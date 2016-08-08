/*
  dw
*/
// app 变量已在首页定义了。
app.API_PATH = '/api/admin';
app.TPL_PATH = '/jade_compiled';
app.PATH = app.baseUrl + app.mainPath;
app.V_PATH = app.PATH + '/views';


require.config({
  paths: {
    jquery: 'http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min',
    bootstrap: '/public/bootstrap/dist/js/bootstrap.min',
    underscore: '/public/js/underscore-min',
    backbone: '/public/js/backbone-min',
    css: 'http://apps.bdimg.com/libs/require-css/0.1.8/css.min',
    text: '/public/js/require-text',
    json: '//cdn.bootcss.com/requirejs-plugins/1.0.3/json.min',
    datePicker: '/public/bootstrap-datepicker/dist/locales/bootstrap-datepicker.zh-CN.min',
    datePickerJs: '/public/bootstrap-datepicker/dist/js/bootstrap-datepicker.min',
    datepickerCss: '/public/bootstrap-datepicker/dist/css/bootstrap-datepicker.min',
    backbone_app: app.PATH + '/libs/backbone-app',
    util: app.PATH + '/libs/util',
    bootstrap_select: '/public/bootstrap-select/dist/js/bootstrap-select.min',
    md5: '/public/js/md5.min',
    clockpicker: '/public/clockpicker/clockpicker',
    ajaxfileupload: '/public/js/jquery_fn_ajaxfileupload',
    bootbox: '/public/js/bootbox.min'
  },
  shim: {
    'backbone': ['jquery', 'underscore'],
    'backbone_app': ['backbone'],
    'bootstrap_select': ['css!/public/bootstrap-select/dist/css/bootstrap-select.min.css'],
    'bootstrap': ['jquery'],
    'bootstrap': ['jquery'],
    'datePicker': ['datePickerJs', 'css!datepickerCss'],
    'clockpicker': ['css!clockpicker']
  }
});

require(['backbone_app', 'util', 'bootstrap', 'bootbox'], function(Backbone, util, b, bootbox) {

  /*$.ajaxSetup({
        xhrFields: { //跨站ajax请求初始化.
          withCredentials: true
        }
  });*/

  app.el = {
    login: $('#login'),
    topNav: $('#topNav'),
    leftMenu: $('#leftMenu'),
    main: $('#main')
  }
  app.bootbox = bootbox;

  app.util = util;

  //--------------- 路由 ---------------
  var router = new(Backbone.Router.extend({}));
  app.def_index = '';
  //简单的路由parse
  router.route('*path', {
    next: true
  }, function() {
    app.fragment = Backbone.history.getFragment() || app.def_index;
    app.oldUrl = app.url;
    app.url = util.url.parse(app.fragment);
    app.onThisPath = (app.oldUrl.path === app.url.path);
    //app.qsModel.set(app.url.search);
  });

  //登录页
  router.route('login', function() {
    require([app.V_PATH + '/login'], function(view) {
      if (app.sessModel && app.sessModel.get('isLogin')) {
        view.$el.hide();
        app.go('');
      } else {
        view.$el.show();
      }
    });
  });



  app.router = router;

  app.start(function(sessModel) {

    var run = app.run;

    //左菜单和上导航
    router.route('*path', {
      next: true
    }, function() {
      if (!sessModel.get('isLogin')) {
        app.go('login');
      } else {
        app.el.login.hide();
      }

      require([app.V_PATH + '/nav_menu'], function(view) {
        view.leftMenu.highLight(); //左菜单高亮
      });
    });

    //首页
    router.route('', function() {
      require([app.V_PATH + '/common'], function(view) {
        view.index.display();
      });
    });


    //生成路由
    _.each(app.ROUTE_CONF, function(v, k) {
      if (v.route) {
        router.route(v.route, app.action('/' + v.route));
      }
    });

    router.route('channels/:activityId/beacons', app.action('/channel_high_bind'));

    router.route('activitys/:activityId/beacons', app.action('/high_bind'));
    router.route('activitys/:activityId/B_coupons', app.action('/activitys/B_coupons'));
    router.route('activitys/:activityId/set_channels', app.action('/activitys/set_channels'));

    router.route('reports/bprize', app.action('/reports_bprize'));
    router.route('reports/redpacket', app.action('/reports_redPacket'));
    router.route('reports/wifi', app.action('/reports_wifi'));
    router.route('reports/onlinePrizesByCity', app.action('/reports_online_by_city'));
    router.route('reports/onlinePrizesByOneDay', app.action('/reports_online_by_one_day'));

    //404
    router.route('*path', function() {
      require([app.V_PATH + '/common'], function(view) {
        view.notFound.display();
      });
    });

    /*  $(document).on("click", "a", function(e){
        e.preventDefault(); // This is important
        var href = $(e.currentTarget).attr('href');
        router.navigate(href, true);
      });*/

    Backbone.history.start( /*{pushState: true}*/ );

  });
});