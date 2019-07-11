const fs = require('fs-extra');
const Datastore = require('nedb');
const path = require('path');
const { getDirectories } = require('./directory');
const { command } = require('./command');
const {
  PATHS,
  DB_PATH,
  NEURAL_STYLES_INSTALL_PATH,
} = require('../constants');

const db = new Datastore({ filename: DB_PATH, autoload: true });
const { contentDir, stylesDir } = getDirectories();
let cIndex = 0;
let sIndex = 0;

Object.values(PATHS).forEach(PATH => fs.mkdirp(PATH));

// ---------------------------------------------------------------------------------- //

function filenameSelector() {
  const contentImg = contentDir[cIndex] || {};
  const styleImg = stylesDir[sIndex] || {};

  return [
    contentImg.filename,
    styleImg.filename,
  ];
}

function foundImagesToProcess() {
  const [ content, style ] = filenameSelector();

  db.insert({ content, style }, (err, newDoc) => {
    if (err) {
      console.log('Error, db.insert():', err);
      return;
    }

    const width = 1000;
    const iterations = 1000;
    const neuralStylesExecutablePath = path.join(NEURAL_STYLES_INSTALL_PATH, 'neural_style.py');
    const networkPathVGG = path.join(NEURAL_STYLES_INSTALL_PATH, 'imagenet-vgg-verydeep-19.mat');
    const contentPath = path.join(PATHS.CONTENT, content);
    const checkpointPath = path.join(PATHS.CHECKPOINTS, 'checkpoint-%05d.jpg');
    const stylePath = path.join(PATHS.STYLES, style);
    const outFilename = `c(${content})_s(${style})_w${width}_i${iterations}.jpg`;
    const outPath = path.join(PATHS.OUT, outFilename);

    const cmd = `python ${neuralStylesExecutablePath} \
      --checkpoint-output "${checkpointPath}" \
      --network "${networkPathVGG}" \
      --checkpoint-iterations 50 \
      --overwrite \
      --width ${width} \
      --iterations ${iterations} \
      --content "${contentPath}" \
      --styles ${stylePath} \
      --output "${outPath}" \
    `;

    console.log('running command', cmd);
    command(cmd)
      .then(([stdout, stderr]) => {
        console.log('stdout', stdout);
        console.log('stderr', stderr);
        console.log(content, style);
        // process quits here
      })
      .catch(err => console.log(err));
  });
}

function checkIfExists() {
  return new Promise((resolve, reject) => {
    cIndex = parseInt(Math.random() * contentDir.length, 10);
    sIndex = parseInt(Math.random() * stylesDir.length, 10);

    const [ content, style ] = filenameSelector();
    if (!content || !style) reject(`
      Fatal Error. Tried to search undefined filenames:
      ${cIndex}/${contentDir.length}
      ${sIndex}/${stylesDir.length}
      ${content}
      ${style}
    `);

    db.findOne({ content, style }, (error, doc) => {
      if (error) console.log('error in db.find():', content, style, error);

      if (doc) resolve(true); // continue searching
      else resolve(false); // found combo to use
    })
  });
}

function loop() {
  checkIfExists() // we want to find an image combo that does not exist
    .then(doc => doc ? loop() : foundImagesToProcess())
    .catch(err => console.log(err));
}

loop();
