define(function(require, exports, module) {
  var gm = require('global');

  var mydata = {
    url: gm.getUrl()
  };

  gm.ajax({
    url: '/wechat/wechat/ticket.json',
    data: mydata,
    success: function(data) {
      try {
        if (data.status == '200') {
          data = data.value;
          wxconfig(data);
        }
      } catch (e) {
        console.log('get wxconfig error:' + e.message);
      }
    },
    error: function() {
      console.log('get wxconfig error');
    }
  });

  // 初始化微信配置
  function wxconfig(data) {
    wx.config({
      debug: false,
      appId: data.appid,
      timestamp: data.timestamp,
      nonceStr: data.random,
      signature: data.signature,
      jsApiList: ['getLocation', 'chooseWXPay']
    });

    // 如果初始化成功
    wx.ready(function() {

      // 用户支付 options.id 要买的用户id options.success = function() {}
      exports.pay = function(options) {
        gm.ajax({
          url: '/wechat/version/previous/service/buy.json',
          data: {
            service_record_identify: options.id
          },
          success: function(data) {
            try {
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
    });

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
    gm.alert('<div style="padding: 1rem;">微信插件未正常初始化</div>');
  };

  // 公用微信端异常处理

});
