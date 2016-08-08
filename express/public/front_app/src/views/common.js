/*
  dw
*/
define([app.TPL_PATH + '/common.jade'], function(tpls) {
  //首页
  var index = new (app.MainView.extend({template: tpls.index}));
  //404
  var notFound = new (app.MainView.extend({template: tpls.notFound}));

  return {
    index : index,
    notFound: notFound
  }
});