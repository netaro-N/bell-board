var express = require('express');
var router = express.Router();
const fs = require('fs');
const moment = require('moment-timezone');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Fixture = require('../models/fixture');
const Evaluation = require('../models/evaluation');
const Post = require('../models/post');
const csvParse = require('csv-parse/lib/sync'); // requiring sync module 同期でパースする

/* GET manage page. */
router.get('/', function (req, res, next) {
  Fixture.findAll({
    order: [['"fixtureId"', 'ASC']]
  }).then((fixtures) => {
    const ID = [];
    fixtures.forEach((f) => {
      ID.push(f.fixtureId);
    });
    res.render('manage', {
      title: '管理人ページ',
      user: req.user,
      ID: ID
    });
  });
});


/* GET new page. */
router.get('/new', function (req, res, next) {
  //　ここに、新規ページへの実装をする
  res.render('new', {
    user: req.user
  });
});

/* GET edit page */
router.get('/:fixtureId', function (req, res, next) {
  Fixture.findOne({
    where: {
      fixtureId: req.params.fixtureId
    }
  }).then((fixture) => {
    if (fixture) {
      //YYYY-MM-DDThh:mm:ss
      fixture.formattedDate = moment(fixture.fixtureDate).format('YYYY-MM-DDTHH:mm');
      console.log(fixture.formattedDate);
      res.render('edit', {
        title: '編集ページです',
        user: req.user,
        fixture: fixture
      });
    } else {
      const err = new Error('試合が無いので編集できません');
      err.status = 404;
      next(err);
    }
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
    //fixtureId,fixtureDate,description,homeTeam,awayTeam,homeScore,awayScore
    const fixtureDate = new Date(req.body.fixtureDate);
    const formattedDate = moment(fixtureDate).format("YYYY/MM/DD HH:mm");
    Fixture.upsert({
      fixtureId: req.body.fixtureId + (id.length + 1),
      fixtureDate: formattedDate,
      description: req.body.description,
      location: req.body.location,
      homeTeam: req.body.homeTeam,
      awayTeam: req.body.awayTeam,
      homeScore: '',
      awayScore: ''
    });
    res.redirect('/manage/new');
  });
});

/* POST csv file */
router.post('/insert', (req, res, next) => {
  const file = '19.csv';
  let data = fs.readFileSync(file);
  let Parse = csvParse(data, {
    delimiter: ',',
    rowDelimiter: 'auto',
    quote: '"',
    escape: '"',
    columns: true,
    comment: '#',
    skip_empty_line: true,
    trim: false
  });
  Parse.forEach((f, i) => {
    // 時差用　f.formattedDate = moment(f.fixtureDate, 'DD/MM/YYYY HH:mm').add(8, 'hours').format("YYYY/MM/DD HH:mm");
    //console.log(f.fixtureDate + ' → ' + f.formattedDate);

    // fixtureId,fixtureDate,desctiption,location,homeTeam,awayTeam,homeScore,awayScore
    Fixture.upsert({
      fixtureId: f.fixtureId,
      fixtureDate: f.fixtureDate,
      description: f.description,
      location: f.location,
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      homeScore: f.homeScore,
      awayScore: f.awayScore
    });

  });
  res.redirect('/fixtures');
  console.log('サーバーサイドおK');
});


/* POST 編集ページへリダイレクト */
router.post('/edit', function (req, res, next) {
  res.redirect(`/manage/${req.body.fixtureId}`);
});

/* POST edit & delete */
router.post('/:fixtureId', (req, res, next) => {
  const fixtureDate = new Date(req.body.fixtureDate);
  const formattedDate = moment(fixtureDate).format("YYYY/MM/DD HH:mm");
  console.log(fixtureDate + ' → ' + formattedDate);
  console.log('確認しました');
  Fixture.findOne({
    where: {
      fixtureId: req.params.fixtureId
    }
  }).then((f) => {
    if (f) {
      if (parseInt(req.query.edit) === 1) {
        f.update({
          fixtureId: f.fixtureId,
          fixtureDate: formattedDate,
          description: req.body.description,
          location: req.body.location,
          homeTeam: req.body.homeTeam,
          awayTeam: req.body.awayTeam,
          homeScore: req.body.homeScore,
          awayScore: req.body.awayScore
        }).then((fixture) => {
          res.redirect('/fixtures/' + fixture.fixtureId);
        });
      } else if (parseInt(req.query.delete) === 1) {
        console.log('get!!' + req.params.fixtureId);
        deleteFixtureAggregate(req.params.fixtureId, () => { // １：ID　２：done関数
          res.redirect('/');
        });
      } else {
        const err = new Error('不正なリクエストです');
        err.status = 400;
        next(err);
      }
    } else {
      const err = new Error('指定された予定がありません');
      err.status = 404;
      next(err);
    }
  });
})

function deleteFixtureAggregate(fixtureId, done, err) {

  Evaluation.findAll({
    where: { fixtureId: fixtureId }
  }).then((evaluations) => {
    const promises = evaluations.map((a) => { return a.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    return Post.findAll({
      where: { fixtureId: fixtureId }
    });
  }).then((posts) => {
    const promises = posts.map((p) => { return p.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    return Fixture.findByPk(fixtureId).then((f) => { f.destroy(); });
  }).then(() => {
    if (err) return done(err);
    done();
  });
}

router.deleteFixtureAggregate = deleteFixtureAggregate;

module.exports = router;
