var express = require('express');
var router = express.Router();
const moment = require('moment-timezone');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Fixture = require('../models/fixture');
const Post = require('../models/post');
const User = require('../models/user');
const Evaluation = require('../models/evaluation');
const config = require('../config');

/* GET fixtures page. */
router.get('/', function (req, res, next) {
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
      } else {
        fixtureTitle = '試合前'
      }
      let storedPosts = null;
      //評価済みMap(key:postId 、値：評価)を作成
      const selfEvaluationMap = new Map();
      //全評価Map(key:postId 、値：評価)を作成
      const rendSelfEvaluationMap = new Map();

      Post.findAll({
        where: { fixtureId: fixture.fixtureId },
        include: [
          {
            model: User,
            attributes: ['userId', 'username', 'thumbUrl']
          }],
        order: [['postId', 'DESC']]
      }).then((posts) => {
        storedPosts = posts;
        storedPosts.forEach((post) => {
          post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
        });
        //storedPostsごとforEachの、Evaluation.findAllの{evaluation: true}の合計
        //sumPostEvMap.set(postId , COUNT)
        return Evaluation.findAll({
          attributes: ['postId', [Sequelize.fn('COUNT', Sequelize.col('userId')), 'count']],
          group: ['postId'],
          where: {
            fixtureId: fixture.fixtureId,
            evaluation: 't'
          }
        });
      }).then((sumEva) => {
        const sumPostEvMap = new Map();
        sumEva.forEach((postEva) => {
          sumPostEvMap.set(postEva.postId, postEva.dataValues['count']);
          console.log(postEva.postId + 'の「いいね」の数は' + postEva.dataValues['count']);
        });
        if (req.user) {
          return Evaluation.findAll({
            where: {
              fixtureId: fixture.fixtureId,
              userId: req.user.provider + req.user.id
            }
          }).then((evaluations) => {
            // forEach でselfEvaluationMapに{[postId:evaluation]…}入れていく
            // selfEvaluationMap.set(e.postId , e.evaluation)
            evaluations.forEach((e) => {
              selfEvaluationMap.set(e.postId, e.evaluation);
              console.log('（評価済み）投稿' + e.postId + 'へあなたの評価は' + e.evaluation);
            });
            // storedPostsをforEachで回して、
            // const e = selfEvaluationMap.get(p.id) || 0
            // rendSelfEvaluationMap.set(p.id , e)
            storedPosts.forEach((p) => {
              const e = selfEvaluationMap.get(p.postId) || false;
              rendSelfEvaluationMap.set(p.postId, e);
              console.log('（全投稿）投稿' + p.postId + 'へあなたの評価は' + e);
            });
            // プラスするもの＝＞　rendSelfEvaluationMap , sumPostEvMap

            res.render('match', {
              title: fixtureTitle,
              user: req.user,
              fixture: fixture,
              posts: storedPosts,
              SelfEvaMap: rendSelfEvaluationMap,
              sumPostEvMap: sumPostEvMap,
              admin: config.admin,
              //  csrfToken: req.csrfToken()
            });
          });
        } else {
          res.render('index', {
            title: 'Top Page',
            user: req.user,
            fixture: fixture,
            posts: storedPosts,
            //SelfEvaMap: rendSelfEvaluationMap,
            sumPostEvMap: sumPostEvMap,
            admin: config.admin,
            //  csrfToken: req.csrfToken()
          });
        }

      });

    } else {
      const err = new Error('指定された試合は見つかりません');
      err.status = 404;
      next(err);
    }
  })
});

router.post('/:fixtureId/posts', (req, res, next) => {
  // ここにコメント処理
  const userId = req.user.provider + req.user.id;
  Post.create({
    fixtureId: req.params.fixtureId,
    postedBy: userId,
    content: req.body.content
  }).then(() => {
    if(parseInt(req.query.from) === 1) {
    res.redirect('/');
    }else{
          res.redirect('/fixtures/' + req.params.fixtureId);
    }
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

router.post('/:fixtureId/posts/:postId', (req, res, next) => {
  if (parseInt(req.query.delete) === 1) {
    Post.findOne({
      where: {
        postId: req.params.postId
      }
    }).then((post) => {
      if (post && (isMine(req, post) || isAdmin(req, post))) {
        deletePostAggregate(req.params.postId, () => {
          if (parseInt(req.query.from) === 1) {
            res.redirect('/');
          }else{
          res.redirect('/fixtures/' + req.params.fixtureId);
          }
        })
        // 以前いたURLにリダイレクトする
      } else {
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
      where: { postId: id }
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
