const async = require('async');
const cheerio = require('cheerio');
const Url = require('url-parse');
const fs = require('fs-extra');
const path = require('path');
const get = require('get');
let Parser = require('rss-parser');
let parser = new Parser();

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

// ----------------------------- Init ---------------------------------------------- //

// init
Object.values(PATHS).forEach(PATH => fs.mkdirp(PATH));

// ----------------------------- Main ----------------------------------------------- //

function delay(func, milliseconds) {
  return setTimeout(func, milliseconds);
}

let masterSmartList = [];

function download(smartLink, callback) {
  const { bucket, filename, filepath, href } = smartLink;
  console.log('  Downloading:', filename);

  if (fs.pathExistsSync(filepath)) {
    console.log('  -Skipping: File Exists.');
    callback();
    return;
  }

  get({ uri: href, }).toDisk(filepath, (err, filename) => {
    if (err) console.log('  Error saving', filePath, 'to disk:', err);
    else delay(callback, 1000);
  });
}

/* once we have the list of links (as objects with all the properties we need), download them */
function downloadAllImages(smartImgList) {
  return new Promise((resolve, reject) => {

    async.eachLimit(smartImgList, PARALLEL_LIMIT, download, (err) => {
      if (err) reject('error in async.eachLimit() of downloadAllImages():' + err);
      else resolve();
    });
  });
}

/* converts list from a array of strings (links) to a smart Url() object with filename info */
function convertImgListToSmartList(imgList, bucketName = 'CONTENT') {
  return new Promise((resolve, reject) => {
    const cleanImgList = imgList.filter(link => /\.\w{3}$/.test(link))
    const smartImgList = cleanImgList.map(link => {
      const url = new Url(link);
      url.bucket = bucketName,
      url.filename = url.pathname.split('/').slice(-1)[0];
      url.filepath = path.join(PATHS[bucketName], url.filename);
      return url;
    });

    resolve(smartImgList);
  })
}

/* downloads and scrapes from the rss feed. only supports reddit's rss due to selectors used */
function getImageListFromRedditRSS(rssLinks) {
  return new Promise((resolve, reject) => {
    const imageList = [];

    const parseLinksFromRedditRSS = (url, callback) => {
      try {
        parser.parseURL(url).then(feed => {
          feed.items.forEach(item => {
            const $ = cheerio.load(item.content);
            $('a').each((idx, item) => {
              const innerText = $(item).text();
              if (innerText === '[link]') imageList.push(item.attribs.href);
            });
          });
  
          console.log('  -Fetched', url);
          delay(callback, 1000);
        });
      } catch (err) {
        console.log('  -Catch Thrown in parseLinksFromRedditRSS().', err);
        delay(callback, 1000);
      }
    };

    console.log('  Fetting all RSS feeds in bucket');
    async.eachLimit(rssLinks, PARALLEL_LIMIT, parseLinksFromRedditRSS, (err) => {
      if (err) reject('  -Error getting rss feeds: ' + err);
      else resolve(imageList);
    });
  });
}

/* A feed bucket is the type of feed. content, styles, ect. Keep them in seperate dl folders */
function downloadFeedBucket(bucket, key, callback) {
  const [bucketName, linkArr] = bucket;
  console.log('Downloading bucket of RSS feeds from bucket', bucketName);

  getImageListFromRedditRSS(linkArr)
    .then(imgList => convertImgListToSmartList(imgList, bucketName))
    .then(smartList => {
      masterSmartList = [ ...masterSmartList, ...smartList ];
      console.log('-Done with this bucket.');
      callback();
    })
    .catch(err => {
      console.log('-Err getting list from reddit rss', err);
      callback();
    });
}

console.log('Looking at all RSS buckets.');
async.eachOfSeries(Object.entries(REDDIT_RSS_FEEDS), downloadFeedBucket, (err) => {
  if (err) {
    console.log('error in async.eachOfSeries():', err);
    return;
  }
  
  downloadAllImages(masterSmartList)
    .then(() => console.log('All Complete!'))
});
