/*
  dw
*/
define([app.TPL_PATH + '/common.jade'],
  function(tpls) {

    var sessModel = Backbone.Model.extend({
      url: app.API_PATH + '/sessInfo',
      defaults: {
        isLogin: null,
        user: null
      }
    });

    sessModel = new sessModel;
    app.sessModel = sessModel;

    //上导航
    var TopNav = Backbone.View.extend({
      model: sessModel,
      el: app.el.topNav,
      template: tpls.top_nav,
      initialize: function() {
        this.listenTo(this.model, "change", this.render);
      },
      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
      }
    });

    //左菜单
    var LeftMenu = Backbone.View.extend({
      el: app.el.leftMenu,
      model: new Backbone.Model({
        indexKey: '',
        list: null
      }),
      template: tpls.left_menu,
      initialize: function() {
        this.listenTo(sessModel, 'change:isLogin', this.render);
      },
      render: function(model, isLogin) {
        if (!isLogin) {
          return;
        }
        var route_conf = app.route_conf;
        var userData = sessModel.toJSON();
        var user = userData.user;
        var localKey = user.username + '.leftMenu';
        var localMenu = localStorage[localKey];
        if(!localMenu){
          app.bootbox.alert('出错了，请重新登录！');
          sessModel.set('isLogin', false);
          return app.go('login');
        }
        localMenu = JSON.parse(localMenu);
        var list = [];

/*        for (var i = 0, len = localMenu.length; i < len; i++) {
          var k = localMenu[i];
          if(ROUTE_CONF[k]){
            list.push(ROUTE_CONF[k]);
          }
        }*/

        var _localMenu = _.indexBy(localMenu);
        for (var i = 0, len = route_conf.length; i < len; i++) {
          var id = route_conf[i].id;
          if(_localMenu[id]){
            list.push(route_conf[i]);
          }
        }

        

        var indexKey = "app.url.path.substr('/')[0] || app.def_index";

        //console.log('indexKey', indexKey);
        this.model.set({
          indexKey: indexKey,
          list: list
        });
        this.$el.html(this.template(this.model.toJSON()));
        this.find_a = this.$el.find('a');
      },
      highLight: function() {
        if(!this.find_a){
          return;
        }
        this.find_a.each(function() { //菜单高亮
          var t = $(this),
            href = t.attr('href').substr(1);
          if (href === app.url.path ||
            (href && app.url.path.indexOf(href) === 0)) {
            t.parent().addClass('active')
              .siblings().removeClass('active');
            return false;
          }
        });
      }
    });

    return {
      topNav: new TopNav,
      leftMenu: new LeftMenu
    }
  });