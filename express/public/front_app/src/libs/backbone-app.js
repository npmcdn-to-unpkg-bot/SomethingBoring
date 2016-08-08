/*
修改了Backbone的路由，增加了一个next属性。
*/

define(['backbone', 'util'], function(Backbone, util) {
  Backbone.Router.prototype.route = function(route, name, callback) {
    if (!_.isRegExp(route)) route = this._routeToRegExp(route);
    var next = false;

    if (_.isFunction(name)) {
      callback = name;
      name = '';
    } else if (typeof name === 'object') {
      next = name.next;
      name = name.name || '';
    }

    if (!callback) callback = this[name];
    var router = this;
    Backbone.history.route(route, next, function(fragment) {
      var args = router._extractParameters(route, fragment);
      if (router.execute(callback, args, name) !== false) {
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      }
    });
    return this;
  }

  Backbone.history.route = function(route, next, callback) { //unshift is a jok ?
    this.handlers.push({
      route: route,
      next: next,
      callback: callback
    });
  }

  Backbone.history.loadUrl = function(fragment) {
    // If the root doesn't match, no routes can match either.
    if (!this.matchRoot()) return false;
    fragment = this.fragment = this.getFragment(fragment);

    var _bool;
    for (var i = 0, len = this.handlers.length; i < len; i++) {
      var handler = this.handlers[i];
      if (handler.route.test(fragment)) {
        handler.callback(fragment);
        _bool = true;
        if (!handler.next) {
          return true;
        }
      }
    }
    return _bool;
  }


  //====================app扩展====================

  //用户信息
  //web客户端唯一入口
  //Api服务器端只会生成一个session
  app.oldUrl = null;
  app.url = util.url.parse('');

  app.start = function(callback) {
    require([this.V_PATH + '/nav_menu'], function() {
      app.sessModel.fetch({
        success: callback
      });
    });
  };

  app.afterLogin = function() {
    this.el.login.hide();
    return this.router.navigate('/', {
      trigger: true
    });
  };

  /*  app.crank = function(path){
      return function(){}
    }*/
  //路由控制
  app.run = function(path) {
      return function() {
        var arg = arguments;
        require([path], function(control) {
          control.apply(null, arg);
        });
      }
    }
    /*  app.turn = function(path) {
          return function() {
            var arg = arguments;
            require([app.V_PATH + path], function(view) {
              view.render();
            });
          }
        }*/
    //路由跳转
  app.go = function(str) {
    str = typeof str === 'string' ? str : util.url.serialize(app.url);
    this.router.navigate(str, {
      trigger: true
    });
  }

  app.action = function(path) {
    return function() {
      if(!app.sessModel.get('isLogin')){
        return app.go('login');
      }
      var arg = arguments;

      require([app.V_PATH + path], function(action) {
        action.apply(null, arg);
      });
    }
  }


  var $app_tip = $('#app_tip');
  var $win = $(window);
  var $doc = $(document);
  app.tip = function(msg){
    $app_tip.html(msg);
      var w = $app_tip.outerWidth();
    $app_tip.css('left', 
      ($win.width() - w) /2
    );
    $app_tip.show();
    setTimeout(function(){
      $app_tip.fadeOut();
    },2000);
  }
//app.tip('test')
  //在hash一样的情况下重载
  app.reload = function() {
    Backbone.history.loadUrl();
  };

  //app.qsModel = new (Backbone.Model.extend({}));

  //默认view
  app.View = Backbone.View.extend({
    components: {},
    $components: null,
    mount: function(components) {
        var that = this;
        if (!this.$components) {
          this.$components = this.$('component');
        }
        this.$components.each(function() {
          var t = $(this),
            key = t.text();


          if (components[key]) {

/*            if (key === 'phoneview') {
              console.log('key', key, components[key])
            }*/
            if (!t.next().attr('component')) { //优化：加了个path属性，防止重复挂载
              var $el = components[key].$el;
              t.after($el);
              $el.attr('component', 'true');
              that.components[key] = components[key];
            }
          }
        });
      }
      /*    ,
          query: function(){
            _.each(this.components, function(v,k){
              if(v.query){
                v.query();
              }
            });
          }*/

  });

  app.query = function(components) {
      for (var i in components) {
        if (components[i].query) {
          components[i].query();
        }
      }
    }
    //主视图
  app.MainView = app.View.extend({
    template: null,
    initialize: function(obj) {
      this.template = this.template || obj.template;
      app.el.main.append(this.$el);
      this.$el.html(this.template());
    },
    display: function() { //切换显示
        this.$el.siblings().hide();
        this.$el.show();
      }
      /*    ,
          action: function(){
            _.each(this.components, function(v,k){
              //console.log('v',v)
              if(v.action){
                v.action();
              }
            });
          }*/
  });

  var glo_error = false;
  var table_loading = $('#dw_spin_loading');
  app.TableView = Backbone.View.extend({
    paging: null,
    template: null,
    className:'dw_table_wrap',
    initialize: function() {
      this.listenTo(this.model, "request", function(){
        //this.$el.spin('def');
        table_loading.spin('def');
        table_loading.show();
       // this.$el.append(table_loading);
      });
      this.listenTo(this.model, "sync", function(){
        table_loading.spin(false);
        table_loading.hide();
      });
      this.listenTo(this.model, "sync", this.render);
      this.listenTo(this.model, "error", function(model, resp){
        table_loading.spin(false);
        table_loading.hide();
        app.errorMsg(resp);
      });
    },
    render: function() {
      this.model.pagingInfo.index = Number(app.url.search.page) || 1;
      this.paging.model.set(this.model.pagingInfo);
      this.$el.html(this.template({
        data: this.model.toJSON()
      }));
      if (this.afterRender) {
        this.afterRender();
      }
    }
  });

  app.ModalView = app.View.extend({
    className: 'modal fade',
    hide: function() {
      this.$el.modal('hide');
    },

    show: function() {
      this.$el.modal('show');
    },
    model: null,
    template: null,
    initialize: function() {
      this.render();
      this.listenTo(this.model, "change", this.render);
      this.$el.modal('hide');
    },
    render: function() {
      this.$el.html(this.template({
        data: this.model ? this.model.toJSON() : null
      }));
      if (this.afterRender) {
        this.afterRender();
      }
    }
  });
  app.errorMsg = function(xhr) {
   // console.log(xhr)
   switch(xhr.status){
    case 403:
    return app.go('login');
    break;
    case 401:
    var json = xhr.responseJSON;
    app.bootbox.alert(json.message, function(){
      app.go(app.oldUrl.path);
    });
    break;
    default:
    var msg = '',
    json = xhr.responseJSON;
    if(json){
      if(json.message){
        return app.bootbox.alert(json.message);
      }
    }
    app.bootbox.alert(xhr.status + ' : ' + xhr.statusText + '\n' + xhr.responseText);
   }

  }
  
  app.route_conf = [{
    id: 1001,
    route: 'markets',
    name: '商场/商户管理'
  }, {
    id: 1011,
    route: 'marketAudits',
    name: '商场审核'
  }, {
    id: 1002,
    route: 'channels',
    name: '渠道管理'
  },{
    id: 1004,
    route: 'activitys',
    name: '活动管理'
  },{
    id: 1005,
    route: 'beacons',
    name: 'beacon管理'
  },{
    id: 1003,
    route: 'coupons',
    name: '优惠券审核'
  },{
    id: 1006,
    route: 'redPackets',
    name: '红包管理'
  },{
    id: 1008,
    route: 'users',
    name: '账户管理'
  }, {
    id: 1010,
    route: 'reports',
    name: '运营报表'
  }, {
    id: 1007,
    name: '吃豆豆管理',
    url: app.API_PATH + '/redirect?redirect=http://101.201.174.158/chidoudou/public/index.html'
  }];

  app.ROUTE_CONF = _.indexBy(app.route_conf,'id');
  return Backbone;
});


/*        1009: {
          route: 'logs',
          name: '操作日志'
        },*/
/*
加fixed版
  Backbone.Router.prototype.route = function(route, name, callback) {
    if (!_.isRegExp(route)) route = this._routeToRegExp(route);
    var next = false;
    var fixed = false;

    if (_.isFunction(name)) {
      callback = name;
      name = '';
    } else if (typeof name === 'object') {
      next = name.next;
      fixed = name.fixed;
      name = name.name || '';
    }

    if (!callback) callback = this[name];
    var router = this;
    Backbone.history.route(route, next, fixed, function(fragment) {
      var args = router._extractParameters(route, fragment);
      if (router.execute(callback, args, name) !== false) {
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      }
    });
    return this;
  }

  Backbone.history.route = function(route, next, fixed, callback) { //unshift is a jok ?
    this.handlers.push({
      route: route,
      next: next,
      fixed:fixed,
      callback: callback
    });
  }

  Backbone.history.loadUrl = function(fragment) {
    // If the root doesn't match, no routes can match either.
    if (!this.matchRoot()) return false;
    fragment = this.fragment = this.getFragment(fragment);

    var _bool;
    for (var i = 0, len = this.handlers.length; i < len; i++) {
      var handler = this.handlers[i];

      if (handler.route.test(fragment)) {

        //console.log('handler', handler.is_first)

        if(handler.fixed){
          if(!handler.is_fixed){
            handler.callback(fragment);
            handler.is_fixed = true;
          }
        }else{
          handler.callback(fragment);
        }
        
        _bool = true;
        if (!handler.next) {
          return true;
        }
      }else{
        handler.is_fixed = false;
      }
    }
    return _bool;
  }*/