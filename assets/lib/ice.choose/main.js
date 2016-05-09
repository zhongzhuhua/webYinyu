(function(ice) {
  if (ice != null) {
    // 标签切换
    ice.choose = function(o) {
      var options = {
        selector: '',
        // 切换的子元素选择器
        children: 'div',
        // 选中时附加的 class 样式
        chooseClass: '',
        // 默认选中下标，如果是 dom 数组，则为对应 selector 的选中元素
        chooseIndex: 0,
        // function 绑定 click 事件执行的方法
        success: null
      };
      options = ice.extend(options, o);

      // 查询标签
      var $selector = ice.queryAll(options.selector);
      var len = $selector == null ? 0 : $selector.length;
      for (var i = 0; i < len; i++) {
        var $domSel = $selector[i];
        // 是否已经绑定事件
        var isbind = $domSel.getAttribute('ichoose');
        if (isbind !== '1') {
          $domSel.setAttribute('ichoose', '1');
          navBind($domSel, options, i);
        }
      }
    };

    // 绑定选择事件
    function navBind($domSel, options, i) {
      var clazz = options.chooseClass;
      var isfun = ice.isFunction(options.success);
      // 查询绑定子项
      var $doms = ice.queryAll(options.children, $domSel);
      var len = $doms == null ? 0 : $doms.length;
      if (len > 0) {
        var $choose = null;
        var cidx = options.chooseIndex;
        if (cidx != null) {
          if (typeof cidx == 'number') {
            $choose = $doms[options.chooseIndex];
          } else if (cidx.length >= i) {
            $choose = options.chooseIndex[i];
          }
        }
        ice.addClass($choose, options.chooseClass);

        for (var i = 0; i < len; i++) {
          (function(idx) {
            var $dom = $doms[idx];
            // 添加绑定事件方法
            $dom.addEventListener(ice.tapClick, function(e) {
              ice.removeClass($choose, clazz);
              ice.addClass($dom, clazz);
              $choose = $dom;
              if (isfun) {
                options.success($dom, $domSel);
              }
            });
          })(i);
        }
      }
    };
  }
})(ice);
