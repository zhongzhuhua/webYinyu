define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;
  var gm_wechat = require('wechat');

  var $upload = ice.query('#upload');
  var $list = ice.query('#list');
  var listTemp = ice.query('#listTemp').innerHTML;

  var $delete = ice.query('#delete');

  // 查询相册列表
  function search() {
    gm.ajax({
      url: '/wechat/sociality/media/photo/list.json',
      async: false,
      data: {
        size: ''
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
                var img = '<img src="' + imgPath + '" data-src="' + imgBigPath + '" alt="">';
                html += listTemp.replace('{id}', imgId).replace('{img}', img);
              }
            }

            $list.innerHTML = html;
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    });

    bindChoose();
  };

  // 绑定图片选中
  function bindChoose() {
    var $list = ice.queryAll('#list .photo-img');
    var len = $list == null ? 0 : $list.length;
    for (var i = 0; i < len; i++) {
      bindChange($list[i]);
    }
  };

  function bindChange($img) {
    $img.addEventListener(ice.tapClick, function(e) {
      var $icon = ice.query('.photo-icon', $img);
      if ($icon.className.indexOf('bg-orange') > -1) {
        ice.removeClass($icon, 'bg-orange');
      } else {
        ice.addClass($icon, 'bg-orange');
      }
    });
  };

  // 删除图片
  function bindDelete() {
    $delete.addEventListener(ice.tapClick, function(e) {
      // 标识切换
      var $icons = ice.queryAll('.bg-orange', $list);
      var $parents = [];
      var len = $icons == null ? 0 : $icons.length;
      if (len > 0) {
        var layer = gm.confirm('<div style="padding: 1rem 1.2rem;">是否要删除选中的照片?</div>', function() {
          var ids = [];
          for (var i = 0; i < len; i++) {
            var $parent = $icons[i].parentNode;
            $parents.push($parent);
            ids.push($parent.getAttribute('data-value'));
          }
          console.log(ids);

          gm.ajax({
            url: '/wechat/sociality/media/photo/remove.json',
            data: {
              photo: ids
            },
            success: function(data) {
              try {
                if (data.status == '200') {
                  gm.mess('删除照片成功');
                  ice.remove($parents);
                }
              } catch (e) {
                console.log(e.message);
              }
            }
          });
        });
      } else {
        gm.mess('没有选中的照片')
      }
    });
  };

  // 初始化
  (function() {
    gm_wechat.init();

    // 绑定滚动加载
    gm.bindScroll(function() {
      search();
    }, null);

    search();

    // 绑定删除图片
    bindDelete();

    // 绑定上传照片
    gm_wechat.bindUploadImage($upload, function(model) {
      var imgId = ice.toEmpty(model.album_identify);
      var imgPath = ice.removeAttr(ice.toEmpty(model.thumbnail));
      var imgBigPath = ice.removeAttr(ice.toEmpty(model.view));
      if (imgId != '') {
        var img = '<img src="' + imgPath + '" data-src="' + imgBigPath + '" alt="">';
        var $dom = document.createElement('div');
        $dom.innerHTML = listTemp.replace('{id}', imgId).replace('{img}', img);
        bindChange($dom.children[0]);
        $list.appendChild($dom.children[0]);
      } 
    });
  })();
});
