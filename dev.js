import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting backend server on port 3001...');
const backend = spawn('node', ['server.js'], { stdio: 'inherit', shell: true });

console.log('🌐 Starting Vite frontend dev server...');
const viteBin = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
const frontend = spawn('node', [viteBin], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
