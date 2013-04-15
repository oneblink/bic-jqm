<?php
/*
 * makes use of the following arguments:
 * asn: answerSpace name
 * ds: Data Suitcase name
 */

set_include_path('../../../includes/');

require_once 'adodb5/adodb.inc.php';
require_once 'adodb5/adodb-exceptions.inc.php';
require_once 'answers_config.inc.php';

session_start();

$db = BlinkPlatformConfig::openMainDatabaseConnection();
if (!$db) {
	header('HTTP/1.1 500 Internal Server Error', true, 500);
	exit('unable to open main database connection');
}
	
$db->SetFetchMode(ADODB_FETCH_ASSOC);
$rs = $db->Execute('SELECT * FROM answer_space WHERE uid = ?', array($_REQUEST['asn']));
if ($rs === false || empty($rs->fields)) {
	header('HTTP/1.1 404 Not Found', true, 404);
	exit('Data Suitcase ' . $_REQUEST['ds'] . ' could not be located');
}
$answer_space_id = $rs->fields['id'];

$db->SetFetchMode(ADODB_FETCH_ASSOC);
$rs = $db->Execute('SELECT * FROM `object` WHERE `answer_space_id` = ? AND `key` = ? ORDER BY `updated_time` DESC LIMIT 1', array($answer_space_id, $_REQUEST['ds']));
//$rs = $db->Execute('SELECT * FROM answer_space WHERE uid = ?', array($_REQUEST['asn']));
if ($rs === false || empty($rs->fields)) {
	header('HTTP/1.1 404 Not Found', true, 404);
	exit('Data Suitcase ' . $_REQUEST['ds'] . ' could not be located');
}

header('Content-Type: application/json');

$ds['data'] = $rs->fields['data'];
//$ds['name'] = $_REQUEST['ds'];
$ds['_id'] = $_REQUEST['ds'];

echo json_encode($ds);
