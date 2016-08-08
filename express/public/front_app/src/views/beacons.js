/*
  dw
*/
define([app.TPL_PATH + '/beacons.jade',
  '../models/index',
  './paging','./toolbar','./toolbar_select_addr'
], function(tpls, models, paging, toolbar, select_addr) {

  var main = new app.MainView({
    template: tpls.main,
    events:{
      'click button.dw_batch':function(e){
        batch_modal.show();
      }
    }
  });

  var search_bak = {};

  var tableModel = new models.Beacons;
  var table = new(app.TableView.extend({
    template: tpls.table,
    model:tableModel,
    events:{
      'click a.dw_modify':function(e){
        var t = $(e.target),
        id = Number(t.attr('modelId'));
        modal.model.clear({silent:true});
        var data = this.model.get(id).toJSON();

        modal.model.set(data);
        var search = app.url.search;
        search_bak = _.clone(search);
/*        if(search_bak.city_id == data.cityId){
          console.log('search_bak.city_id == data.cityId')
          components.select_city.model.set('city_id', null);
        }*/

        search.city_id = data.cityId;
        search.market_id = data.marketId || -1;
        search.shop_id = data.shopId || -1;
        modal.model.set(data);
        modal.putId = data.id;
        //console.log('app.url.search', app.url.search);
        modal.$components =null;
        modal.mount(components);
        components.select_city.query();

        modal.show();
      }
    },
    paging: paging
  }));

  function _dissmiss(){
    components.select_city.model.set('city_id', null);
    app.url.search = search_bak;
    //console.log('app.url.search', app.url.search);
    components.select_city.query();
    //components.select_city.set('city_id', search_bak.city_id);
    main.mount(components);

    modal.hide();
  }
  main.mount({table: table}); //挂载table组件
 var modal = new (app.ModalView.extend({
    template: tpls.modal,
    model: new Backbone.Model({}),
    events: {
      'click button.dw_submit':function(e){
        //_dissmiss();

        var data={
            city_id: components.select_city.$el.attr('search_v')
          };
          var id = components.select_market.$el.attr('search_v');
          if(id){
            data.market_id =  id;
          }
          id = components.select_shop.$el.attr('search_v');
          if(id){
            data.shop_id =  id;
          }else{
            data.shop_id = 0;
          }

          data = _.extend(this.$el.dwGetInputData(), data);
          //console.log('data', data);
          if(!data.market_id){
            return alert('请选择商场');
          }
          var msg = veify_common(data);
          if(msg){
            return(alert(msg));
          };
          var t =$(e.target);
          if(t.attr('disabled')){
            return;
          }
          t.attr('disabled',true);


        $.ajax({
          type:'put',
          url: app.API_PATH + table.model.path + '/' + modal.putId,
          data:data,
          success: function(){
            table.model.fetch({success:function(){
              _dissmiss();
            }});
            
            
          },
          error: app.errorMsg,
          complete: function(){
            t.removeAttr('disabled');
          }
        })
      },
      'click button.dw_dissmiss':function(){
        _dissmiss();
      }
    }
  }));

 var addr_data; 
 var marketList = new select_addr.Select_market({
  first:'请选择',
  events:{
    'change select.selectpicker': function(e){
      var thatModel = this.model;
      var data = {
          city_id: thatModel.get('city_id'),
          market_id: e.target.value
        };
       if(!data.market_id){
        return;
       }
      addr_data = data;
     //console.log('data', data);

      $.ajax({
        type:'get',
        url: app.API_PATH + '/beaconCountNum',
        data:data,
        success: function(data){
          batch_modal.$beacon_total.text(data);
        },
        error: app.errorMsg
      });
    }
  }
});
 var cityList = new select_addr.Select_city({
  first:'请选择',
  events:{
    'change select.selectpicker': function(e){
      marketList.model.set('city_id', e.target.value);
      batch_modal.$beacon_total.text('');
    }
  }
});

function veify_common(data){
  if(data.store_id && data.app_id){
    return 0;
  }else if(!data.store_id && !data.app_id){
    data.store_id = '';
    data.app_id = '';
    return 0;
  }else{
    return '微信门店ID和微信appid必须同时存在';
  }

  return 0;
}

 var batch_modal = new (app.ModalView.extend({
    template: tpls.batch_modal,
    model: new Backbone.Model({}),
    afterRender: function(){
      this.$beacon_total = this.$('#beacon_total');
      this.mount({cityList:cityList, marketList: marketList});
    },
    events: {
      'click button.dw_submit':function(e){
        var t =$(e.target);
        var data = _.extend(this.$el.dwGetInputData(), addr_data);
 
        

        if(!data.market_id){
          return alert('请选择商场');
        }

          var msg = veify_common(data);
          if(msg){
            return(alert(msg));
          };

        //console.log('submit data', data);
        //return console.log('submit data', data);

        if(t.attr('disabled')){
          return;
        }
        var text = t.text();
        t.attr('disabled',true);
        t.text('正在提交...');

        $.ajax({

          type: 'post',
          url: app.API_PATH + '/beacon_bind_batch',
          data:data,

          success:function(){
            table.model.fetch();
            batch_modal.hide();
          },
          errorMsg: app.errorMsg,
          complete:function(){
            t.text(text);
            t.removeAttr('disabled');
          }
        })

      },
      'click button.dw_dissmiss':function(){
        this.hide();
      }
    }
  }));

 
main.mount({batch_modal:batch_modal, modal:modal});

    var components = {
      'select_city': select_addr.select_city,
      'select_market': select_addr.select_market,
      'select_shop': select_addr.select_shop,
      'select_btn': toolbar.select_btn,
      param_search: new toolbar.Param_search({
        id:'设备ID',
        mac: 'MAC',
        uuid: '微信uuid',
        major: '微信major',
        minor: '微信minor'
      }),
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