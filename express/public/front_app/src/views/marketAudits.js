/*
  dw
*/
define([app.TPL_PATH + '/marketAudits.jade',
  '../models/index',
  './paging', './toolbar', './toolbar_select_addr'
], function(tpls, models, paging, toolbar, select_addr) {

  var tableModel = new models.marketAuditsTable;
  var table = new(app.TableView.extend({
    template: tpls.table,
    model: tableModel,
    events: {
      //修改用户
      'click button.dw_modify': function(e) {
        var t = $(e.target),
          id = t.parent().attr('modelId');
        var data = this.model.get(id).toJSON();
        modal.model.set(data);
        modal.show();

      }
    },
    paging: paging
  }));
  var modal = new(app.ModalView.extend({
    template: tpls.modal,
    events:{
      'click .dw_submit':function(e){
        var t = $(e.target),
        data = this.$el.dwGetInputData();
        //console.log('data', data);
        //return;
        $.ajax({
          url:app.API_PATH + '/markets/updateauthtype',
          type: 'post',
          data:data,
          success: function(){
            modal.hide();
            table.model.fetch();
          },
          error: app.errorMsg
        })

      }
    },
    model:new Backbone.Model({})
  }));

  var main = new(app.MainView.extend({
    template: tpls.main
  }));

  //挂载内部组件
  main.mount({
    table: table,
    modal: modal
  });

  var hybrid_search = new toolbar.Hybrid_search({placeholder: '建筑物id/商场名称'});
    var components = {
      'select_is_allcoupon_audit': new toolbar.Select({
        key:'is_allcoupon_audit',
        label:'是否所有券都要审核:',
        def: '全部',
        option:{
          '0':'否',
          '1':'是'
        }
      }),
      'select_is_auto_audit': new toolbar.Select({
        key:'is_auto_audit',
        label:'是否自动审核:',
        def: '全部',
        option:{
          '0':'否',
          '1':'是'
        }
      }),
      'select_city': select_addr.select_city,
      'select_market': select_addr.select_market,
      'select_btn': toolbar.select_btn,
      hybrid_search: hybrid_search,
      'paging': paging
    }

  //----------------control----------------
    return function() {
      if (!app.onThisPath) {
        main.mount(components);
        main.display();
      }
      app.query(components);

      table.model.fetch();
    }

});