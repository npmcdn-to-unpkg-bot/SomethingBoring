var demo = new Vue({
  el: '#demo',
  data: {
    message: 33333333,
    count: 0
  }
})

console.log('start');
var startTime = Date.now();

function test(i) {

  setTimeout(function() {
    var now = Date.now();

    demo.message = 'message' + i;
    demo.count = 'count' + i;
/*    demo.$data = {
          message:'message' + i,
          count:'count' + i
        }*/
    if (i < 5000) {
      test(i+1)
    } else {
      console.log('end', Date.now() - startTime);
    }

  });
}
test(0)

/*console.log('start');
var startTime = Date.now();
for(var i=0;i < 99999;i++){

    demo.$data = {
      message: 'message' + i,
      count: 'count' + i
    }
}
console.log('end', Date.now() - startTime);*/
/*    demo.$data = {
      message:now,
      count:now
    }*/