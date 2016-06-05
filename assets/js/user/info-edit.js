define(function(require, exports, module) {
  var gm = require('global');
  var ice = gm.ice;
  var gm_wechat = require('wechat');

  var $img = ice.query('#img');
  var $name = ice.query('#name');
  var $area = ice.query('#area');
  var $sex = ice.query('#sex');
  var $age = ice.query('#age');
  var $birthday = ice.query('#birthday');
  var $btnUpload = ice.query('#btnUpload');
  var birth;

  var mydata = {
    face: '',
    nick: '',
    sex: '',
    birthday: '',
    country_identify: '',
    province_identify: '',
    city_identify: ''
  };

  // 查询个人资料
  function search() {

    // 获取 user/info.html 存入的用户信息，避免再查数据库
    var sex = ice.toEmpty(sessionStorage.getItem('editSex'));
    sex = sex == null ? '1' : sex;
    mydata.sex = sex;
    mydata.nick = sessionStorage.getItem('editName');
    mydata.face = sessionStorage.getItem('editImageId');

    $img.innerHTML = sessionStorage.getItem('editImage');
    $area.innerHTML = sessionStorage.getItem('editArea');

    mydata.province_identify = sessionStorage.getItem('editProvince');
    mydata.city_identify = sessionStorage.getItem('editCity');

    $name.value = mydata.nick;

    $sex.innerHTML = gm.enum.sexName[sex];
    // $age.innerHTML = ice.parseInt(sessionStorage.getItem('editAge'));
    birth = ice.toEmpty(sessionStorage.getItem('editBirth'));
    if(birth == '') {
      birth = gm.defaultBirthday;
    }

    // $birthday.value = birth;
    $birthday.innerHTML = birth;
    if (birth == '') {
      $birthday.innerHTML = '<label class="col-grey03">点击选择出生日期</label>';
    }

    // 绑定上传事件
    var $image = ice.query('img', $img);
    gm_wechat.bindUploadImage($img, function(result) {
      if(result != null) {
        $image.src = result.url;
        mydata.face = result.uri;
      }
    }, 1);

  };

  // 绑定修改资料
  function bindUpdate() {
    var $submit = ice.query('#submit');
    var issubmit = true;
    $submit.addEventListener(ice.tapClick, function(e) {
      if (!issubmit) return;
      issubmit = false;

      ice.stopDefault(e);

      mydata.nick = ice.trim(ice.toEmpty($name.value));
      mydata.birthday = ice.trim($birthday.innerHTML);
      // mydata.birthday = $birthday.value;

      if(mydata.nick == '') {
        gm.mess('昵称不能为空');
        return;
      }
      if(mydata.sex == '') {
        gm.mess('请选择性别');
        return;
      }
      if(mydata.birthday == '') {
        gm.mess('请填写出生日期');
        return;
      }
      if(mydata.province_identify == '') {
        gm.mess('请选择城市');
        return;
      }

      console.log(mydata);

      // 更新资料
      gm.ajax({
        url: '/wechat/version/previous/user/brief/edit.json',
        async: false,
        data: mydata,
        success: function(data) {
          try {
            if (data.status == '200') {
              // gm.go('/html/user/info.html');
            }
          } catch (e) {
            console.log(e.message);
          }
        }
      });

      issubmit = true;
    });
  };

  // 日期选择
  function bindSimpleDate() {
    // $birthday.addEventListener(ice.tapClick, function() {
    //   WdatePicker();
    // });
    // 绑定日历选择
    ice.simpledate({
      selector: '#birthday',
      initValue: birth,
      defYear: '1995',
      success: function(calendar) {
        var arrs = calendar.getValue().split('-');
        $birthday.innerHTML = arrs[0] + '-' + ice.dateFormatZero(arrs[1]) + '-' + ice.dateFormatZero(arrs[2]);
      }
    });
  };

  // 选择性别
  function bindChooseSex() {
    var winSex = ice.query('#winSex').innerHTML;
    $sex.addEventListener(ice.tapClick, function(e) {
      ice.stopDefault(e);
      ice.stopPropagation(e);

      // 打开弹窗
      var layer = gm.alert(winSex, null, '取消');
      // 选择性别
      var $man = ice.query('.layermbox .sex-man');
      var $woman = ice.query('.layermbox .sex-woman');

      $man.addEventListener(ice.tapClick, function(e) {
        ice.stopPropagation(e);
        ice.stopDefault(e);
        mydata.sex = 1;
        $sex.innerHTML = '男';
        gm.close(layer, 0);
      });
      $woman.addEventListener(ice.tapClick, function(e) {
        ice.stopPropagation(e);
        ice.stopDefault(e);
        mydata.sex = 2;
        $sex.innerHTML = '女';
        gm.close(layer, 0);
      });
    });
  };

  // 绑定选择省市县
  function bindChooseCity() {
    var city = gm.buildCitySelect($area, function() {
      mydata.province_identify = city.getProvince();
      mydata.city_identify = city.getCity();
      mydata.country_identify = city.getCounty();
      $area.innerHTML = city.getText();
    }, {
      p: mydata.province_identify,
      c: mydata.city_identify
    });
  };

  // 初始化
  (function() {
    gm_wechat.init();

    // 绑定滚动加载_previous_user_brief_edit
    gm.bindScroll(function() {
      search();
    }, null);

    search();
    bindUpdate();
    bindSimpleDate();
    bindChooseSex();
    bindChooseCity();
  })();
});
