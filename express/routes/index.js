var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/vue', function(req, res, next) {
  res.render('vue', { title: 'Express' });
});
router.get('/testJson', function(req, res, next) {
  res.status(500).json({ testJson: 'testJson' });
});
router.get('/jquery', function(req, res, next) {
  res.render('jquery', { title: 'Express' });
});
module.exports = router;
