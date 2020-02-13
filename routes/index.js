var express = require('express');
var router = express.Router();
const moment = require('moment-timezone');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Fixture = require('../models/fixture');

/* GET home page. */
router.get('/', function(req, res, next) {
  const nowTime = new Date();
  console.log('nowTime ==='+nowTime);
  const japanTime = moment(nowTime).tz('Asia/Tokyo').format("YYYY/MM/DD HH:mm");
  console.log('japanTime === ' + japanTime);
  console.log('整形⇒' +new Date(japanTime) );
  Fixture.findOne({
    where: {
      fixtureDate: { [Op.lte]: new Date(japanTime) } // fixtureDate <= japanTimeplus2 2019/04/13 Op.lte → $lte
    },
    order: [['"fixtureDate"', 'DESC']]
  }).then((fixture) => {
    if (fixture) {
      fixture.formattedDate = moment(fixture.fixtureDate).format('YYYY/MM/DD (ddd) HH:mm');
        res.render('index', {
          user:req.user,
          title: 'こちらはトップページです',
          fixture: fixture
        });
    } else {
      const err = new Error('表示できる試合がございません。');
      err.status = 404;
      next(err);
    };
  });
});

module.exports = router;
