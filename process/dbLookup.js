const Datastore = require('nedb');
const path = require('path');
const fs = require('fs-extra');
const {
  PATHS,
  PARALLEL_LIMIT,
  REDDIT_RSS_FEEDS,
} = require('../constants');

class LookupDB {
  constructor() {
    this.DB_PATH = path.join(__dirname, 'processed_images.db');
    this.db = new Datastore({ filename: this.DB_PATH, autoload: true });
    this.dbLookup = this._dbLookupGenerator();
  }

  _safeStatSync(path) {
    let out = [];
  
    try {
      out = fs.statSync(path);
    } catch (e) {
      out = [];
    }
  
    return out;
  }

  _extendFileInfo(folderPath) {
    return fs.readdirSync(folderPath)
      .map(filename => ({
        filename,
        ...this._safeStatSync(path.join(folderPath, filename)),
      }))
      .sort((a, b) => b.birthtimeMs - a.birthtimeMs)
  }

  _getDirectories() {
    const contentDir = this._extendFileInfo(PATHS.CONTENT);
    const stylesDir = this._extendFileInfo(PATHS.STYLES);
  
    return {
      contentDir,
      stylesDir,
    };
  }

  *_dbLookupGenerator() {
    const { contentDir, stylesDir } = this._getDirectories();

    for (let x=0; x<contentDir.length; x++) {
      for (let y=0; y<stylesDir.length; y++) {
        const content = contentDir[x];
        const style = stylesDir[y];

        yield new Promise((resolve, reject) => {
          console.log('looking up');
          this.db.findOne({ content, style }, (err, doc) => {
            if (err) reject('db err' + err);
            else resolve(doc);
          });
        });
      }
    }
  }

  nextImage() {
    return new Promise((resolve, reject) => {
      const { value, done } = this.dbLookup.next();
      if (done) reject();
      else resolve(value);
    });
  }
}

module.exports = LookupDB;
