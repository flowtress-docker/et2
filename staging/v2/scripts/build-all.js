import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const variantsDir = path.join(rootDir, 'variants');
const artifactsDir = path.join(rootDir, 'artifacts');
const registryPath = path.join(rootDir, 'registry.json');

// Heuristic patterns to locate the MCU part inside diagram.json
const MCU_PATTERNS = [
  /arduino/,
  /esp32/,
  /pico/,
  /stm32/,
  /attiny/,
  /nano/,
  /mega/,
  /rp2040/,
];

function findMcuPartId(diagram) {
  if (!Array.isArray(diagram.parts)) return null;
  for (const part of diagram.parts) {
    if (typeof part.type === 'string') {
      for (const pattern of MCU_PATTERNS) {
        if (pattern.test(part.type)) {
          return part.id;
        }
      }
    }
  }
  return null;
}

function parsePlatformioEnv(iniPath) {
  try {
    const content = fs.readFileSync(iniPath, 'utf-8');
    const match = content.match(/^\[env:([^\]]+)\]/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function log(variantId, icon, message) {
  console.log(`[${variantId}] ${icon} ${message}`);
}

function quote(str) {
  return `"${str.replace(/"/g, '\\"')}"`;
}

async function main() {
  // Import and run variants.js (assumes side-effects on import or a named export)
  let variantsModule;
  try {
    variantsModule = await import(path.join(__dirname, 'variants.js'));
  } catch (e) {
    console.error('Failed to import variants.js:', e.message);
    process.exit(1);
  }

  if (variantsModule && typeof variantsModule.generate === 'function') {
    await variantsModule.generate();
  } else if (variantsModule && typeof variantsModule.default === 'function') {
    await variantsModule.default();
  } else if (variantsModule && typeof variantsModule.run === 'function') {
    await variantsModule.run();
  }
  // If no function is exported, assume side-effect execution on import

  await fs.ensureDir(artifactsDir);

  let variantIds;
  try {
    const entries = await fs.readdir(variantsDir, { withFileTypes: true });
    variantIds = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (e) {
    console.error('Failed to read variants directory:', e.message);
    process.exit(1);
  }

  if (variantIds.length === 0) {
    console.log('No variants found in', variantsDir);
  }

  try {
    execSync('wokwi-cli --version', { encoding: 'utf-8', stdio: 'ignore' });
  } catch {
    console.error('wokwi-cli is not installed or not in PATH');
    process.exit(1);
  }

  const registry = {
    generatedAt: new Date().toISOString(),
    projects: [],
  };

  for (const variantId of variantIds) {
    const variantDir = path.join(variantsDir, variantId);
    const artifactDir = path.join(artifactsDir, variantId);
    const variantJsonPath = path.join(variantDir, 'variant.json');
    const diagramJsonPath = path.join(variantDir, 'diagram.json');
    const platformioIniPath = path.join(variantDir, 'platformio.ini');
    const scenarioPath = path.join(variantDir, 'scenarios', 'base.yaml');

    let variantMeta = {};
    try {
      if (await fs.pathExists(variantJsonPath)) {
        variantMeta = await fs.readJson(variantJsonPath);
      }
    } catch (e) {
      log(variantId, '⚠️', `Failed to read variant.json: ${e.message}`);
    }

    const board = variantMeta.board || {};
    const platformioEnv =
      parsePlatformioEnv(platformioIniPath) || board.platformioEnv || 'unknown';

    const projectEntry = {
      variantId,
      board: {
        type: board.type || 'unknown',
        platformioEnv,
      },
      sensors: variantMeta.sensors || [],
      display: variantMeta.display || null,
      build: { ok: false, stdout: '', stderr: '' },
      simulate: {
        ok: false,
        stdout: '',
        stderr: '',
        screenshot: null,
        serialLog: null,
      },
      validatedAt: null,
    };

    // --- Build ---
    log(variantId, '🔄', 'Building firmware...');
    try {
      const buildOut = execSync('pio run', {
        cwd: variantDir,
        encoding: 'utf-8',
        timeout: 120000,
      });
      projectEntry.build.ok = true;
      projectEntry.build.stdout = buildOut;
      log(variantId, '✅', 'Build passed');

      // Validate firmware path from wokwi.toml
      const wokwiTomlPath = path.join(variantDir, 'wokwi.toml');
      let firmwarePath = null;
      try {
        const tomlContent = await fs.readFile(wokwiTomlPath, 'utf-8');
        const match = tomlContent.match(/^firmware\s*=\s*['"](.+?)['"]/m);
        firmwarePath = match ? path.join(variantDir, match[1]) : null;
      } catch (e) {
        log(variantId, '⚠️', `Failed to read wokwi.toml: ${e.message}`);
      }

      if (!firmwarePath || !(await fs.pathExists(firmwarePath))) {
        projectEntry.build.ok = false;
        projectEntry.build.stderr = firmwarePath
          ? `Firmware file missing: ${firmwarePath}`
          : 'Firmware path not found in wokwi.toml';
        log(variantId, '❌', `Build failed: ${projectEntry.build.stderr}`);
        projectEntry.validatedAt = new Date().toISOString();
        registry.projects.push(projectEntry);
        continue;
      }
    } catch (e) {
      projectEntry.build.ok = false;
      projectEntry.build.stdout = e.stdout || '';
      projectEntry.build.stderr = e.stderr || e.message || '';
      log(
        variantId,
        '❌',
        `Build failed: ${projectEntry.build.stderr.substring(0, 200)}`
      );
      projectEntry.validatedAt = new Date().toISOString();
      registry.projects.push(projectEntry);
      continue;
    }

    // Validate scenario YAML before simulation
    try {
      const scenarioContent = await fs.readFile(scenarioPath, 'utf-8');
      yaml.load(scenarioContent);
    } catch (e) {
      log(variantId, '⚠️', `Scenario YAML invalid or missing: ${e.message}`);
      projectEntry.validatedAt = new Date().toISOString();
      registry.projects.push(projectEntry);
      continue;
    }

    // Check for required token
    if (!process.env.WOKWI_CLI_TOKEN) {
      log(variantId, '⚠️', 'WOKWI_CLI_TOKEN not set; skipping simulation');
      projectEntry.validatedAt = new Date().toISOString();
      registry.projects.push(projectEntry);
      continue;
    }

    // Resolve MCU part id from diagram.json
    let mcuPartId = null;
    try {
      const diagram = await fs.readJson(diagramJsonPath);
      mcuPartId = findMcuPartId(diagram);
    } catch (e) {
      log(variantId, '⚠️', `Failed to read diagram.json: ${e.message}`);
    }

    if (!mcuPartId) {
      log(variantId, '⚠️', 'Could not determine MCU part ID; skipping simulation');
      projectEntry.validatedAt = new Date().toISOString();
      registry.projects.push(projectEntry);
      continue;
    }

    await fs.ensureDir(artifactDir);

    const screenshotPath = path.join(artifactDir, 'screenshot.png');
    const serialLogPath = path.join(artifactDir, 'serial.log');

    // --- Simulate ---
    log(variantId, '🔄', 'Running simulation...');
    let simSuccess = false;
    let simError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        log(variantId, '🔄', `Retrying simulation (${attempt}/2)...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
      try {
        const cmd = [
          'wokwi-cli',
          quote(variantDir),
          '--scenario',
          quote(scenarioPath),
          '--screenshot-part',
          quote(mcuPartId),
          '--screenshot-time',
          '5000',
          '--screenshot-file',
          quote(screenshotPath),
          '--serial-log-file',
          quote(serialLogPath),
          '--timeout',
          '30000',
        ].join(' ');

        const simOut = execSync(cmd, {
          encoding: 'utf-8',
          timeout: 60000,
          env: { ...process.env },
        });
        projectEntry.simulate.ok = true;
        projectEntry.simulate.stdout = simOut;
        projectEntry.simulate.screenshot = screenshotPath;
        projectEntry.simulate.serialLog = serialLogPath;
        log(variantId, '✅', 'Simulation passed');
        simSuccess = true;
        break;
      } catch (e) {
        simError = e;
      }
    }

    if (!simSuccess) {
      projectEntry.simulate.ok = false;
      projectEntry.simulate.stdout = simError.stdout || '';
      projectEntry.simulate.stderr = simError.stderr || simError.message || '';
      log(
        variantId,
        '❌',
        `Simulation failed: ${projectEntry.simulate.stderr.substring(0, 200)}`
      );
    }

    projectEntry.validatedAt = new Date().toISOString();
    registry.projects.push(projectEntry);
  }

  await fs.writeJson(registryPath, registry, { spaces: 2 });
  console.log(`\nRegistry written to ${registryPath}`);
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
