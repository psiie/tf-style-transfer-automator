const fs = require('fs-extra');
const Datastore = require('nedb');
const getDirectories = require('./getDirectories');
const {
  PATHS,
  DB_PATH,
} = require('../constants');

const db = new Datastore({ filename: DB_PATH, autoload: true });
const { contentDir, stylesDir } = getDirectories();
let cCount = 0;
let sCount = 0;

Object.values(PATHS).forEach(PATH => fs.mkdirp(PATH));

// ---------------------------------------------------------------------------------- //

function filenameSelector() {
  const contentImg = contentDir[cCount] || {};
  const styleImg = stylesDir[sCount] || {};

  return [
    contentImg.filename || null,
    styleImg.filename || null,
  ];
}

function foundImagesToProcess() {
  const [ content, style ] = filenameSelector();

  console.log('2) foundImagesToProcess()', content, style);

  db.insert({ content, style }, (err, newDoc) => {
    if (err) console.log('Error, db.insert():', err);
    console.log('newDoc', newDoc);
  });
}

function checkIfExists() {
  return new Promise((resolve, reject) => {
    const [ content, style ] = filenameSelector();
    if (!content || !style) reject('Fatal Error. Tried to search undefined filenames');

    db.findOne({ content, style }, (error, doc) => {
      if (error) console.log('error in db.find():', content, style, error);

      if (doc) {
        console.log('1) found doc');
        if (cCount < contentDir.length) {
          cCount++;
        } else {
          cCount = 0;
          if (sCount < stylesDir.length) sCount++;
          else reject('no more images to process')
        }


        resolve(true);
      } else {
        console.log('1) ! did not find doc :)');
        resolve(false);
      }
    })
  });
}

function loop() {
  checkIfExists() // we want to find an image combo that does not exist
    .then(doc => doc ? loop() : foundImagesToProcess())
    .catch(err => console.log(err));
}

loop();
