//dw

define([app.TPL_PATH + '/coupons.jade','../models/index','./paging','./toolbar','./toolbar_select_addr'], 
  function(tpls, models, paging, toolbar, select_addr) {
  
  var tableModel = new models.coupons;

  var ids_batch = {};

  var ajaxURL = '';
  var ajaxMethod = 'put';
  var ajaxData = {
    audit_reason:'',
    status:'',
      ids:'',
      reject_reason:'虚假信息'
  }

  var table = new (app.TableView.extend({
    template:tpls.table,
    model:tableModel,
    afterRender:function(){
      this.$el.find("[data-toggle='tooltip']").tooltip();
      this.eventList = this.$el.find('td input[type="checkbox"]');
    },
    events:{
      'change th input[type="checkbox"]' : function(e){
        var t = $(e.target);
        this.eventList.prop('checked', e.target.checked);
        this.eventList.trigger('change');
      },
      'change td input[type="checkbox"]' : function(e){
        var t = $(e.target);
        var k = t.data('id');
        //console.log('k', k);
        if(e.target.checked){
          ids_batch[k] = true;
        }else{
          delete(ids_batch[k])
        }
      },
      'click a.dw_reject' : function(e){
          var t = $(e.target),
          prize_id = t.attr('prize_id');
          ajaxData.ids = prize_id;
          ajaxData.status = 5;
          ajaxMethod = 'put';
          ajaxURL = app.API_PATH + this.model.path + '/' + prize_id;
          modal.show();
      },
      'click a.dw_accsess' : function(e){
        var that = this;
        app.bootbox.confirm('确定通过吗?', function(result){
          if(result){
            var t = $(e.target),
            prize_id = t.attr('prize_id');
            if (t.attr('disabled')) {
              return;
            }
            var text = t.text();
            t.text('正在提交...');
            t.attr('disabled', 'disabled');

            $.ajax({
              type:'put',
              url: app.API_PATH + that.model.path + '/' + prize_id,
              data:{
                status: 0,
                ids:prize_id
              },
              success: function(){
                table.model.fetch();
                console.log('success');
              },
              complete: function() {
                t.text(text);
                t.removeAttr('disabled');
              }
            })
          }
        });
      }
    },
    paging: paging
  }));



  var modal = new(app.ModalView.extend({
    template: tpls.modal,
    model: new Backbone.Model({}),
    afterRender:function(){
      this.$_content = this.$el.find('input[name="audit_reason_content"]');
      this.$_content.blur(function(){
        ajaxData.reject_reason = $(this).val();
      })
    },
    events:{
      'click button.dw_submit': function(e){
        var t = $(e.target);

        var data = this.model.toJSON();
          if(!ajaxData.reject_reason){
            app.bootbox.alert('请填写驳回原因');
            return;
          }

          if (t.attr('disabled')) {
            return;
          }
          var text = t.text();
          t.text('正在提交...');
          t.attr('disabled', 'disabled');
          $.ajax({
            type:ajaxMethod,
            url: ajaxURL,
            data:ajaxData,
            success: function(){
              table.model.fetch();
              //alert('驳回成功');
              //console.log('success');
              modal.hide();
            },
            error:app.errorMsg,
            complete: function() {
              t.text(text);
              t.removeAttr('disabled');
            }
          });
      },

      'change :radio' :function(e){
        var t = $(e.target);
        var v = t.val();
        ajaxData.audit_reason = v;
        if( v === 'custom'){
          ajaxData.reject_reason = this.$_content.val();
          this.$_content.attr('disabled', false).focus();
        }else{
          ajaxData.reject_reason = t.parent().text();
          this.$_content.attr('disabled', true);
        }
      }
    }
  }));


  var main = new app.MainView({template: tpls.main,
    events:{
      'click .dw_batch' : function(e){
        var t = $(e.target),
        status = Number(t.data('status'));
        ids = Object.keys(ids_batch);
        if(!ids.length){
          return app.bootbox.alert('请先选择');
        }
        var msg = status === 2 ? '通过':'驳回';


        app.bootbox.confirm('确定批量 '+ msg+'吗?', function(result){

          $.ajax({
            url:app.API_PATH + '/coupons_batch',
            type:'post',
            data:{
              ids:ids.join(','),
              status: status,
            },
            success: function(){
              table.model.fetch({success:function(){
                ids_batch = {};
              }});
            },
            error: app.errorMsg
          })
          
        })

      }
    }
  });
  main.mount({table:table}); //挂载table


    var hybrid_search = toolbar.hybrid_search;


    var components = {


      'select_status': new toolbar.Select({
        key:'status',
        label:'状态:',
        def: '全部',
        option:{
          '4':'待审核',
          '5':'驳回',
          '2':'审核通过',
          '0':'投放中',
          '1':'暂停'
        }
      }),
      'select_city': select_addr.select_city,
      'select_market': select_addr.select_market,
      'select_shop': select_addr.select_shop,
      'select_btn': toolbar.select_btn,
      param_search: new toolbar.Param_search({
        name:'优惠券名字',
        prize_id:'优惠券ID',
        auditor_name: '审核人'
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
    //components.select_city.query();
    table.model.fetch();
  }

});


/*status:'',
      ids:'',
      audit_reason:'0',
      reject_reason:{
        '0':'虚假信息',
        '1':'文案违规',
        '2':'信息书写错误',
        '3':'图片问题',
        '5':'发放时间有问题',
        '6':'客户投诉',
        'custom':'自定义原因'
      }
      */