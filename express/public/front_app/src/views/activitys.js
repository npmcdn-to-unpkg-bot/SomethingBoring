//dw

define([app.TPL_PATH + '/activitys.jade',
  '../models/index',
  './paging','./toolbar','datePicker','clockpicker'], 
  function(tpls, models, paging, toolbar) {
  
  function _to_min(str){
    str = str.split(':');
    return Number(str[0] * 60) + Number(str[1]);
  }
  var tableModel = new models.activitys;
  var modal = new (app.ModalView.extend({
    template : tpls.modal,
    initialize : function(){
      this.listenTo(this.model, "change", this.render);
    },
    model:new Backbone.Model({}),
    _tmp:{},
    events:{
      'click button.dw_modify': function(){
        var data = this.$el.dwGetInputData();
        if(_to_min(data.start_time)  > _to_min(data.end_time)){
          return alert('活动时间设置错误');
        }
        data.activity_times = data.start_time + ':00_' + data.end_time+ ':00';
        data.is_nation_activity = data.is_nation_activity || 0;
        delete(data.start_time);
        delete(data.end_time);
        $.ajax({
          url: app.API_PATH + '/activitys/' + modal.activity_id,
          type: 'put',
          data:data,
          success: function(data){
            modal.hide();
            table.model.fetch();
          },
          error: app.errorMsg
        })
      },
      'changeDate .datetimepicker':function(e){
        
        if(e.target.value){
          var t = $(e.target);
          var data = this.$el.dwGetInputData();
          var _tmp = this._tmp[e.target.name] || e.target.defaultValue;
          if(new Date(data.start_date) > new Date(data.end_date)){
            t.datepicker('update', _tmp);
            alert('开始时间不可大于结束时间。');
            return;
         }
         this._tmp[e.target.name] = data[e.target.name];
         }
      }
    },
    afterRender: function(){
      this.$('.datetimepicker').datepicker({
        /*format: 'yyyy-mm-dd'*/
        language:'zh-CN',
        autoclose: true,
        todayHighlight: true
      });
      this.$('.clockpicker').clockpicker();
    }
  }));
  var table = new (app.TableView.extend({
    template:tpls.table,
    model:tableModel,
    afterRender:function(){
      this.$el.find("[data-toggle='tooltip']").tooltip();
      this.eventList = this.$el.find('td input[type="checkbox"]');
    },
    events:{
/*      'change th input' : function(e){
        var t = $(e.target);
        for(var i=0;i<this.eventList.length;i++){
            this.eventList[i].checked = e.target.checked;
        }
      },*/

      'click a.dw_changestatus' : function(e){
        var t = $(e.target),
        id = t.parents('tr').attr('modelId'),
        status = t.data('status');
        if(t.attr('disabled')){
          return;
        }
        t.attr('disabled',true);
        $.ajax({
          type: 'post',
          url: app.API_PATH + '/activity/modify_status',
          data:{
          activity_id: id, status: status
          },
          success: function(){
            table.model.fetch();
          },
          error: app.errorMsg,
          complete: function(){
            t.removeAttr('disabled');
          }
        })
      },
      'click a.dw_changesbind' : function(e){
        var t = $(e.target),
        id = t.parents('tr').attr('modelId'),
        status = t.data('status');
          if(t.attr('disabled')){
            return;
          }
          t.attr('disabled',true);
        $.ajax({
          url: app.API_PATH + '/beacon/bind/' + id,
          type: 'put',
          data:{},
          success: function(){
            table.model.fetch();
          },
          error: app.errorMsg,
          complete:function(){
            t.removeAttr('disabled');
          }
        })
      },
      'click a.dw_changesunbind' : function(e){
        var t = $(e.target),
        id = t.parents('tr').attr('modelId'),
        status = t.data('status');
          if(t.attr('disabled')){
            return;
          }
          t.attr('disabled',true);
        $.ajax({
          url: app.API_PATH + '/beacon/unbind/' + id,
          type: 'put',
          data:{},
          success: function(){
            table.model.fetch();
          },
          error: app.errorMsg,
          complete:function(){
            t.removeAttr('disabled');
          }
        })
      },
      'click a.dw_modify' : function(e){
        var t = $(e.target),
        tptr = t.parents('tr'),
        id = tptr.attr('modelId'),
        activityStatus = tptr.attr('activityStatus');
        
        if(activityStatus !='暂停'){
          return app.bootbox.alert('请先暂停活动再修改！');
        }
        if(t.attr('disabled')){
          return;
        }
        t.attr('disabled',true);
        $.ajax({
          url: app.API_PATH + '/activitys/' + id,
          type: 'get',
          success: function(data){
            modal.model.set(data);
            modal.activity_id = id;
            modal._tmp = {};
            modal.show();
          },
          error: app.errorMsg,
          complete:function(){
            t.removeAttr('disabled');
          }
        })
      },
      'click a.dw_set_channels' : function(){
        console.log('test');
      }
    },
    paging: paging
  }));

  var main = new app.MainView({template: tpls.main});




  var components = {
/*    "activity_type" :new toolbar.Select({
        key:'type',
        label:'类型:',
        option:{
          '1':'漏解beacon'
        }
      }),*/
    "activity_status" :new toolbar.Select({
        key:'activityStatus',
        label:'活动状态:',
        option:{
        }
      })/*,
    "bind_status" :new toolbar.Select({
        key:'beaconBindingStatus',
        label:'绑定状态:',
        option:{
        }
      })*/
  }

  function _initSelect(key){
    $.get( app.API_PATH + '/beacon/'+ key, function(data){
      data = data.pageResult;
      var obj = {};
      for( var i =0, len = data.length; i < len; i++){
        obj['$'+data[i].id] = data[i].name;
      }
      //console.log('obj', obj);
      components[key].data.option = obj;
      components[key].render();
    });
  }
  for(var i in components){
    _initSelect(i);
  }

  main.mount({table:table,
    
    param_search: new toolbar.Param_search({
      activityId:'活动ID',
      username: '用户名'
      })}); //挂载table
  main.mount(components);

    var hybrid_search = toolbar.hybrid_search;

    var outComponents = {
      'select_btn': toolbar.select_btn,
      'paging': paging
    }

  //control
  return function() {
    if(!app.onThisPath){
      main.mount(outComponents);
      //hybrid_search.input.val(app.url.search.queryString); //数据回显
      main.display();
    }
    table.model.fetch();
    }

});