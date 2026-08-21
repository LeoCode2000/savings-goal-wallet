const { spawn } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { createInterface } = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const WEBVIEW_PORT = 5173;
const RED = '\x1b[31m';
const RESET_COLOR = '\x1b[0m';
const children = new Set();
let stopping = false;

function start(command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = start(command, args);

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} terminó con código ${code}`));
    });
  });
}

async function selectPlatform() {
  const readline = createInterface({ input: stdin, output: stdout });

  try {
    const pattern = readFileSync(
      path.resolve(__dirname, 'pattern.txt'),
      'utf8'
    );
    console.log(`${RED}${pattern}${RESET_COLOR}`);

    while (true) {
      const answer = (
        await readline.question(
          '¿En qué plataforma quieres iniciar el proyecto? [1] Android [2] iOS: '
        )
      )
        .trim()
        .toLowerCase();

      if (answer === '1' || answer === 'android' || answer === 'a') {
        return 'android';
      }

      if (answer === '2' || answer === 'ios' || answer === 'i') {
        return 'ios';
      }

      console.error('Selecciona Android (1) o iOS (2).');
    }
  } finally {
    readline.close();
  }
}

function stop(signal = 'SIGTERM') {
  if (stopping) {
    return;
  }

  stopping = true;
  for (const child of children) {
    child.kill(signal);
  }
}

async function main() {
  const platform = await selectPlatform();

  if (platform === 'android') {
    console.log(`Configurando adb reverse para el puerto ${WEBVIEW_PORT}...`);
    await run('adb', [
      'reverse',
      `tcp:${WEBVIEW_PORT}`,
      `tcp:${WEBVIEW_PORT}`,
    ]);
  }

  console.log('Iniciando el servidor web...');
  const web = start('yarn', ['workspace', 'savings-goal-web', 'dev']);

  web.once('error', (error) => {
    console.error(`No se pudo iniciar la web: ${error.message}`);
    stop();
    process.exitCode = 1;
  });

  web.once('exit', (code) => {
    if (!stopping && code !== 0) {
      console.error(`El servidor web terminó con código ${code}.`);
      stop();
      process.exitCode = code ?? 1;
    }
  });

  console.log(`Iniciando la app en ${platform === 'android' ? 'Android' : 'iOS'}...`);
  const app = start('yarn', ['workspace', 'app', platform]);

  app.once('error', (error) => {
    console.error(`No se pudo iniciar la app: ${error.message}`);
    stop();
    process.exitCode = 1;
  });

  app.once('exit', (code) => {
    if (!stopping && code !== 0) {
      console.error(`La app terminó con código ${code}.`);
      stop();
      process.exitCode = code ?? 1;
    }
  });
}

process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));

main().catch((error) => {
  console.error(error.message);
  stop();
  process.exitCode = 1;
});
