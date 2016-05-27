define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;

  // 个人信息
  var $name = ice.query('#name');
  var $lv = ice.query('#lv');
  var $city = ice.query('#city');
  var $face = ice.query('#face');
  var $age = ice.query('#age');
  var $sellPrice = ice.query('#sellPrice');
  var $totalPrice = ice.query('#totalPrice');
  var $wechat = ice.query('#wechat');
  var $skills = ice.query('#skills');
  var $times = ice.query('#times');
  var $money = ice.query('#money');

  // 相册
  var $photoList = ice.query('#photoList');
  var photoTemp = ice.query('#photoTemp').innerHTML;

  // 查询
  function search() {
    gm.ajax({
      url: '/wechat/version/previous/user/center.json',
      data: {},
      success: function(data) {
        try {
          var status = data.status;
          if (status == '200') {
            var model = data.value;
            $name.innerHTML = model.nick;

            $city.innerHTML = model.city;
            $age.innerHTML = model.age;

            var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
            var img = '<img src="' + photo + '" alt="">';
            $face.innerHTML = img;

            var lv = gm.enum.getLevel(model.consumption_level);
            $lv.className = lv;

            $times.innerHTML = model.expires;
            $totalPrice.innerHTML = model.total_price;
            $sellPrice.innerHTML = model.service_price;
            $skills.innerHTML = model.service_name;
            $money.innerHTML = model.balance_money;
            $wechat.innerHTML = model.wechat;

            buildPhotos(model.photo_list);
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    });
  };

  // 绑定打开相册事件
  function bindOpenPhoto() {
    var $winPhoto = ice.query('#winPhoto');

    $photoList.addEventListener('click', function() {
      ice.removeClass($winPhoto, 'hidden');
    });
  };

  // 构建相册
  function buildPhotos(list) {
    var len = list == null ? 0 : list.length;
    var html = '';
    for (var i = 0; i < len; i++) {
      var model = list[i];
      var imgPath = ice.removeAttr(ice.toEmpty(model.thumbnail));
      var imgBigPath = ice.removeAttr(ice.toEmpty(model.view));
      if (imgPath != '') {
        var img = '<img src="' + imgPath + '" data-src="' + imgBigPath + '" alt="">';
        html += photoTemp.replace('{img}', img);
      }
    }
    $photoList.innerHTML = html;
  };

  // 初始化
  (function() {

    // 绑定滚动加载
    gm.bindScroll(function() {
      search();
    }, null);

    search();

    bindOpenPhoto();

  })();
});
