(function(ice) {
  if (ice != null) {
    // 绑定滚动事件，conf 配置 {  }
    ice.scrollY = function(dom, options) {
      if (dom == null || dom.getAttribute('scrollY') == '') {
        return;
      }

      // 配置
      var g = {
        // 顶部 dom 元素
        arrow: options ? options.arrow : null,
        // 刷新块
        refresh: options ? options.refresh : null,
        // 刷新函数
        refreshFun: options ? options.refreshFun : null,
        // 加载函数
        loadFun: options ? options.loadFun : null,
        // 什么样式不执行事件
        noClass: 'option',

        // 是否可以执行刷新
        isRefresh: false,
        // 是否加载更多
        isLoad: false,
        // 是否按住
        isBegin: false,
        // 是否执行了移动事件
        isMove: false,
        // 控件高度
        height: dom.clientHeight,
        // 控件全部高度
        scrollHeight: dom.scrollHeight,
        // 移动高度占比
        moveHeight: dom.clientHeight / 2,
        start: 0,
        end: 0,
        // 是否上拉超过一秒
        isLoadTimer: null,
        // 当前滚动条高度
        st: 0
      };

      g.arrowHeight = g.arrow instanceof HTMLElement ? g.arrow.clientHeight : 0;
      if (g.arrowHeight > 0) {
        ice.css(g.arrow, {
          'transition': 'all .2s'
        });
      };

      // 绑定事件
      dom.addEventListener(ice.tapStart, function(e) {
        e = e || window.event;
        g.st = dom.scrollTop;
        var myEvent = e.touches ? e.touches[0] : (e || window.event);
        g.start = myEvent.pageY;

        // 如果点击的是 input select 或者 class 有 noClass 的，就 false
        var node = e.srcElement;
        var nodeName = node.nodeName.toLowerCase();
        var clazz = node.className;
        if(nodeName == 'input' || nodeName == 'select' || (clazz && clazz.indexOf(g.noClass) > -1)) {
          return;
        }
        g.isBegin = true;
      });

      dom.addEventListener(ice.tapMove, function(e) {
        var myEvent = e.touches ? e.touches[0] : (e || window.event);
        // 计算移动的比例，如果大于0，则是下拉，如果小于0则是上拉
        var diff = myEvent.pageY - g.start;
        if (g.isBegin) {
          // 如果是下拉，则 scrollTop 小于 0 的时候才阻止滚动事件
          if (diff > 0 && g.st <= 0) {
            g.isLoad = false;
            stopDefault(e);
            stepRun(diff);
            // 箭头是否变化
            if (g.arrowHeight > 0) {
              var deg = diff > g.arrowHeight ? '180deg' : '0';
              g.isRefresh = deg !== '0';
              ice.css(g.arrow, {
                'transform': 'rotate(' + deg + ')'
              });
            }
          } else if (diff < 0 && dom.scrollTop + dom.clientHeight >= dom.scrollHeight - 1) {
            g.isRefresh = false;
            g.isLoad = true;
            stopDefault(e);
            stepRun(diff);
          }
        } else {
          g.isMove = false;
        }
      });

      dom.addEventListener(ice.tapEnd, function(e) {
        if (g.isMove) {
          ice.removeClass(dom, 'user-select');
          dom.onselectstart = dom.ondrag = null;
          ice.css(dom, {
            'transition': 'all .6s',
            'transform': 'translateY(0)'
          });
        }

        ice.css(g.arrow, {
          'transform': 'rotate(0)'
        });

        if (g.isMove) {
          try {
            if (g.isRefresh && g.refreshFun) {
              g.refreshFun();
            } else if (g.loadFun) {
              g.loadFun(g.refresh);
            }
          } catch (e) {
            console.log(e.message);
          }
        }

        g.isBegin = false;
        g.isMove = false;

        // 清除定时器
        g.isLoad = false;
        if (g.isLoadTimer != null) {
          clearTimeout(g.isLoadTimer);
          g.isLoadTimer = null;
        }
      });

      // 计算滚动高度
      function stepRun(diff) {
        var percentage = (diff / g.height).toFixed(2) * g.moveHeight;
        ice.css(dom, {
          'transition': '',
          'transform': 'translateY(' + percentage + 'px)'
        });
      };

      // 阻止默认事件
      function stopDefault(e, buildTimer) {
        e.preventDefault();
        if (!g.isMove) {
          ice.addClass(dom, 'user-select user-select');
          dom.onselectstart = dom.ondrag = function() {
            return false;
          };
          g.isMove = true;
        }
      };
    };
  }
})(ice);
