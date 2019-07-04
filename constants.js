const path = require('path');

const PATHS = {
  CONTENT: path.join(__dirname, 'content'),
  STYLES: path.join(__dirname, 'styles'),
  OUT: path.join(__dirname, 'out'),
};
const PARALLEL_LIMIT = 4;
const REDDIT_RSS_FEEDS = {
  CONTENT: [
    'https://www.reddit.com/r/photographs.rss',
    'https://www.reddit.com/r/photocritique.rss',
    'https://www.reddit.com/r/analog.rss',
    'https://www.reddit.com/r/itookapicture.rss',
    'https://www.reddit.com/r/postprocessing.rss',
    'https://www.reddit.com/r/pics.rss',
    'https://www.reddit.com/r/ExposurePorn.rss',
  ],
  STYLES: [
    'https://www.reddit.com/r/Art.rss',
    'https://www.reddit.com/r/SpecArt.rss',
  ],
};

module.exports = {
  PATHS,
  PARALLEL_LIMIT,
  REDDIT_RSS_FEEDS,
};
