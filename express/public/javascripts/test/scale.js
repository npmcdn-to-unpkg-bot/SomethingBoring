document.write('<style>#main{width:500px;background:red}</style>');

function getMySrc() {
  return document.scripts[document.scripts.length - 1].src;
  return document.currentScript.src;
}

document.write('getMySrc()' + getMySrc());

$(function() {
  var w1 = $('#main').css('width');
  var h1 = $('#main').css('height');
  var main = document.getElementById('main');
  var w2 = window.innerWidth;
  var h2 = window.innerHeight;


  console.log('style height', main.style.height);
  console.log('clientHeight', main.clientHeight);

  console.log('h1', h1);

});