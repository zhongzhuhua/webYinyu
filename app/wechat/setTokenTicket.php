<?php  
	require_once $_SERVER['DOCUMENT_ROOT'].'/configs.php';
  require_once 'WechatUtil.php';

  $token = WechatUtil::setAccessToken();
  $ticket = WechatUtil::setJsApiTicket();

  echo $token.'<br>'.$ticket;
?>