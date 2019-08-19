var express = require('express');
var router = express.Router();
const moment = require('moment-timezone');
const Fixture = require('../models/fixture')

/* GET fixtures page. */
router.get('/', function(req, res, next) {
  Fixture.findAll({
    order: [['"fixtureDate"', 'ASC']]
  }).then((fixtures) => {
    if (fixtures) {
      fixtures.forEach((f) => {
        f.formattedDate = moment(f.fixtureDate).format('YYYY/MM/DD (ddd) HH:mm');
      });
      res.render('fixtures', {
        title: '試合一覧ページ',
        fixtures: fixtures
      });
    } else {
      const err = new Error('試合一覧がございません。申し訳ございません。');
      err.status = 404;
      next(err);
    };
  });
});

/* GET 個別ページ */
router.get('/:fixtureId', function(req, res, next) {
  //　ここに、個別ページへの実装をする
  res.render('match', { 
    user:req.user,
    ID:req.params.fixtureId
  });
});

module.exports = router;
