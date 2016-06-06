define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;
  var gm_wechat = require('wechat');

  var openPhoto;
  var $upload = ice.query('#upload');
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
  var $sex = ice.query('#sex');
  var $auction = ice.query('#auction');
  var $auctionNone = ice.query('#auctionNone');

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
            console.log(model);
            $name.innerHTML = model.nick;

            $city.innerHTML = model.city;

            if(model.age == '-1') {
              model.age = '0';
            }
            $age.innerHTML = model.age;

            var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
            var img = '<img src="' + photo + '" alt="">';
            $face.innerHTML = img;

            $sex.className = 'icon-' + gm.enum.sex[model.sex];

            var lv = gm.enum.getLevel(model.consumption_level);
            $lv.className = lv;

            $times.innerHTML = model.expires;
            $totalPrice.innerHTML = model.total_price;
            $sellPrice.innerHTML = model.service_price;
            $skills.innerHTML = model.service_name;
            $money.innerHTML = model.balance_money;
            $wechat.innerHTML = model.wechat;

            buildPhotos(model.photo_list);

            // 用户未开始拍卖
            if(model.is_auction != '1') {
              ice.removeClass($auctionNone, 'hidden');
              ice.addClass($auction, 'hidden');
            }

            // 设置用户信息
            sessionStorage.setItem('editBirth', model.birthday);
            sessionStorage.setItem('editName', model.nick);
            sessionStorage.setItem('editImage', img);
            sessionStorage.setItem('editImageId', model.face_identify);
            sessionStorage.setItem('editSex', model.sex);
            sessionStorage.setItem('editProvince', model.province_identify);
            sessionStorage.setItem('editProvinceCode', model.province_code);
            sessionStorage.setItem('editCity', model.city_identify);
            sessionStorage.setItem('editCityCode', model.city_code);
            sessionStorage.setItem('editArea', model.city);
            sessionStorage.setItem('editAge', model.age);
          }
        } catch (e) {
          console.log(e.message);
        }
      }
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
      var imgId = ice.toEmpty(model.album_identify);
      if (imgPath != '') {
        var img = '<img src="' + imgPath + '" data-src="' + imgBigPath + '" data-value="' + imgId + '" alt="">';
        html += photoTemp.replace('{img}', img);
      }
    }
    $photoList.innerHTML = html;
  };

  // 初始化
  (function() {
    gm_wechat.init();
    // 绑定滚动加载
    gm.bindScroll(function() {
      search();
    }, null);

    search();

    openPhoto = gm.bindOpenPhoto($photoList, '');
    // openPhoto = gm_wechat.buildPhotoView($photoList);

    // 绑定上传照片 
    gm_wechat.bindUploadImage($upload, function(model) {
      if(openPhoto && model) {
        openPhoto.reset();
        // openPhoto.addImage(model.view);
      }
    }); 
  })();
});
