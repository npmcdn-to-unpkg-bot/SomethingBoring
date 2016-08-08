//dw

define([app.TPL_PATH + '/channels.jade', '../models/index', './paging', './toolbar',
  'ajaxfileupload'],
  function(tpls, models, paging, toolbar) {
    var ids_batch = {};
    var tableModel = new models.channels;
    var CDN_DOMAIN = 'http://res.rtmap.com/';
    var table = new(app.TableView.extend({
      template: tpls.table,
      model: tableModel,
      afterRender:function(){
        this.$("[data-toggle='tooltip']").tooltip();
        this.eventList = this.$el.find('td input[type="checkbox"]');
      },
      events: {
/*      'change th input[type="checkbox"]' : function(e){
        var t = $(e.target);
        this.eventList.prop('checked', e.target.checked);
        this.eventList.trigger('change');
      },

      'change td input[type="checkbox"]' : function(e){
        var t = $(e.target);
        var k = t.data('id');
        if(e.target.checked){
          ids_batch[k] = true;
        }else{
          delete(ids_batch[k])
        }
      },*/

        'click a.btn-danger': function(e) {
          var t = $(e.target);
          rejectModal.data = {
            status: 2,
            ids: t.parent().attr('modelId')
          }
          rejectModal.show();
        },


      'click a.dw_refresh_bind': function(e){
        var t = $(e.target),
        build_id = t.data('build_id');
        if(t.attr('disabled')){
          return;
        }
        var text = t.text();
        t.text('正在提交...');
        t.attr('disabled',true);
        $.ajax({
          type:'post',
          url: app.API_PATH +'/beacon_refresh',
          data: {buildid: build_id},
          success: function(){
            table.model.fetch();
          },
          error:app.errorMsg,
          complete: function(){
            t.text(text);
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
          url: app.API_PATH + '/task/rest/channel/bindbeacon/' + id,
          type: 'post',
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
          url: app.API_PATH + '/task/rest/channel/unbindbeacon/' + id,
          type: 'post',
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


        'click a.dw_modify': function(e) {
          var t = $(e.target),
          id = t.parent().attr('modelId'),
          model = this.model.get(id);
          //console.log('model', model)
          $.get(app.API_PATH + '/channels/' + id, function(data){

/*            var isTicket = data.pre_url_bind ? false : true;
            if(!isTicket){
              isTicket = _.every([data.pre_url_xunlu_openid, data.pre_url_xunlu_getauth,
                data.pre_url_market_openid, data.pre_url_phone], function(url){
                  return url !== data.pre_url_bind;
                })
            }
            //data.isTicket = isTicket;*/

            modifyModal.model.clear({silent:true});
            
            var picture_path = data.picture_path || '';
            data.picture_path = picture_path.replace(CDN_DOMAIN, '');
            data.CDN_DOMAIN = CDN_DOMAIN;
            modifyModal.model.set(data);
            modifyModal.show();
          });
/*          modifyModal.model.set(model.toJSON());
          modifyModal.show();*/
        },
        'click a.btn-success' : function(e){
          var t = $(e.target),
          id = t.parent().attr('modelId'),
          status = 1;


          app.bootbox.confirm('确定通过吗?', function(result){
            if(result){

          if (t.attr('disabled')) {
            return;
          }
          var text = t.text();
          t.text('正在提交...');
          t.attr('disabled', 'disabled');

                $.ajax({
                  url: app.API_PATH + table.model.path + '/' + id,
                  type: 'put',
                  data: {
                    channelId: id,
                    status: status
                  },
                  error: app.errorMsg,
                  success: function(){
                    table.model.fetch();
                  },
              complete: function() {
                t.text(text);
                t.removeAttr('disabled');
              }
                });
            }
          });

        }
      },
      paging: paging
    }));

    var main = new app.MainView({
      template: tpls.main
/*    ,events:{
      'click .dw_batch' : function(e){
        var t = $(e.target),
        status = Number(t.data('status'));
        ids = Object.keys(ids_batch);
        if(!ids.length){
          return app.bootbox.alert('请先选择');
        }
        var msg = status === 1 ? '通过':'驳回';

        app.bootbox.confirm('确定批量 '+ msg+'吗?', function(result){
          if(result){
            $.ajax({
              url:app.API_PATH + '/channels_batch',
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
            });
          }
        })
      }
    }*/
    });

    

    var modifyModal = new(app.ModalView.extend({
      template: tpls.modifyModal,
      initialize : function(){
        this.render();
        this.listenTo(this.model, "change", this.render);
        this.$el.modal('hide');

      },
      afterRender:function(){
        var $phoneview_title = this.$('.phoneview-title').children();
        this.$main_title = $phoneview_title.eq(0);
        this.$sub_title = $phoneview_title.eq(1);
      },
      events:{
        'click .dw_submit': function(e){
          var data = this.$el.dwGetInputData();
          var $obj = this.$(':checked[name="pre_url_bind"]');
          data.pre_url_type = $obj.data('type');
          $obj = $obj.parent().next('input');
          data.pre_url_bind = $obj.val();
          if(data.pre_url_type !==0 && !data.pre_url_bind){
            return alert('请输入一个链接!');
          }


          data.id = Number(data.id)
          var that = this;

          var t =$(e.target);
          if(t.attr('disabled')){
            return;
          }
          var text = t.text();
          t.attr('disabled',true);
          t.text('正在提交..');

          $.ajax({
            type:'post',
            url : app.API_PATH + '/channels_modify',
            data:data,
            success: function(){
              table.model.fetch();
              that.hide();
            },
            error: app.errorMsg,
            complete: function(){
              t.removeAttr('disabled');
              t.text(text);
            }
          });
        },
/*        'input .form-inline input[type=text]' : function(e){
          var tpre = $(e.target).prev().children('input');
          tpre.attr('value', e.target.value);
        },*/
        'change  #dw_btn-upload-file': function(e){
          var t = $(e.target),
          img = t.val().toLowerCase();
          var ext = img.match(/(png|jpg|jpeg|gif)$/g);
          if( !img || !ext ){
            app.bootbox.alert('请选择图片文件！');
            return false;
          }
          var that = this;
          var pic_name = Date.now() + '.' + ext;
            $.ajaxFileUpload({
              url:app.API_PATH + '/ideaaudit/pic_upload',
              type: 'post',
              fileElementId: 'dw_btn-upload-file', 
              data:{
                type:0,
                img : img,
                pic_name: pic_name
              },
               dataType: 'POST',
              success: function(data){
                //console.log('data', data)
                var imgPath = data.data.picture_path;
                var wx_pic_url = data.data.wx_path;
                //console.log('wx_pic_url', wx_pic_url);
                that.$('input[name="picture_path"]').attr('value', imgPath);
                that.$('input[name="wx_pic_url"]').attr('value', wx_pic_url);
                that.$('#phoneview-img-show').attr('src', CDN_DOMAIN +imgPath);
              }
             ,error: app.errorMsg
            })

        },
        'input input[name="main_title"]': function(e){

          this.$main_title.html(e.target.value);
        },
        'input input[name="sub_title"]': function(e){
          this.$sub_title.html(e.target.value);
        }
      },
      model: new Backbone.Model({})
    }));

    var rejectModal = new(app.ModalView.extend({
      template: tpls.rejectModal,
      events:{
        'click .btn-primary': function(e){
          var data = this.data;

          data.reject_reason = this.$el.find('input[name="comment"]').val();
          //console.log('data', data);
          var t = $(e.target);
          if (t.attr('disabled')) {
            return;
          }
          var text = t.text();
          t.text('正在提交...');
          t.attr('disabled', 'disabled');

          $.ajax({
            url: app.API_PATH + table.model.path + '/' + data.ids,
            type: 'put',
            data: data,
            error: app.errorMsg,
            success: function(){
              table.model.fetch();
              rejectModal.hide();
            },
            complete: function() {
              t.text(text);
              t.removeAttr('disabled');
            }
          })
        }
      }
    }));
    main.mount({
      table: table,
      rejectModal: rejectModal,
      modifyModal : modifyModal
    }); //挂载table

    var components = {
      param_search: new toolbar.Param_search({
        id: '渠道ID',
        name: '渠道名称',
        username: '用户名',
        market_name: '店铺名称'
      }),
      'select_status': new toolbar.Select({
        key:'status',
        label:'状态:',
        def: '全部',
        option:{ 
          '0':'未审核',
          '1':'审核通过',
          '2':'驳回'
        }
      }),
      "bind_status" :new toolbar.Select({
        key:'bind_status',
        label:'绑定状态:',
        option:{
        }
      }),
      'select_btn': toolbar.select_btn,
      paging: paging
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
    _initSelect('bind_status');
    
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