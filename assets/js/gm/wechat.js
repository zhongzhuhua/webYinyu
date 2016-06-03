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
    if (isinit) return;
    isinit = true;

    wx.config({
      debug: false,
      appId: data.app_id,
      timestamp: data.timestamp,
      nonceStr: data.random,
      signature: data.signature,
      jsApiList: ['chooseWXPay', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone',
        'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'uploadVoice', 'chooseImage', 'previewImage', 'uploadImage'
      ]
    });

    // 如果初始化成功
    wx.ready(function(share) {

      // 用户支付 options.id 要买的用户id options.success = function() {}
      exports.pay = function(options) {
        if (!_pay) {
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

      // 录音
      exports.bindSound = function() {
        _bindSound();
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
      if (ice.isFunction(_fun)) {
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

  // =============== 录音相关，没封装好，后期改善 =================
  var localId = null;
  // 录音路径
  var audioPath = null;
  var isplay = false;
  var ismack = false;
  var $wxBtnDelete = ice.query('#wxBtnDelete');
  var $wxBtnSound = ice.query('#wxBtnSound');
  var $wxBtnMack = ice.query('#wxBtnMack');
  var $wxBtnMackIcon = ice.query('#wxBtnMackIcon');
  var $wxSoundSource = ice.query('#wxSoundSource');

  // 绑定录音
  function _bindSound() {

    // 录音时间超过一分钟没有停止的时候会执行 complete 回调
    wx.onVoiceRecordEnd({
      complete: function(res) {
        localId = res.localId;
        if (localId != null) {
          _uploadSound();
        }
      }
    });

    // 录音按钮
    if ($wxBtnMack) {
      ice.removeClass($wxBtnMack, 'i-disabled');
      // 录音
      $wxBtnMack.addEventListener('click', function(e) {
        ice.stopDefault(e);
        ice.stopPropagation(e);
        if (ismack) {
          // 结束录音，上传录音
          ismack = false;
          ice.removeClass($wxBtnMack, 'i-disabled');
          ice.removeClass($wxBtnMackIcon, 'icon-stop');
          if (gm.isprod) {
            wx.stopRecord({
              success: function(res) {
                localId = res.localId;
                if (localId != null) {
                  _uploadSound();
                }
              }
            });
          } else {
            localId = 'test';
            _uploadSound();
          }
        } else {
          // 开始录音，清空 localId
          gm.mess('正在录音中，再次点击结束录音...');
          ismack = true;
          localId = null;
          ice.addClass($wxBtnMack, 'i-disabled');
          ice.addClass($wxBtnMackIcon, 'icon-stop');
          wx.startRecord();
          // 录音的时候停止播放
          isplay = true;
          _playSound();
        }
      });
    }

    // 播放
    if ($wxBtnSound) {
      ice.removeClass($wxBtnSound, 'i-disabled');

      $wxBtnSound.addEventListener('click', function(e) {
        _playSound();
      });
    }

    // 删除
    if ($wxBtnDelete) {
      ice.removeClass($wxBtnDelete, 'i-disabled');
      $wxBtnDelete.addEventListener('click', function(e) {
        _deleteSound();
      });
    }
  };

  exports.bindSound = _bindSound;

  // 初始化录音 duration 修改按钮文字变成带有秒数的
  exports.initSound = function(audio, audio_uri, duration) {
    if (audio != null && audio != '') {
      audioPath = audio_uri;
      $wxSoundSource.setAttribute('src', audio);

      if (duration != null && $wxBtnSound) {
        $wxBtnSound.innerHTML = duration + '"' + '<i class="icon-sound"></i>';
      }
    }
  };

  // 获取上传的录音地址
  exports.getSoundPath = function() {
    return audioPath;
  };

  // 上传录音
  function _uploadSound() {
    if (localId != null && localId != '') {
      if (gm.isprod) {
        wx.uploadVoice({
          localId: localId,
          isShowProgressTips: 1,
          success: function(res) {
            var serverId = res.serverId;
            _uploadServer(serverId);
          }
        });
      } else {
        _uploadServer('');
      }
    }
  };

  // 上传到服务器
  function _uploadServer(serverId) {
    var result = _commonUploadServer(serverId, 'voice');
    if(result != null) {
      $wxSoundSource.setAttribute('src', result.url);
      audioPath = result.uri;
    }
  };

  // 播放录音
  function _playSound() {
    if (isplay) {
      $wxSoundSource.pause();
      isplay = false;
    } else {
      $wxSoundSource.play();
      isplay = true;
    }
  };

  // 删除录音
  function _deleteSound() {
    gm.mess('删除录音成功');
    localId = null;
    audioPath = null;
    isplay = false;
    $wxSoundSource.setAttribute('src', '');
  };


  // =============== 上传相片相关 =================
  // btn 上传按钮， img 图片
  exports.imageId = null;
  exports.bindUploadImage = function($btn, success, count) {
    if($btn == null) return;

    var imageIds = null;
    var imageId = null;
    // 选择图片
    $btn.addEventListener(ice.tapClick, function(e) {
      wx.chooseImage({
        count: count == null ? 9 : count, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
          imageIds = res.localIds;
          var result = [];

          // 上传到微信服务器
          for(var key in imageIds) {
            wx.uploadImage({
              localId: imageIds[key], // 需要上传的图片的本地ID，由chooseImage接口获得
              isShowProgressTips: 1, // 默认为1，显示进度提示
              success: function(res) {
                imageId = res.serverId;

                result.push(_commonUploadServer(imageId, 'image'));
              }
            });  
          }

          if(ice.isFunction(success)) {
            success(result)
          }
        }
      });
    });

    // 服务器上传
    function addImage(photo) {
      gm.ajax({
        url: '/wechat/sociality/media/photo/add.json',
        data: {
          album: '',
          photo: photo
        },
        success: function(data) {
          try {
            if(data.status == '200') {
              gm.reload();
            }
          } catch(e) {
            console.log(e.message);
          }
        }
      });
    };
  };

  // 公用上传到服务器 type = image|voice|video|thumb
  function _commonUploadServer(serverId, type) {
    // 上传到服务器
    gm.ajax({
      url: '/wechat/wechat/media.json',
      data: {
        type: 'voice',
        media_id: serverId
      },
      success: function(data) {
        try {
          if (data.status == '200') {
            var _uri = data.value.uri;
            var _url = data.value.url;
            return {
              url: _url,
              uri: _uri
            };
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    });
  };

  (function() {
    // 绑定分享
    if($btnShard != null) {
      $btnShard.addEventListener(ice.tapClick, function() {
        var _l = gm.open('<img src="/assets/images/share.png" class="dialogShare" style="width: 10rem; height: 5rem; float: right; padding-right: 2rem; padding-top: .5rem" />', ' background-color: transparent; position:fixed; width:100%; height:100%; border:none;');
        (ice.query('.dialogShare').parentNode.parentNode).addEventListener(ice.tapClick, function(e) {
          e = e || window.event;
          e.stopPropagation();
          gm.close(_l, 0);
        });
      }); 
    }
  })();
});