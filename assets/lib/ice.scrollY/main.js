(function(ice) {
  if (ice != null) {
    // 绑定滚动事件，conf 配置 {  }
    ice.scrollY = function(dom, options) {
      if (dom == null || dom.getAttribute('scrollY') == '') {
        return;
      } 
 
      // 配置
      var g = {
        // 刷新 dom 元素
        refresh: options ? options.refresh : null,
        // 加载更多 dom 元素
        load: options ? options.load : null,
        // 刷新函数
        refreshFun: options ? options.refreshFun : null,
        // 加载更多函数
        loadFun: options ? options.loadFun : null,
        // 什么样式不执行 scroll 事件
        noClass: 'option',

        // 是否按住
        isBegin: false,
        // 是否执行了移动事件
        isMove: false,
        // 控件高度
        height: dom.clientHeight,
        // 控件全部高度
        scrollHeight: dom.scrollHeight,
        // 移动高度占比
        moveHeight: dom.clientHeight / 2.5,
        start: 0,
        end: 0,
        // 当前滚动条高度
        st: 0,
        // 上拉超过多少 rem 的时候，可以执行函数加载
        runHeight: 1.8,
        // 是否执行刷新和加载
        isRun: false,
        // 目前移动距离
        runDiff: 0,
        // 按住多少毫秒执行事件
        runTime: 500,
        runBegin: 0
      };

      dom.setAttribute('scroll-load', '1');

      // 计算实际高度
      g.runHeightRealy = g.runHeight * 10 / 0.625;

      // 箭头
      g.arrow = g.refresh ? g.refresh.querySelector('span') : null;
      if (g.arrow) {
        ice.css(g.arrow, {
          'transition': 'all .2s'
        });
      }

      // 按下事件
      dom.addEventListener(ice.tapStart, function(e) {
        e = e || window.event;
        g.st = dom.scrollTop;
        var myEvent = e.touches ? e.touches[0] : (e || window.event);
        g.start = myEvent.pageY;

        // 如果点击的是 input select 或者 class 有 noClass 的，就 false
        var node = e.srcElement;
        var nodeName = node.nodeName.toLowerCase();
        var clazz = node.className;
        if (nodeName == 'input' || nodeName == 'select' || (clazz && clazz.indexOf(g.noClass) > -1)) {
          return;
        }
        g.isBegin = true;
        g.runBegin = new Date().getTime();
      });

      // 滑动事件
      dom.addEventListener(ice.tapMove, function(e) {
        var myEvent = e.touches ? e.touches[0] : (e || window.event);
        // 计算移动的比例，如果大于0，则是下拉，如果小于0则是上拉
        var diff = myEvent.pageY - g.start;
        if (g.isBegin) {
          if (diff > 0 && g.st <= 0) {
            // 如果是下拉，则 scrollTop 小于 0 的时候才执行事件
            g.isMove = true;
            stopDefault(e);
            stepRun(diff);

            if (g.arrow) {
              var deg = (Math.abs(g.runDiff) > g.runHeightRealy) ? '180deg' : '0';
              ice.css(g.arrow, {
                'transform': 'rotate(' + deg + ')'
              });
            }
          } else if (diff < 0 && dom.scrollTop + dom.clientHeight >= dom.scrollHeight) {
            // 如果是上拉，超出滚动条的时候，才执行事件
            g.isMove = true;
            stopDefault(e);
            stepRun(diff);
          }
        } else {
          g.isMove = false;
        }
      });

      // 松开事件
      dom.addEventListener(ice.tapEnd, function(e) {
        // 初始化
        if (g.isMove) {
          ice.removeClass(dom, 'ice-user-select');
          dom.onselectstart = dom.ondrag = null;
        }

        // 如果超过则执行函数
        if(new Date().getTime() - g.runBegin > g.runTime) {
          if (Math.abs(g.runDiff) > g.runHeightRealy) {
            if (g.runDiff > 0 && g.refresh && g.refreshFun) {
              g.refreshFun();
            } else if (g.runDiff < 0 && g.load && g.loadFun) {
              if(dom.getAttribute('scroll-load') !== '0') {
                g.loadFun();
              }
            }
          }
        }

        if (g.isMove) {
          stepRun(0);
        }

        g.isBegin = false;
        g.isMove = false;
      });

      // 计算滚动高度
      function stepRun(diff) {
        var percentage = (diff / g.height).toFixed(2) * g.moveHeight;
        g.runDiff = percentage;
        ice.css(dom, {
          'transform': 'translateY(' + percentage + 'px)'
        });

        if (!!g.refresh && percentage >= 0) {
          ice.css(g.refresh, {
            'transform': 'translateY(' + percentage + 'px)'
          });
        }
        if (!!g.load && percentage <= 0) {
          ice.css(g.load, {
            'transform': 'translateY(' + percentage + 'px)'
          });
        }
      };

      // 阻止默认事件
      function stopDefault(e, buildTimer) {
        e.preventDefault();
        if (!g.isMove) {
          ice.addClass(dom, 'ice-user-select');
          dom.onselectstart = dom.ondrag = function() {
            return false;
          };
          g.isMove = true;
        }
      };
    };

    // 可以滚动
    ice.scrollY.start = function(dom) {
      dom.setAttribute('scroll-load', '1');
    };

    // 禁用滚动
    ice.scrollY.stop = function(dom) {
      dom.setAttribute('scroll-load', '0');
    };
  }
})(ice);
