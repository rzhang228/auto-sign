const packager = require('electron-packager');

let options = {
  dir: '.',
  arch: 'x64',
  platform: 'win32',
  name: 'AutoSign',
  out: __dirname
}

packager(options, (err, appPaths) => {
  console.log(err, appPaths);
})