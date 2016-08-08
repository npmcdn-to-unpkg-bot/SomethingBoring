/*
  dw
*/
define([app.TPL_PATH + '/common.jade', 'md5'],
  function(tpls , md5) {



    var views = Backbone.View.extend({
      model: app.sessModel,
      el: app.el.login,
      initialize: function() {
        this.render();
        //this.listenTo(this.model, 'change:isLogin', this.render);
      },
      events: {
        'keypress': 'updateOnEnter',
        'click button': 'submit'
      },
      template:tpls.login,
      submit: function() {
        var name = this.inputName.val();
        var password = this.inputPassword.val();
        var data = {
          username: name,
          password: md5(password)
        }
        $.ajax({
          url: app.API_PATH + '/login',
          data: data,
          type: 'post',
          error: app.errorMsg,
          success: function(data) {

            var pageList = data.pageList;
            pageList = _.pluck(pageList, 'id');
            localStorage[data.username + '.leftMenu'] = JSON.stringify(pageList);
            delete(data.pageList);
            //再更新用户信息，不可颠倒。
            app.sessModel.set({
              isLogin: true,
              user: data
            });
            app.afterLogin();
          }
        })
      },
      updateOnEnter: function(e) {
        if (e.keyCode == 13) this.submitBtn.click();
      },
      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.submitBtn = this.$el.find('button');
        this.inputName = $('#inputUser');
        this.inputPassword = $('#inputPassword');
      }
    });

    return new views;
  });