/*
  dw
*/
define([app.TPL_PATH + '/high_bind.jade',
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
        var activityId = table.model.activityId;
        if(!buildId){
          return app.bootbox.alert('建筑为空,请先选择建筑');
        }
        var t = $(e.target);
        if(t.attr('disabled')){
          return;
        }
        t.attr('disabled',true);
        $.ajax({
          url: app.API_PATH + '/beacon_bind_by_floor',
          type: 'post',
          data:{
          buildId:buildId,
          floor:floor,
          activityId:activityId
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
          var activityId = table.model.activityId;
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
                  url: app.API_PATH + '/beacon_unbind_by_floor',
                  type: 'post',
                  data:{
                  buildId:buildId,
                  floor:floor,
                  activityId:activityId
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
        var activityId = table.model.activityId;
        $.ajax({
          type:'post',
          url : app.API_PATH + '/beacon_bind_by_deviceId',
          data:{
            activityId: activityId,
            deviceId: tpv
          },
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
        var activityId = table.model.activityId;

        $.ajax({
          type:'post',
          url : app.API_PATH + '/beacon_unbind_by_deviceId',
          data:{
            activityId: activityId,
            deviceId: tpv
          },
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
    model: new models.high_beacon('beacons'),
    template: tpls.table,
    events:{
      'click a.btn-sm': function(e){
        var t = $(e.target),
        method = t.data('method'),
        deviceId= t.parent().attr('deviceId');
        if(t.attr('disabled')){
          return;
        }
        t.attr('disabled',true);
        $.ajax({
          type:'put',
          url: app.API_PATH + '/activitys/'+ table.model.activityId+'/beacons/'+deviceId,
          data: {
            method:method
          },
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
    param:'deviceId',
    holdParam: ['activityName','channelIdeaId'],
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
    model: new models.high_beacon_addr('provinces'),
    events:{
      'change': function(e){
        var search = pickSearch();
        search = _.omit(search, 'cityId','buildId');
        search.provinceId = e.target.value;
        app.url.search = search;
        app.go();
        getActivityCity.model.fetch();
      }
    },
    render:function(){
      this.$el.html(this.template({data:this.model.toJSON()}));
    }
  }));

  var getActivityCity = new (Backbone.View.extend({
    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
    },
    template: tpls.getActivityAddr,
    className:'form-group',
    model: new models.high_beacon_addr('citys'),
    events:{
      'change': function(e){
        var search = pickSearch();
        search = _.omit(search, 'buildId');
        search.cityId = e.target.value;
        app.url.search = search;
        app.go();
        getActivityBuilding.model.fetch();
      }
    },
    render:function(){
      this.$el.html(this.template({data:this.model.toJSON()}));
    }
  }));

  function pickSearch(){
      var search = app.url.search;
      search = _.omit(search, ['deviceId','page']);
      return search;
  }
  var getActivityBuilding = new (Backbone.View.extend({
    initialize: function(data){
      this.listenTo(this.model, "sync", this.render);
    },
    template: tpls.getActivityBuilding,
    className:'form-group',
    model: new models.high_beacon_addr('buildings'),
    events:{
      'change': function(e){
        var search = pickSearch();
        search.buildId = e.target.value;
        app.url.search = search;
        app.go();
      }
    },
    render:function(){
      this.$el.html(this.template({data:this.model.toJSON()}));
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
      'change': function(e){
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
    search: search,
    title:title,
    getActivityProvince: getActivityProvince,
    getActivityCity: getActivityCity,
    getActivityBuilding:getActivityBuilding,
    common_provinces:common_provinces,
    common_citys:common_citys,
    common_buildings:common_buildings,
    common_floors:common_floors,
    table: table
  });




  var out_components = {
    paging:paging
  }
  //----------------control----------------
  return function(activityId) {
    if (!app.onThisPath) {
      table.model.activityId = activityId;
      getActivityProvince.model.activityId=activityId;
      getActivityProvince.model.fetch();
      getActivityCity.model.activityId = activityId;
      getActivityCity.model.fetch();
      getActivityBuilding.model.activityId = activityId;
      getActivityBuilding.model.fetch();

      main.mount(out_components);
      var data = _.clone(app.url.search);
      data.activityId = activityId;

      title.render(data);
      main.display();
    }

    table.model.fetch();
  }

});