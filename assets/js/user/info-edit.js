define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;

  var $img = ice.query('#img');
  var $name = ice.query('#name');
  var $area = ice.query('#area');
  var $sex = ice.query('#sex');
  var $age = ice.query('#age');

  // 查询个人资料
  function search() {

    // 获取 user/info.html 存入的用户信息，避免再查数据库
    var sex = ice.toEmpty(sessionStorage.getItem('editSex'));
    sex = sex == null ? '1' : sex;

    $name.value = sessionStorage.getItem('editName');
    $img.innerHTML = sessionStorage.getItem('editImage');
    $area.value = sessionStorage.getItem('editArea');

    $sex.innerHTML = gm.enum.sexName[sex];
    $age.innerHTML = ice.parseInt(sessionStorage.getItem('editAge'));
  };

  // 初始化
  (function() {

    // 绑定滚动加载
    gm.bindScroll(function() {
      search();
    }, null);

    search();

  })();
});
