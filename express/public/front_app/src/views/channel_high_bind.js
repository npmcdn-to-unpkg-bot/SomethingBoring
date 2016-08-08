/*
  dw
*/
define([app.TPL_PATH + '/channel_high_bind.jade',
  '../models/index',
  './paging','./toolbar','./toolbar_select_addr'
], function(tpls, models, paging, toolbar, select_addr) {

/*  var table = new (app.table.extend({

  }));*/


  var main = new app.MainView({
    template: tpls.main,
    events:{
      'click button.dw_bind_all': function(e){

        var buildId  = $('#getAllBuilding').val();
        var floor  = $('#getAllFloors').val();
        var channelId = table.model.channelId;
        if(!buildId){
          return app.bootbox.alert('建筑为空,请先选择建筑');
        }
        var t = $(e.target);
        if(t.attr('disabled')){
          return;
        }
        t.attr('disabled',true);
        $.ajax({
          url: app.API_PATH + '/task/rest/channel/operbeacon/' + buildId + '/' + channelId,
          type: 'post',
          data:{
          //buildId:buildId,
          floor:floor,
          flag: 0
          //channelId:channelId
        },
        success: function(data){
          app.tip('绑定操作成功！');
          //-table.$el.html('<h1>绑定成功!</h1>');
          table.model.fetch();
        },
        error: app.errorMsg,
        complete: function(){
          t.removeAttr('disabled');
        }
        })
      },
      'click button.dw_delete_all': function(e){
        
          var buildId  = $('#getAllBuilding').val();
          var floor  = $('#getAllFloors').val();
          var channelId = table.model.channelId;
          if(!buildId){
            return app.bootbox.alert('建筑为空,请先选择建筑');
          }

          app.bootbox.confirm('确定要删除吗?', function(result){
            if(result){
                var t = $(e.target);
                if(t.attr('disabled')){
                  return;
                }
                t.attr('disabled',true);
                $.ajax({
                  url: app.API_PATH + '/task/rest/channel/operbeacon/' + buildId + '/' + channelId,
                  type: 'post',
                  data:{
                  //buildId:buildId,
                  floor:floor,
                  flag: 1
                  //channelId:channelId
                },
                success: function(data){
                  table.model.fetch();
                 app.tip('操作成功！');
                },
                error: app.errorMsg,
                complete: function(){
                  t.removeAttr('disabled');
                }
                })
            }
          })
      },
      'click button.dw_bind_one': function(e){
        var t = $(e.target),
        tpre = t.prev('input'),
        tpv = tpre.val();

        if(t.attr('disabled')){
          return;
        }

        if(!tpv){
          return app.bootbox.alert('请输入微信id');
        }

        t.attr('disabled', 'disabled');
        var channelId = table.model.channelId;
        $.ajax({
          type:'post',
          url : app.API_PATH + '/task/rest/channel/bindbeacon/' + channelId + '/' + tpv,
/*          data:{
            channelId: channelId,
            deviceId: tpv
          },*/
          success: function(){
            app.tip('绑定成功');
            table.model.fetch();
          },
          error:app.errorMsg,
          complete:function(){
            t.removeAttr('disabled');
          }
        });
      },
      'click button.dw_delete_one': function(e){
        var t = $(e.target),
        tpre = t.prev().prev('input'),
        tpv = tpre.val();

        if(t.attr('disabled')){
          return;
        }

        if(!tpv){
          return app.bootbox.alert('请输入微信id');
        }

        t.attr('disabled', 'disabled');
        var channelId = table.model.channelId;

        $.ajax({
          type:'post',
          url : app.API_PATH + '/task/rest/channel/unbindbeacon/' + channelId + '/' + tpv,
/*          data:{
            channelId: channelId,
            deviceId: tpv
          },*/
          success: function(){
            app.tip('解绑成功');
            table.model.fetch();
          },
          error:app.errorMsg,
          complete:function(){
            t.removeAttr('disabled');
          }
        });
      }
    }
  });

  var table =  new (app.TableView.extend({
    model: new models.channel_high_beacon,
    template: tpls.table,
    events:{
      'click a.btn-sm': function(e){
        var t = $(e.target),
        method = t.data('method'),
        beaconId= t.parent().attr('beaconId');
        if(t.attr('disabled')){
          return;
        }
        t.attr('disabled',true);
        $.ajax({
          type:'post',
          url: app.API_PATH + '/task/rest/channel/' 
          + method +'beacon/'+ table.model.channelId+'/'+beaconId,
          success:function(){
            table.model.fetch();
          },
          error:app.errorMsg,
          complete: function(){
            t.removeAttr('disabled');
          }
        })
      }
    },
    paging: paging
  }))

  var search = new toolbar.Search({
    param:'beaconId',
    holdParam: [],
    placeholder:'微信ID'
  })
  var title = new (Backbone.View.extend({
    template: tpls.title,
    render:function(data){
      this.$el.html(this.template({data:data}));
    }
  }));

  var getActivityProvince = new (Backbone.View.extend({

    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
    },
    template: tpls.getActivityAddr,
    className:'form-group',
    model: new models.channel_high_beacon_attr('0'),
    events:{
      'change': function(e){
        var search = pickSearch();
        search = _.omit(search, ['cityId','buildId']);
        if(e.target.value == -1){
          delete(search.provinceId);
        }else{
          search.provinceId = e.target.value;
        }
        
        app.url.search = search;
        app.go();
        getActivityCity.model.fetch();
        getActivityBuilding.model.fetch();
      }
    },
    query_: function(){
      this.$('option[value=' + app.url.search.provinceId + ']').prop('selected', true);
    },
    render:function(){
      this.$el.html(this.template({data:this.model.toJSON()}));
      this.query_();
    }
  }));

  var getActivityCity = new (Backbone.View.extend({
    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
    },
    template: tpls.getActivityAddr,
    className:'form-group',
    model: new models.channel_high_beacon_attr('1'),
    events:{
      'change': function(e){
        var search = pickSearch();
        search = _.omit(search, 'buildId');
        if(e.target.value == -1){
          delete(search.cityId);
        }else{
          search.cityId = e.target.value;
        }
        app.url.search = search;
        app.go();
        getActivityBuilding.model.fetch();
      }
    },
    query_: function(){
      this.$('option[value=' + app.url.search.cityId + ']').prop('selected', true);
    },
    render:function(){
      this.$el.html(this.template({data:this.model.toJSON()}));
      this.query_();
    }
  }));

  function pickSearch(){
      var search = app.url.search;
      search = _.omit(search, ['beaconId','page']);
      return search;
  }
  var getActivityBuilding = new (Backbone.View.extend({
    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
    },
    template: tpls.getActivityBuilding,
    className:'form-group',
    model: new models.channel_high_beacon_attr('2'),
    events:{
      'change': function(e){
        var search = pickSearch();

        if(e.target.value == -1){
          delete(search.buildId);
        }else{
          search.buildId = e.target.value;
        }
        app.url.search = search;
        app.go();
      }
    },
    query_: function(){
      this.$('option[value=' + app.url.search.buildId + ']').prop('selected', true);
    },
    render:function(){
      this.$el.html(this.template({data:this.model.toJSON()}));
      this.query_();
    }
  }));


  var common_provinces = new (Backbone.View.extend({
    template: tpls.getAllProvince,
    className:'form-group',
    model: new models.common_provinces,
    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
      this.model.fetch();
    },
    events:{
      'change': function(e){
        common_citys.model.provinceId = e.target.value;
        common_citys.model.clear();
        common_citys.model.fetch();
      }
    },
    render:function(){
      //console.log('this.model.toJSON()', this.model.toJSON());

      this.$el.html(this.template({data:this.model.toJSON()}));
    }
  }));

  var common_citys = new (Backbone.View.extend({
    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
      //-this.listenTo(common_provinces.model, "sync", this.model.fetch);
      this.render();
    },
    template: tpls.getAllCity,
    className:'form-group',
    model: new models.common_citys,
    events:{
      'change': function(e){

        common_buildings.model.cityId = e.target.value;
        common_buildings.model.clear();
        common_buildings.model.fetch();
      }
    },
    render:function(){
     //console.log('this.model.toJSON()', this.model.toJSON());
     var data = this.model.toJSON();
      this.$el.html(this.template({data:data}));
    }
  }));



  var common_buildings = new (Backbone.View.extend({
    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
      this.listenTo(common_citys.model, "change", function(){
        this.model.clear();
        this.render()
      });
      this.render();
    },
    template: tpls.getAllBuilding,
    className:'form-group',
    model: new models.common_buildings,
    events:{
      'change select': function(e){
        common_floors.model.clear();
        common_floors.model.buildId = e.target.value;
        
        common_floors.model.fetch();
      }
    },
    render:function(){
     var data = this.model.toJSON();
      this.$el.html(this.template({data:data}));
      this.$('.selectpicker').selectpicker('val');
    }
  }));

    var common_floors = new (Backbone.View.extend({
    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
      this.listenTo(common_buildings.model, "change", function(){
        this.model.clear();
        this.render();
      });

      this.render();
    },
    template: tpls.getAllFloors,
    className:'form-group',
    model: new models.common_floors,
    events:{
    },
    render:function(){
      this.$el.html(this.template({data:this.model.toJSON()}));
    }
  }));

    main.mount({
      title:title,
    common_provinces:common_provinces,
    common_citys:common_citys,
    common_buildings:common_buildings,
    common_floors:common_floors,
    table: table
    });

    var components = {
    search: search,
    getActivityProvince: getActivityProvince,
    getActivityCity: getActivityCity,
    getActivityBuilding:getActivityBuilding

  }
  main.mount(components);




  var out_components = {
    paging:paging
  }
  //----------------control----------------
  return function(channelId) {
    if (!app.onThisPath) {
      var search = app.url.search;
      table.model.channelId = channelId;
      getActivityProvince.model.channelId=channelId;
      getActivityBuilding.model.channelId = channelId;
      getActivityCity.model.channelId = channelId;

      getActivityProvince.model.fetch();
      getActivityCity.model.fetch();
      getActivityBuilding.model.fetch();
      
/*      if(search.provinceId){
        getActivityCity.model.fetch();
      }
      
      if(search.cityId){
        getActivityBuilding.model.fetch();
      }*/
      

      main.mount(out_components);
/*      var data = _.clone(app.url.search);
      data.id = channelId;*/
      $.get(app.API_PATH + '/channels',{id:channelId}, function(data){
        console.log('data',data);
        title.render(data.pageResult[0]);
      })
      main.display();
    }

    app.query(components);
    table.model.fetch();
  }

});