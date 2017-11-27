const packager = require('electron-packager');
const path = require('path');

let options = {
  dir: '.',
  arch: 'x64',
  platform: 'win32',
  name: 'Auto Sign',
  out: path.join(__dirname, 'dist'),
  overwrite: true,
  ignore: ['node_modules', 'dist', '.vscode', '.gitignore', 'package-lock.json'],
  icon: 'icon.ico'
}

packager(options, (err, appPaths) => { })