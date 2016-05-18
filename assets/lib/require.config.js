var myargs = '003.';
require.config({
  baseUrl: '/assets/',
  urlArgs: '',
  paths: {
    'global': 'js/gm/global.js?v=' + myargs + '002',
    'wechat': 'js/gm/wechat.js?v=' + myargs + '002',
    'layer': 'lib/layer.mobile/layer/layer.js?v=' + myargs + '002'
  }
});
