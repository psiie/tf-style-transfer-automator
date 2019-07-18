const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const { command } = require('../process/command');

function generateSmallCommand(tmpPath, contentFile, styleFile) {
  const smallOutputPath = path.join(tmpPath, 'small.jpg');
  const cmd = `convert ${contentFile} ${styleFile} -resize 500x ${smallOutputPath}`;
  return command(cmd);
}

function generateBottomCommand(tmpPath, bottomFile) {
  const out0 = path.join(tmpPath, 'small-0.jpg');
  const out1 = path.join(tmpPath, 'small-1.jpg');
  const cmd = `montage ${out0} ${out1} -mode concatenate -tile 2x1 -background black ${bottomFile}`;
  return command(cmd);
}

function generateFinalCommand(neuralFile, bottomFile, finalFile) {
  const cmd = `montage "${neuralFile}" "${bottomFile}" -mode concatenate -tile 1x2 "${finalFile}"`;
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
      else resolve();
    });
  });
}

function main() {
  fs.mkdirpSync(path.join(__dirname, 'tmp'));
  const neuralFile = 'c(hu8laprw7q831.jpg)_s(l5YwjUS.jpg)_w1000_i1000.jpg';
  const contentFile = 'hnpwk8gcap731.jpg';
  const styleFile = '5nq9wkud1g731.jpg';
  
  const tmpPath = path.join(__dirname, 'tmp');
  const bottomFile = path.join(__dirname, 'tmp', 'bottom.jpg');
  const finalFile = path.join(__dirname, 'final.jpg');

  processImage(tmpPath, neuralFile, contentFile, styleFile, bottomFile, finalFile).then(() => {
    console.log('done');
  })
}

main()
