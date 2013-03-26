<?php
// /*
//  * makes use of the following arguments:
//  * asn: answerSpace name
//  * iact: interaction link name
//  * cat: (category) (optional)
//  * mcat: (master category) (optional)
//  * TODO: allow passing last-fetch-time so caching can be honored
//  */

// // $microtime = array();
// // $microtime['start'] = microtime(true);

// // *** BASIC ERROR CHECKING WITH RESPONSE CODES ***

// // session_cache_limiter('nocache');

// // if (empty($_REQUEST['asn']) || empty($_REQUEST['iact'])) {
// // 	header('HTTP/1.1 400 Bad Request', true, 400);
// // 	exit('answerSpace (asn) and interaction (iact) must be specified');
// // }

set_include_path('../../../includes/');
// // require_once 'tools.php';
// // dispelAllMagic();

require_once 'adodb5/adodb.inc.php';
require_once 'adodb5/adodb-exceptions.inc.php';
require_once 'answers_config.inc.php';

session_start();

$db = BlinkPlatformConfig::openMainDatabaseConnection();
if (!$db) {
	header('HTTP/1.1 500 Internal Server Error', true, 500);
	exit('unable to open main database connection');
}

// // $microtime['db_connection'] = microtime(true) - $microtime['start'];

// // require_once 'tools.php';
// // $headers = getRequestHeaders();
// // $configHeader = json_decode($headers['X-Blink-Config'], true);

// // $message = array();

// // if (!is_array($_SESSION['mydot_device'])) {
// // 	$_SESSION['mydot_device'] = array();
// // }
// // if (is_array($configHeader['conditions'])) {
// // 	$_SESSION['mydot_device']['features'] = $configHeader['conditions'];
// // } else {
// // 	if (empty($_SESSION['mydot_device']['features'])) {
// // 		require_once 'Tera-WURFL/TeraWurfl.php';
// // 		require_once 'deviceConfig/DeviceIdentifier.php';
// // 		$di = new DeviceIdentifier($_SERVER['HTTP_USER_AGENT']);
// // 		$_SESSION['mydot_device']['features'] = $di->features;
// // 	}
// // }

// // $microtime['device_detection'] = microtime(true) - $microtime['start'];

require_once 'deviceConfig/SettingsParser.php';
$sp = SettingsParser::resurrect($db, get_include_path() . 'deviceConfig/answerSpace.xml');
require_once 'deviceConfig/FeatureProcessor.php';
require_once 'deviceConfig/config.php';

// // $microtime['settings_parser'] = microtime(true) - $microtime['start'];

// // // *** FETCH ANSWER SPACE ***

// // if (!empty($_REQUEST['asn'])) {
	$db->SetFetchMode(ADODB_FETCH_ASSOC);
	$rs = $db->Execute('SELECT * FROM answer_space WHERE uid = ?', array($_REQUEST['asn']));
	if ($rs === false || empty($rs->fields)) {
		header('HTTP/1.1 404 Not Found', true, 404);
		exit('answerSpace ' . $_REQUEST['asn'] . ' could not be located');
	}
	$answer_space_id = $rs->fields['id'];
	$asConfig = new Config($rs->fields, $_SESSION['mydot_device']['features'], $sp);
    $asConfig = $asConfig->config['pertinent'];



    if (is_numeric($_REQUEST['iact'])) {
        $db->SetFetchMode(ADODB_FETCH_ASSOC);
    	$rs = $db->Execute('SELECT keyword FROM keyword WHERE id = ?', array($_REQUEST['iact']));
	    if ($rs === false || empty($rs->fields)) {
		    header('HTTP/1.1 404 Not Found', true, 404);
    		exit('interaction id ' . $_REQUEST['iact'] . ' could not be located');
        }
        $interaction = $rs->fields['keyword'];
    } else {
        $interaction = $_REQUEST['iact'];
    }







// // 	$microtime['answerSpace_fetched'] = microtime(true) - $microtime['start'];
// // }

// // // *** FETCH INTERACTION ***

// $db->SetFetchMode(ADODB_FETCH_ASSOC);
// $rs = $db->Execute('SELECT * FROM keyword WHERE keyword = ? AND answer_space_id = ?', array($_REQUEST['iact'], $answer_space_id));
// if ($rs === false || empty($rs->fields)) {
// 	header('HTTP/1.1 404 Not Found', true, 404);
// 	exit('interaction could not be located');
// } else {
// 	$answer_space_id = $rs->fields['answer_space_id'];
// 	$config = new Config($rs->fields, $_SESSION['mydot_device']['features'], $sp);
// 	$config = $config->config['pertinent'];
// }

// // $_SESSION['mydot_user']['answer_space_id'] = $answer_space_id;
// // $microtime['interaction_fetched'] = microtime(true) - $microtime['start'];

// // if ($config['registeredOnly'] === 'deny anonymous' && empty($_SESSION['mobile_number'])) {
// // 	header('HTTP/1.1 403 Forbidden', true, 403);
// // 	exit('anonymous access to interaction ' . $_REQUEST['_i'] . ' denied');
// // }
// // require_once 'iphone_tools.php';
// // /* TODO: get restricted access interactions working again
// //  if ($result->restricted == "yes") {
// //  if (!haspermission($db, $answer_space_id, $answerSpace, $result->id)) {
// //  echo "No Data";
// //  die();
// //  }
// //  }
// //  */

// // require_once 'blink/bic/Interaction.php';
// // \Blink\BIC\Interaction::$db = $db;
// // $interaction = new \Blink\BIC\Interaction($config, $answer_space_id);

// // $returnValue = $interaction->toHTML();

// // $microtime['access_verified'] = microtime(true) - $microtime['start'];

// // // *** FETCH ANSWER SPACE (IF NOT DONE EARLIER) ***

// // if (empty($answerSpace)) {
// // 	$db->SetFetchMode(ADODB_FETCH_ASSOC);
// // 	$rs = $db->Execute('SELECT * FROM answer_space WHERE id = ?', array($answer_space_id));
// // 	if ($rs === false || empty($rs->fields)) {
// // 		header('HTTP/1.1 404 Not Found', true, 404);
// // 		exit('answerSpace with ID ' . $answer_space_id . ' (associated with interaction with ID ' . $_REQUEST['_i'] . ') could not be located');
// // 	}
// // 	$answerSpace = new Config($rs->fields, $_SESSION['mydot_device']['features'], $sp);
// // 	$answerSpace = $answerSpace->config['pertinent'];
// // 	$microtime['answerSpace_fetched'] = microtime(true) - $microtime['start'];
// // } 

// // *** BUILD RESULT ***

// header('Content-Type: application/json');

// //$microtime['end'] = microtime(true) - $microtime['start'];
// //print_r($microtime);

// echo json_encode($config);

// Ron's BIC thang
require_once('blink/bic/getConfigs.php');
require_once('tools.php');

// BB's BIC Components
require_once('blink/bic/router.php');
require_once('blink/bic/requestHandlers.php');
require_once('blink/bic/views.php');
require_once('blink/bic/renderer.php');

// Pull in the CDN's
require_once('blink/cdn/PlatformCDN.php');
\Blink\CDN\PlatformCDN::setConfig(BlinkPlatformConfig::$CDN_PLATFORM);
$cdnp = new \Blink\CDN\PlatformCDN();

require_once('blink/cdn/cdn_factory.php');
$defaultLoc = \Blink\CDN_Factory::getDefaultLocation($answer_space_id);
$cdna = \Blink\CDN_Factory::openCDN($asConfig['cdnLocation'], $answer_space_id);

$renderer = new Renderer();
$handler = new RequestHandler();

$getConfigs = new GetConfigs();

//$content = $router->route($_SERVER['REQUEST_URI'], $_REQUEST, $handler, $renderer, $answer_space_id, $asConfig, $cdnp, $cdna, $getConfigs);
$content = $handler->objects(array($_REQUEST['asn'], $interaction), array_key_exists('args', $_REQUEST) ? $_REQUEST['args'] : NULL, $renderer, $answer_space_id, array(), $cdnp, $cdna, $getConfigs);

//$configs = $getConfigs->getConfigsByNames($_REQUEST['iact']);
//$args = $_REQUEST['args'] ? $_REQUEST['args'] : NULL;
//$content = $handler->contentify(array($_REQUEST['iact']), $args, $renderer, $answer_space_id, $asConfig, $cdnp, $cdna, $getConfigs);

//echo $content;

// echo $content['header'];
// echo '<div data-role="content">';
// echo $content['content'];
// echo '</div>';
// echo $content['footer'];

if (!$content['name']){
	$content['name'] = $_REQUEST['asn'];
}

if (array_key_exists('type', $content) && $content['type'] === 'xslt'){
    $content['content'] = '';
}

if (array_key_exists('inputPrompt', $content)){
    $content['inputPrompt'] = getInputs($content['inputPrompt']);
}

if (!$content['_id']){
    $content['_id'] = $content['name'];
}

header('Content-Type: application/json');
echo json_encode($content);
