define(function(require, exports, module) {
  var gm = require('global');
  var gm_wechat = require('wechat');
  var ice = gm.ice;

  var $list = ice.query('#list');
  var listTemp = ice.query('#listTemp').innerHTML;
  var $first = null;

  // 弹窗
  var winInputwx = ice.query('#winInputwx').innerHTML;

  // 查询条件
  var identify = ice.request('identify');
  var mydata = {
    identify: identify,
    service_record_identify: '',
    flag: '',
    index: 1
  };
  var haveNext = true;

  // 按钮
  var $btnCommont = ice.query('#btnCommont');
  var $btnWantBuy = ice.query('#btnWantBuy');

 
  gm.bindScroll(function() {
    Search(true);
  }, function() {
    Search(false);
  });

  // 查询用户数据
  var $userName = ice.query('#userName');
  var $userPhoto = ice.query('#userPhoto');
  var $userSort = ice.query('#userSort');
  var $userSex = ice.query('#userSex');
  var $userSkills = ice.query('#userSkills');
  var $userBegin = ice.query('#userBegin');
  var $userTotal = ice.query('#userTotal');
  var $userPrice = ice.query('#userPrice');
  var $userCitySort = ice.query('#userCitySort');
  var $sortType = ice.query('#sortType');

  // 底部菜单
  var $bottomEdit = ice.query('#bottomEdit');

  // 查询卖家
  function FindUser() {
    var myModel = '';
    gm.getUser(identify, function(model) {
      // 微信分享配置
      gm_wechat.init(model);

      myModel = model;
      try {
        var name = ice.toEmpty(model.nick);
        mydata.service_record_identify = ice.toEmpty(model.service_record_identify);
        var _self = model.self;

        var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
        photo = '<img src="' + photo + '" alt="">';

        SetSellInfo(myModel);

        // 如果是自己看自己的
        if (_self) {
          $bottomEdit.innerHTML = '编辑';
        }

      } catch (e) {
        console.log(e.message);
      }
    }, true);
  };

  // 添加用户信息
  function SetSellInfo(model) {
    try {
      var city = ice.toEmpty(model.city);
      var sex = gm.enum.sex[model.sex];
      var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
      var name = ice.toEmpty(model.nick);
      var sort = (model.ranking_country);
      var skills = ice.toEmpty(model.service_name);
      var total = model.total_price;
      var price = model.service_price;
      var citySort = (model.ranking_city);
      var expires = (model.expires);

      var sexName = ice.toEmpty(gm.enum.sexName[model.sex]);
      if(sexName != '') {
        $sortType.innerHTML = '(' + sexName + ')';
      }

      $userName.innerHTML = name;
      $userPhoto.src = photo;
      $userSort.innerHTML = sort;
      $userSex.className = 'icon-' + sex;
      $userSkills.innerHTML = skills + '（' + expires + '分钟）';
      $userTotal.innerHTML = total;
      $userPrice.innerHTML = price;
      $userCitySort.innerHTML = citySort;
      if (city != null) {
        ice.query('#userArea').innerHTML = city;
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  // 查询评论
  function FindList(clear) {
    if (!haveNext) return;
    if (clear) {
      $list.innerHTML = '';
      mydata.index = 1;
      mydata.flag = '';
      gm.scrollStart();
      haveNext = true;
    };

    console.log(mydata);
    // 执行查询
    gm.ajax({
      url: '/wechat/version/previous/user/comment.json',
      data: mydata,
      success: function(data) {
        try {
          var status = data.status;
          if (status == '200') {
            // 列表判断
            data = data.value;
            haveNext = data.next;
            mydata.flag = data.flag;
            if (!haveNext) gm.scrollEnd();
            mydata.index = ice.toEmpty(data.index);

            // 构建列表
            var list = data.list;
            var len = list == null ? 0 : list.length;
            var html = '';
            for (var i = 0; i < len; i++) {
              var model = list[i];
              var name = ice.toEmpty(model.nick);
              var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
              var img = '<img src="' + photo + '" alt="">';
              var lv = gm.enum.getLevel(model.consumption_level);
              var content = ice.removeAttr(model.comment);
              html += listTemp.replace('{lv}', lv).replace('{img}', img).replace('{name}', name).replace('{content}', content);
            }
            var divs = document.createElement('div');
            divs.innerHTML = html;
            $list.appendChild(divs);
            if ($first == null) {
              $first = ice.query('#list div');
            }
          }
        } catch (e) {
          console.log('findlist error:' + e.message);
        }
      }
    });
  };

  // 执行查询
  function Search(isfirst) {
    var layer = gm.loading();

    if (isfirst) {
      FindUser();
      $list.innerHTML = '';
    }

    FindList();
    
    gm.close(layer);
  };

  // 绑定发表评论
  function BindSend() {
    var html = '<input id="layerSendMess" class="input01 col-grey02" placeHolder="请输入您的评论" maxlength="80">';
    $btnCommont.addEventListener(ice.tapClick, function() {
      var layer = gm.confirm(html, function() {
        gm.close(layer, 0);
        var sendMess = ice.trim(ice.removeAttr(ice.query('#layerSendMess').value));
        if (sendMess.length > 0) {
          var _layer = gm.loading();
          gm.ajax({
            url: '/wechat/version/previous/user/comment/add.json',
            data: {
              identify: identify,
              comment: sendMess
            },
            success: function(data) {
              try {
                // 评论成功
                var status = data.status;
                if (status == '200') {
                  var model = data.value;
                  // 用户信息
                  var name = ice.toEmpty(model.nick);
                  var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
                  photo = '<img src="' + photo + '" alt="">';
                  var lv = gm.enum.getLevel(model.consumption_level);

                  var div = document.createElement('div');
                  div.innerHTML = listTemp.replace('{lv}', lv).replace('{img}', photo).replace('{name}', name).replace('{content}', sendMess);
                  $list.insertBefore(div, $first);
                }
                gm.close(_layer);
              } catch (e) {
                console.log(e.message);
              }
            }
          });
        }
      });
      ice.query('#layerSendMess').focus();
    });
  };

  // 购买
  var inputLayer;
  function BindBuy() {
    $btnWantBuy.addEventListener(ice.tapClick, function() {
      gm_wechat.pay({
        service_record_identify: mydata.service_record_identify,
        success: function(data) {
          // 成功之后
          inputLayer = gm.alert(winInputwx, function() {
            try {
              var $_wx = ice.query('.layermbox input');
              var wechat = ice.trim($_wx.value);
              if(wechat == '' || wechat.length < 2) {
                $_wx.focus();
                $_wx.style['borderColor'] = 'red';
              } else {
                MySubmit($_wx.value);
              }
            } catch(e) {}
          });

          var $wechat = ice.query('.layermbox input');
          $wechat.value = gm_wechat.getWechat();
          $wechat.focus();
        }
      });
    });
  };

  // 记录用户信息
  function MySubmit(wechat) {
    var prepay_id = gm_wechat.getPrepayId();
    gm.ajax({
      url: '/wechat/wechat/query.json',
      data: {
        prepay_id: prepay_id,
        wechat: wechat
      },
      success: function(data) {
        gm.close(inputLayer, 0);
      },
      error: function() {
        gm.mess('提交微信号失败');
      }
    });
  };

  // 初始化
  (function() {
    Search(true);

    // 绑定事件
    BindSend();
    BindBuy();
  })();
});
