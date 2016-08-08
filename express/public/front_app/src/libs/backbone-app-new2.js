//dw 2016/8/8
define(['backbone', 'util'], function(Backbone, util) {
      /*
      修改了Backbone的路由，增加了next();
      */
      Backbone.Router.prototype.route = function(route, name, callback) {
        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
        if (_.isFunction(name)) {
          callback = name;
          name = '';
        }
        if (!callback) callback = this[name];
        var router = this;
        Backbone.history.route(route, function(fragment) {
          var args = router._extractParameters(route, fragment);
          if (router.execute(callback, args, name) !== false) {
            router.trigger.apply(router, ['route:' + name].concat(args));
            router.trigger('route', name, args);
            Backbone.history.trigger('route', router, name, args);
          }
        });
        return this;
      }
      Backbone.history.loadUrl = function(fragment) {
        // If the root doesn't match, no routes can match either.
        if (!this.matchRoot()) return false;
        fragment = this.fragment = this.getFragment(fragment);
        this._next(this.handlers, fragment, 0, this.handlers.length);
      }

      Backbone.history._next = function(handlers, fragment, i, len) {
        if (i < len) {
          function nextTick() {
            this._next(handlers, fragment, i + 1, len);
          }
          if (handlers[i].route.test(fragment)) {
            handlers[i].callback(fragment, nextTick);
          } else {
            nextTick();
          }
        }
      }

      //---------------- app ----------------

      app.prevUrl = null;
      app.url = util.url.parse('');
      app.route = new Backbone.Router;

      //end
    }