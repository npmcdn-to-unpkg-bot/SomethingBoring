/*
  dw
*/
define(function() {

  var models = {};

  //获得所有城市
/*  models.Select_city = Backbone.Model.extend({
    url: app.API_PATH + '/list_citys',
    parse: function(data) {
      //var id = app.url.search.cityid;
      return {
        city_id: null,
        index: null,
        list: data
      }
    }
  });*/


  //获得所有商户：需要city_id
  models.Select_market = Backbone.Model.extend({
    url: function() {
      var city = this.get('city');
      return app.API_PATH + '/list_markets?city_id=' + city.id;
    },
    parse: function(data) {

      data = data || [];
      return {
        market_id: null,
        index: null,
        list: data
      }
    }
  });

  //获得所有商户：需要city_id
  models.Select_shop = Backbone.Model.extend({
    url: function() {
      var market = this.get('market');
      return app.API_PATH + '/list_shops?market_id=' + market.id;
    },
    parse: function(data) {
      //var id = app.url.search.shop_id;
      data = data || [];
      return {
        shop_id: null,
        index: null,
        list: data
      }
    }
  });

  var TableCollection = Backbone.Collection.extend({
    url: function(){ // 
      return app.API_PATH + this.path  + '?' +app.url.searchStr;
    },
    parse: function(data) {
      this.pagingInfo = {
        max: data.pageSize ? Math.ceil(data.total / data.pageSize) : 0,
        index: data.currentpage
      }
      return data.pageResult;
    }
  });



  //报表
  models.bUsers = TableCollection.extend({
    path:'/reports/bUsers'
  });
  
  models.bPrizess = TableCollection.extend({
    path:'/reports/bPrizes'
  });

  models.report_redPackets = TableCollection.extend({
    path:'/reports/redPackets'
  });

  models.report_onlineByCity = TableCollection.extend({
    path:'/reports/onlinePrizesByCity'
  });

  models.report_onlineByOneDay  = TableCollection.extend({
    path:'/reports/onlinePrizesByOneDay'
  });

  models.report_wifi = TableCollection.extend({
    path:'/reports/wifi'
  });
  
  models.MarketsTable = TableCollection.extend({
    path:'/markets'
  });

  models.marketAuditsTable = TableCollection.extend({
    path:'/marketAudits'
  });

  models.UsersTable = TableCollection.extend({
    path:'/users'
  });

  //Beacons
  models.Beacons = TableCollection.extend({
    path:'/beacons'
  });
  //redPackets
  models.redPackets = TableCollection.extend({
    modelId:function(attr){
      return attr.prize_id;
    },
    path:'/redPackets'
  });
  //activitys
  models.activitys = TableCollection.extend({
    path:'/activitys'
  });

  //设置渠道页
  models.set_channels = TableCollection.extend({
    url: function(){
      var search = app.url.search;
      search.page_size = 50;
      search.activity_id = this.activityId;
      search = app.util.url.serializeQuery(search);
      
      return app.API_PATH + '/activity/nation/channel?' +search;
    }
  });
  //channels
  models.channels = TableCollection.extend({
    path:'/channels'
  });



  //高级绑定

  models.high_beacon = TableCollection.extend({
      activityId: '',
      initialize:function(path){
        this.path = path;
      },
     url: function(){
      var search = app.url.search;
      search = _.omit(search, ['activityName', 'channelIdeaId']);
      search = app.util.url.serializeQuery(search);
      return app.API_PATH + '/activitys/' + this.activityId  + '/'+this.path+'?' +search;
    }
  });

  //3.7
  models.channel_high_beacon = TableCollection.extend({
      activityId: '',
      buildId: '',
     url: function(){
      var search = app.url.search;
      search = _.omit(search, ['name', 'build_id']);
      search = app.util.url.serializeQuery(search);
      return app.API_PATH + '/task/rest/channel/querybeacon/'+this.channelId+
      '?' +search;
    }
  });

  models.channel_high_beacon_attr = TableCollection.extend({
      initialize:function(type){
        this.type = type;
      },
    parse: function(resp){
      return resp;
    },
     url: function(){
      var search = app.url.search;

      var _p = '';
      switch(this.type.toString()){
        case '1':
        if(search.provinceId){
          _p = '&provinceId=' + search.provinceId;
        }
        break;
        case '2':
        if(search.cityId){
          _p = '&cityId=' + search.cityId;
        }
        
        break;
      }
      return app.API_PATH + '/task/rest/channel/queryregion/'+
      this.channelId+'?type='+ this.type +_p;
    }
  });

  models.high_beacon_addr = models.high_beacon.extend({
    parse: function(resp){
      return resp;
    }
  });

  models.common_provinces = Backbone.Collection.extend({
     url: function(){
      return app.API_PATH + '/common_provinces'
     }
  });

  models.common_citys = Backbone.Model.extend({
     provinceId:'',
     url: function(){
      return app.API_PATH + '/common_citys?provinceId=' + this.provinceId
     }
  });

  models.common_buildings = Backbone.Model.extend({
     cityId:'',
     url: function(){
      return app.API_PATH + '/common_buildings?cityId=' + this.cityId
     }
  });

  models.common_floors = Backbone.Model.extend({
     buildId:'',
     url: function(){
      return app.API_PATH + '/common_floors?buildId=' + this.buildId
     }
  });
  //coupons
  models.coupons = TableCollection.extend({
    path:'/coupons',
    modelId: function(attr){
      return attr.prize_id;
    }
  });

  
  return models;
});