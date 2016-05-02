<?php  
	require_once $_SERVER['DOCUMENT_ROOT'].'/app/util/ActionCommon.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/configs.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/app/util/Common.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/app/util/JsonResult.php';
	require_once $_SERVER['DOCUMENT_ROOT'].'/app/wechat/WechatUtil.php';

	$result = new JsonResult();
	try {
		$url = json_decode($GLOBALS['HTTP_RAW_POST_DATA'])->url;
		if(!empty($url)) {
			$signature = WechatUtil::buildSignature($url);

			$data = array(				
				'appid' => $signature['appId'],
				'timestamp' => $signature['timestamp'],
				'random' => $signature['nonceStr'],
				'signature' => $signature['signature']
			);
		}

		$result->value = $data;
		$result->post = $url;
    $result->success('');
	} catch(Exception $e) {
		$result->error($e->errorMessage());
	}

	echo gm::getJson($result);
?>