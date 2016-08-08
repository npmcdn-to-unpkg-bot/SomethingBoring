/*
  dw
*/
define([app.TPL_PATH + '/toolbar.jade', 'bootstrap_select'],
  function(tpls) {

    //select + input + btn 
    var Param_search = app.View.extend({
      className:'input-group',
      template: tpls.param_search,
      initialize: function(data){
        this.holdParam = data.holdParam || [];
        delete(data.holdParam);
        this.keys = Object.keys(data);
        this.data = data;
        this.render();
        this.$spr = this.$('.selectpicker');
        this.$spr.selectpicker('val');
        this.$el.attr('search_k', this.keys[0]);
      },
      events:{
        'changed.bs.select': function(e, clickedIndex){
          this.$el.attr('search_k', this.keys[clickedIndex]);
        },
        'click button.dw_search_btn' :function(e){
          var search_v = this.$('input').val();
          var search_k = this.$el.attr('search_k');
          var search = app.url.search;
          search = _.pick(search, this.holdParam);
          search[search_k] = search_v;
          app.url.search = search;
          app.go();
        }
      },
      query: function(){
        var search = app.url.search;
        var index = 0,v, keys = this.keys;
        for(var i = 0, len = keys.length; i< len; i++){
          var k = keys[i];
          if(search[k] !== undefined){
            index = i;
            v = search[k];
            break;
          }
        }
        var eqIndex = this.$spr.children().eq(index);
        if(!eqIndex.prop('selected')){
          eqIndex.prop('selected', 'selected');
          this.$spr.selectpicker('refresh');
        }
        this.$('input').val(v);
      },
      render: function(){
        this.$el.html(this.template({data:this.data}));
      }
    });

    //混合搜索 input + btn
    Search = Backbone.View.extend({
      className:'input-group',
      tpl:tpls.queryString_search,
      initialize: function(data){
        this.data = data;
        this.param = data.param || 'queryString';
        this.holdParam = data.holdParam || [];
        this.render(this);
        this.input = this.$el.find('input');
      },
      events:{
        'click button': function(){
          var val = this.input.val();
          var search = app.url.search;
          search = _.pick(search, this.holdParam);
          search[this.param] = val;
          app.url.search = search;
          app.go();
        }
      },
      query: function(){
        this.input.val(app.url.search[this.param]);
      },
      render: function() {
        this.$el.html(this.tpl(this.data));
      }
    });

    //混合搜索 input + btn
    Hybrid_search = Backbone.View.extend({
      className:'input-group',
      tpl:tpls.queryString_search,
      initialize: function(data){
        this.data = data;
        this.render();
        this.input = this.$el.find('input');
      },
      events:{
        'click button': function(){
          var val = this.input.val();
          app.url.search = {
            queryString : val
          }
          app.go();
        }
      },
      render: function() {
        this.$el.html(this.tpl(this.data));
      }
    });

    //多重条件筛选按钮
    var Select_btn = Backbone.View.extend({
      template: tpls.select_btn,
      className: 'btn-group',
      unique:true,
      initialize:function(data){
        data = data || {}
        this.holdParam = data.holdParam || [];
        this.render();
      },
      events: {
        'click': function(e){
          var prevAll = this.$el.prevAll('.btn-group');
          var query = {};
          prevAll.each(function(){
            var t = $(this),
            key = t.attr('search_k'),
            v = t.attr('search_v');
            if(v){
              query[key] = v;
            }else{
              delete(query[key]);
            }
          });
          var search = app.url.search;
          search = _.pick(search, this.holdParam);

          app.url.search = _.extend(search, query);
          app.go();
        }
      },
      render: function(){
        this.$el.html(this.template());
      }
    });

    var Select = app.View.extend({
      template: tpls.select,
      className: 'btn-group',
      initialize:function(data){
        this.data = data;
        this.render();
        this.keys = Object.keys(this.data.option);
        this.$el.attr('search_k', this.data.key);
      },
      events: {
        'change select': function(e, index){
          var t = $(e.target);
          //console.log('index', t.val());
          var v = t.val();
          this.$el.attr('search_v', v);
        }
      },
      query: function(){
        var v = app.url.search[this.data.key] || '';
        //console.log('action', v);

        this.$el.attr('search_v', v);
        this.$('option[value="' + v + '"]').prop('selected', 'selected');
      },
      render: function(){
        this.$el.html(this.template(this.data));
      }
    });
    return {
      Search: Search,
      Select : Select,
      select_btn: new Select_btn,
      Select_btn: Select_btn,
      Param_search: Param_search,
      Hybrid_search: Hybrid_search
    };
  });