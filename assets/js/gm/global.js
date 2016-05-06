define(function(require, exports, module) {
  require('layer');

  // 统一 ajax ，生产线 http://api.haoyoumm.com
  var ctx = location.host.indexOf('mm') > -1 ? 'http://api.haoyoumm.com' : '';
  exports.ctx = ctx;

  // 公用调用
  var domNav = ice.query('.ice-nav');
  var domMain = ice.query('.ice-main');
  var domRefresh = ice.query('.ice-refresh');
  var domLoading = ice.query('.ice-loading');

  // 绑定下拉刷新
  exports.bindScroll = function(_reload, _load) {
    ice.scrollY(domMain, {
      refresh: domRefresh,
      load: domLoading,
      refreshFun: _reload,
      loadFun: _load
    });
  };

  // 最后一页
  exports.scrollEnd = function() {
    ice.scrollY.stop(domMain, domLoading);
  };

  // 重置分页
  exports.scrollStart = function() {
    ice.scrollY.start(domMain, domLoading);
  };

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
  exports.alert = function(content, _callback) {
    return layer.open({
      content: content,
      shadeClose: false,
      btn: ['朕知道了'],
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
      //time: 3
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
    }
  };

  // 默认头像
  exports.photo = '/assets/images/user.png';

  // 身价 
  exports.edit = {
    prices: function(s) {
      var v = ice.parseFloat(s);
      return v >= 0.01 && v <= 999.99
    },
    expires: function(s) {
      var v = ice.parseInt(s);
      return v >= 1 && v <= 180;
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
