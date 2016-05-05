define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;
 
  ice.ajax({
    url: gm.ctx + '/wechat/wechat/token.json',
    type: 'post',
    cache: false,
    dataType: 'json',
    data: JSON.stringify({
      'code': ice.request('code'),
      'state': ice.request('state')
    }),
    header: {
      'Content-type': 'application/json; charset=UTF-8'
    },
    success: function(data) {
      try {
        if (data.status == '200') {
          if(data.cookies) {
            for (var i = data.cookies.length - 1; i >= 0; i--) {
              var cookie = data.cookies[i];
              localStorage.setItem('_C_' + cookie.name + '_', cookie.value);
            } 
          }
          gm.go(sessionStorage.getItem('_C_RETURN_'));
        } else {
          alert(data.msg);
        }
      } catch (e) {
        console.log(e.message);
      }
    }
  });
});
