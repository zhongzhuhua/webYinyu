<?php 
  require_once $_SERVER['DOCUMENT_ROOT'].'/app/util/ActionCommon.php';
  require_once $_SERVER['DOCUMENT_ROOT'].'/app/util/WechatUtil.php';

  // 获取加密所需信息
  $signature = $_GET['signature'];
  $timestamp = $_GET['timestamp'];
  $nonce = $_GET['nonce'];
  // echostr null 或者 '' 的时候是第一次绑定域名，其他的则是用户互动
  $echostr = $_GET['echostr'];
  $resultStr = '';
 
  // 绑定域名的时候，校验 signature
  if($echostr) {
    $resultStr = WechatUtil::checkSignature($signature, $timestamp, $nonce, $echostr);  
  } else {
    // 获取微信 post 提交过来的 xml 数据
    $postStr = $GLOBALS['HTTP_RAW_POST_DATA'];

    // 如果数据不为空，则解析 xml 数据
    if(!empty($postStr)) {
      $postObj = gm::xmlToArray($postStr);
      $fromUsername = $postObj->FromUserName;
      $toUsername = $postObj->ToUserName;
      // 事件类型 [text][image][location][link][event事件推送]
      $eventType = strtolower(trim($postObj->msgType));
      // 事件名称 [subscribe订阅][unsubscribe][click]
      $eventName = strtolower(trim($postObj->Event));
      $time = time();
      $temp = "<xml>
        <ToUserName><![CDATA[%s]]></ToUserName>
        <FromUserName><![CDATA[%s]]></FromUserName>
        <CreateTime>%s</CreateTime>
        <MsgType><![CDATA[%s]]></MsgType>
        <Content><![CDATA[%s]]></Content>
        <FuncFlag>0</FuncFlag>
      </xml>";      

      // 默认回复
      $resultStr = 'welcome to ice!';
      $msgType = 'text'; 
      if($eventName == 'subscribe') {
        $resultStr = 'ICE欢迎您！';
      } 
      $resultStr = sprintf($temp, $fromUsername, $toUsername, $time, $msgType, $resultStr);
    }
  }

  echo $resultStr;
?>