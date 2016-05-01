<?php
  // 公用类 
  class gm {

    // ================== 日志操作 ======================

    /** 
     * 记录系统日志
     * @param type 错误位置 action bll
     * @param mess 错误信息
     */
    public static function log($type, $mess) {
      return;
    } 

    // ================== 日志操作 ======================



    // ================== http ==========================

    /**
     * http 请求
     * @param url 要请求的地址
     * @param data 要请求的数据
     */
    public static function http($url, $data = '') {
      try {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        if (!empty($data)){
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($curl);
        curl_close($curl);
        return $output;
      } catch(Exception $e) {
        return '';
      }
    }

    // ================== http ==========================


    // ================== 字符串操作 ======================

    /** 
     * 将 xml 数据转成hash数组
     * @param xml 数据
     * @return array 返回解析后的hash数组
     */
    public static function xmlToArray($xml) {
      $result;
      if(!empty($xml)) {
        libxml_disable_entity_loader(true);
        return simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);
      } 
      return $result;
    }

    /** 把数组或者对象转成 json 字符串
     * @param jsonResult 数组或者 JsonResult 
     * @return 返回 json 字符串
     */
    public static function getJson($jsonResult) {
      try {
        $jsonResult === null ? new JsonResult() : $jsonResult;
      } catch (Exception $e) {
        $jsonResult = new JsonResult();
      }
      return json_encode($jsonResult);
    }

    /**
     * 过滤攻击字符串，返回非 null 字符串
     * @param str 要过滤的字符串
     * @return 返回过滤后的字符串
     */
    public static function removeAttr($str){
      if($str === null){
        return "";
      }
      $str = str_replace("'","''",$str);
      return $str;
    }

    // ================== 字符串操作 ======================



    // ================== Session ======================

    /**
     * 获取 session
     * @param key string
     * @return object
     */
    public static function getSession($key) {
      if(is_null($key)) return '';
      return $_SESSION['gm_'.$key];
    }

    /**
     * 设置 session
     * @param key string
     * @param val object
     */
    public static function setSession($key, $val) {
      if(is_null($key)) return;
      $_SESSION['gm_'.$key] = $val;
    }

    /**
     * 删除 session
     * @param key string
     */
    public static function removeSession($key) {
      if(is_null($key)) return;
      unset($_SESSION['gm_'.$key]);
    }

    // ================== Session ======================




    // ================== 校验 ======================

    // 获取校验提示字符串
    public static function regMess($key) {
      static $configs = array(
        needLogin => '请先登录',
        mobile => '请输入正确的手机号码',
        mobileCheck => '请输入接收验证码的手机号',
        email => '请输入正确的邮箱',
        name => '请输入正确的姓名',
        area => '请选择正确的省市',
        address => '请输入正确的地址',
        pass => '请输入正确的密码',
        user => '请输入正确的用户名',
        code => '请输入正确的验证码',
        login => '请输入正确的登录名',
        userE => '用户名已被注册',
        mobileE => '手机号已被注册',
        noRegister => 'noRegister'
      );
      return $configs[$key];
    }

    // 是否为空
    public static function isNull($str) {
      return is_null($str) || $str == '';
    }

    // 校验是否数字
    public static function regInt($str){
      return preg_match("/^([-]{0,1}((0)|([1-9][0-9]*)))$/", $str);
    }

    // 校验是否手机
    public static function regMobile($str){
      return preg_match("/^[1][3-9][0-9]{9}$/",$str);
    }

    // 校验邮箱
    public static function regEmail($str){
      return preg_match("/^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/",$str);
    }

    // 校验用户名
    public static function regUser($str) {
      return preg_match("/^[a-zA-Z][a-zA-Z0-9_\-]{2,16}$/", $str);
    }

    // 校验登录名
    public static function regLogin($str) {
      return preg_match("/^([a-zA-Z0-9_\-\.]+@[a-zA-Z0-9]+\.[a-zA-Z]+)|([1][3-9][0-9]{9})$/", $str);
    }

    // 校验密码
    public static function regPass($str) {
      return preg_match("/^[a-zA-Z0-9_\-]{6,16}$/", $str);
    }

    // 校验姓名
    public static function regName($str) {
      return preg_match("/^[A-Za-z0-9_\-\x{4e00}-\x{9fa5}]{2,16}$/u", $str);
    }

    // 校验地址
    public static function regAddress($str) {
      return preg_match("/^[A-Za-z0-9_\-\x{4e00}-\x{9fa5}]{6,50}$/u", $str);
    }

    // 校验省市县
    public static function regArea($str) {
      return preg_match("/^[0-9]{6}$/", $str);
    }

    // ================== 校验 ======================





    /**
     * 生产随机码
     * @param len int 生成的长度
     * @param type int 0=数字 1=数字和字符
     * @return 返回字符串
     */
    public static function getcode($len = 4, $type = 0) {
      $len = gm::regInt($len) ? 4 : $len;
      if($len <= 0 || $len >= 9) {
        $len = 4;
      }
      $chars = '0123456789';
      if ($type === 1) {
        $chars = $chars.'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      }
      $result = '';
      for ($i = 0; $i < $len; $i++) {
        $result = $result.$chars[mt_rand(0, strlen($chars) - 1)];
      }
      return $result;
    }

    // 转换成日期字符串 yyyy-mm-dd hh:mm:ss 格式
    public static function changeToDateString($str, $format = 'Y-m-d H:i:s') {
      date_default_timezone_set('prc');
      $is_date = strtotime($str) ? strtotime($str) : false;
      if($is_date === false){
        return date($format, time());
      }
      return date($format, $is_date);
    }

    // 获取 yyyy-mm-dd hh:mm:ss:fff
    public static function getNowTime() {
      $nowtime = microtime() * 1000;
      $utimestr = gm::changeToDateString($nowtime);
      return $utime = $utimestr.'.'.substr($nowtime, -3);
    }

    // 生成订单编号
    public static function getOrderNo() {
      return date('YmdHis').substr(implode(NULL, array_map('ord', str_split(substr(uniqid(), 7, 13), 1))), 0, 8);
    }

    // 绘制验证码图片
    public static function buildCodeImg($str, $size = 20, $width = 50, $height = 26) {
      @ header("Content-Type:image/png");
      //创建一个图层
      $im = imagecreate($width, $height);
      //背景色
      $back = imagecolorallocate($im, 0xFF, 0xFF, 0xFF);
      //模糊点颜色
      $pix  = imagecolorallocate($im, 187, 230, 247);
      //字体色
      $font = imagecolorallocate($im, 41, 163, 238);
      //绘模糊作用的点
      mt_srand();
      for ($i = 0; $i < 1000; $i++) {
         imagesetpixel($im, mt_rand(0, $width), mt_rand(0, $height), $pix);
      }
      //输出字符
      imagestring($im, 5, 7, 5, $str, $font);
      //输出矩形
      imagerectangle($im, 0, 0, $width -1, $height -1, $font);
      //输出图片
      imagepng($im);
      imagedestroy($im);
    }
  }
?>
