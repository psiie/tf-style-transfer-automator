const path = require('path');
const REDDIT_RSS_FEEDS = require('./download/reddit_rss_feeds.json');

const PATHS = {
  CONTENT: path.join(__dirname, 'content'),
  STYLES: path.join(__dirname, 'styles'),
  OUT: path.join(__dirname, 'out'),
  OUT2: path.join(__dirname, 'out2'),
  CHECKPOINTS: path.join(__dirname, 'checkpoints'),
  FAILED: path.join(__dirname, 'failed'),
};
const DB_PATH = path.join(__dirname, 'processed_images.db');
const NEURAL_STYLES_INSTALL_PATH = path.resolve(__dirname, '..', 'neural-style');
const TWEETED_OUT_PATH = path.join(PATHS.OUT, 'tweeted');
const IMAGE_METADATA_DB = path.join(__dirname, 'imageMetadata.db');
const PARALLEL_LIMIT = 4;


module.exports = {
  PATHS,
  PARALLEL_LIMIT,
  REDDIT_RSS_FEEDS,
  DB_PATH,
  NEURAL_STYLES_INSTALL_PATH,
  IMAGE_METADATA_DB,
  TWEETED_OUT_PATH,
};
