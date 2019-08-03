var express = require('express');
var router = express.Router();

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
module.exports = router;
