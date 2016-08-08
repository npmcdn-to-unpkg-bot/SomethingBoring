/*
  dw
*/
define([app.TPL_PATH + '/reports_online_by_city.jade',
  '../models/index',
  './paging',
  './toolbar',
  './toolbar_select_addr','datePicker'
], function(tpls, models, paging, toolbar ,select_addr) {

  var search = app.url.search;
  var main = new(app.MainView.extend({
    template: tpls.main,
    events:{
     'changeDate .datetimepicker': function(e){
        if(e.target.value){
          var search = app.url.search;
          var _tmp = search[e.target.name];
          
         search[e.target.name] = e.target.value;
         if(new Date(search.start_date) > new Date(search.end_date)){
          search[e.target.name] = _tmp;
          app.bootbox.alert('开始时间不可大于结束时间。')
          return;
         }
         app.go();
       }
     },
     'change select': function(e){
      components.select_btn.$('button').click();
     },
      'click button.dw_export' : function(e){
        var search = app.url.search;
        if(!search.commond){
          search.commond = app.API_CONF.def_reports_online_commond
        }
        var searchStr = encodeURIComponent(app.util.url.serializeQuery(search));
        var path = app.API_PATH + 
        "/download?filePath=/new_report_prize/exportStockPrizeStatData?"
        + searchStr;
        window.open(path);
     }
    }
  }));

  var $datetimepicker = main.$('.datetimepicker');
  var start_date = $datetimepicker.eq(0);
  var end_date = $datetimepicker.eq(1);
      start_date.datepicker({
        language:'zh-CN',
        autoclose: true,
        clearBtn:true,
        todayHighlight: true
      });
      end_date.datepicker({
        language:'zh-CN',
        autoclose: true,
        clearBtn:true,
        todayHighlight: true
      });
  var redPacketTable = new(app.TableView.extend({
    template: tpls.table,
    model: new models.report_onlineByCity,
    paging: paging
  }));


/* var cityList = new select_addr.Select_city({
  first:'全部',
  notDisabled: true,
  events:{
    'change select.selectpicker': function(e){
      this.$el.attr({
        search_k:'city_id',
        search_v
      })
    }
  }
});*/

var components = {table: redPacketTable,
      'select_bind_type': new toolbar.Select({
        key:'commond',
        label: '类型:',
        option:{
          'all_prize':'全部线上券',
          'big_prize':'大B线上券',
          'little_prize':'小B线上券'
        }
      }),
      select_btn: new toolbar.Select_btn({holdParam:['start_date', 'end_date']})
      }

  main.mount(components);
  var dateFormet = app.util.dateFormet;
  //----------------control----------------
  return function() {
    var search = app.url.search;
    if (!app.onThisPath) {
      
      search.start_date = search.start_date || dateFormet(Date.now() - 2592000000, 'yyyy-MM-dd');
      search.end_date = search.end_date || dateFormet(Date.now(), 'yyyy-MM-dd');
      search.commond = search.commond || app.API_CONF.def_reports_online_commond;
      app.url.searchStr = app.util.url.serializeQuery(search);

      main.mount({
        select_city:select_addr.select_city,
        paging: paging
      });
      main.display();
    }

    start_date.datepicker('update',search.start_date);
    end_date.datepicker('update',search.end_date);

    app.query(components);
    select_addr.select_city.query();
    redPacketTable.model.fetch();
  }

});