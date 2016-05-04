define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;

  // 列表模版
  var $list = ice.query('#list');
  var $listTop = ice.queryAll('.list-top');
  var listTemp = {
    '1': ice.query('#sellTemp').innerHTML,
    '2': ice.query('#buyTemp').innerHTML
  };

  // 请求路径
  var listUrl = {
    '1': '/wechat/version/previous/record/sell/list.json',
    '2': '/wechat/version/previous/record/buy/list.json'
  };

  // 弹窗数据
  var buyData = {};

  // 弹窗
  var winSellTemp = ice.query('#winSell').innerHTML;
  var winMoneyup = ice.query('#winMoneyup').innerHTML;

  // 按钮
  var $btnMoney = ice.query('#btnMoney');

  // 查询条件
  var mydata = {
    type: ice.query('#navTopList div').getAttribute('data-value'),
    index: 1
  };
  var haveNext = true;

  function FindList(clear) {
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
      url: listUrl[mydata.type],
      data: mydata,
      success: function(data) {
        try {
          var status = data.status;
          if (status == '200') {
            // 列表判断
            data = data.value;
            haveNext = data.next;
            if (!haveNext) gm.scrollEnd();
            mydata.index = ice.toEmpty(data.index);

            // 构建列表
            var list = data.list;
            var len = list == null ? 0 : list.length;
            var html = '';
            for (var i = 0; i < len; i++) {
              // 获取公用数据
              var model = list[i];
              var id = ice.toEmpty(model.identify);
              var name = ice.toEmpty(model.nick);
              var date = ice.toEmpty(model.time);
              var wechat = ice.toEmpty(model.wechat);
              var price = (model.price);
              var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
              var img = '<img src="' + photo + '" alt="">';
              var sex = gm.enum.sex[model.sex];
              var sexName = gm.enum.sexName[model.sex];
              var skill = ice.toEmpty(model.service_name);
              var lv = gm.enum.getLevel(model.consumption_level);

              // 获取独立数据
              if (mydata.type == '1') {
                html += listTemp[mydata.type].replace('{date}', date).replace('{lv}', lv).replace('{name}', name).replace('{img}', img)
                  .replace('{sex}', sex).replace('{price}', price).replace('{wechat}', wechat).replace('{skill}', skill);
              } else {
                buyData[id] = {
                  price: price,
                  name: name,
                  sex: sexName,
                  wechat: wechat,
                  skill: skill,
                  lv: lv
                };
                html += listTemp[mydata.type].replace('{id}', id).replace('{date}', date).replace('{img}', img).replace('{name}', name);
              }

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
        if (mydata.type == '1') {
          ice.removeClass($listTop[0], 'hidden');
          ice.addClass($listTop[1], 'hidden');
        } else {
          ice.removeClass($listTop[1], 'hidden');
          ice.addClass($listTop[0], 'hidden');
        }
        FindList(true);
      }
    });
  };

  // 绑定详情点击方法 -- 暂时不用
  function bindOpen() {
    $list.addEventListener(ice.tapClick, function(e) {
      try {
        var node = e.srcElement.nodeName.toLowerCase();
        if (node == 'a') {
          if (mydata.type == '2') {
            var data = buyData[e.srcElement.getAttribute('data-value')];
            var html = winSellTemp.replace('{price}', data['price']).replace('{sex}', data['sex']).replace('{wechat}', data['wechat']).replace('{skill}', data['skill']).replace('{name}', data['name']);
            var index = gm.open(html);
            // 关闭弹窗
            ice.query('#layermbox' + index + ' .icon-close').addEventListener(ice.tapClick, function() {
              gm.close(index, 0);
            });
          }
        }
      } catch (e) {
        console.log('show error:' + e.message);
      }
    });
  };

  // 初始化
  (function() {
    // 绑定滚动加载
    gm.bindScroll(function() {
      FindList(true);
    }, function() {
      FindList(false);
    });

    // 绑定事件
    navChoose();
    bindOpen();

    $btnMoney.addEventListener(ice.tapClick, function() {
      gm.alert(winMoneyup);
    });

    // 查询列表
    FindList(false);
  })();
});
