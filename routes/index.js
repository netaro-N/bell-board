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

/* GET home page. */
router.get('/', function (req, res, next) {
  const nowTime = new Date();
  const japanTime = moment(nowTime).tz('Asia/Tokyo').format("YYYY/MM/DD HH:mm");
  Fixture.findOne({
    where: {
      fixtureDate: { [Op.lte]: new Date(japanTime) } // fixtureDate <= japanTime 2019/04/13 Op.lte → $lte
    },
    order: [['"fixtureDate"', 'DESC']]
  }).then((fixture) => {
    if (fixture) {
      fixture.formattedDate = moment(fixture.fixtureDate).format('YYYY/MM/DD (ddd) HH:mm');
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
        // storedPostsごとforEachの、Evaluation.findAllの{evaluation: true}の合計
        // sumPostEvMap.set(postId , COUNT)
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
        // ログイン時
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

            res.render('index', {
              title: req.user.username + 'さんこんにちは',
              user: req.user,
              fixture: fixture,
              posts: storedPosts,
              SelfEvaMap: rendSelfEvaluationMap,
              sumPostEvMap: sumPostEvMap,
              admin: config.admin,
              //  csrfToken: req.csrfToken()
            });
          });
        }
        //  非ログイン時
        else {
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
      const err = new Error('表示できる試合がございません。');
      err.status = 404;
      next(err);
    };
  });
});

router.get('/:fixtureDate/last', (req, res, next) => {
  // moment で整形。そうしないとsequelizeで比較できない？
  console.log("出力結果");
  console.log(req.params.fixtureDate); // [Sat Dec 07 2019 14:00:00 GMT+0000 (UTC)]
  console.log(new Date(req.params.fixtureDate)); // [2019-12-07T14:00:00.000Z]
  console.log(moment(new Date(req.params.fixtureDate))); //  [moment("2019-12-07T14:00:00.000")]
  // const testDate = new Date(req.params.fixtureDate);  こちらのtestDateでもおｋですが、念の為moment を利用しておきます。
  const originDate = moment(new Date(req.params.fixtureDate));
  Fixture.findOne({
    where: {
      fixtureDate: { [Op.lt]: originDate }
    },
    order: [['"fixtureDate"', 'DESC']]
  }).then((fixture) => {
    if (fixture) {
      res.redirect(`/fixtures/${fixture.fixtureId}`);
    } else {
      const err = new Error('これより前の試合はありません');
      err.status = 404;
      next(err);
    }
  })
});

router.get('/:fixtureDate/next', (req, res, next) => {
  const originDate = moment(new Date(req.params.fixtureDate));
  Fixture.findOne({
    where: {
      fixtureDate: { [Op.gt]: originDate }
    },
    order: [['"fixtureDate"', 'ASC']]
  }).then((fixture) => {
    if (fixture) {
      res.redirect(`/fixtures/${fixture.fixtureId}`);
    } else {
      const err = new Error('これより後の試合はありません');
      err.status = 404;
      next(err);
    }
  })
});

module.exports = router;
