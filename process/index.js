const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const Datastore = require('nedb');
const command = require('./command');
const LookupDB = require('./dbLookup');
const childProcess = require('child_process');
const {
  PATHS,
  PARALLEL_LIMIT,
  REDDIT_RSS_FEEDS,
} = require('../constants');

// ----------------------------- Init ---------------------------------------------- //

Object.values(PATHS).forEach(PATH => fs.mkdirp(PATH));

// ---------------------------------------------------------------------------------- //



// ---------------------------------------------------------------------------------- //

// let num = 0;
// function findNextImageCombo(callback) {
//   num++;
//   if (num >= 5) callback('@@DONE');
//   else callback();
//   // lookupDB.nextImage()
//   //   .then(doc => {
//   //     console.log(doc)
//   //   })
//   //   .catch(() => {
//   //     // restart
//   //   });
// }

// const lookupDB = new LookupDB();
// async.forever(findNextImageCombo, err => {
//   if (err) console.log(err);
//   console.log('done. num:', num);
// });