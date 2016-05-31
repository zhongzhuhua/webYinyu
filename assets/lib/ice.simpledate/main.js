// 简单日历控件， success: funciont({getValue}) {}  , close: function({reset:function(){}})
(function(ice) {
  ice.simpledate = function(options) {
    var tempTopYear = '<div class="ic-top-sec"><span class="ic-top-icon ym">&lt;</span><span class="yv">{y}</span>年<span class="ic-top-icon ya">&gt;</span></div>';
    var tempTopMonth = '<div class="ic-top-sec"><span class="ic-top-icon mm">&lt;</span><span class="mv">{m}</span>月<span class="ic-top-icon ma">&gt;</span></div>';
    var tempTop = '<div class="ic-top">' + tempTopYear + tempTopMonth + '</div>';
    var tempMain = '<div class="ic-main"></div>';
    var tempButton = '<div class="ic-button">{text}</div>';
    var tempDate = '<div class="ic-date" data-value="{data}">{val}</div>';

    var g = {
      selector: '#ice-simpledate',
      // 初始化值，必须是 yyyy-MM-dd，如果是 null ，默认 def****，如果是 dom 的话，则或者 data-value
      initValue: null,
      defYear: '1955',
      defMonth: '1',
      defDate: '1',
      btntext: '关闭',
      nonetext: '点击选择日期',
      success: function() {},
      close: function() {}
    };

    g = ice.extend(g, options);

    _buildShadow();

    var $doms = ice.queryAll(g.selector);
    var len = $doms ? $doms.length : 0;
    for (var i = 0; i < len; i++) {
      var $dom = $doms[i];
      var $date = document.createElement('div');
      $date.className = 'ice-simpledate';
      document.body.appendChild($date);
      _close($date, $dom);

      var datas = _initValue();
      $date.setAttribute('data-value', datas.year + '-' + datas.month + '-' + datas.date);

      $date.innerHTML = tempTop.replace('{y}', datas.year).replace('{m}', datas.month) + tempMain + tempButton.replace('{text}', g.btntext);
      _buildMain($date, datas);
      _bindShow($date, $dom);
      _bindChoose($date, $dom);
      _bindClose($date, $dom);
      _bindIcon($date, datas); 

    };

    // 绑定切换日期
    function _bindIcon($date) {
      var $ymin = ice.query('.ym', $date);
      var $yadd = ice.query('.ya', $date);
      var $yval = ice.query('.yv', $date);
      var $mmin = ice.query('.mm', $date);
      var $madd = ice.query('.ma', $date);
      var $mval = ice.query('.mv', $date);

      $mmin.addEventListener(ice.tapClick, function(e) {
        datas.month = datas.month - 1;
        datas.month = datas.month <= 0 ? 12 : datas.month;
        $mval.innerHTML = datas.month;
        _buildMain($date, datas);
      });

      $madd.addEventListener(ice.tapClick, function(e) {
        datas.month = datas.month + 1;
        datas.month = datas.month >= 13 ? 1 : datas.month;
        $mval.innerHTML = datas.month;
        _buildMain($date, datas);
      });

      $ymin.addEventListener(ice.tapClick, function(e) {
        datas.year = datas.year - 1;
        $yval.innerHTML = datas.year;
        _buildMain($date, datas);
      });

      $yadd.addEventListener(ice.tapClick, function(e) {
        datas.year = datas.year + 1;
        $yval.innerHTML = datas.year;
        _buildMain($date, datas);
      });
    };

    // 创建日历
    function _buildMain($date, datas) {
      var oldval = $date.getAttribute('data-value');
      var $main = ice.query('.ic-main', $date);
      var len = new Date(datas.year, datas.month, 0).getDate();
      var html = '';
      for (var i = 1; i <= len; i++) {
        var val = datas.year + '-' + datas.month + '-' + i;
        if (val == oldval) {
          html += tempDate.replace('{val}', i).replace('{data}', val).replace('ic-date', 'ic-date ic-choose');
        } else {
          html += tempDate.replace('{val}', i).replace('{data}', val);
        }
      }
      $main.innerHTML = html;
    };

    // 打开日历 
    function _bindShow($date, $selector) {
      $selector.addEventListener(ice.tapClick, function(e) {
        $date.style['display'] = 'block';
        ice.query('.ice-simpledate-shadow').style['display'] = 'block';
      });
    };

    // 选择日期
    function _bindChoose($date, $selector) {
      $date.addEventListener(ice.tapClick, function(e) {
        ice.stopDefault(e);
        var ele = e.srcElement;
        var clazz = ele.className.toLowerCase();
        if (clazz.indexOf('ic-date') > -1) {
          _close($date, $selector);

          var $choose = ice.query('.ic-choose', $date);
          if ($choose) {
            $choose.className = 'ic-date';
          }
          ice.addClass(ele, 'ic-choose');

          if (ice.isFunction(g.success)) {
            g.success({
              getValue: function() {
                var val = ele ? ele.getAttribute('data-value') : _defaultValue();
                $date.setAttribute('data-value', val);
                return val;
              }
            });
          }
        }
      });
    };

    // 绑定关闭事件
    function _bindClose($date, $selector) {
      var $close = ice.query('.ic-button', $date);
      $close.addEventListener(ice.tapClick, function(e) {
        _close($date, $selector);

        if (ice.isFunction(g.close)) {
          g.close({
            reset: function() {
              $selector.setAttribute('data-year', g.defYear);
              $selector.setAttribute('data-month', g.defMonth);
              $selector.setAttribute('data-date', g.defDate);
            }
          });
        }
      });
    };

    // 关闭事件
    function _close($date, $selector) {
      $date.style['display'] = 'none';
      ice.query('.ice-simpledate-shadow').style['display'] = 'none';

      if($selector.innerHTML == '') {
        $selector.innerHTML = '<label style="color: #999;">' + g.nonetext + '</label>';
      }
    };

    // 初始化日期
    function _initValue() {
      var val = '';
      if (g.initValue != null) {
        if (typeof g.initValue != 'string') {
          val = g.initValue.getAttribute('data-value');
        } else {
          val = g.initValue;
        }
      }
      if (val == null || val == '') {
        val = _defaultValue();
      }
      var arrs = val.split('-');
      return {
        year: ice.parseInt(arrs[0]),
        month: ice.parseInt(arrs[1]),
        date: ice.parseInt(arrs[2])
      };
    };

    // 默认值
    function _defaultValue() {
      return g.defYear + '-' + g.defMonth + '-' + g.defDate;
    };

    // 阴影层
    function _buildShadow() {
      if(!ice.query('.ice-simpledate-shadow')) {
        var dom = document.createElement('div');
        dom.className = 'ice-simpledate-shadow';
        document.body.appendChild(dom);
      }
    };
  };
})(ice);
