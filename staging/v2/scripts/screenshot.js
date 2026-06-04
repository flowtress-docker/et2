import path from 'path';
import fs from 'fs-extra';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';

export async function compareScreenshots(baselinePath, currentPath, threshold = 0.1) {
  const [baselineStat, currentStat] = await Promise.all([
    fs.stat(baselinePath).catch(() => null),
    fs.stat(currentPath).catch(() => null),
  ]);

  if (!baselineStat || !currentStat) {
    return { match: false, diff: 1 };
  }

  if (baselineStat.size !== currentStat.size) {
    return { match: false, diff: Math.abs(baselineStat.size - currentStat.size) };
  }

  const [baselineBuf, currentBuf] = await Promise.all([
    readFile(baselinePath),
    readFile(currentPath),
  ]);

  const baselineHash = createHash('sha256').update(baselineBuf).digest('hex');
  const currentHash = createHash('sha256').update(currentBuf).digest('hex');

  if (baselineHash !== currentHash) {
    return { match: false, diff: 1 };
  }

  return { match: true, diff: 0 };
}

export async function collectScreenshots(registryPath, outputDir, baselineDir) {
  let registry;
  try {
    registry = await fs.readJson(registryPath);
  } catch (e) {
    throw new Error(`Failed to read registry at ${registryPath}: ${e.message}`);
  }

  if (!Array.isArray(registry.projects)) {
    throw new Error('Invalid registry: projects array missing');
  }

  const screenshots = [];
  for (const project of registry.projects) {
    if (project.simulate && project.simulate.screenshot) {
      screenshots.push({
        variantId: project.variantId,
        path: project.simulate.screenshot,
      });
    }
  }

  const result = {
    screenshots,
  };

  if (baselineDir) {
    const comparisons = [];
    for (const item of screenshots) {
      const baselinePath = path.join(baselineDir, `${item.variantId}.png`);
      const currentPath = item.path;
      const comparison = await compareScreenshots(baselinePath, currentPath);
      comparisons.push({
        variantId: item.variantId,
        baselinePath,
        currentPath,
        ...comparison,
      });
    }
    result.comparisons = comparisons;
  }

  if (outputDir) {
    await fs.ensureDir(outputDir);
    const copied = [];
    for (const item of screenshots) {
      if (await fs.pathExists(item.path)) {
        const ext = path.extname(item.path);
        const destName = `${item.variantId}${ext}`;
        const destPath = path.join(outputDir, destName);
        await fs.copy(item.path, destPath);
        copied.push({ ...item, destPath });
      }
    }
    result.copied = copied;
  }

  return result;
}
