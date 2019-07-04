const path = require('path');
const fs = require('fs-extra');
const { PATHS } = require('../constants');

function safeStatSync(path) {
  let out = [];

  try {
    out = fs.statSync(path);
  } catch (e) {
    out = [];
  }

  return out;
}

function extendFileInfo(folderPath) {
  return fs.readdirSync(folderPath)
    .map(filename => ({
      filename,
      ...safeStatSync(path.join(folderPath, filename)),
    }))
    .sort((a, b) => b.birthtimeMs - a.birthtimeMs)
}

function getDirectories() {
  const contentDir = extendFileInfo(PATHS.CONTENT);
  const stylesDir = extendFileInfo(PATHS.STYLES);

  return {
    contentDir,
    stylesDir,
  };
}

module.exports = getDirectories;
