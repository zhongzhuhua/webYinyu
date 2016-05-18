define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;
  var gm_wechat = require('wechat');

  var $txtSkill = ice.query('#txtSkill');
  var $txtPrice = ice.query('#txtPrice');
  var $txtExpires = ice.query('#txtExpires');
  var $txtWechat = ice.query('#txtWechat');
  var $btnSubmit = ice.query('#submit');

  var $choosePrice = null;
  var $chooseSkill = null;
  var $chooseExpires = null;
  var mydata = {
    prices: '',
    skills: '',
    expires: '',
    wechat: '',
    canSubmit: false
  };

  gm.bindScroll(function() {
    location.reload();
  });

  // 绑定 tab 切换
  function navChoose() {
    ice.choose({
      selector: '#skills,#prices,#expires',
      chooseClass: 'option-choose',
      chooseIndex: [$chooseSkill, $choosePrice, $chooseExpires],
      success: function($dom, $selector) {
        var id = $selector.getAttribute('id');
        if (id == 'skills') {
          $chooseSkill = $dom;
          $txtSkill.value = '';
          mydata.skills = $dom.getAttribute('data-value');
        } else if (id == 'prices') {
          $choosePrice = $dom;
          $txtPrice.value = '';
          mydata.prices = $dom.getAttribute('data-value');
        } else {
          $chooseExpires = $dom;
          $txtExpires.value = '';
          mydata.expires = $dom.getAttribute('data-value');
        }
        checkSubmit();
      }
    });
  };

  // 绑定输入框事件
  function bindInput() {
    // 价格
    $txtPrice.addEventListener(ice.tapKeyup, function() {
      mydata.prices = ice.trim(this.value);
      ice.removeClass($choosePrice, 'option-choose');
      checkSubmit();
    });

    $txtPrice.addEventListener('change', function() {
      if (!gm.edit.prices(ice.trim($txtPrice.value))) {
        gm.mess('输入的拍卖价格格式错误，请重新输入');
      }
    });

    // 拍卖项
    $txtSkill.addEventListener(ice.tapKeyup, function() {
      mydata.skills = ice.trim(this.value);
      ice.removeClass($chooseSkill, 'option-choose');
      checkSubmit();
    });

    $txtSkill.addEventListener('change', function() {
      if (!gm.edit.skills(ice.trim($txtSkill.value))) {
        gm.mess('输入的拍卖项格式错误，请重新输入');
      }
    });

    // 服务时长
    $txtExpires.addEventListener(ice.tapKeyup, function() {
      mydata.expires = ice.trim(this.value);
      ice.removeClass($chooseExpires, 'option-choose');
      checkSubmit();
    });

    $txtExpires.addEventListener('change', function() {
      if (!gm.edit.expires(ice.trim($txtExpires.value))) {
        gm.mess('输入的服务时长格式错误，请重新输入');
      }
    });

    // 微信号
    $txtWechat.addEventListener(ice.tapKeyup, function() {
      mydata.wechat = ice.trim(this.value);
      checkSubmit();
    });

    $txtWechat.addEventListener('change', function() {
      if (!gm.edit.wechat(ice.trim($txtWechat.value))) {
        gm.mess('输入的微信号格式错误，请重新输入');
      }
    });
  };


  // 判断是否可以提交
  function checkSubmit() {
    if (gm.edit.prices(mydata.prices) && gm.edit.skills(mydata.skills) && gm.edit.expires(mydata.expires) && gm.edit.wechat(mydata.wechat)) {
      mydata.canSubmit = true;
      ice.removeClass($btnSubmit, 'i-disabled');
    } else {
      mydata.canSubmit = false;
      ice.addClass($btnSubmit, 'i-disabled');
    }
  };

  // 获取用户信息
  function findUser() {
    gm.getUser(null, function(model) {
      // 微信配置初始化
      gm_wechat.init(model);
      gm_wechat.bindSound();

      try {
        // 语音
        var audio = ice.toEmpty(model.audio);
        if (audio != '') {
          gm_wechat.initSound(audio);
        }

        // 基础信息
        if (model.is_auction == '1' && ice.request('url_from').length == 0) {
          gm.go('/html/sell/show.html');
        }
        var city = ice.toEmpty(model.city);
        var sex = gm.enum.sex[model.sex];
        var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
        var name = ice.toEmpty(model.nick);
        var isbegin = model.is_auction;

        ice.query('#userName').innerHTML = name;
        ice.query('#userPhoto').src = photo;
        ice.query('#userSex').className = 'icon-' + sex;
        $btnSubmit.innerHTML = !!isbegin ? '更新资料' : '开始拍卖';
        if (city != null) {
          ice.query('#userArea').innerHTML = city;
        }
        $txtWechat.value = ice.toEmpty(model.wechat);

        // 初始化参数
        mydata.skills = model.current;
        mydata.prices = model.price;
        mydata.expires = model.expires;
        mydata.wechat = model.wechat;

        if (mydata.skills != null && mydata.skills != '') {
          var dom = ice.queryAll('#skills >div[data-value="' + mydata.skills + '"]');
          if (dom && dom.length > 0) {
            $chooseSkill = dom[0];
          } else {
            $txtSkill.value = mydata.skills;
          }
        } else {
          $chooseSkill = ice.query('#skills >div');
          mydata.skills = $chooseSkill.getAttribute('data-value');
        }

        if (mydata.prices != null && mydata.prices != '') {
          var dom = ice.queryAll('#prices >div[data-value="' + mydata.prices + '"]');
          if (dom && dom.length > 0) {
            $choosePrice = dom[0];
          } else {
            $txtPrice.value = mydata.prices;
          }
        } else {
          $choosePrice = ice.query('#prices >div');
          mydata.prices = $choosePrice.getAttribute('data-value');
        }

        if (mydata.expires != null && mydata.expires != '') {
          var dom = ice.queryAll('#expires >div[data-value="' + mydata.expires + '"]');
          if (dom && dom.length > 0) {
            $chooseExpires = dom[0];
          } else {
            $txtExpires.value = mydata.expires;
          }
        } else {
          $chooseExpires = ice.query('#expires >div');
          mydata.expires = $chooseExpires.getAttribute('data-value');
        }

        // 校验是否可以登录
        checkSubmit();
      } catch (e) {
        console.log(e.message);
      }
    });
  };

  // 初始化事件
  (function() {
    findUser();
    navChoose();
    bindInput();

    // 绑定更新按钮事件
    $btnSubmit.addEventListener(ice.tapClick, function() {

      console.log(mydata);
      if (mydata.canSubmit) {
        mydata.canSubmit = false;
        var layer = gm.loading();

        // 执行查询
        gm.ajax({
          url: '/wechat/version/previous/service/setting.json',
          data: {
            name: mydata.skills,
            price: mydata.prices * 1000,
            expires: mydata.expires,
            wechat: mydata.wechat,
            audio: gm_wechat.getSoundPath()
          },
          success: function(data) {
            try {
              var status = data.status;
              if (status == '200') {
                gm.go('/html/sell/show.html?identify=');
              }
            } catch (e) {
              console.log(e.message);
            }
          }
        });
      }
    });

  })();
});
