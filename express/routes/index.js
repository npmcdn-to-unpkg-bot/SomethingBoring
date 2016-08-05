var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('*', function(req, res, next) {
  console.log('req.path', req.path);
  var path = req.path.substr(1);
  path = path || 'index';
  console.log('path', path);
  res.render(path, {path: path});
});

module.exports = router;
