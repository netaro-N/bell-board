var express = require('express');
var router = express.Router();
const fs = require('fs');
const moment = require('moment-timezone');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const csvParse = require('csv-parse/lib/sync'); // requiring sync module 同期でパースする

/* GET manage page. */
router.get('/', function(req, res, next) {
  res.render('manage', { user:req.user });
});

/* GET new page. */
router.get('/new', function(req, res, next) {
  //　ここに、新規ページへの実装をする
  res.render('new', { 
    user:req.user
  });
});

/* GET edit page */
router.get('/:fixtureId', function(req, res, next) {
  //　ここに、個別編集ページへの実装をする
  res.render('edit', { 
    user:req.user,
    ID:req.params.fixtureId
  });
});

/* POST csv file */
router.post('', (req, res, next) => {
  // ここに csvParse 実装

  // ここにデータベースへ保存実装

})

module.exports = router;
