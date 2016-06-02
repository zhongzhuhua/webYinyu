define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;
  var gm_wechat = require('wechat');

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
            if(!model.is_auction) {
              ice.removeClass($auctionNone, 'hidden');
              ice.addClass($auction, 'hidden');
            }

            // 设置用户信息
            sessionStorage.setItem('editBirth', model.birthday);
            sessionStorage.setItem('editName', model.nick);
            sessionStorage.setItem('editImage', img);
            sessionStorage.setItem('editSex', model.sex);
            sessionStorage.setItem('editArea', model.city);
            sessionStorage.setItem('editAge', model.age);
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    });
  };

  // 绑定打开相册事件
  function bindOpenPhoto() {
    var isload = false;
    var $winPhoto = ice.query('#winPhoto');
    var $winPhotoClose = ice.query('#winPhotoClose');
    var $winPhotoList = ice.query('#winPhotoList');
    var winPhotoTemp = ice.query('#winPhotoTemp').innerHTML;
    var $iconLeft = ice.query('#winPhoto .icon-left');
    var $iconRight = ice.query('#winPhoto .icon-right');
    var chooseIndex = 0;
    var $choose;
    var imgIds = [];
    var $imgList = null;
    var $winPhotoTotal = ice.query('#winPhotoTotal');
    var $winPhotoIndex = ice.query('#winPhotoIndex');

    // 打开相册
    $photoList.addEventListener('click', function(e) {
      // 如果还没有加载数据，则进行数据加载
      if (!isload) {
        isload = false;
        gm.ajax({
          url: '/wechat/sociality/media/photo/list.json',
          async: false,
          data: {
            size: 10000
          },
          success: function(data) {
            try {
              imgIds = [];
              if (data.status == '200') {
                var list = data.value.list;

                var len = list == null ? 0 : list.length;

                var html = '';
                for (var i = 0; i < len; i++) {
                  var model = list[i];
                  var imgId = ice.toEmpty(model.album_identify);
                  var imgPath = ice.removeAttr(ice.toEmpty(model.thumbnail));
                  var imgBigPath = ice.removeAttr(ice.toEmpty(model.view));
                  if (imgId != '') {
                    var img = '<img src="' + imgPath + '" data-src="' + imgBigPath + '" data-value="' + imgId + '" alt="">';
                    html += winPhotoTemp.replace('{img}', img);
                    imgIds.push(imgId);
                  }
                }

                $winPhotoList.innerHTML = html;
                $imgList = ice.queryAll('div', $winPhotoList);
              }
            } catch (e) {
              console.log(e.message);
            }
          }
        });
      }

      // 是否可以打开
      var imgLen = imgIds.length;
      if (imgLen > 0) {
        $winPhotoTotal.innerHTML = imgLen;

        // 判断当前选中的相片
        var ele = e.srcElement;
        var value = ele.getAttribute('data-value');
        for (var i = 0; i < imgLen; i++) {
          if (value == imgIds[i]) {
            chooseIndex = i;
            break;
          }
        }

        changeIamge();
        bindChange(imgLen);

        // 打开弹窗
        ice.removeClass($winPhoto, 'hidden');
      }
    });

    // 关闭相册
    $winPhotoClose.addEventListener('click', function() {
      ice.addClass($winPhoto, 'hidden');
    });

    // 绑定切换事件
    function bindChange(imgLen) {
      // 移动端绑定滑动事件
      if(ice.isMobile) {
        ice.addClass($iconLeft, 'hidden');
        ice.addClass($iconRight, 'hidden');
        var pageX = 0;
        var min = 0;

        $winPhoto.addEventListener(ice.tapStart, function(e) {
          pageX = e.touches[0].pageX;
        });

        $winPhoto.addEventListener(ice.tapMove, function(e) {
          ice.stopDefault(e);
          ice.stopPropagation(e);
          min = e.touches[0].pageX - pageX;
        });

        $winPhoto.addEventListener(ice.tapEnd, function(e) {
          if(min < 0)  {
            chooseIndex = chooseIndex + 1;
            if (chooseIndex >= imgLen) {
              chooseIndex = 0;
            }
            changeIamge();
          } else if(min > 0) {
            chooseIndex = chooseIndex - 1;
            if (chooseIndex < 0) {
              chooseIndex = imgLen - 1;
            }
            changeIamge();
          }
        });
      } else {
        $iconLeft.addEventListener(ice.tapClick, function(e) {
          chooseIndex = chooseIndex - 1;
          if (chooseIndex < 0) {
            chooseIndex = imgLen - 1;
          }
          changeIamge();
        });

        $iconRight.addEventListener(ice.tapClick, function(e) {
          chooseIndex = chooseIndex + 1;
          if (chooseIndex >= imgLen) {
            chooseIndex = 0;
          }
          changeIamge();
        });
      }
    };

    // 相册切换事件
    function changeIamge() {
      $winPhotoIndex.innerHTML = chooseIndex + 1;
      ice.addClass($choose, 'hidden');
      ice.removeClass($imgList[chooseIndex], 'hidden');

      // 判断是否加载过高清图
      var $img = ice.query('img', $imgList[chooseIndex]);
      var isload = $img.getAttribute('isload');
      if (isload == null || isload == '') {
        $img.setAttribute('isload', '1');
        $img.src = $img.getAttribute('data-src');
      }

      $choose = $imgList[chooseIndex];
    };
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

    bindOpenPhoto();

    // 绑定上传照片
    gm_wechat.bindUploadImage($upload);
  })();
});
