/**
 * Compresses files with gzip.
 * Should be executed in a post build step.
 */

const glob = require('glob');
const fs = require('fs');
const ngCliCfg = require('../.angular-cli.json');
const EXCLUDES = [
  "env-settings.json"
];

function compress(fileName, zlib) {
  let excludes = ['.gz','.map','.br','.png','.jpg','.woff2', '.txt'];
  for (let j = 0; j < excludes.length; ++j) {
    if (fileName.endsWith(excludes[j])) {
      return;
    }
  }

  if (!fs.statSync(fileName).isFile()) {
    return '';
  }

  const gzip = zlib.createGzip({level:9});
  fs.createReadStream(fileName)
    .pipe(gzip)
    .pipe(fs.createWriteStream(fileName + '.gz'))
    .on('finish', function(){ console.log('Created ' + fileName + '.gz') });
}

function compressAssets() {
  let zlib = require('zlib');

  glob(`${ngCliCfg.apps[0].outDir}/**/*`, function (er, files) {
    console.log('Compressing files ...');
    for (let i = 0; i < files.length; ++i) {
      if (!isExcluded(files[i])) {
        compress(files[i], zlib);
      }
    }
  });
}

compressAssets();


function isExcluded(filepath) {
  for( let ex of EXCLUDES) {
    if (filepath.endsWith(ex)) {
      return true
    }
  }

  return false;
}
