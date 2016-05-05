var myargs = '001.';
require.config({
  baseUrl: '/assets/',
  urlArgs: '',
  paths: {
    'global': 'js/gm/global.js?v=' + myargs + '001',
    'wechat': 'js/gm/wechat.js?v=' + myargs + '001',
    'layer': 'lib/layer.mobile/layer/layer.js?v=' + myargs + '001'
  }
});
