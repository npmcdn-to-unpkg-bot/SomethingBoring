//dw

define([app.TPL_PATH + '/markets.jade', '../models/index',
    './paging', './toolbar', './toolbar_select_addr', 'md5', 'ajaxfileupload'
  ],
  function(tpls, models, paging, toolbar, select_addr, md5) {
    var search_bak ={};
    var tableModel = new models.MarketsTable;
    var table = new(app.TableView.extend({
      template: tpls.table,
      model: tableModel,
      events: {
        'click button.dw_delete': function(e) {
          app.bootbox.confirm('确定要删除吗?', function(result){
            if(!result){
              return;
            }
              var t = $(e.target),
                id = t.parent().attr('modelId');
              if(t.attr('disabled')){
                return;
              }
              t.attr('disabled', true);

              $.ajax({
                url: app.API_PATH + table.model.path + '/' + id,
                type: 'delete',
                success: function() {
                  table.model.fetch();
                },
                complete:function(){
                  t.removeAttr('disabled');
                },
                error: app.errorMsg
              });
          });


        },
        'click button.dw_freeze': function(e) {
          var t = $(e.target),
            id = t.parent().attr('modelId'),
            status = t.data('status');

          if(t.attr('disabled')){
            return;
          }
          t.attr('disabled', true);
          $.ajax({
            url: app.API_PATH + table.model.path + '/freeze_account',
            type: 'post',
            data: {
              id: id,
              status: status
            },
            success: function() {
              table.model.fetch();
            },
            error: app.errorMsg,
            complete:function(){
              t.removeAttr('disabled');
            }
          });
        },

        'click button.dw_carate_sub': function(e) {
          var t = $(e.target),
            id = t.parent().attr('modelId'),
            status = t.data('status'),
            data = this.model.get(id).toJSON();
          carate_subaccount.parent_id = id;
          carate_subaccount.user_level = data.user_level;
          carate_subaccount.show();
        },

        'click button.dw_carate_activity': function(e) {
          app.bootbox.confirm('确定要创建活动吗?', function(result){
            if(!result){
              return;
            }
            var t = $(e.target);
            if (t.attr('disabled')) {
              return;
            }
            t.attr('disabled', 'disabled');
            var id = t.parent().attr('modelId');

            $.ajax({
              url: app.API_PATH + '/activitys',
              type: 'post',
              data: {
                user_id: id
              },
              success: function() {
                table.model.fetch();
              },
              error: app.errorMsg,
              complete: function() {
                t.removeAttr('disabled');
              }
            });

          });


        },

        'click a.dw_get_sub': function(e) {
          var t = $(e.target),
            id = t.attr('modelId');
          $.get(app.API_PATH + '/market_sub_accounts', {
            parent_id: id,
            page_size: 9999999,
          }, function(data) {
            get_subaccount.model.reset(data.pageResult);
            get_subaccount.show();
          });
        },
        'click button.dw_modify': function(e) {
          mainModal.model.clear({silent :true});
          var t = $(e.target),
            id = t.parent().attr('modelId');
          data = this.model.get(id).toJSON();


          mainModal.isCreate = false;
          var level = Number(data.type);
          data.level = level;
          mainModal.level = level;
          mainModal.modelId = data.id;
          data.md5_str = md5_str(data.wechatId);
          var search = app.url.search;
          search_bak = _.clone(search);
/*          if (search_bak.city_id == data.cityId) {
            console.log('search_bak.city_id == data.cityId')
            components.select_city.model.set('city_id', null);
          }*/
          search.city_id = data.cityId;
          search.market_id = data.market_id || -1;
          search.shop_id = data.shop_id || -1;
          mainModal.model.set(data);
          mainModal.$components = null;
          if (level === 2) {
            mainModal.mount({
              'select_city': select_addr.select_city,
              'select_market': select_addr.select_market,
              'select_shop': select_addr.select_shop
            });
          } else {
            mainModal.mount(components);
          }
          select_addr.select_city.query();
          mainModal.show();
        }
      },
      paging: paging
    }));

    var _modal = app.View.extend({
      className: 'modal fade',
      initialize: function(data) {
        this.template = data.template;
        this.render();
      },
      hide: function() {
        this.$el.modal('hide');
      },
      show: function() {
        this.$el.modal('show');
      },
      render: function() {
        this.$el.html(this.template());
      }
    });

    var get_subaccount = new(_modal.extend({
      template: tpls.subaccount_list_modal,
      initialize: function() {
        this.listenTo(this.model, "reset", this.render);
        this.listenTo(this.model, "remove", this.render);
      },
      events: {
        'click a.btn-danger': function(e) {
/*          if (!confirm('确定要删除吗?')) {
            return;
          }*/
          var t = $(e.target);
          if(t.attr('disabled')){
            return;
          }
          t.attr('disabled',true);
          var id = t.attr('modelId');
          var that = this;
          $.ajax({
            type: 'delete',
            url: app.API_PATH + '/market_sub_accounts/' + id + '?type=1',
            error: app.errorMsg,
            success: function() {
              //console.log('remove');
              table.model.fetch();
              that.model.remove(id);
            },
            complete: function(){
              t.removeAttr('disabled');
            }
          })
        }
      },
      model: new Backbone.Collection([]),
      render: function() {
        //-console.log('this.model.toJSON()', this.model.toJSON())
        this.$el.html(this.template({
          data: this.model.toJSON()
        }));
      }
    }));

    var key = "rtmap911_d1e2df1fdb7daa3a105445fdebdba19c";

    function md5_str(value) {
      if(!value){
        return '';
      }
      var str = md5(value + "_" + key);
      str = 'http://weix.rtmap.com/beacon/shake/transfer/' + str + '.do?redirectURL=http://res.rtmap.com/image/vs3/proj/standard3/list.html'
      return str;
    }

    //console.log(md5_str('test'))
      /*function _test(count){

        $.post(app.API_PATH + '/market_sub_accounts',{
          username : count + '_test' + Date.now(),
           type:'1',
           rights: "3_0",
           mobile: Date.now().toString().substr(0,11),
           mail: Date.now() + '@test.com',
           parent_id: 2122,
           level:'1',
           password: '098f6bcd4621d373cade4e832627b4f6'
        }, function(){
          if(count < 20){
            _test(count+1);
          }
        });
      }
        _test(0);*/

    var carate_subaccount = new _modal({
      template: tpls.carate_subaccount_modal,
      events: {
        'click button.dw_submit': function() {
          var data = this.$el.dwGetInputData();

          if (!data.password) {
            app.bootbox.alert('请输入密码');
            return;
          }

          if (data.veifypass !== data.password) {
            app.bootbox.alert('两次输入密码不一样');
            return;
          }

          delete(data.veifypass);
          delete(data.md5_str);
          data.parent_id = this.parent_id;
          data.level = this.user_level;
          data.type = 1;
          data.password = md5(data.password);
          //console.log(data);
          var that = this;
          $.ajax({
            type: 'post',
            url: app.API_PATH + '/market_sub_accounts',
            data: data,
            success: function(resdata) {
              that.hide();
              table.model.fetch();
              //console.log('resdata', resdata);
            },
            error: app.errorMsg
          })

        }
      }
    });

    var main = new app.MainView({
      template: tpls.main,
      events: {
        'click a.dw_add_Buser': function() {
          mainModal.model.clear({silent :true});
          mainModal.model.set(emptyData);


          mainModal.isCreate = true;
          emptyData.level = 1;
          mainModal.level = 1;
          mainModal.$components = null;
          mainModal.mount(components);
          mainModal.show();
        },
        'click a.dw_add_buser': function() {
          mainModal.model.clear({silent :true});
          mainModal.isCreate = true;

          emptyData.level = 2;
          mainModal.model.set(emptyData);
          mainModal.$components = null;
          mainModal.level = 2;
          mainModal.mount({
            'select_city': select_addr.select_city,
            'select_market': select_addr.select_market,
            'select_shop': select_addr.select_shop
          });
          mainModal.show();
        }
      }
    });
    main.mount({
      table: table
    }); //挂载table

    var emptyData = {
      id: '',
      username: '',
      password: '',
      mobile:'',
      phone: '',
      mail: '',
      wechat_id:'',
      logo:'/public/img/df120.jpg',
      qrCodeImg:'/public/img/df120.jpg',
      md5_str:''
    };
    var mainModal = new(app.ModalView.extend({
      template: tpls.main_modal,
      events: {
        'input input[name="wechat_id"]' : function(e){
          this.$('#md5_str').text(md5_str(e.target.value));
        },
        'click button.dw_submit': function(e) {
          var data = this.$el.dwGetInputData();
          
          data.market_id = components.select_market.$el.attr('search_v');
          data.level = this.level;
          var type, path;
          if (this.isCreate) {
            type = 'post';
            path = '/markets';
            data.password = md5(data.password);
          } else {
            type = 'put',
              path = '/markets/' + this.modelId;
              if(data.password){
                data.password = md5(data.password);
              }
          }

          if(!data.market_id){
            return alert('请选择商场');
          }


          if (this.level === 2) {
            data.shop_id = select_addr.select_shop.$el.attr('search_v');
            if(!data.shop_id){
              return alert('请选择商场');
            }
          }

          var that = this;
          $.ajax({
            type: type,
            url: app.API_PATH + path,
            data: data,
            success: function() {
              table.model.fetch();
              that.$('button.dw_dismiss').click();
              //that.trigger('click button.dw_dismiss', that);
            },
            error: app.errorMsg
          })
        },
        'click button.dw_dismiss': function() {
          if (mainModal.level === 2) {
            $('#dw_tmp').append(select_addr.select_shop.$el);
          }
          app.url.search = search_bak;
          select_addr.select_city.query();
          main.mount(components);
        },
        'change  #dw_btn-upload-logo': function(e) {
          var t = $(e.target),
            img = t.val().toLowerCase();
          var ext = img.match(/(png|jpg|jpeg|gif)$/g);
          if (!img || !ext) {
            app.bootbox.alert('请选择图片文件！');
            return false;
          }
          var that = this;
          var pic_name = Date.now() + '.' + ext;
          $.ajaxFileUpload({
            url: app.API_PATH + '/upload',
            type: 'post',
            fileElementId: 'dw_btn-upload-logo',
            data: {
              type: 0,
              img: img,
              pic_name: pic_name
            },
            dataType: 'POST',
            success: function(data) {
              var imgPath = data.data;
              that.$('input[name="logo_img"]').attr('value', imgPath);
              that.$('#logo-pre-img-show').attr('src', "http://res.rtmap.com/" + imgPath);
            },
            error: app.errorMsg
          })
        },
        'change  #dw_btn-upload-qrCodeImg': function(e) {
          var t = $(e.target),
            img = t.val().toLowerCase();
          var ext = img.match(/(png|jpg|jpeg|gif)$/g);
          if (!img || !ext) {
            app.bootbox.alert('请选择图片文件！');
            return false;
          }
          var that = this;
          var pic_name = Date.now() + '.' + ext;
          $.ajaxFileUpload({
            url: app.API_PATH + '/upload',
            type: 'post',
            fileElementId: 'dw_btn-upload-qrCodeImg',
            data: {
              type: 0,
              img: img,
              pic_name: pic_name
            },
            dataType: 'POST',
            success: function(data) {
              var imgPath = data.data;
              that.$('input[name="wechat_img"]').attr('value', imgPath);
              that.$('#qrcode-add-imgfile-show').attr('src', "http://res.rtmap.com/" + imgPath);
            },
            error: app.errorMsg
          })
        }
      },
      model: new Backbone.Model(emptyData)
    }));


    //var select_input_group = new toolbar.Select_input_group;
    var components = {
      'select_type': new toolbar.Select({
        key: 'type',
        label: '类型:',
        def: '全部',
        option: {
          '1': '商场',
          '2': '商户'
        }
      }),

      'select_status': new toolbar.Select({
        key: 'status',
        label: '状态:',
        def: '全部',
        option: {
          '0': '正常',
          '1': '冻结'
        }
      }),
      'select_city': select_addr.select_city,
      'select_market': select_addr.select_market,
      'select_btn': toolbar.select_btn,
      param_search: new toolbar.Param_search({
        username: '用户名',
        id: '用户ID',
        realname: '商场/店铺名称'
      }),
      'paging': paging
    }

    return function() {
      if (!app.onThisPath) {
        main.mount(components);
        main.display();
      }
      app.query(components);
      table.model.fetch();
    }
  });