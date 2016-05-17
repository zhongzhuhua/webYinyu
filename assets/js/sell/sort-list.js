define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;

  var $list = ice.query('#list');
  var listTemp = ice.query('#listTemp').innerHTML;

  var $userSort = ice.query('#userSort');

  // 查询条件 卖家买家|本周上周
  var mydataChoose = ice.query('#navTopList div').getAttribute('data-value').split('|');
  var mydata = {
    type: mydataChoose[0],
    status: mydataChoose[1]
  };

  // 查询列表
  function findList(clear) {
    if (clear) {
      $list.innerHTML = '';
      haveNext = true;
    }
    var layer = gm.loading();

    // 获取列表
    console.log(mydata);

    // 执行查询
    gm.ajax({
      url: '/wechat/version/previous/user/ranking.json',
      data: mydata,
      success: function(data) {
        try {
          var status = data.status;
          if (status == '200') {
            // 列表判断
            data = data.value;
            haveNext = !!data.next;

            $userSort.innerHTML = (data.ranking);
            // 构建列表
            var list = data.list;
            var len = list == null ? 0 : list.length;
            var html = '';
            for (var i = 0; i < len; i++) {
              var model = list[i];
              var name = ice.toEmpty(model.nick);
              var total = (model.total_price);
              var index = (model.index);
              var sex = gm.enum.sex[model.sex];
              var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
              var img = '<img src="' + photo + '" alt="">';
              var lv = 'hidden';
              var type = '身价';
              var link = 'javascript:;';
              if (mydata.type == '2') {
                lv = gm.enum.getLevel(model.consumption_level);
                type = '消费';
              } else {
                link = '/html/sell/show.html?identify=' + model.identify;
              }

              html += listTemp.replace('{link}', link).replace('{total}', total).replace('{type}', type).replace('{lv}', lv).replace('{index}', index).replace('{sex}', sex)
                .replace('{img}', img).replace('{name}', name);
            }
            var divs = document.createElement('div');
            divs.innerHTML = html;
            $list.appendChild(divs);
          } else {
            gm.mess(data.msg);
          }
          gm.close(layer);
        } catch (e) {
          console.log('findlist error:' + e.message);
        }
        gm.scrollLoad(!!haveNext);
      }
    });
    gm.close(layer);
  };

  // 绑定 tab 切换
  function navChoose() {
    ice.choose({
      selector: '#navTopList',
      chooseClass: 'nav-choose',
      success: function($dom) {
        var arrs = $dom.getAttribute('data-value').split('|');
        mydata.type = arrs[0];
        mydata.status = arrs[1];
        findList(true);
      }
    });
  };

  // 初始化
  (function() {
    // 绑定滚动加载
    gm.bindScroll(function() {
      findList(true);
    });
    gm.scrollLoad(false);

    // 绑定选择
    navChoose();

    // 查询列表
    findList(false);
  })();
});
