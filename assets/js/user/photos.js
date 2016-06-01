define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;


  var $list = ice.query('#list');
  var listTemp = ice.query('#listTemp').innerHTML;

  // 查询相册列表
  function search() {
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
                html += listTemp.replace('{img}', img);
              }
            }

            $list.innerHTML = html;
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    });
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
