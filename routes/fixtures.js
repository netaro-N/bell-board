var express = require('express');
var router = express.Router();
const moment = require('moment-timezone');
const Fixture = require('../models/fixture');
const Post = require('../models/post');
const User = require('../models/user');
const Evaluation = require('../models/evaluation');
const config = require('../config');

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


function isMine(req, post) {
  const userId = req.user.provider + req.user.id;
  return post && post.postedBy === userId;
}

function isAdmin(req, post) {
  const userId = req.user.provider + req.user.id;
  return post && config.admin === userId;
}

router.post('/posts', (req, res, next) => {
  if (parseInt(req.query.delete) === 1) {
    Post.findOne({
      where: {
        postId:req.body.postId
      }
    }).then((post) => {
      if (post && (isMine(req, post) || isAdmin(req, post))) {
        deletePostAggregate(req.body.postId, () => {
          res.redirect('/');})
      }else{
        const err = new Error('指定された投稿がない、または、削除する権限がありません。');
        err.status = 404;
        next(err);
      }
    });
  } else {
    // 本プロダクトではpost createは違うURLだから。ここは編集機能にでもしようか？
    // const userId = req.user.provider + req.user.id;
    // Post.create({
    //   postedBy: userId,
    //   content: req.body.content
    // }).then(() => {
    //   res.redirect(302, '/');
    // });
    const err = new Error('不正なリクエストです。');
    err.status = 404;
    next(err);
  }
});

function deletePostAggregate(id, done, err) {
  Post.findByPk(id).then((post) => {
      //いいねの削除
      Evaluation.findAll({
        where:{ postId:id }
      }).then((evaluations) => {
        const promises = evaluations.map((e) => { return e.destroy(); });
        return Promise.all(promises);
      }).then(() => {
        return post.destroy();
      }).then(() => {
      if (err) return done(err); // ??いらんやろ。これテスト用や！
      done();
      });
  });
}

router.deletePostAggregate = deletePostAggregate;
module.exports = router;
