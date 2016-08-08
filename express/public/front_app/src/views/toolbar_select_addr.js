/*
  dw
*/
define(['../models/index',
    app.TPL_PATH + '/toolbar.jade',
    'json!' + app.API_PATH + '/list_citys' 
    , 'bootstrap_select'
  ],
  function(models, tpls, cityData) {

    var BaseSelect = Backbone.View.extend({
      topToEl: function(){
        var attr = this.model.attributes;
        var id = attr['list'][attr['index']] || {id:''};
        this.$el.attr('search_v', id.id);
      }
    })


    //==================选择城市================== 
    var select_city = BaseSelect.extend({
      model: new Backbone.Model({
        city_id:null,
        index:null,
        list:cityData
      }),
      className:'btn-group',
      initialize: function() {
        //this.render()
        var that = this;
        this.$el.attr('search_k','city_id');

        /*this.model.fetch({success:function(model){

          that.query = function(){
            var city_id = app.url.search.city_id;

            //console.log('fetch set city_id', city_id);
            if(!city_id){
              //-console.log('-(Date.now())', -(Date.now()));
              
              select_market.model.set({'index':-(Date.now()), list:[]});
              select_shop.model.set({'index':-(Date.now()), list:[]});
              this.model.set({'index':-(Date.now()), city_id: city_id});
            }else{
               model.set('city_id', city_id);
            }

            //model.set('city_id', city_id);
          }

          that.query();
        }});*/


        this.model.on('change:index', function(model, id) {

          //-console.log('change index', id);
          that.render();
        });

        this.model.on('change:city_id', function(model, id) {
          var list = model.get('list');
          if(list){
          var index = (id === undefined) ? -1 : _.findIndex(list, {
            id: Number(id)
          });
          //console.log('change city_id set index', index);
          //console.log('list', list);
            model.set('index', index);
          }
        });
        
      },

      query:function(){
            var city_id = app.url.search.city_id;
            if(!city_id){
              select_market.model.set({'index':-(Date.now()), list:[]});
              select_shop.model.set({'index':-(Date.now()), list:[]});
              this.model.set({'index':-(Date.now()), city_id: city_id});
            }else{
               this.model.set('city_id', city_id);
            }
          },
      events: {
        "changed.bs.select": function(e, clickedIndex) {
          //console.log('city changed')
          this.model.set('index', clickedIndex - 1); //模版里最上头多加了一行(全部)，所以减一。
          //this.topToEl();
          e.stopPropagation();
        }
      },
      render: function() {
        var data = this.model.toJSON();
        this.$el.html(tpls.select_city(data));
        var selectpicker = this.$el.find('.selectpicker');
        selectpicker.selectpicker('val');
        this.topToEl();
      }
    });

    select_city = new select_city; //直接创建对象。保证全局只这唯一一个view。

    //==================选择商场==================
    var select_market = BaseSelect.extend({
      model: new models.Select_market,
      className:'btn-group',
      initialize: function() {
        this.render();
        this.$el.attr('search_k','market_id');
        //和'选择city'关联起来。
        this.cityModel = select_city.model;
        this.listenTo(this.cityModel, 'change:index', function(model,index) {
          if(!_isPrevComponent(this, select_city)){ //触发条件：city必须在它的前面。
            return;
          }
          var list = model.get('list');
          this.model.set('city', list[index]);
        });

        var that = this;
        this.model.on('change:index', function(model, id) {
          that.topToEl();
          that.render();
        });
        this.model.on('change:market_id', function(model, id) {
          var list = model.get('list');
          var index = (id === undefined) ? -1 : _.findIndex(list, {
            id: Number(id)
          });
          model.set('index', index);
        });

        //this.listenTo(this.model, "sync", this.render);

        function _setMarketId(model){
                var market_id = app.url.search.market_id;
                model.set('market_id', market_id);
        }
        this.listenTo(this.model, 'change:city',
          function(model, city) {
            if (city) {
              //this.model.set('index', -1);
              this.model.fetch({success:function(){
                this.query =  function(){
                  _setMarketId(model);
                }
                _setMarketId(model);
              }});
            } else {
              model.set('market_id', null);
            }
          });
      },
      query: function(){},
      events: {
        "changed.bs.select": function(e, clickedIndex) {
          //console.log('market changed')
          this.model.set('index', clickedIndex - 1); //模版里多加了一行(全部)，所以减一。
          e.stopPropagation();
        }
      },
      render: function() {
        var data = this.model.toJSON();
        this.$el.html(tpls.select_market(data));
        var selectpicker = this.$el.find('.selectpicker');
        selectpicker.selectpicker('val');
        
      }
    });
    //直接创建对象。保证全局只这唯一一个view。
    select_market = new select_market; 

    //==================选择商铺==================
    //需要market_id
    var select_shop = BaseSelect.extend({
      model: new models.Select_shop,
      template: tpls.select_shop,
      className:'btn-group',
      initialize: function() {
        this.render();
        //和'选择city'关联起来。
        this.$el.attr('search_k','shop_id');
        this.marketModel = select_market.model;
        this.listenTo(this.marketModel, 'change:index', 
          function(model, index) {
          if(!_isPrevComponent(this, select_market)){ 
          //触发条件：market必须在它的前面。
            return;
          }
          var list = model.get('list');
          this.model.set('market', list[index]);
        });

        var that = this;
        this.model.on('change:index', function(model, id) {
          that.topToEl();
          that.render();
        });

        this.model.on('change:shop_id', function(model, id) {
          var list = model.get('list');
          var index = (id === undefined) ? -1 : _.findIndex(list, {
            id: Number(id)
          });
          model.set('index', index);
        });

        function _setShopId(model){
                var shop_id = app.url.search.shop_id;
                model.set('shop_id', shop_id);
        }
        this.listenTo(this.model, 'change:market',
          function(model, market) {
            if (market) {
              this.model.fetch({success:function(){
                _setShopId(model)
              }});
            } else {
              model.set('shop_id', null);
            }
          });

      },
      events: {
        "changed.bs.select": function(e, clickedIndex) {
          //模版里多加了一行(全部)，所以减一。
          this.model.set('index', clickedIndex - 1); 
          this.topToEl();
          e.stopPropagation();
        }
      },
      render: function() {
        var data = this.model.toJSON();
        this.$el.html(this.template(data));
        var selectpicker = this.$el.find('.selectpicker');
        selectpicker.selectpicker('val');
      }
    });
    select_shop = new select_shop;

    function _isPrevComponent(th, obj){
      var next_key = obj.$el.next('component').text();
      var prev_key = th.$el.prev('component').text();
/*      console.log('next_key', next_key);
      console.log('prev_key', prev_key);*/
      var bool = (next_key.length > 0);

      if(bool){
        bool = (next_key === prev_key)
      }
      //console.log('bool',bool)
      return bool;
    }

    //--------- 新组件 ---------

    var Select_city = Backbone.View.extend({
      className:'btn-group',
      initialize: function(opts){
        opts = opts || {};
        this.template = opts.template || tpls.new_select_city;

        this.model = new Backbone.Model({
          label: opts.label || '城市:',
          name: opts.name || 'city_id',
          first: opts.first,
          notDisabled:opts.notDisabled,
          active_id: undefined,
          list: cityData
        });
        this.render();
        this.listenTo(this.model, 'change:active_id', this.refresh);
      },
      render: function(){
        //console.log('this.model.toJSON()', this.model.toJSON())
        this.$el.html(this.template(this.model.toJSON()));
        this.$selectpicker = this.$('.selectpicker');
        this.$selectpicker.selectpicker('val');
      },
      refresh: function(model, active_id){
        this.$selectpicker.find('[value='+active_id+']').prop('selected', true);
        this.$selectpicker.selectpicker('refresh');
      }
    });

/*    var _market_model = Backbone.Model.extend({
      url: function() {
        var city = this.get('city');
        return app.API_PATH + '/list_markets?city_id=' + city.id;
      },
      parse:
    })*/
    var Select_market = Backbone.View.extend({
      className:'btn-group',
      initialize: function(opts){
        opts = opts || {};
        this.template = opts.template || tpls.new_select_city;

        this.model = new Backbone.Model({
          label: opts.label || '商场:',
          first: opts.first,
          name: opts.name || 'market_id',
          city_id: undefined,
          active_id: undefined,
          list: []
        });
        this.render();
        this.listenTo(this.model, 'change:city_id', this.getData);
        this.listenTo(this.model, 'change:list', this.render);
      },
      getData: function(model, city_id){
        //this.$el.attr('disabled', 'disabled');
        $.ajax({
          type: 'get',
          url: app.API_PATH + '/list_markets?city_id=' + city_id,
          success: function(data){
            model.set({list: data});
          }
        })
      },
      render: function(){
        //console.log('this.model.toJSON()', this.model.toJSON())
        this.$el.html(this.template(this.model.toJSON()));
        this.$selectpicker = this.$('.selectpicker');
        this.$selectpicker.selectpicker('val');
      },
      refresh: function(model, active_id){
        this.$selectpicker.find('[value='+active_id+']').prop('selected', true);
        this.$selectpicker.selectpicker('refresh');
      }
    });


    //console.log('test.model.toJSON()', test.model.toJSON());

    return {
      select_city: select_city,
      select_market: select_market,
      select_shop: select_shop,
      Select_city: Select_city,
      Select_market: Select_market
    }
  });