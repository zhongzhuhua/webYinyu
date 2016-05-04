define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;

  var submit = ice.query('#submit');
  submit.addEventListener(ice.tapClick, function() {
    gm.mess('yes');
  });

  gm.bindScroll(Search, function() {
    console.log('more');
  });
 
  function Search() {
    console.log('Search');

    var layer = gm.loading();

    setTimeout(function() {

      console.log('yes');
      gm.close(layer);
    }, 2000);
  };
});
