var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('fixtures', { user:req.user });
});

router.get('/:fixtureId', function(req, res, next) {
  //　ここに、個別ページへの実装をする
  res.render('match', { 
    user:req.user,
    ID:req.params.fixtureId
  })
})

module.exports = router;
