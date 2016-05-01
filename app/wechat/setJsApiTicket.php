<?php  
	require_once $_SERVER['DOCUMENT_ROOT'].'/configs.php';
  require_once 'WechatUtil.php';

  $result = WechatUtil::setJsApiTicket();

  echo $result;
?>