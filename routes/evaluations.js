'use strict';
const express = require('express');
const router = express.Router();
//const authenticationEnsurer = require('./authentication-ensurer');
const Evaluation = require('../models/evaluation');

router.post('/:fixtureId/post/:postId/users/:userId', (req,res,next) => {
  const fixtureId = req.params.fixtureId;
  const postId = req.params.postId;
  const userId = req.params.userId;
  let evaluation = req.body.evaluation;
console.log(userId+'さんのfixtureId='+fixtureId+',,,postId='+postId+'への評価は'+evaluation+'です');
  Evaluation.upsert({
    postId : postId,
    userId : userId,
    evaluation : evaluation,
    fixtureId : fixtureId
  }).then(() => {
    //最後に ↓
    res.json( {status: 'OK', evaluation: evaluation} );
  });
});

module.exports = router;