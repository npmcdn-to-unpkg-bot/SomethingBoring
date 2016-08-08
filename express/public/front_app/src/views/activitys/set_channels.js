/*
  dw
*/
define([app.TPL_PATH + '/set_channels.jade',
  '../../models/index',
  '../paging','../toolbar','../toolbar_select_addr'
], function(tpls, models, paging, toolbar,select_addr) {



  var main = new app.MainView({
    template: tpls.main,
    events: {
      'change .dw_glo_top_checobox input[type="checkbox"]' : function(e){
        var t = $(e.target);
        table.eventList.prop('checked', e.target.checked);
        table.eventList.trigger('change');
      },
      'click .dw_save' : function(e){
        var arr = [], data = table.postData;
        
        for(var i in data){
          arr.push(data[i]);
        }

        if(arr.length === 0){
          return;
        }

        var t = $(e.target);
        if (t.attr('disabled')) {
          return;
        }
        var text = t.text();
        t.text('正在提交...');
        t.attr('disabled', 'disabled');

        data = {
          activityId: table.model.activityId,
          channelList:arr
        }

        
        $.ajax({url: app.API_PATH + '/activity/setchannel',
          type: 'post',
          data: data,
          success: function(){
            table.model.fetch();
          },
          error: app.errorMsg,
          complete: function() {
            t.text(text);
            t.removeAttr('disabled');
          }
      });
      }
    }
  });




  var table = new (app.TableView.extend({
    model: new models.set_channels,
    template: tpls.table,
    afterRender:function(){
      this.DATA = _.indexBy(this.model.toJSON(), 'id');
      this.eventList = this.$el.find('input[type="checkbox"]');
    },
    DATA:{},
    postData :{},
    events: {
      'change input[type="checkbox"]': function(e){
         var t = $(e.target),
         _id = t.next().text();
         var status = this.DATA[_id].in_channel;
         var curr_status = Number(e.target.checked);
         if(curr_status === status){
            delete(this.postData[_id]);
         }else{
          this.postData[_id] = {
            channelId: _id,
            type: curr_status
          }
         }
         //console.log("this.postData", this.postData);
      }
    },
    paging: paging
  }));


  var title = new (Backbone.View.extend({
    template: tpls.title,
    render:function(data){
      this.$el.html(this.template({data:data}));
    }
  }));

  main.mount({
    title:title,
    table: table,
    param_search: new toolbar.Param_search({
      id: '渠道ID',
      name: '渠道名称',
      username: '用户名',
      market_name: '店铺名称'
    })
  });

  function _initSelect(key){
    $.get( app.API_PATH + '/beacon/'+ key, function(data){
      data = data.pageResult;
      var obj = {};
      for( var i =0, len = data.length; i < len; i++){
        obj['$'+data[i].id] = data[i].name;
      }

      var components_bind_status = new toolbar.Select({
        key:'bind_status',
        label:'beacon绑定状态:',
        option:obj
      });
      if(!components['bind_status']){
        components['bind_status'] = components_bind_status;
        main.mount({bind_status: components_bind_status});
        components_bind_status.query();
      }
    });
  }
 
  _initSelect('bind_status');
  var components = {
    'select_city': select_addr.select_city,
    'select_market': select_addr.select_market,
    'select_btn': toolbar.select_btn,
    'select_relevance' : new toolbar.Select({
        key:'is_relevance',
        label:'关联状态:',
        def: '全部',
        option:{
          '0':'未关联',
          '1':'已关联'
        }
      }),
    "paging": paging
  }

  //----------------control----------------
  return function(activityId) {
    var search = app.url.search;
    if (!app.onThisPath) {
      table.model.activityId = activityId;
      main.mount(components);
      $.get(app.API_PATH + '/activitys',{activityId:activityId}, function(data){
        title.render(data.pageResult[0]);
      });
      main.display();
    }
    app.query(components);
    table.model.fetch();
  }

});