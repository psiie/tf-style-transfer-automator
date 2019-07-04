const Datastore = require('nedb');
const path = require('path');
const fs = require('fs-extra');
const getDirectories = require('./getDirectories');
const {
  PATHS,
  PARALLEL_LIMIT,
  REDDIT_RSS_FEEDS,
} = require('../constants');

const DB_PATH = path.join(__dirname, 'processed_images.db');
const db = new Datastore({ filename: this.DB_PATH, autoload: true });
const { contentDir, stylesDir } = getDirectories();
let cCount = 0;
let sCount = 0;

// ---------------------------------------------------------------------------------- //

function foundImagesToProcess(contentImg, stylesImg) {

}

function checkIfExists() {
  const contentImg = contentDir[cCount];
  const styleImg = stylesDir[sCount];

  console.log(contentImg, styleImg);
}

function loop() {
  // we want to find an image combo that does not exist
  checkIfExists()
    .then(result => result ? loop() : foundImagesToProcess())
    .catch(err => console.log(err));
}

loop();
