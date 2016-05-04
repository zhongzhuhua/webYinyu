define(function(require, exports, module) {
  var gm = require('global');

  // 分享按钮
  var ice = gm.ice;
  $btnShard = ice.query('#btnShard');
  var shardTemp = {
    title: '',
    desc: '',
    link: '',
    imgUrl: '',
    type: '',
    dataUrl: '',
  };

  // 是否已经初始化
  var isinit = false;

  // 获取微信配置
  exports.init = function(config) {
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
            wxconfig(data, config);
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
  function wxconfig(data, config) {
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
                }
              });
            } catch (e) {
              console.log('wxpay error:' + e.message);
            }
          }
        });
      };

      // 分享到朋友圈
      shardTemp.link = config.link_wx_blog;
      wx.onMenuShareTimeline(shardTemp);
      // 微信好友
      shardTemp.link = config.link_wx_friend;
      wx.onMenuShareAppMessage(shardTemp);
      //  QQ
      shardTemp.link = config.link_qq_friend;
      wx.onMenuShareQQ(shardTemp);
      // 腾讯微博
      shardTemp.link = config.link_qq_tencent;
      wx.onMenuShareWeibo(shardTemp);
      // QQ 空间
      shardTemp.link = config.link_qq_qzone;
      wx.onMenuShareQZone(shardTemp);
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
    console.log(options);
    gm.alert('<div style="padding: 1rem;">微信插件未正常初始化</div>');
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
