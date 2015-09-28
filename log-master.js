var child_process = require('child_process');
var sas = require('sas');
var fs = require('fs');

var Dateformat = function(date, fmt) { //来自互联网
  date = date ? new Date(date) : new Date();
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

var _sh = "cat /dev/null > "; //清理log shell



exports.split = function(conf) {
  //conf
  var from = conf.from; //源文件夹
  var to = conf.to || __dirname; //目标文件夹
  var Interval = conf.Interval || 1000 * 60 * 60 * 24; //间隔
  var timeFormat = conf.timeFormat || "yyyy年MM月dd日HH时mm分ss秒"; //文件夹时间名字格式。
  var C_start = conf.startTime || "00:00"; //开始时间
  C_start = C_start.split(':'); //开始时间
  var Suffix = conf.Suffix || ['.log'];

  var C_start_Hour = Number(C_start[0]); //开始时间小时
  var C_start_min = Number(C_start[1]); //开始时间分钟
  var C_start_sec = C_start[2] ? Number(C_start[2]) : 0; //开始时间分钟
  var Cresult = {}; //读取源文件列表变量。
  var C_time = 0; //时间文件夹名字

  //////////////////////// task ///////////////////////////

  var readDir = function(path) { //读取目录下log文件。第一步。
    return function(cb, t) {
      fs.readdir(path, function(err, flies) {
        if (err) {
          return cb('$STOP', err);
        }
        //var sharr = [];
        var obj = {};
        for (var i = 0, len = flies.length; i < len; i++) {
          var flie = flies[i];
          for (var Suffix_i = 0, Suffix_len = Suffix.length; Suffix_i < Suffix_len; Suffix_i++) {
            if (flie && flie[0] !== '.' && flie.substr(flie.length - Suffix[Suffix_i].length) === Suffix[Suffix_i]) {
              Cresult[path + '/' + flie] = t.index + '__' + flie;
            }
          }

        }
        cb(path);
      });
    }
  }

  var mkDirTime = function(cb, t) { //2跟据时间创建文件夹
    var _start = new Date();
    var _now = _start.getTime();
    _start.setHours(C_start_Hour, C_start_min, C_start_sec);
    if (_start.getTime() <= (_now + 1000)) {


      _start = _now + Interval;

            console.log("_now+':'+_start.getTime()")
      console.log(_now+':'+_start)
    } else {
      _start = _start.getTime();
    }

    //testg
    //_start= _now+10000;

    //console.log("_start=" + _start + " _now=" + _now);

    var time = Dateformat(_start, timeFormat);
    C_time = time;
    console.log('将在：\u001b[91m' + time + " \u001b[39m开始切割。");
    setTimeout(function() {
      console.log('正在创建文件夹:' + time);
      fs.mkdir(to + '/' + time, function(err) {
        if (err) {
          console.error("创建目标文件夹失败：" + to + '/' + time);
          console.error(err);
          return cb('$STOP', err);
        }
        cb();
      });
    }, _start - _now);
    //}, 10000);

  }

  function clear(cb, t) { //清空log;
    child_process.exec(_sh + t.pIndex, function(err) {
      if (err) {
        console.error("清空log err:");
        console.error(err);
      }
      cb();
    });
  }

  ///////////////////// task end /////////////////////

  function _loop() {
    sas([from], {
      iterator: readDir,
      allEnd: function(err, result) {
        if (err) {
          return console.error('初始化失败：' + err);
        }
        var _read = {};

        var new_rw = function(cb, t) {
          var fs_rs = fs.createReadStream(t.pIndex);
          fs_rs.pipe(fs.createWriteStream(to + "/" + C_time + '/' + Cresult[t.pIndex]));
          fs_rs.on('end', function() {
            //console.log('new createReadStream');
            cb();
          });
        }
        for (var i in Cresult) {
          //_read[i] = [readFile,writeFile,Clear];
          _read[i] = [new_rw, clear];
        }
        sas([mkDirTime, _read, function(cb) {
          cb();
          console.log('end');
          _loop();
        }]);
      }
    });
  }
  _loop();
}