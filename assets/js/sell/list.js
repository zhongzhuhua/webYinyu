define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;

  var $list = ice.query('#list');
  var listTemp = ice.query('#listTemp').innerHTML;
  var priceTemp = ice.query('#priceTemp').innerHTML;
  var hotTemp = ice.query('#hotTemp').innerHTML;

  // 查询条件
  var mydata = {
    type: ice.query('#navTopList div').getAttribute('data-value'),
    index: 1
  };
  var haveNext = true;

  // 查询列表
  function findList(clear) {
    if (!haveNext) return;
    if (clear) {
      $list.innerHTML = '';
      mydata.index = 1;
      gm.scrollStart();
      haveNext = true;
    };
    var layer = gm.loading();
    console.log(mydata);

    // 执行查询
    gm.ajax({
      url: '/wechat/version/previous/seller/list.json',
      data: mydata,
      success: function(data) {
        try {
          var status = data.status;
          if (status == '200') {
            // 列表判断
            data = data.value;
            haveNext = data.next;
            if(!haveNext) gm.scrollEnd();
            mydata.index = ice.toEmpty(data.index);

            // 构建列表
            var list = data.list;
            var len = list == null ? 0 : list.length;
            var html = '';
            var temp = mydata.type == '3' ? priceTemp : mydata.type == '4' ? hotTemp : listTemp;
            for (var i = 0; i < len; i++) {
              var model = list[i];
              var name = ice.toEmpty(model.nick);
              var total = (model.total_price);
              var price = (model.price);
              var city = ice.toEmpty(model.city);
              var sex = gm.enum.sex[model.sex];
              var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
              var skill = ice.toEmpty(model.service_name);
              var num = (model.amount);
              var img = '<img src="' + photo + '" alt="">';
              var oprice = (model.origin_price);
              var id = ice.toEmpty(model.identify);
              html += temp.replace('{total}', total).replace('{price}', price).replace('{oprice}', oprice)
                .replace('{sex}', sex).replace('{num}', num).replace('{id}', id).replace('{img}', img)
                .replace('{city}', city).replace('{skill}', skill).replace('{name}', name);
            }
            var divs = document.createElement('div');
            divs.innerHTML = html;
            $list.appendChild(divs);
          } else {
            gm.mess(data.msg);
          }
          gm.close(layer);
        } catch (e) {
          console.log('findList error:' + e.message);
        }
      }
    });
  };

  // 绑定 tab 切换
  function navChoose() {
    ice.choose({
      selector: '#navTopList',
      chooseClass: 'nav-choose',
      success: function($dom) {
        mydata.type = $dom.getAttribute('data-value');
        findList(true);
      }
    });
  };

  // 初始化
  (function() {
    // 绑定滚动加载
    gm.bindScroll(function() {
      findList(true);
    }, function() {
      findList(false);
    });
 
    // 绑定选择
    navChoose();

    // 查询列表
    findList(false);
  })();
});
