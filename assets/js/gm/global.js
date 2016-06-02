define(function(require, exports, module) {
  require('layer');

  exports.defaultBirthday = '1995-01-01';

  // 统一 ajax ，生产线 http://api.haoyoumm.com
  var isprod = location.host.indexOf('mm') > -1;
  var ctx = isprod ? 'http://api.haoyoumm.com' : '';
  exports.ctx = ctx;
  exports.isprod = isprod;

  // 公用调用
  var domNav = ice.query('.ice-nav');
  var domScroll = ice.query('.ice');

  // 绑定下拉刷新
  var mytimer = null;
  var $load = ice.query('.ice-load');

  if ($load) {
    $load.innerHTML = '上拉加载更多';
  }

  exports.bindScroll = function(_reload, _load) {
    ice.scrollY(domScroll, {
      refreshFun: _reload,
      loadFun: function() {},
      endFun: function(dom, load) {
        var textArr = ['.', '..', '...', '....'];
        if (load && dom.getAttribute('scroll-load') == '1') {
          var idx = 0;
          clearInterval(mytimer);
          mytimer = setInterval(function() {
            try {
              if (idx == 100) {
                scrollLoadded();
              }
              $load.innerHTML = '数据加载中' + textArr[idx % 4];
              idx++;
            } catch (e) {
              clearInterval(mytimer);
            }
          }, 200);

          setTimeout(function() {
            if (ice.isFunction(_load)) {
              _load();
            }
          }, 1000);
        }
      }
    });
  };

  // 加载完成 type='i'[初始化] type=false[结束] type=other[普通]
  function scrollLoad(type) {
    if ($load) {
      clearInterval(mytimer);
      if (type === false) {
        ice.scrollY.stop(domScroll);
        $load.innerHTML = '已经加载全部数据';
      } else if (type == 'i') {
        ice.scrollY.start(domScroll);
        $load.innerHTML = '上拉加载更多';
      } else {
        $load.innerHTML = '上拉加载更多';
      }
    }
  };
  exports.scrollLoad = scrollLoad;

  if (domNav != null) {
    domNav.addEventListener(ice.tapStart, function(e) {
      e.stopPropagation();
    });
  };

  // 插件
  exports.ice = ice;


  // 获取不含 # 之后的整个 url
  exports.getUrl = function() {
    return location.href.split('#')[0];
  };

  // 打开弹窗
  exports.open = function(content, style) {
    return layer.open({
      style: (style == null ? 'padding: 0;' : style),
      content: content
    });
  };

  // 提示
  exports.alert = function(content, _callback, text) {
    return layer.open({
      content: content,
      shadeClose: false,
      btn: [text == null ? '朕知道了' : text],
      yes: function(index) {
        if (ice.isFunction(_callback)) {
          _callback();
        } else {
          layer.close(index);
        }
      }
    });
  };

  // 确认
  exports.confirm = function(content, ok, no) {
    return layer.open({
      content: content,
      btn: ['确认', '取消'],
      shadeClose: false,
      yes: ok,
      no: no
    });
  };

  // 加载中
  function loading(mess) {
    return layer.open({
      type: 2,
      time: 4,
      content: mess == null ? '加载中' : mess
    });
  };
  exports.loading = loading;

  // 关闭弹窗
  function close(l, t) {
    if (l !== null) {
      setTimeout(function() {
        layer.close(l)
      }, (t == null ? 800 : t));
    }
  };
  exports.close = close;

  // 提示信息
  function mess(m) {
    return layer.open({
      shade: false,
      className: 'alert-mess',
      content: (m == null || m == '' ? '操作成功' : m),
      time: 3
    });
  };
  exports.mess = mess;

  // 正则校验
  exports.reg = {
    mobile: /^[1][3-9][0-9]{9}$/,
    email: /^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/
  };

  // 枚举
  exports.enum = {
    sex: {
      '1': 'man',
      '2': 'woman'
    },
    sexName: {
      '1': '男',
      '2': '女'
    },
    getLevel: function(l) {
      l = ice.parseInt(l);
      if (!(l > 0 && l < 25)) {
        return 'hidden';
      }
      return 'bg-lv bg-lv' + l;
    },
    getLevelB: function(l) {
      l = ice.parseInt(l);
      if (!(l > 0 && l < 21)) {
        return 'hidden';
      }
      return 'bg-lvb bg-lvb' + l;
    }
  };

  // 默认头像
  exports.photo = '/assets/images/user.png';

  // 校验  
  var reg = {
    int: /^[+-]?([1-9][0-9]*|0+)$/,
    float: /^[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?$/
  };
  exports.reg = reg;

  // 编辑校验
  exports.edit = {
    prices: function(v) {
      if (reg.float.test(v)) {
        v = ice.parseFloat(v);
        return v >= 0.01 && v <= 999.99
      }
      return false;
    },
    expires: function(v) {
      if (reg.int.test(v)) {
        v = ice.parseInt(v);
        return v >= 1 && v <= 180;
      }
      return false;
    },
    skills: function(v) {
      return /^([0-9a-zA-Z \u4E00-\u9FA5]){1,18}$/.test(v);
    },
    wechat: function(v) {
      return /^([a-zA-Z][a-zA-Z0-9_\-]{1,19}|\d{5,15})$/.test(v);
    }
  };

  // 获取用户信息 isback = true 的时候，不跳回 list
  exports.getUser = function(identify, _callback, isback) {
    var _url = '/wechat/version/previous/user/information.json';
    if (location.href.indexOf('/html/sell/edit.html') > -1) {
      _url = '/wechat/version/previous/service/entry.json';
    }

    ajax({
      url: _url,
      async: false,
      data: {
        identify: (identify == null ? '' : identify),
        size: ''
      },
      success: function(data) {
        try {
          var status = data.status;
          var user = null;
          if (status == '200') {
            user = data.value;
          } else if (status == '404' && isback !== true) {
            getUserNull();
          }
          if (ice.isFunction(_callback)) _callback(user);
        } catch (e) {
          console.log(e.message);
        }
      },
      error: function(a) {
        console.log(a);
      }
    });
  };

  function getUserNull() {
    go();
  };
  exports.getUserNull = getUserNull;

  // 跳转
  function go(url) {
    location.href = url == null || url == '' ? '/html/sell/list.html' : url;
  };
  exports.go = go;

  // 城市
  exports.buildCitySelect = function(dom, yes) {
    if (!dom) return;

    // 省市县
    var temp = ice.query('#winCityTemp').innerHTML;
    var $dialog = ice.query('#winCity');
    var $province = ice.query('#winCity .province');
    var $city = ice.query('#winCity .city');
    var $county = ice.query('#winCity .county');
    var $btnYes = ice.query('#winCity .yes');
    var $btnCancel = ice.query('#winCity .cancel');

    // 获取数据
    function _select(identify, type) {
      ajax({
        url: '/wechat/system/district.json',
        async: false,
        data: {
          identify: identify
        },
        success: function(data) {
          try {
            var list = data.value.list;
            var len = list == null ? 0 : list.length;
            var html = '';
            for (var i = 0; i < len; i++) {
              var model = list[i];
              html += temp.replace('{id}', model.identify).replace('{name}', model.brief);
            }
            if (type == 'c') {
              $city.innerHTML = html;
              ice.addClass($county, 'hidden');
            } else if (type == 'd') {
              $county.innerHTML = html;
            } else {
              $province.innerHTML = html;
              ice.addClass($city, 'hidden');
              ice.addClass($county, 'hidden');
            }
          } catch (e) {
            console.log(e.message);
          }
        }
      });
    };

    _select('Fzyzwvvvzxw', 'p');

    // 绑定事件
    var $choose = null;
    var $cp = null;
    var $cc = null;
    var $cd = null;
    $dialog.addEventListener(ice.tapClick, function(e) {
      var ele = e.srcElement;
      var clazz = ele.className;
      if (clazz == 'city-option') {
        var id = ele.getAttribute('data-value');
        var pclazz = ele.parentNode.className;
        $choose = ele;

        if (pclazz.indexOf('province') > -1) {
          ice.removeClass($cp, 'col-orange');
          $cp = ele;
          $cc = null;
          $cd = null;
          _select(id, 'c');
          ice.removeClass($city, 'hidden');
        } else if (pclazz.indexOf('city') > -1) {
          ice.removeClass($cc, 'col-orange');
          $cc = ele;
          $cd = null;
          // _select(id, 'd');
          // ice.removeClass($county, 'hidden');
        } else {
          ice.removeClass($cd, 'col-orange');
          $cd = ele;
        }

        ice.addClass(ele, 'col-orange');
      }
    });

    // 打开弹窗
    dom.addEventListener(ice.tapClick, function() {
      ice.removeClass($dialog, 'hidden');
    });

    // 关闭
    function _close() {
      ice.addClass($dialog, 'hidden');
    };

    // 确定事件
    $btnYes.addEventListener(ice.tapClick, function() {
      if (ice.isFunction(yes)) {
        yes($choose);
      }
      _close();
    });

    $btnCancel.addEventListener(ice.tapClick, function() {
      _close();
    });

    return {
      getCity: function() {
        return $cc == null ? '' : $cc.getAttribute('data-value');
      },
      getProvince: function() {
        return $cp == null ? '' : $cp.getAttribute('data-value');
      },
      getCounty: function() {
        return $cd == null ? '' : $cd.getAttribute('data-value');
      },
      getText: function() {
        return $choose == null ? '' : $choose.innerHTML;
      }
    };
  };

  // 公用处理
  function statusDeel(data) {
    try {
      if (data != null) {
        var status = data.status;
        var msg = data.msg;

        if (data.cookies) {
          for (var i = data.cookies.length - 1; i >= 0; i--) {
            var cookie = data.cookies[i];
            localStorage.setItem('_C_' + cookie.name + '_', cookie.value);
          }
        }

        if (status == '200') {
          if (msg != null && msg != '') {
            mess(msg);
          }
        } else if (status == '302') {
          var rurl = document.URL;
          rurl = rurl.indexOf('?') > -1 ? (rurl + '?') : rurl;
          sessionStorage.setItem('_C_RETURN_', rurl);
          ice.ajax({
            url: ctx + '/wechat/wechat/code.json',
            type: 'post',
            cache: false,
            dataType: 'json',
            data: JSON.stringify({
              'url': 'http://' + location.host + '/html/wechat/return.html'
            }),
            header: {
              'Content-type': 'application/json; charset=UTF-8'
            },
            success: function(data) {
              go(data.value.url);
            }
          });
        } else if (status == '307') {
          go(data.value.url);
        } else {
          if (msg != null && msg != '') {
            mess(msg);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  function ajax(o) {
    o = o == null ? {} : o;
    ice.ajax({
      url: ctx + o.url,
      type: 'post',
      cache: false,
      dataType: 'json',
      data: JSON.stringify(o.data == null ? {} : o.data),
      header: {
        'Content-type': 'application/json; charset=UTF-8',
        'CUI': ice.toEmpty(localStorage.getItem('_C_CUI_')),
        'CUT': ice.toEmpty(localStorage.getItem('_C_CUT_'))
      },
      async: o.async,
      success: function(data) {
        statusDeel(data);
        // 公用处理
        if (ice.isFunction(o.success)) {
          o.success(data);
        }
      }
    });
  };
  exports.ajax = ajax;
});
