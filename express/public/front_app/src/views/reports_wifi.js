/*
  dw
*/
define([app.TPL_PATH + '/reports_wifi.jade',
  '../models/index',
  './paging',
  './toolbar',
  './toolbar_select_addr','datePicker'
], function(tpls, models, paging, toolbar ,select_addr) {


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
      'click button.dw_export' : function(e){
        var search = app.url.search;
        if(!search.commond){
          search.commond = app.API_CONF.def_reports_commond
        }
        var searchStr = encodeURIComponent(app.util.url.serializeQuery(search));
        //console.log('searchStr', searchStr);
        var path = app.API_PATH + 
        "/download?filePath=/new_report_prize/exportWifiPrizeStatData?" 
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


  var bUserTable = new(app.TableView.extend({
    template: tpls.table,
    model: new models.report_wifi,
    paging: paging
  }));


  main.mount({table: bUserTable}); //挂载table组件

  var dateFormet = app.util.dateFormet;
  //----------------control----------------
  return function() {
    var search = app.url.search;
    if (!app.onThisPath) {

      search.start_date = search.start_date || dateFormet(Date.now() - 86400000, 'yyyy-MM-dd');
      search.end_date = search.end_date || dateFormet(Date.now() - 86400000, 'yyyy-MM-dd');
      app.url.searchStr = app.util.url.serializeQuery(search);
      start_date.datepicker('update',search.start_date);
      end_date.datepicker('update',search.end_date);
    
      main.mount({
        paging: paging,
        select_city: select_addr.select_city,
        select_market: select_addr.select_market,
        select_btn: new toolbar.Select_btn({holdParam:['start_date', 'end_date']})
      });
      main.display();
    }
    select_addr.select_city.query();

    bUserTable.model.fetch();
  }

});