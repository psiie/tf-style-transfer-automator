const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const { command } = require('../process/command');
const { PATHS } = require('../constants');

function generateSmallCommand(tmpPath, contentFilename, styleFilename) {
  const smallOutputPath = path.join(tmpPath, 'small.jpg');
  const contentFilepath = path.join(PATHS.CONTENT, contentFilename);
  const styleFilepath = path.join(PATHS.STYLES, styleFilename);
  const cmd = `convert ${contentFilepath} ${styleFilepath} -resize 500x ${smallOutputPath}`;
  console.log('command 1', cmd);
  return command(cmd);
}

function generateBottomCommand(tmpPath, bottomFile) {
  const out0 = path.join(tmpPath, 'small-0.jpg');
  const out1 = path.join(tmpPath, 'small-1.jpg');
  const cmd = `montage ${out0} ${out1} -mode concatenate -tile 2x1 -background black ${bottomFile}`;
  console.log('command 2', cmd);
  return command(cmd);
}

function generateFinalCommand(neuralFilename, bottomFile, finalFile) {
  const neuralFilePath = path.join(PATHS.OUT, neuralFilename);
  const cmd = `montage "${neuralFilePath}" "${bottomFile}" -mode concatenate -tile 1x2 "${finalFile}"`;
  console.log('command 3', cmd);
  return command(cmd);
}

function clean(tmpPath) {
  return new Promise((resolve, reject) => {
    const tmpDirList = fs.readdirSync(tmpPath);
    tmpDirList.forEach(file => fs.removeSync(path.join(tmpPath, file)));
    resolve();
  });
}

function processImage(tmpPath, neuralFile, contentFile, styleFile, bottomFile, finalFile) {
  return new Promise((resolve, reject) => {
    const actions = [
      () => generateSmallCommand(tmpPath, contentFile, styleFile),
      () => generateBottomCommand(tmpPath, bottomFile),
      () => generateFinalCommand(neuralFile, bottomFile, finalFile),
      () => clean(tmpPath),
    ];
  
    // we are using eachOfSeries in a way that is not initially intended.
    const fn = (action, key, callback) => action().then(() => callback());
    async.eachOfSeries(actions, fn, (err) => {
      if (err) reject();
      else resolve(finalFile);
    });
  });
}

function main(neuralFilename) {
  fs.mkdirpSync(path.join(__dirname, 'tmp'));
  const match = neuralFilename.match(/c\((.+?)\)_s\((.+?)\)/) || [];
  const [ contentFile, styleFile ] = match.slice(1,3); // todo finish
  console.log('content', contentFile, 'style', styleFile);
  
  const tmpPath = path.join(__dirname, 'tmp');
  const bottomFile = path.join(__dirname, 'tmp', 'bottom.jpg');
  const finalFile = path.join(__dirname, '../', 'out2/', `cb_${neuralFilename}`);

  return processImage(tmpPath, neuralFilename, contentFile, styleFile, bottomFile, finalFile)
}

// const neuralFile = 'c(hu8laprw7q831.jpg)_s(l5YwjUS.jpg)_w1000_i1000.jpg';
module.exports = main;
