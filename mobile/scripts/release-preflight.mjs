import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  } catch (error) {
    failures.push(`Cannot read ${file}: ${error instanceof Error ? error.message : 'unknown error'}`);
    return null;
  }
};

const app = readJson('app.json');
const eas = readJson('eas.json');

if (app?.expo) {
  const bundleId = app.expo?.ios?.bundleIdentifier || '';
  const androidPackage = app.expo?.android?.package || '';
  const projectId = app.expo?.extra?.eas?.projectId || '';
  const appName = app.expo?.name || '';
  const appSlug = app.expo?.slug || '';
  const appScheme = app.expo?.scheme || '';

  if (!bundleId || bundleId === 'com.luna.mobile') {
    warnings.push('iOS bundleIdentifier is still default (com.luna.mobile).');
  } else if (!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9_-]+)+$/.test(bundleId)) {
    failures.push('iOS bundleIdentifier format looks invalid.');
  }

  if (!androidPackage || androidPackage === 'com.luna.mobile') {
    warnings.push('Android package is still default (com.luna.mobile).');
  } else if (!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9_]+)+$/.test(androidPackage)) {
    failures.push('Android package format looks invalid.');
  }

  if (!projectId || String(projectId).includes('REPLACE_WITH_EAS_PROJECT_ID')) {
    failures.push('EAS projectId is missing in app.json (expo.extra.eas.projectId).');
  }

  if (!appName || !appSlug || !appScheme) {
    failures.push('Missing one of required app identity fields: expo.name, expo.slug, expo.scheme.');
  }
} else {
  failures.push('Missing expo config in app.json.');
}

if (!eas?.build?.production) {
  failures.push('Missing production profile in eas.json.');
}
if (!eas?.submit?.production) {
  failures.push('Missing production submit profile in eas.json.');
}

const envProdPath = path.join(root, '.env.production');
if (!fs.existsSync(envProdPath)) {
  failures.push('Missing mobile/.env.production file. Copy from .env.production.example.');
} else {
  const envRaw = fs.readFileSync(envProdPath, 'utf8');
  const apiLine = envRaw
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith('EXPO_PUBLIC_API_BASE_URL='));

  if (!apiLine) {
    failures.push('EXPO_PUBLIC_API_BASE_URL is missing in .env.production.');
  } else if (!apiLine.includes('https://')) {
    warnings.push('EXPO_PUBLIC_API_BASE_URL is not https in .env.production.');
  }
}

const requiredSecrets = [
  'EXPO_TOKEN',
  'APPLE_ID',
  'ASC_APP_ID',
  'APPLE_TEAM_ID',
  'GOOGLE_SERVICE_ACCOUNT_JSON',
];

console.log('Luna29 mobile release preflight');
console.log('============================');
console.log('Required GitHub secrets:');
for (const secret of requiredSecrets) {
  console.log(`- ${secret}`);
}

if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const item of warnings) {
    console.log(`- ${item}`);
  }
}

if (failures.length > 0) {
  console.log('\nFailures:');
  for (const item of failures) {
    console.log(`- ${item}`);
  }
  process.exit(1);
}

console.log('\nStatus: PASS');
