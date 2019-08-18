var express = require('express');
var router = express.Router();
const fs = require('fs');
const moment = require('moment-timezone');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Fixture = require('../models/fixture');
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

/* POST 新規作成 */
router.post('/new', (req, res, next) => {
  // ここにデータベースへ保存実装
  Fixture.findAll({
    where: {
      fixtureId: { [Op.like]: req.body.fixtureId + '%' } // fixtureDate <= japanTimeplus2
    }
  }).then((id) => {
    //fixtureId,fixtureDate,fixtureSort,homeTeam,awayTeam,homeScore,awayScore
    const fixtureDate = new Date(req.body.fixtureDate);
    const formattedDate = moment(fixtureDate).format("YYYY/MM/DD HH:mm");
    Fixture.upsert({
      fixtureId: req.body.fixtureId + (id.length + 1),
      fixtureDate: formattedDate,
      fixtureSort: req.body.fixtureSort,
      homeTeam: req.body.homeTeam,
      awayTeam: req.body.awayTeam,
      homeScore: '',
      awayScore: ''
    });
    res.redirect('/new');
  });
});

/* POST csv file */
router.post('/insert', (req, res, next) => {
  // ここに csvParse 実装

  // ここにデータベースへ保存実装

})

/* POST edit & delete */
router.post('/:fixtureId', (req, res, next) => {
  // ここに csvParse 実装

  // ここにデータベースへ保存実装

})


module.exports = router;
