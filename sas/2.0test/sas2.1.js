/*
作者:hezedu
https://github.com/hezedu/sas
*/
//主
function sas(tasks, opt, end) {

  //参数样式: 根据参数个数 判定函数的 api样式
  var ite;
  if (typeof opt !== 'object') {
    switch (arguments.length) {
      case 2:
        end = opt;
        break;
      case 3:
        ite = opt;
        break;
      default:
        opt = {};
    }
  } else {
    ite = opt.ite;
    end = end || opt.end;
  }
  //参数样式完
  return new sas.min(tasks, ite, end, opt);
}
//主end
//主静态方法
sas.typeArr = ['[object,Function]', '[object,Object]', '[object,Array]'];
sas.typeFn = Object.prototype.toString;
//主静态方法完

//min
sas.min = function(tasks, ite, end, opt) {
  this.tasks_count = 0;
  this.tasks_count_cb = 0;
  this.STOP = false;
  this.error = null;
  this.end = end;
  this.ite = ite;
  this.process = opt.process;
  this.process_interval = opt.process_interval || 1000;
  this.plan = opt.copy ? sas.copy(tasks) : tasks;
  //<DWDEBUG##############################
  this.debug._color(1, '\n开始', 22);
  //##############################DWDEBUG>
  this.init();
}
//min 完

//min 初始化
sas.min.prototype.init = function() {
  var ty = sas.typeFn.call(this.plan);
  switch (ty) {
    case sas.typeArr[1]: //Object
      var keys = Object.keys(this.plan),
        keys_len = keys.length,
        _count = [keys_len, 0];
      for (var o = 0; o < keys_len; o++) {
        this.dis(keys[o], this.plan, _count, arguments);
      }
      break;

    case sas.typeArr[2]: //Array
      var _count = [this.plan.length, 0];
      this.dis(_count[1], this.plan, _count, arguments);
      break;
    default:
      return;
  }
  /*  var count = [0, 1];
    this.dis(count[0], [this.plan], count);*/
}
//min 初始化完

//min 递归
sas.min.prototype.dis = function(i, t, count, parents) {
  if (this.STOP) {
    return;
  }
  var ty = sas.typeFn.call(t[i]);

  switch (ty) {

    case sas.typeArr[0]: //function
      this.tasks_count++;
      var args = arguments;
      if (t[i].length > 1) {
        t[i](this.cb, new.sas.index(args));
      } else {
        t[i](this.cb);
      }



      break;
    case sas.typeArr[1]: //Object

      var keys = Object.keys(t[i]),
        keys_len = keys.length,
        _count = [keys_len, 0];
      for (var o = 0; o < keys_len; o++) {
        //_count[0] ++;
        this.dis(keys[o], t[i], _count, arguments);
      }
      break;

    case sas.typeArr[2]: //Array
      var _count = [t[i].length, 0];
      this.dis(_count[1], t[i], _count, arguments);
      break;

    default:
  }
}
//min 递归完

//进度条
sas.min.prototype._process = function() { //over
  if (this.process) {
    this._t = setInterval(function() {
      this.process(this.tasks_count, this.tasks_count_cb);
    }, this.process_interval);
  }
}
//进度条完
sas.min.prototype._end = function() { //over
  if (this.process) {
    clearInterval(this._t);
    this.process(this.tasks_count, this.tasks_count_cb);
    if (this.end) {
      this.end(this.error, this.plan); //国际惯例
    }
  }
}



sas.min.prototype.cbi = function(i, t, count, parents) {
  
}
sas.cbi.prototype.cb = function(mag_str, parem) {
  if (typeof mag_str === 'string') {
    switch (mag_str) {
      case '$STOP':
        if (this.end) {
          this.end(pream);
        }
        return C_stop = true;
        break;
      case '$THIS=':


    }

  }


}

sas.cbi.prototype.index = function() {

}



sas.index = function(task, i, key, parents) {
  this.index = i;
  this.count = opt.count;
  this._init = false;
  this._path = null;
  this._fspath = null;

}
sas.index.prototype.path = function() {
    if (!this._path) {

    }
    return this._path;
  }
  /*sas.index.prototype.init = function(){

  }*/
sas.index.prototype.fspath = function() {
  if (!this._fspath) {
    if (!this._path) {
      this.path();
    }
  }
  return this._fspath;
}

sas.index.prototype.parent = function() {
  return new sas.index(parents);
}
sas.copy = function(t) {
  var c = [];
  sas._copy([t], 0, c);
  return c[0];
}
sas._copy = function(t, i, c) {
  ty = sas.typeFn.call(t[i]);
  switch (ty) {
    case sas.typeArr[1]: //obj
      c[i] = {};
      for (var j in t[i]) {
        _copy(t[i], j, c[i]);
      }
      break;
    case sas.typeArr[2]: //arr
      c[i] = [], len = t[i].length;
      for (var j = 0; j < len; j++) {
        _copy(t[i], j, c[i]);
      }
      break;
    default:
      c[i] = t[i];
  }
}

//<DWDEBUG##############################
sas.min.prototype.debug = {
    C_START: Date.now(),
    C_time: 0,
    _color: function(c, str, b) {
      b = b || 39;
      if (typeof window !== 'undefined') {
        console.log(str);
      } else {
        console.log('\u001b[' + c + 'm' + str + '\u001b[' + b + 'm');
      }
    }
  }
  //##############################DWDEBUG>