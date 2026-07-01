#!/usr/bin/env node
import { spawn, execSync } from 'node:child_process';

const root = process.cwd();

const stopPreview = () => {
  try {
    execSync("lsof -ti :4173 | xargs kill -9 2>/dev/null || true", { stdio: 'ignore', shell: '/bin/bash' });
  } catch {
    // ignore
  }
};

stopPreview();

console.log('Luna29 local dev');
console.log('- URL: http://localhost:3000');
console.log('- Do not use :4173 (vite preview = old production build)');
console.log('- Use the same URL in every browser\n');

const server = spawn('node', ['--env-file-if-exists=.env.local', 'server/index.mjs'], {
  cwd: root,
  stdio: 'inherit',
});

const vite = spawn('npm', ['run', 'dev'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

const shutdown = () => {
  server.kill('SIGTERM');
  vite.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.on('exit', (code) => {
  if (code && code !== 0) shutdown();
});

vite.on('exit', (code) => {
  process.exit(code ?? 0);
});
