define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;

  var $txtSkill = ice.query('#txtSkill');
  var $txtPrice = ice.query('#txtPrice');
  var $txtExpires = ice.query('#txtExpires');
  var $txtWechat = ice.query('#txtWechat');
  var $btnSubmit = ice.query('#submit');

  var $choosePrice = ice.query('#prices div');
  var $chooseSkill = ice.query('#skills div');
  var $chooseExpires = ice.query('#expires div');
  var mydata = {
    prices: $choosePrice.getAttribute('data-value'),
    skills: $chooseSkill.getAttribute('data-value'),
    expires: $chooseExpires.getAttribute('data-value'),
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
      }
    });
  };

  // 绑定输入框事件
  function bindInput() {
    $txtPrice.onchange = function() {
      this.value = gm.edit.price(this.value);
      mydata.prices = this.value;
      ice.removeClass($choosePrice, 'option-choose');
    };

    $txtSkill.onchange = function() {
      mydata.skills = this.value;
      ice.removeClass($chooseSkill, 'option-choose');
    };

    $txtExpires.onchange = function() {
      this.value = gm.edit.expires(this.value);
      mydata.prices = this.value;
      ice.removeClass($chooseExpires, 'option-choose');
    };
  };

  // 绑定微信号 keyup 事件
  function bindWechat() {
    $txtWechat.onkeyup = function() {
      var val = ice.trim(this.value);
      mydata.wechat = val;
      if (val.length < 2) {
        mydata.canSubmit = false;
        ice.addClass($btnSubmit, 'i-disabled');
      } else {
        mydata.canSubmit = true;
        ice.removeClass($btnSubmit, 'i-disabled');
      }
    };
  };

  // 获取用户信息
  function findUser() {
    gm.getUser(null, function(model) {
      try {
        var city = ice.toEmpty(model.city);
        var sex = gm.enum.sex[model.sex];
        var photo = ice.isEmpty(model.face) ? gm.photo : model.face;
        var name = ice.toEmpty(model.nick);
        var sort = ice.parseInt(model.ranking_country);

        ice.query('#userName').innerHTML = name;
        ice.query('#userPhoto').src = photo;
        ice.query('#userSort').innerHTML = sort;
        ice.query('#userSex').className = 'icon-' + sex;
        if (city != null) {
          ice.query('#userArea').innerHTML = city;
        }
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
        ice.ajax({
          url: '/wechat/version/previous/service/setting.json',
          data: {
            name: mydata.skills,
            price: mydata.prices * 100,
            expires: mydata.expires,
            wechat: mydata.wechat,
            audio: ''
          },
          success: function(data) {
            gm.statusDeel(data);
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
