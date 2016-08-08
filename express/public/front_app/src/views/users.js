/*
  dw
*/
define([app.TPL_PATH + '/users.jade',
  '../models/index',
  './paging', './toolbar', 'md5'
], function(tpls, models, paging, toolbar, md5) {

  var emptyData = {
    id: '',
    username: '',
    realname: '',
    password: '',
    phone: '',
    email: '',
    description: '',
    pageList: []
  };

  var _auth = [];

  var modal = new(app.ModalView.extend({
    template: tpls.modal,
    events: {
      'change input:checkbox': function(e) {
        var t = $(e.target);
        var v = Number(t.val());
        if (t.prop("checked")) {
          _auth.push(v);
        } else {
          _auth.splice(_auth.indexOf(v), 1);
        }
      },

      'click button.dw_dismiss': function(e) {
        this.model.clear({
          silent: true
        });
        _auth = [];
      },
      //创建用户
      'click button.dw_submit': function(e) {
        var data = this.$el.dwGetInputData();
        
        var t = $(e.target);
        var def_text = t.text();
        t.attr('disabled', 'disabled');
        delete(data.pageList);
        if (_auth.length) {
          data.pageList = _auth.join('_');
        }

        var url = app.API_PATH + '/users';
        var method = 'post';
        if (data.id) {
          method = 'put';
          url = url + '/' + data.id;
          if(data.password){
            data.password = md5(data.password);
          }
        }else{
          data.password = md5(data.password);
        }
        //console.log('data', data);
        t.text('正在提交..');
        $.ajax({
          url: url,
          type: method,
          data: data,
          success: function() {
            table.model.fetch();
            t.prev().click();
          },
          error: app.errorMsg,
          complete: function(xhr) {
            t.text(def_text);
            t.removeAttr('disabled');
          }
        })
      }
    },
    model: new Backbone.Model(emptyData)
  }));

  var tableModel = new models.UsersTable;
  var table = new(app.TableView.extend({
    template: tpls.table,
    model: tableModel,
    events: {
      //修改用户
      'click button.dw_modify': function(e) {
        var t = $(e.target),
          modelId = t.parent().attr('modelId');
        var thisModel = this.model.get(modelId);
        var data = _.clone(thisModel.attributes);
        _auth = _.clone(data.pageList);
        modal.model.set(data);
        modal.show();
      },
      'click button.dw_status' : function(e){
        var t = $(e.target),
          modelId = t.parent().attr('modelId'),
          statusId = t.attr('statusId');
          if(t.attr('disabled')){
            return;
          }
          t.attr('disabled',true);
        var url = app.API_PATH + '/users/updatestatus/' + modelId;
        $.ajax({
          type: 'put',
          url : url,
          data: {
            status:Number(statusId)
          },
          success:function(data){
            table.model.fetch();
            //console.log('success', data);
          },
          complete:function(){
            t.removeAttr('disabled');
          }
        })
      },
    },
    paging: paging
  }));

  var main = new(app.MainView.extend({
    template: tpls.main,
    events: {
      'click button.dw_add': function(e) {
        modal.show();
        modal.model.set(emptyData);
      }
    }
  }));

  //挂载内部组件
  main.mount({
    table: table,
    modal: modal
  });

  var hybrid_search = new toolbar.Hybrid_search;
  var components = {
    hybrid_search: hybrid_search,
    'paging': paging
  }

  //----------------control----------------
  return function() {
    if (!app.onThisPath) {
      main.mount(components);
      main.display();
    }
    hybrid_search.input.val(app.url.search.queryString); //数据回显
    table.model.fetch();
  }

});