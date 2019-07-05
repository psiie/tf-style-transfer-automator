const fs = require('fs-extra');
const Datastore = require('nedb');
const getDirectories = require('./getDirectories');
const { command } = require('./command');
const {
  PATHS,
  DB_PATH,
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

    command('sleep 2')
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
