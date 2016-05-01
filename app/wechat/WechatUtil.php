<?php
  require_once $_SERVER['DOCUMENT_ROOT'].'/configs.php';
  require_once $_SERVER['DOCUMENT_ROOT'].'/app/util/Common.php';

  // 微信工具类 
  class WechatUtil {

    // 获取 access_token 的地址
    static $tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s';

    // 获取 jsapi_ticket 的地址
    static $ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=%s';

    // access_token 存放路径
    static $tokenPath = '/cache/wechatToken.txt';

    // jsapi_ticket 存放路径
    static $ticketPath = '/cache/wechatTicket.txt';    

    /**
     * 校验微信加密签名 
     * @param signature 加密签名
     * @param timestamp 时间戳
     * @param nonce 随机数
     * @param echostr 加密成功后的返回值
     */
    static function checkSignature($signature, $timestamp, $nonce, $echostr) {
      $token = configs::$wechat['token'];
      // 微信加密签名算法
      $tmpArr = array($token, $timestamp, $nonce);
      sort($tmpArr, SORT_STRING);
      $tmpArr = implode($tmpArr);
      $tmpStr = sha1($tmpArr);

      // 判断是否加密成功
      return $tmpStr == $signature ? $echostr : '';
    }

    /**
     * 获取当前 url 对应的 signature 解析结果
     * @param url 当前全路径，不包含 #
     * @return 解析后的 signature
     */
    static function buildSignature($url) {
      $jsapiTicket = WechatUtil::getJsApiTicket();
      $timestamp = time();
      $nonceStr = WechatUtil::createNonceStr();

      // 这里参数的顺序要按照 key 值 ASCII 码升序排序
      $string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$url";

      $signature = sha1($string);

      $signPackage = array(
        "appId"     => configs::$wechat['appid'],
        "nonceStr"  => $nonceStr,
        "timestamp" => $timestamp,
        "url"       => $url,
        "signature" => $signature,
        "rawString" => $string
      );
      return $signPackage;
    }

    // 随机字符串
    static function createNonceStr($length = 16) {
      $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      $str = "";
      for ($i = 0; $i < $length; $i++) {
        $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
      }
      return $str;
    }

    /**
     * 获取微信 access_token
     */
    static function getAccessToken() {
      $result = '';
      try {
        $result = file_get_contents($_SERVER['DOCUMENT_ROOT'].WechatUtil::$tokenPath);
      } catch(Exception $e) {
        $result = '';
      }
      return $result;
    }

    /**
     * 获取 jsapi_ticket
     */
    static function getJsApiTicket() {
      $result = '';
      try {
        $result = file_get_contents($_SERVER['DOCUMENT_ROOT'].WechatUtil::$ticketPath);
      } catch(Exception $e) {
        $result = '';
      }
      return $result;
    }

    /**
     * 设置微信 access_token
     */
    static function setAccessToken() {
      // 如果获取不到 token 则请求微信获取地址
      $token = '';
      $myfile = null;
      try {
        $url = sprintf(WechatUtil::$tokenUrl, configs::$wechat['appid'], configs::$wechat['appsecret']);
        

        // 获取 access_token 
        $result = gm::http($url);

        // 解析 json {"access_token":"ACCESS_TOKEN","expires_in":7200}
        $json = json_decode($result, true);

        // 设置 access_token
        $token = $json['access_token'];

        // 存放 token
        $myfile = fopen($_SERVER['DOCUMENT_ROOT'].WechatUtil::$tokenPath, 'w+');
        fwrite($myfile, $token);
        fclose($myfile);

      } catch(Exception $e) { 
        if($myfile != null) fclose($myfile);
        throw $e;
      }

      return $token;
    }

    /**
     * 设置微信 jsapi_ticket
     */
    static function setJsApiTicket() {
      $ticket = '';
      $token = WechatUtil::getAccessToken();
      $myfile = null;

      try {
        $url = sprintf(WechatUtil::$ticketUrl, $token);

        // 获取 access_token 
        $result = gm::http($url);

        // 解析 json {"ticket:"","expires_in":7200 ... }
        $json = json_decode($result, true);

        // 设置 jsapi_ticket
        $ticket = $json['ticket'];

        // 存放 ticket
        $myfile = fopen($_SERVER['DOCUMENT_ROOT'].WechatUtil::$ticketPath, 'w+');
        fwrite($myfile, $ticket);
        fclose($myfile);

      } catch(Exception $e) { 
        if($myfile != null) fclose($myfile);
        throw $e;
      }

      return $ticket;
    }
  }
?>