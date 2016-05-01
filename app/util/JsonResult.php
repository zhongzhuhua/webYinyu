<?php
  // 公用系统返回数据 
  class JsonResult {

    // 200：处理成功
    // 301：没有权限
    // 302：要求登录
    // 307：页面跳转。跳转的路径由 value.url 返回
    // 400：处理异常。code 会返回错误码，msg 返回提示信息
    // 404：数据不存在
    // 503：数据不可用
    public $status = -1;
    public $msg = '系统繁忙';
    public $value;
    public $timestamp;

    function __construct() {
      $this->value = array();
      $this->timestamp = time();
    }

    public function error($_msg, $code = 1) {
      $this->status = $code;
      $this->msg = $_msg;
    }

    public function success($_msg) {
      $this->status = 200;
      $this->msg = $_msg;
    }
  }
?>