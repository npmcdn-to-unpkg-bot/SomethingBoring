define(['jquery', 'backbone'], function($, Backbone) {
  var util = {};
  var $win = $(window);

  //web客户端必须的唯一入口
  //Api服务器端只会生成一个session
  $.fn.dwGetInputData = function() {
    var all = [];
    var data = {};
    $.merge(all, this.find("input[name]").toArray());
    //$.merge(all, this.find(":selected").toArray());
    $.merge(all, this.find("textarea[name]").toArray());
    all = $(all);
    all.each(function() {
      var t = $(this),
        key = t.attr('name'),
        type = t.attr('type'),
        v = t.val();
        if(v){
          switch(type){
            case 'radio':
            if(t.prop('checked')){
              data[key] = v;
            }
            break;
            case 'checkbox':
            if(t.prop('checked')){
              data[key] = data[key] ? data[key] + ',' + v : v;
            }
            break;
            default:
            data[key] = v;
          }
          
        }
      
    });
    return data;
  }

//http://spin.js.org/jquery.spin.js

  $.fn.spin = function(opts, color) {

    return this.each(function() {
      var $this = $(this)
        , data = $this.data()

      if (data.spinner) {
        data.spinner.stop()
        delete data.spinner
      }
      if (opts !== false) {
        opts = $.extend(
          { color: color || $this.css('color') }
        , $.fn.spin.presets[opts] || opts
        )

        data.spinner = new Spinner(opts).spin(this)
      }
    })
  }
  
  $.fn.spin.presets = {
    def:  {
      lines: 9 // The number of lines to draw
    , length: 18 // The length of each line
    , width: 7 // The line thickness
    , radius: 9 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#428bca' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%'// Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: true // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'fixed' // Element positioning
  }
/*  , small: { lines:  8, length: 4, width: 3, radius: 5 }
  , large: { lines: 10, length: 8, width: 4, radius: 8 }*/
  }

  util.isEmpty = function(str) {
    return /^\s*$/.test(str);
  }

  util.logout = function() {
    $.post(app.API_PATH + '/logout', {}, function() {
      app.sessModel.set({
        isLogin: false,
        user: null
      });
      app.router.navigate('login', {
        trigger: true
      });
    });
  }

  util.mainView = function(tpl) {
    var view = Backbone.View.extend({
      initialize: function() {
        app.el.main.append(this.$el);
        this.$el.html(tpl());
      },
      render: function() {
        this.$el.siblings().hide();
        this.$el.show();
      }
    });
    return view;
  }

  util.append = function(components, main) { //嵌入组件
    var dw_components = main.$el.find('.dw_components');
    dw_components.each(function() {
      var t = $(this);
      var elList = t.attr('view-el');
      if (elList) {
        elList = elList.split(',');
        for (var i = 0, len = elList.length; i < len; i++) {
          var key = $.trim(elList[i]);
          t.append(components[key].$el);
        }
      }
    });
  }

  util.mount = function(components, main) { //嵌入组件
    var dw_components = main.$el.find('component');
    dw_components.each(function() {
      var t = $(this);
      var key = t.attr('view-el');
      components.$el = t;

    });
  }
  util.getSelectKey = function(model) {
    var raw = model.attributes;

    return raw.list[raw.index].key;
  }

  util.dateFormet = function(date, fmt) { //来自互联网
    if (!date) return;
    date = typeof date === 'number' ? new Date(date) : date;
    fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
    var o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'H+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      'S': date.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
  }

  //简单的url parse 和 serialize 
  //dw 2015/0/21
  util.url = {
    origin: typeof location === 'undefined' ? '' : location.origin || location.protocol + '//' + location.host,
    hashSplit: '#',
    parse: function(url) {
      if (typeof url === 'undefined') {
        url = this.def_parse_param;
      }
      if (!url) {
        return {
          path: '',
          search: {},
          hash: {}
        };
      }
      var obj = {
        searchStr:'',
        hashStr:''
      };
      url = url.split('?');
      if (url.length === 1) {
        url = url[0].split(this.hashSplit);
        obj.path = url[0];
        obj.search = {};
      } else {
        obj.path = url[0];
        url = url[1].split(this.hashSplit);
        obj.searchStr = url[0];
        obj.search = this.parseQuery(url[0]);
      }

      if (url[1]) {
        obj.hashStr = url[1];
        obj.hash = this.parse(url[1]);
      } else {
        obj.hash = {}
      }

      return obj;
    },
    serialize: function(obj) {
      if (!obj) {
        return;
      }
      var str = obj.path;
      var _tmp = this.serializeQuery(obj.search);
      if (_tmp) {
        str += '?' + _tmp;
      }
      _tmp = this.serialize(obj.hash);
      if (_tmp) {
        str += this.hashSplit + _tmp;
      }
      return str;
    },
    parseQuery: function(str) {
      var obj = {};
      str = str.split('&');
      for (var i = 0, len = str.length; i < len; i = i + 1) {
        var lis = str[i].split('=');
        obj[lis[0]] = decodeURIComponent(lis[1]);
      }
      return obj;
    },
    serializeQuery: function(obj) {
      var arr = [];
      for (var i in obj) {
        arr.push(i + '=' + encodeURIComponent(obj[i]));
      }
      return arr.join('&');
    }
  }
  util.url.def_parse_param = util.url.origin ? location.href.substr(util.url.origin.length) : ''
    //============ url end ============

  //================ cookie ================
  //v 0.0.1 dw
  util.cookie = {
      set: function(k, v, opts) {
        var str = '';
        if (opts) {
          for (var i in opts) {
            str += ';' + i + '=' + opts[i]
          }
        }
        document.cookie = k + '=' + encodeURIComponent(v) + str;
      },
      get: function(k) {
        var dc = document.cookie;
        k = k + '=';
        var firstIndex = dc.indexOf(k);
        if (firstIndex !== -1) {
          var lastIndex = dc.indexOf(';', firstIndex);
          lastIndex = lastIndex === -1 ? dc.length : lastIndex;
          firstIndex = firstIndex + k.length;
          dc = dc.substr(firstIndex, lastIndex - firstIndex);
          return decodeURIComponent(dc);
        } else {
          return null;
        }
      },
      expires: new Date(0),
      del: function(k, opts) {
        opts = opts || {};
        opts.expires = this.expires;
        this.set(k, 'del', opts);
      }
    }
    //================ cookie end ================
    //----------------------------分割线--------------------------------------

  /*  

    util.fromUrlGo = function(th) {
      if(App._fromUrl !== null){
       location.hash = App._fromUrl;
       App._fromUrl = null;
     }
    }*/

  //在url不变的情况下，触发当前url.
  util.samaHash = function(th) {
    var hash = location.hash || '#',
      th = $(th);
    if (th.attr('href') && hash === th.attr('href')) {
      this.reload();
    }
  }

  util.ajaxhandle = function(that, xhr) {
    if (xhr.status === 403) {
      if (App.gloErr) {
        return;
      }
      App.gloErr = true;
      App.el.login_btn.click();
      return;
    }
    that.error(that.$el, xhr);
  }
  return util;

});