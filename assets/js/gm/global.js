define(function(require, exports, module) {
  require('layer');

  // 默认参数
  ice.ajaxDefault({
    cache: false,
    dataType: 'json',
    type: 'post'
  });

  // 公用调用
  var domNav = ice.query('.ice-nav');
  var domMain = ice.query('.ice-main');
  var domArrow = ice.query('.ice-main .i-hide');
  var domRefresh = ice.query('.ice-refresh');

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
  exports.open = function(content) {
    return layer.open({
      style: 'padding: 0;',
      content: content
    });
  };

  // 提示
  exports.alert = function(content, _callback) {
    return layer.open({
      content: content,
      btn: ['朕知道了'],
      yes: function(index) {
        if(ice.isFunction(_callback)) {
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
      className: 'ice-mess',
      content: (m == null || m == '' ? '操作成功' : m),
      time: 3
    });
  };
  exports.mess = mess;

  // 绑定下拉刷新
  exports.bindScroll = function(_reload, _load) {
    ice.scrollY(domMain, {
      arrow: domArrow,
      refresh: domRefresh,
      refreshFun: _reload,
      loadFun: _load
    });
  };

  // 最后一页
  exports.scrollEnd = function() {
    ice.addClass(domRefresh, 'i-last');
  };

  // 重置分页
  exports.scrollStart = function() {
    ice.removeClass(domRefresh, 'i-last');
  };

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
    }
  };

  // 默认头像
  exports.photo = '/assets/images/user.png';

  // 身价
  exports.edit = {
    price: function(s) {
      var v = ice.parseFloat(s);
      if (v < 0.01) {
        return 0.01;
      } else if (v > 999.99) {
        return 999.99;
      }
      return v;
    },
    expires: function(s) {
      var v = ice.parseInt(s);
      if (v < 1) {
        return 1;
      } else if (v > 180) {
        return 180;
      }
      return v;
    }
  };

  // 获取用户信息 isback = true 的时候，不跳回 list
  exports.getUser = function(identify, _callback, isback) {
    ice.ajax({
      url: '/wechat/version/previous/user/information.json',
      async: false,
      data: {
        identify: (identify == null ? '' : identify),
        size: ''
      },
      success: function(data) {
        statusDeel(data);
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
        if (status == '200') {
          if (msg != null && msg != '') {
            mess(msg);
          }
        } else if (status == '302') {
          var cuws = localStorage.getItem('_cuws');
          if (typeof cuws != 'string' || cuws.length == 0) {
            // 获取用户 code
            ice.ajax({
              url: '/wechat/wechat/code.json',
              success: function(data) {
                localStorage.setItem('_cuws', data.value.state);
                go(data.value.url);
              }
            });
          } else {
            // 获取用户 token
            ice.ajax({
              url: '/wechat/wechat/token.json',
              data: {
                code: ice.request('code'),
                origin: cuws,
                state: ice.request('state')
              },
              success: function() {
                localStorage.setItem('_cuws', '');
              },
              error: function() {
                localStorage.setItem('_cuws', '');
              }
            });
          }
        } else if (status == '307') {
          go(data.value.url);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  exports.statusDeel = statusDeel;
});
