import fs from 'fs-extra';

export function validateSerialLog(variantId, logPath, expectedPatterns) {
  if (!Array.isArray(expectedPatterns)) {
    throw new TypeError('expectedPatterns must be an array');
  }

  let logContent;
  try {
    logContent = fs.readFileSync(logPath, 'utf-8');
  } catch (e) {
    return {
      pass: false,
      found: [],
      missing: expectedPatterns,
      error: e.message,
    };
  }

  const found = [];
  const missing = [];

  for (const pattern of expectedPatterns) {
    if (logContent.includes(pattern)) {
      found.push(pattern);
    } else {
      missing.push(pattern);
    }
  }

  return {
    pass: missing.length === 0,
    found,
    missing,
  };
}

export function reportRegistryStats(registryPath) {
  let registry;
  try {
    registry = fs.readJsonSync(registryPath);
  } catch (e) {
    throw new Error(`Failed to read registry at ${registryPath}: ${e.message}`);
  }

  if (!Array.isArray(registry.projects)) {
    throw new Error('Invalid registry: projects array missing');
  }

  let buildPass = 0;
  let buildFail = 0;
  let simPass = 0;
  let simFail = 0;
  let skipped = 0;

  for (const project of registry.projects) {
    if (project.build && project.build.ok) {
      buildPass++;
    } else {
      buildFail++;
    }

    if (project.simulate && project.simulate.ok) {
      simPass++;
    } else if (
      project.simulate &&
      (project.simulate.stderr || project.simulate.stdout)
    ) {
      // attempted but failed
      simFail++;
    } else {
      skipped++;
    }
  }

  return {
    total: registry.projects.length,
    build: { pass: buildPass, fail: buildFail },
    simulate: { pass: simPass, fail: simFail, skipped },
    allPassed: buildFail === 0 && simFail === 0 && skipped === 0,
  };
}
