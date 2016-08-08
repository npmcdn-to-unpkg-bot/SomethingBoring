  var emptyFn = function() {};
  //默认view
  app.testView = Backbone.View.extend({
    _components_cache :null,
    mount: function(components) {
      var $components = this._components_cache || this.$el.find('component');
      $components.each(function() {
        var t = $(this),
          key = t.text(); //$.trim(t.text());
        if (components[key]) {
          t.after(components[key].$el);
        }
      });
    },
    render: function(data) {
      data = data || (this.model ? this.model.toJSON() : {});
      this.$el.html(this.template({
        data: data
      }));
      if (this.components) {
        this.mount(this.components);
      }
      this.afterRender();
    },
    fetch: function() {
      this.loading();
      this.model.fetch({
        success: this.success,
        error: this.error,
        complete: this.complete
      })
    },
    afterRender: emptyFn,
    loading: emptyFn,
    _complete: emptyFn,
    initialize: function(){
      this.loading = function(){
        $('body').spin('flower', 'red');
      }
    },
    loading: function(){
      console.log(this.$el)
      console.log($(this.$el));
      //$(this.$el).spin('flower', 'red');
      //this.$el.spin('flower', 'red');
    },
    unLoading: function(){

      //this.$el.spin(false);
    },
    loaded:emptyFn,
    success: emptyFn,
    error: emptyFn
  });