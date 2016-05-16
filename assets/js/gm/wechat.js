define(function(require, exports, module) {
  var gm = require('global');

  // 分享按钮
  var ice = gm.ice;
  $btnShard = ice.query('#btnShard');

  // 是否已经初始化
  var isinit = false;
  // 避免重复支付
  var _pay = true;

  // 获取微信配置
  exports.init = function(config, _fun) {
    gm.ajax({
      url: '/wechat/wechat/ticket.json',
      data: {
        url: gm.getUrl()
      },
      async: false,
      success: function(data) {
        try {
          if (data.status == '200') {
            data = data.value;
            wxconfig(data, config, _fun);
          }
        } catch (e) {
          console.log('get wxconfig error:' + e.message);
        }
      },
      error: function() {
        console.log('get wxconfig error');
      }
    });
  };

  // 初始化微信配置
  function wxconfig(data, config, _fun) {
    if(isinit) return;
    isinit = true;

    wx.config({
      debug: false,
      appId: data.app_id,
      timestamp: data.timestamp,
      nonceStr: data.random,
      signature: data.signature,
      jsApiList: ['chooseWXPay', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone']
    });

    // 如果初始化成功
    wx.ready(function(share) {

      // 用户支付 options.id 要买的用户id options.success = function() {}
      exports.pay = function(options) {
        if(!_pay) {
          return;
        }
        _pay = false;

        gm.ajax({
          url: '/wechat/version/previous/service/buy.json',
          data: {
            service_record_identify: options.service_record_identify
          },
          success: function(data) {
            try {
              data = data.value;
              localStorage.setItem('_wx_pi', data.prepay_id);
              localStorage.setItem('_wx_w', data.wechat);
              wx.chooseWXPay({
                timestamp: data.timestamp,
                nonceStr: data.random,
                package: 'prepay_id=' + data.prepay_id,
                signType: data.sign_type,
                paySign: data.sign,
                success: function(res) {
                  if (res.errMsg == 'chooseWXPay:ok') {
                    if (ice.isFunction(options.success)) {
                      options.success(res);
                    }
                  }
                  _pay = true;
                },
                cancel: function() {
                  _pay = true;
                },
                error: function() {
                  _pay = true;
                }
              });
            } catch (e) {
              console.log('wxpay error:' + e.message);
            }
            _pay = false;
          },
          error: function() {
            _pay = true;
          }
        });
      };

      var shardTemp = {
        title: config.share.title,
        desc: config.share.description,
        link: '',
        imgUrl: config.share.icon,
        type: config.share.type,
        dataUrl: config.share.url,
      };

      // 分享到朋友圈
      wx.onMenuShareTimeline({
        title: config.share.title,
        desc: config.share.description,
        link: config.share.link_wx_blog,
        imgUrl: config.share.icon,
        type: config.share.type,
        dataUrl: config.share.url,
      });
      // 微信好友
      wx.onMenuShareAppMessage({
        title: config.share.title,
        desc: config.share.description,
        link: config.share.link_wx_friend,
        imgUrl: config.share.icon,
        type: config.share.type,
        dataUrl: config.share.url,
      });
      //  QQ
      wx.onMenuShareQQ({
        title: config.share.title,
        desc: config.share.description,
        link: config.share.link_qq_friend,
        imgUrl: config.share.icon,
        type: config.share.type,
        dataUrl: config.share.url,
      });
      // 腾讯微博
      wx.onMenuShareWeibo({
        title: config.share.title,
        desc: config.share.description,
        link: config.share.link_qq_tencent,
        imgUrl: config.share.icon,
        type: config.share.type,
        dataUrl: config.share.url,
      });
      // QQ 空间
      wx.onMenuShareQZone({
        title: config.share.title,
        desc: config.share.description,
        link: config.share.link_qq_qzone,
        imgUrl: config.share.icon,
        type: config.share.type,
        dataUrl: config.share.url,
      });

      // 初始化方法
      if(ice.isFunction(_fun)) {
        _fun();
      }
    });

    // 如果初始化失败
    wx.error(function(res) {
      console.log('wx init error:' + res);
    });
  };

  exports.getPrepayId = function() {
    return ice.toEmpty(localStorage.getItem('_wx_pi'));
  };

  exports.getWechat = function() {
    return ice.toEmpty(localStorage.getItem('_wx_w'));
  };

  // 清除信息
  function clearWx() {
    localStorage.removeItem('_wx_pi');
    localStorage.removeItem('_wx_w');
  };

  exports.clearWx = clearWx;

  // 发起一个支付
  exports.pay = function(options) {
    gm.alert('<div style="padding: 1rem;">请稍后再进行购买</div>');
  };

  // 公用微信端异常处理

  (function() {
    // 绑定分享
    $btnShard.addEventListener(ice.tapClick, function() {
      var _l = gm.open('<img src="/assets/images/share.png" class="dialogShare" style="width: 10rem; height: 5rem; float: right; padding-right: 2rem; padding-top: .5rem" />', ' background-color: transparent; position:fixed; left:0; top:0; width:100%; height:100%; border:none;');
      (ice.query('.dialogShare').parentNode.parentNode).addEventListener(ice.tapClick, function(e) {
        e = e || window.event;
        e.stopPropagation();
        gm.close(_l, 0);
      });
    });
  })();
});
