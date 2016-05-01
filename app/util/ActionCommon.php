<?php 
  if (!session_id()) {
    session_start();
  } 
  error_reporting(0);
  ini_set('zlib.output_compression', 'On');
  ini_set('zlib.output_compression_level', '4');
  // error_reporting(E_ERROR | E_WARNING | E_PARSE);
  // 引用公用类
  require_once $_SERVER['DOCUMENT_ROOT'].'/app/util/Common.php';

  // 缓存设置
  header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
  header("Last-Modified: ".gmdate("D, d M Y H:i:s")." GMT");
  header('Cache-Control:no-store,no-cache,must-revalidate');
  header("Cache-Control:post-check=0,pre-check=0", false);
  header('Pragma:no-cache');
?>