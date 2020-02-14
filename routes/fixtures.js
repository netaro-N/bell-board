var express = require('express');
var router = express.Router();
const moment = require('moment-timezone');
const Fixture = require('../models/fixture');
const Post = require('../models/post');
const User = require('../models/user');

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
        fixtures: fixtures,
        user: req.user
      });
    } else {
      const err = new Error('試合一覧がございません。申し訳ございません。');
      err.status = 404;
      next(err);
    };
  });
});

/* GET 個別ページ */
router.get('/:fixtureId', function (req, res, next) {
  Fixture.findOne({
    where: {
      fixtureId: req.params.fixtureId
    }
  }).then((fixture) => {
    if (fixture) {
      let fixtureTitle = '';
      const nowTime = new Date();
      nowTime.setHours(nowTime.getHours() - 5);
      const japanTimeminus5 = moment(nowTime).tz('Asia/Tokyo').format("YYYY/MM/DD HH:mm");
      fixture.formattedDate = moment(fixture.fixtureDate).format('YYYY/MM/DD (ddd) HH:mm');
      const fixtureStatus = moment(new Date(fixture.formattedDate)).isBefore(new Date(japanTimeminus5));
      if (fixtureStatus) {
        fixtureTitle = '試合終了'
      }else {
        fixtureTitle = '試合前'
      }
      res.render('match', {
        title: fixtureTitle,
        fixture: fixture,
        user: req.user
      });
    } else {
      const err = new Error('指定された試合は見つかりません');
      err.status = 404;
      next(err);
    }
  })
});

router.post('/:fixtureId/posts' , (req,res ,next) => {
// ここにコメント処理
  const userId = req.user.provider + req.user.id;
  Post.create({
    fixtureId:req.params.fixtureId,
    postedBy:userId,
    content:req.body.content
  }).then(() => {
    res.redirect(302, '/fixtures/'+req.params.fixtureId);
  })
});

router.post('/:fixtureId/posts/:postId', (req, res, next) => {
  //if (parseInt(req.query.delete) === 1){ の処理 }
})

module.exports = router;
