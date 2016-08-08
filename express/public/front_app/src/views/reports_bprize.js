/*
  dw
*/
define([app.TPL_PATH + '/reports_bprize.jade',
  '../models/index',
  './paging',
  './toolbar',
  './toolbar_select_addr'
], function(tpls, models, paging, toolbar ,select_addr) {


  var select_six_date = new (Backbone.View.extend({
    template: tpls.select_six_date,
    className: 'btn-group',
    initialize: function() {
      this.$el.attr('data-toggle', 'buttons');
      this.render();
      this.$label = this.$el.children();
      this.active();
    },
    get_commond : function(){
      return app.url.search.commond || app.API_CONF.def_reports_commond;
    },
    active: function(){
      var commond = this.get_commond();
      this.$label.each(function(){
        var t = $(this);
        if(t.attr('commond') === commond){
          t.addClass('active');
          t.siblings().removeClass('active');
          return false;
        }
      })
    },
    render: function(){
      this.$el.html(this.template({data:this.commonds}));
    },
    events: {
      'click label' : function(e){
        var search = app.url.search;
        search.commond = $(e.target).attr('commond');
        console.log('url.commond', search.commond);
        delete(search.page);
        app.go();
      }
    },
    commonds: {
        'today':'今日',
        'yesterday':'昨日',
        'tweek':'本周',
        'lweek':'上周',
        'tmonth':'本月',
        'lmonth':'上月'
      }
  }));

  var main = new(app.MainView.extend({
    template: tpls.main,
    events:{
      'click button.dw_export' : function(e){
        var search = app.url.search;
        if(!search.commond){
          search.commond = app.API_CONF.def_reports_commond
        }
        var searchStr = encodeURIComponent(app.util.url.serializeQuery(search));
        console.log('searchStr', searchStr);
        var path = app.API_PATH + 
        "/download?filePath=/new_report_prize/exportPrizeStatData?" 
        + searchStr;
        window.open(path);
     }
    }
  }));

  var bUserTable = new(app.TableView.extend({
    template: tpls.table,
    model: new models.bPrizess,
    paging: paging
  }));


  main.mount({table: bUserTable, select_six_date: select_six_date}); //挂载table组件


  //----------------control----------------
  return function() {
    if (!app.onThisPath) {
      main.mount({
        paging: paging,
        select_city: select_addr.select_city,
        select_market: select_addr.select_market,
        select_btn: toolbar.select_btn
      });
      main.display();
    }
    select_six_date.active();
    select_addr.select_city.query();

    bUserTable.model.fetch();
  }

});