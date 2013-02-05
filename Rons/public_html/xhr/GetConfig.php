<?php

/*
 * makes use of the following arguments:
 * _t (type) = a (answerSpace) | i (interaction) | c (category) | m (master category)
 * _h (hash) = crc32 | md5 | sha1 : hexadecimal hash
 * _id (answerSpace ID)
 *
 * // TODO: allow last-checked time to be specified
 */

// *** BASIC ERROR CHECKING WITH RESPONSE CODES *** 

/* these responses may have a message body
header('HTTP/1.1 403 Forbidden', true, 403);
header('HTTP/1.1 500 Internal Server Error', true, 500);
*/

$_REQUEST['_id'] = isset($_REQUEST['_id']) ? $_REQUEST['_id'] : null;
$_REQUEST['_asn'] = isset($_REQUEST['_asn']) ? $_REQUEST['_asn'] : null;

set_include_path('../../../includes/');
require_once 'tools.php';
dispelAllMagic();

$headers = getRequestHeaders();
if (!empty($headers['X-Blink-Config'])) {
  $configHeader = json_decode($headers['X-Blink-Config'], true);
}
if (!isset($configHeader) || !is_array($configHeader)) {
  $configHeader = array();
}
$answerSpaceId = empty($configHeader['answerSpaceId']) ? $_REQUEST['_id'] : $configHeader['answerSpaceId'];
$uid = empty($configHeader['answerSpace']) ? $_REQUEST['_asn'] : $configHeader['answerSpace'];

if (empty($answerSpaceId) && empty($uid)) {
	header('HTTP/1.1 400 Bad Request', true, 400);
	exit('answerSpace ID (_id) and name (_asn) not found');
}

$hashType = $hashSum = '';
if (!empty($_REQUEST['_h'])) {
	if (strpos($_REQUEST['_h'], ':') === false) {
		header('HTTP/1.1 400 Bad Request', true, 400);
		exit('Hash (_h) should be of the form <type>:<hashsum>');
	}
	$hashType = explode(':', $_REQUEST['_h']);
	$hashSum = $hashType[1];
	$hashType = $hashType[0];
	switch($hashType) {
	case 'crc32':
		$hashLength = 8;
		break;
	case 'md5':
		$hashLength = 32;
		break;
	case 'sha1':
		$hashLength = 40;
		break;
	default:
		header('HTTP/1.1 400 Bad Request', true, 400);
		exit('unexpected Hash Type in _h: must be either crc32, md5 or sha1 (recommended)');
	}
	if (strlen($hashSum) !== $hashLength) {
		header('HTTP/1.1 400 Bad Request', true, 400);
		exit('unexpected length of Hash in (_h) according to Hash Type');
	}
}

require_once 'adodb5/adodb.inc.php';
require_once 'adodb5/adodb-exceptions.inc.php';
require_once 'answers_config.inc.php';

$db = BlinkPlatformConfig::openMainDatabaseConnection();
if (!$db) {
	header('HTTP/1.1 500 Internal Server Error', true, 500);
	exit('unable to open main database connection');
}

// *** BUILD CONFIG ***

session_cache_limiter('nocache');
session_start();

$message = array();

if (!is_array($_SESSION['mydot_device'])) {
	$_SESSION['mydot_device'] = array();
}
if (isset($configHeader['conditions']) && is_array($configHeader['conditions'])) {
	$_SESSION['mydot_device']['features'] = $configHeader['conditions'];
} else {
	if (empty($_SESSION['mydot_device']['features'])) {
		require_once 'Tera-WURFL/TeraWurfl.php';
		require_once 'deviceConfig/DeviceIdentifier.php';
		$di = new DeviceIdentifier($_SERVER['HTTP_USER_AGENT']);
		$_SESSION['mydot_device']['features'] = $di->features;
	}
}

// TODO: only require these if config generation is definitely required
require_once 'deviceConfig/SettingsParser.php';
$sp = SettingsParser::resurrect($db, get_include_path() . 'deviceConfig/answerSpace.xml');
require_once 'deviceConfig/FeatureProcessor.php';
require_once 'deviceConfig/config.php';

$tables = array(
	'a' => 'answer_space',
	'i' => 'keyword',
	'c' => 'category',
	'm' => 'master_category'
);

// *** ANSWERSPACE ***
$sql = <<< EOF
SELECT `id`, LOWER(`uid`) AS `uid`, `config`, `registered_only`, `tags`
FROM answer_space
WHERE id = ? OR uid = ? LIMIT 1
EOF;
$rs = $db->Execute($sql, array($answerSpaceId, $uid));
if ($rs !== false && !empty($rs->fields)) {
  $item = 'a' . $rs->fields['id'];
  $message[$item] = new Config($rs->fields, $_SESSION['mydot_device']['features'], $sp);
  $message[$item] = $message[$item]->config;
  unset($message[$item]['pertinent']['userGroups']);
  $answerSpaceId = $rs->fields['id'];
  $uid = $rs->fields['uid'];
}

// *** BUILD MAP ***

function getUserId() {
  if (empty($_SESSION['mobile_number'])) { return false; }
  global $answerSpaceId, $db;
  if (!$_SESSION['mydot_user'][$uid]['user_id']) {
    $db->SetFetchMode(ADODB_FETCH_ASSOC);
    $sql = 'SELECT `id` FROM `user` WHERE `answer_space_id` = ? AND `mobile_number` = ?';
    $rs = $db->Execute($sql, array($answerSpaceId, $_SESSION['mobile_number']));
    if ($rs === false || empty($rs->fields)) { return false; }
    $_SESSION['mydot_user'][$uid]['user_id'] = $rs->fields['id'];
  }
  return $_SESSION['mydot_user'][$uid]['user_id'];
}

$db->SetFetchMode(ADODB_FETCH_NUM);
require_once 'deviceConfig/answerSpaceMap.php';
$siteMap = new answerSpaceMap($answerSpaceId);
if (isset($_SESSION['mydot_user'][$uid]['account'], $_SESSION['mydot_user'][$uid]['account']['groups'])) {
  $message['map'] = $siteMap->retrieve($_SESSION['mydot_user'][$uid]['account']['groups']);
} else {
  $message['map'] = $siteMap->retrieve(getUserId());
}

// scrub references to Master Categories (deprecated feature)
foreach($message['map']['masterCategories'] as $item) {
  unset($message['map']['m' . $item]);
}
unset($message['map']['masterCategories']);


$_POST['items'] = array();
foreach($message['map']['categories'] as $item) {
  $_POST['items'][] = 'c' . $item;
}
foreach($message['map']['interactions'] as $item) {
  $_POST['items'][] = 'i' . $item;
}

$db->SetFetchMode(ADODB_FETCH_ASSOC);
$inInteractions = implode(',', $message['map']['interactions']);
$inCategories = implode(',', $message['map']['categories']);

$sqlInteractions = false;
if (!empty($message['map']['interactions'])) {
  $sqlInteractions = <<< EOF
SELECT `id`, `keyword` AS `name`, 'i' AS `table`,
  `order`, `status`, `config`, `registered_only`, `tags`
FROM `keyword`
WHERE `status` != 'inactive'
  AND `keyword` != ''
  AND `id` IN ($inInteractions)
EOF;
}

$sqlCategories = false;
if (!empty($message['map']['categories'])) {
  $sqlCategories = <<< EOF
SELECT `id`,  `name`, 'c' AS `table`,
  `order`, `status`, `config`, `registered_only`, `tags`
FROM category
WHERE status != 'inactive'
  AND `name` != ''
  AND `id` IN ($inCategories)
EOF;
}

if ($sqlInteractions && $sqlCategories) {
  $sql = <<< EOF
( $sqlInteractions )
UNION
( $sqlCategories )
EOF;
} else {
  $sql = $sqlInteractions ? $sqlInteractions : $sqlCategories;
}
$sql .= 'ORDER BY `name`';

$rs = $db->Execute($sql);
while ($row = $rs->FetchRow()) {
	try {
    $item = $row['table'] . $row['id'];
    $message[$item] = new Config($row, $_SESSION['mydot_device']['features'], $sp);
    $message[$item] = $message[$item]->config;
    unset($message[$item]['pertinent']['madl']);
    unset($message[$item]['pertinent']['userGroups']);
    if (empty($message[$item]['pertinent']['tags'])) {
      $message[$item]['pertinent']['tags'] = array('nav-' . strtolower($uid));
    }
    if (!empty($message[$item]['pertinent']['inputPrompt'])) {
      $message[$item]['pertinent']['inputPrompt'] = getInputs($message[$item]['pertinent']['inputPrompt']);
    }
    if (!empty($message[$item]['pertinent']['xsl'])) {
      require_once 'iphone_tools.php';
      $message[$item]['pertinent']['xsl'] = ajaxifyURLs($message[$item]['pertinent']['xsl'], $_SESSION['mydot_user']['answer_space_id'], $message[$item]['pertinent']['name']);
    }
	} catch (Exception $e) {
		unset($message[$item]);
		if (!isset($message['errors']) || !is_array($message['errors'])) {
			$message['errors'] = array();
		}
		$message['errors'][$item] = $e->getMessage();
	}
}

// *** FINALISE JSON ***

// TODO: work out how best to reduce unnecessary downloads
/*
$json = json_encode($config);

switch($hashType) {
case 'crc32':
	$hash = crc32($json);
	$hash &= 0xffffffff;
	$hash = str_pad(strtoupper(dechex($hash)), 8, "0", STR_PAD_LEFT);
	break;
case 'md5':
	$hash = md5($json);
	break;
case 'sha1':
default:
	$hashType = 'sha1';
	$hash = sha1($json);
	break;
}

if ($hash === $hashSum) {
	header('HTTP/1.1 304 Not Modified', true, 304);
	exit;
}
*/
header('Content-Type: application/json');

$message['deviceFeatures'] = $_SESSION['mydot_device']['features'];
//$message['hash'] = $hashType . ':' . $hash;

echo json_encode($message);