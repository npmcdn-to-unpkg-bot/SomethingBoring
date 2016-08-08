/*
  dw，通用的paging，已生成好，直接用。
*/

define([app.TPL_PATH + '/common.jade'], function(tpl) {
  var model = Backbone.Model.extend({
    defaults: {
        max: 0,
        index: 1
      }
  });

  
  var len = 8, //默认显示几列
  pre_len = Math.round(len / 2),
  next_len = len - pre_len;

  var view = Backbone.View.extend({
    model: new model,
    initialize: function() {
      this.listenTo(this.model, "change", this.render);
    },
    events: {
      'click nav ul li.dw_pagging_prev': 'prevClick',
      'click nav ul li.dw_pagging_com': 'indexClick',
      'click nav ul li.dw_pagging_next': 'nextClick',
      'click nav ul li.pre_ellipsis': 'pre_ellipsisClick',
      'click nav ul li.next_ellipsis': 'next_ellipsisClick'
    },
    pre_ellipsisClick : function(e){
      app.url.search.page = this.model.get('index') - pre_len -1;
      app.go();
    },
    next_ellipsisClick : function(e){
      app.url.search.page = this.model.get('index') + next_len;
      app.go();
    },
    prevClick: function(e) {
      app.url.search.page = this.model.get('index') - 1;
      app.go();
    },
    indexClick: function(e) {
      //console.log('indexClick', e.target)

      var t = $(e.target);
      app.url.search.page = Number(t.text());
      app.go();
    },
    nextClick: function(e) {

      app.url.search.page = this.model.get('index') + 1;
      app.go();
    },
    render: function() {
      var data = this.model.toJSON();
      //console.log(data);

      var i = 2,
        index = data.index,
        max = data.max,
        len2 = len, pre_ellipsis = 'pre_ellipsis',
        next_ellipsis = 'next_ellipsis';

      if (max <= len) {
        len2 = max;
        pre_ellipsis = 'hidden';
        next_ellipsis = 'hidden';
        
      } else if (index < len) {
        pre_ellipsis = 'hidden';

      } else if (max - index <= len) {
        len2 = max;
        i = max - len;
        next_ellipsis = 'hidden';
      } else {
        i = index - pre_len;
        len2 = i + len;
      }
      
      data.i = i;
      data.len2 = len2;
      data.pre_ellipsis = pre_ellipsis;
      data.next_ellipsis = next_ellipsis;
      this.$el.html(tpl.paging(data));
    }
  });

  return new view;
});