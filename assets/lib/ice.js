(function() {
  // 插件
  var ice = {
    isMobile: ('ontouchend' in document),
    tapStart: ('ontouchstart' in document) ? 'touchstart' : 'mousedown',
    tapMove: ('ontouchmove' in document) ? 'touchmove' : 'mousemove',
    tapEnd: ('ontouchend' in document) ? 'touchend' : 'mouseup',
    tapClick: ('ontouchstart' in document) ? 'touchstart' : 'click',
    tapKeyup: ('oninput' in document) ? 'input' : 'keyup',
    // 获取参数 url 
    request: function(key) {
      var s = location.search.match(new RegExp('[?&]' + key + '=([^&]*)(&?)', 'i'));
      return (s == undefined || s == 'undefined' ? '' : s ? s[1] : s).replace(/[\<\>]/g, '');
    },
    // 去掉 html 字符串
    removeAttr: function(s) {
      return s == null ? '' : s.replace(/<|>|\&/g, ' ');
    },
    replaceHtml: function(s) {
      if (s == null || s == '') return '';
      return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    // innerText
    innerText: function(dom, text) {
      if (dom != null) {
        if (this.isElement(dom)) {
          if (typeof dom.textContent == 'string') {
            dom.textContent = text;
          } else {
            dom.innerText = text;
          }
        } else {
          for (var k in dom) {
            this.innerText(dom[k], json);
          }
        }
      }
    },
    // 去掉左右空格
    trim: function(s) {
      return s != null ? s.replace(/(^\s*)|(\s*$)/g, '') : null;
    },
    // 设置 style
    css: function(dom, json) {
      if (dom != null) {
        if (this.isElement(dom)) {
          for (var k in json) {
            dom.style[k] = json[k];
            dom.style['-webkit-' + k] = json[k];
            dom.style['-moz-' + k] = json[k];
            dom.style['-o-' + k] = json[k];
            dom.style['-ms-' + k] = json[k];
          }
        } else {
          for (var k in dom) {
            this.css(dom[k], json);
          }
        }
      }
    },
    // 添加样式
    addClass: function(dom, clazz) {
      if (dom != null && clazz != null && clazz != '') {
        if (this.isElement(dom)) {
          dom.className = dom.className + ' ' + clazz;
        } else {
          for (var k in dom) {
            this.addClass(dom[k], clazz);
          }
        }
      }
    },
    // 删除样式
    removeClass: function(dom, clazz) {
      if (dom != null && clazz != null && clazz != '') {
        if (this.isElement(dom)) {
          dom.className = this.trim(dom.className.replace(new RegExp(clazz, 'g'), ''));
        } else {
          for (var k in dom) {
            this.removeClass(dom[k], clazz);
          }
        }
      }
    },
    // 删除元素
    remove: function(dom) {
      if (dom != null) {
        if (this.isElement(dom)) {
          dom.parentNode.removeChild(dom);
        } else {
          for (var k in dom) {
            this.remove(dom[k]);
          }
        }
      }
    },
    // css3 选择器
    query: function(s, dom) {
      dom = dom == null ? document : dom;
      return dom.querySelector(s);
    },
    // css3 选择器
    queryAll: function(s, dom) {
      dom = dom == null ? document : dom;
      return dom.querySelectorAll(s);
    },
    // 合并两个 json 对象
    extend: function(a, b) {
      if (a == null) {
        return b;
      } else if (b == null) {
        return a;
      } else {
        for (var k in b) {
          a[k] = b[k];
        }
        return a;
      }
    },
    // 转换对象
    parseInt: function(str) {
      try {
        var v = parseInt(str, 10);
        return isNaN(v) || v == null ? 0 : v;
      } catch (e) {
        return 0;
      }
    },
    parseFloat: function(str, point) {
      try {
        var v = parseFloat(str);
        return isNaN(v) || v == null ? 0 : point == null ? v : v.toFixed(point);
      } catch (e) {
        return 0;
      }
    },
    parseDate: function(str) {
      var date = null;
      try {
        if (str != null && str != '') {
          var regNum = /^[1-3][0-9]{7}$/;
          if (str instanceof Date) {
            date = str
          } else {
            if (str.indexOf('Date') > -1) {
              date = new Date(parseInt(str.replace('/Date(', '').replace(')/', ''), 10))
            } else {
              if (regNum.test(str)) {
                date = new Date(str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2))
              } else {
                date = new Date(str.replace(/\-/g, "/"))
              }
            }
          }
        }
      } catch (e) {
        date = null
      }
      return date;
    },
    // 转成 json
    parseJson: function(s) {
      return s == null || this.trim(s) == '' ? null : eval('(' + s + ')');
    },
    // 是否 HTMLElement
    isElement: function(d) {
      return (d && d instanceof HTMLElement);
    },
    // 是否 function
    isFunction: function(fn) {
      return Object.prototype.toString.call(fn) === '[object Function]';
    },
    // 是否空或者空字符串
    isEmpty: function(s) {
      return s == null || s == '';
    },
    // null 转 ''
    toEmpty: function(s) {
      return s == null ? '' : s;
    },
    // 转换字符串
    formatDate: function(date, format) {
      try {
        var o = {
          // 格式化数据，多字符必须放在前面
          "yyyy": date.getFullYear(),
          "MM": this.dateFormatZero(date.getMonth() + 1),
          "dd": this.dateFormatZero(date.getDate()),
          "hh": this.dateFormatZero(date.getHours()),
          "mm": this.dateFormatZero(date.getMinutes()),
          "ss": this.dateFormatZero(date.getSeconds()),
          "y": date.getFullYear(),
          "M": date.getMonth() + 1,
          "d": date.getDate(),
          "h": date.getHours(),
          "m": date.getMinutes(),
          "s": date.getSeconds(),
          "q": Math.floor((date.getMonth() + 3) / 3),
          "S": date.getMilliseconds()
        };

        for (var k in o) {
          format = format.replace(k, o[k]);
        };
        return format;
      } catch (e) {
        return '';
      }
    },
    dateFormatZero: function(str) {
      str = str.toString();
      return str.length == 1 ? '0' + str : str;
    }
  };

  // 阻止浏览器默认事件
  ice.stopDefault = function(e) {
    e = e || window.event;
    e.preventDefault();
    if (window.event) {
      window.event.cancelBubble = true;
    }
  };

  // 阻止事件冒泡
  ice.stopPropagation = function(e) {
    e = e || window.event;
    e.stopPropagation();
  };

  // 执行时间
  ice.trigger = function(dom, e) {
    try {
      dom[e.replace(/^on/, '')]();
    } catch (e) {
      console.log('trigger:' + e.message);
    }
  };

  // 创建 HttpRequest
  function createHttpRequest() {
    var h;
    try {
      xmlHttp = new XMLHttpRequest();
    } catch (e) {
      try {
        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
    return xmlHttp;
  };

  // 默认参数
  var ajaxDefault = {
    url: null,
    cache: true,
    async: true,
    type: 'get',
    dataType: 'text',
    // application/x-www-form-urlencoded application/json; charset=UTF-8
    header: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  };

  // ajax 请求
  ice.ajax = function(o) {
    var options = ice.extend(ajaxDefault, o);
    var myurl = options.url;
    var myhttp = createHttpRequest();

    if (myhttp == null || myurl == null || myurl == '') {
      options.error('request url is null');
    } else {
      // 是否有问号
      var havep = myurl.indexOf('?') < 0;
      var data = options.data;
      var cache = options.cache;
      var type = options.type;
      var isget = type != 'post';
      var params = '';

      // 参数
      if (data != null) {
        // 缓存
        if (!cache) {
          var rtime = '&ajaxtime=' + new Date().getTime();
          myurl = myurl + (havep ? '?' : '') + rtime;
          havep = true;
        }
        // 请求类型
        if (typeof data != 'string') {
          for (var k in data) {
            var v = data[k];
            v = v == null ? '' : v;
            params += '&' + k + '=' + v;
          }
        } else {
          params = data;
        }

        if (isget) {
          myurl = myurl + (havep ? '?' : '') + params;
        }
      }

      // 请求
      var async = options.async == null ? true : options.async;
      myhttp.open(type, myurl, async);
      if (!isget) {
        var header = options.header;
        if (header != null) {
          for (var key in header) {
            myhttp.setRequestHeader(key, header[key]);
          }
        }
        myhttp.send(params);
      } else {
        myhttp.send(null);
      }

      if (options.async == false) {
        ice.ajaxResult(myhttp, options);
      } else {
        myhttp.onreadystatechange = function() {
          ice.ajaxResult(myhttp, options);
        };
      }
    }
  };

  // 返回结果执行函数
  ice.ajaxResult = function(myhttp, options) {
    var finish = false;
    if (myhttp.readyState == 4) {
      if (myhttp.status == 200) {
        finish = true;
      }

      if (finish) {
        var result = myhttp.responseText;
        if (options.dataType == 'json') {
          try {
            result = ice.parseJson(result);
          } catch (e) {
            result = 'json parse error';
          }
        }

        options.success(result);
      } else {
        if (ice.isFunction(options.error)) {
          console.log('request error');
          options.error(myhttp);
        }
      }
    }
  };

  window.ice = ice;
})();
