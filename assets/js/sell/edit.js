define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;

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
        CheckSubmit();
      }
    });
  };

  // 绑定输入框事件
  function bindInput() {
    $txtPrice.onchange = function() {
      this.value = gm.edit.price(this.value);
      mydata.prices = this.value;
      ice.removeClass($choosePrice, 'option-choose');
      CheckSubmit();
    };

    $txtSkill.onchange = function() {
      mydata.skills = this.value;
      ice.removeClass($chooseSkill, 'option-choose');
      CheckSubmit();
    };

    $txtExpires.onchange = function() {
      this.value = gm.edit.expires(this.value);
      mydata.prices = this.value;
      ice.removeClass($chooseExpires, 'option-choose');
      CheckSubmit();
    };
  };

  // 绑定微信号 keyup 事件
  function bindWechat() {
    $txtWechat.onkeyup = function() {
      var val = ice.trim(this.value);
      mydata.wechat = val;
      CheckSubmit();
    };
  };

  // 判断是否可以提交
  function CheckSubmit() {
    if(!ice.isEmpty(mydata.prices) && !ice.isEmpty(mydata.skills) && !ice.isEmpty(mydata.expires) && !ice.isEmpty(mydata.wechat) && mydata.wechat.length >= 2) {
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
      try {
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
        mydata.prices = model.price;
        mydata.skills = model.current;
        mydata.expires = model.expires;
        mydata.wechat = model.wechat;

        var domS = ice.queryAll('#skills >div[data-value="' + mydata.skills + '"]');
        var domP = ice.queryAll('#prices >div[data-value="' + mydata.prices + '"]');
        var domE = ice.queryAll('#expires >div[data-value="' + mydata.expires + '"]');
        if(domS && domS.length > 0) {
          $chooseSkill = domS[0];
        } else {
          $txtSkill.value = mydata.skills;
        }
        if(domP && domP.length > 0) {
          $choosePrice = domP[0];
        } else {
          $txtPrice.value = mydata.prices;
        }
        if(domE && domE.length > 0) {
          $chooseExpires = domE[0];
        } else {
          $txtExpires.value = mydata.expires;
        }

        // 校验是否可以登录
        CheckSubmit();
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
    bindWechat();

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
            price: mydata.prices * 100,
            expires: mydata.expires,
            wechat: mydata.wechat,
            audio: ''
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
