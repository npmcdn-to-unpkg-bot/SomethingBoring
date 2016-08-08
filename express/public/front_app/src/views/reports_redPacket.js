/*
  dw
*/
define([app.TPL_PATH + '/reports_redPacket.jade',
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
      'click button.dw_export' : function(e){
        var search = app.url.search;
        if(!search.commond){
          search.commond = app.API_CONF.def_reports_commond
        }
        var searchStr = encodeURIComponent(app.util.url.serializeQuery(search));
        var path = app.API_PATH + 
        "/download?filePath=/redpack/reportExport?"
        + searchStr;
        window.open(path);
     },
      'click button.dw_export_detail' : function(e){
        var search = app.url.search;
        if(!search.commond){
          search.commond = app.API_CONF.def_reports_commond
        }
        var searchStr = encodeURIComponent(app.util.url.serializeQuery(search));
        var path = app.API_PATH + 
        "/download?filePath=/redpack/reportDetailExport?" + searchStr
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
    model: new models.report_redPackets,
    paging: paging
  }));

var components = {table: redPacketTable,

              param_search: new toolbar.Param_search({
                    holdParam:['start_date', 'end_date'],
                    activity_name:'活动名称',
                    market_name: '商场名称',
                    shop_name: '商户名称',
                    activity_id: '活动ID'
              }),
      'select_status': new toolbar.Select({
        key:'activity_status',
        label:'状态:',
        def: '全部',
        option:{
          '0':'准备中',
          '1':'进行中',
          '2':'暂停',
          '3':'已结束'
        }
      }),

      'select_type': new toolbar.Select({
        key:'channel',
        label:'类型:',
        def: '全部',
        option:{
          '0':'抽奖',
          '1':'送券'
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
      app.url.searchStr = app.util.url.serializeQuery(search);

      main.mount({
        paging: paging
      });
      main.display();
    }

    start_date.datepicker('update',search.start_date);
    end_date.datepicker('update',search.end_date);

    app.query(components);
    redPacketTable.model.fetch();
  }

});