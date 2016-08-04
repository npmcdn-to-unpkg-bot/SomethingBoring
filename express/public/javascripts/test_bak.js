
  Backbone.history.route = function(route, callback) { //unshift is a jok ?
    this.handlers.push({
      route: route,
      callback: callback
    });
  }

  Backbone.history.loadUrl = function(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      _next(this.handlers, fragment, 0, this.handlers.length);
    }

    var  _next = function(handlers,fragment, i, len){
      if(i < len){
        function nextTick(){
          _next(handlers,fragment, i + 1, len);
        }
        if(handlers[i].route.test(fragment)){
          handlers[i].callback(fragment, nextTick);

        }else{
          nextTick();
        }
    }
  }



var router = new Backbone.Router();



router.route('*path', function(f, next){
  console.log('test');
  //next();
});

router.route('*path', function(f, next){
  console.log('catch');
});


var height = $('body').height();

Backbone.history.start( /*{pushState: true}*/ );
$('textarea').focus(function(){
  var t = $(this);

  alert('height '+ height + '\nheight2 '+ $(window).height() + 
    '\nheight3 '+ $('body').height());
  $('html','body').height(height);
})

$(function(){

$('form').submit(function(e){
  console.log('e', e.value);
  e.preventDefault();
  
});

})
