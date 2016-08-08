/*
  dw
*/
define([app.TPL_PATH + '/coupons.jade',
  '../../models/index',
  '../paging','../toolbar'
], function(tpls, models, paging, toolbar) {

/*  var table = new (app.table.extend({

  }));*/


  var main = new app.MainView({
    template: tpls.B_main
  });

  var table =  new (app.TableView.extend({
    model: new models.high_beacon('B_coupons'),
    template: tpls.B_table,
    events:{
      'click button.dw_wx_sync': function(e){
        console.log('test');
        var t = $(e.target),
        id = t.attr('modelId');
        if(t.attr('disabled')){
          return;
        }
        var text = t.text();
        t.attr('disabled',true);
        t.text('正在同步……');
        $.ajax({
          type:'put',
          url:app.API_PATH + '/B_coupons/' + id,
          success:function(){
            table.model.fetch();
          },
          error:app.errorMsg,
          complete: function(){
            t.removeAttr('disabled');
            t.text(text);
          }
        });

      }
    },
    paging: paging
  }))


  var title = new (Backbone.View.extend({
    template: tpls.B_title,
    render:function(data){
      this.$el.html(this.template({data:data}));
    }
  }));

  main.mount({
    title:title,
    table: table
  });




  var out_components = {
    paging:paging
  }
  //----------------control----------------
  return function(activityId) {
    if (!app.onThisPath) {
      table.model.activityId = activityId;
      main.mount(out_components);
      var data = _.clone(app.url.search);
      data.activityId = activityId;
      title.render(data);
      main.display();
    }
    table.model.fetch();
  }

});