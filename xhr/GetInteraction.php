<?php
// /*
//  * makes use of the following arguments:
//  * asn: answerSpace name
//  * iact: interaction link name
//  * cat: (category) (optional)
//  * mcat: (master category) (optional)
//  * TODO: allow passing last-fetch-time so caching can be honored
//  */


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

require_once 'deviceConfig/SettingsParser.php';
$sp = SettingsParser::resurrect($db, get_include_path() . 'deviceConfig/answerSpace.xml');
require_once 'deviceConfig/FeatureProcessor.php';
require_once 'deviceConfig/config.php';

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

// Ron's BIC thang
require_once('Blink/bic/getConfigs.php');
require_once('tools.php');

// BB's BIC Components
require_once('Blink/bic/router.php');
require_once('Blink/bic/requestHandlers.php');
require_once('Blink/bic/views.php');
require_once('Blink/bic/renderer.php');

// Pull in the CDN's
require_once('Blink/cdn/PlatformCDN.php');
\Blink\CDN\PlatformCDN::setConfig(BlinkPlatformConfig::$CDN_PLATFORM);
$cdnp = new \Blink\CDN\PlatformCDN();

require_once('Blink/cdn/cdn_factory.php');
$defaultLoc = \Blink\cdn\CDN_Factory::getDefaultLocation($answer_space_id);
$cdna = \Blink\cdn\CDN_Factory::openCDN($asConfig['cdnLocation'], $answer_space_id);

$renderer = new Renderer();
$handler = new RequestHandler();

$getConfigs = new GetConfigs();

//$content = $router->route($_SERVER['REQUEST_URI'], $_REQUEST, $handler, $renderer, $answer_space_id, $asConfig, $cdnp, $cdna, $getConfigs);
$content = $handler->objects(array($_REQUEST['asn'], $interaction), array_key_exists('args', $_REQUEST) ? $_REQUEST['args'] : NULL, $renderer, $answer_space_id, array('siteName' => $_REQUEST['asn']), $cdnp, $cdna, $getConfigs);

if (array_key_exists('type', $content) && $content['type'] === 'xslt'){
    $content['content'] = '';
}

if (array_key_exists('inputPrompt', $content)){
    $content['inputPrompt'] = getInputs($content['inputPrompt']);
}

if (!array_key_exists('_id', $content)){
    $content['_id'] = $interaction;
}


// Need to do a little inheriting here
if (!isset($content['userGroups']) && isset($asConfig['userGroups'])){
    $content['userGroups'] = $asConfig['userGroups'];
}

// Lets add an escape option for the login status and prompt
if (isset ($asConfig['loginStatusInteraction'], $asConfig['loginPromptInteraction']) && (strtolower(convertIDtoName($asConfig['loginStatusInteraction'])) === strtolower($content['_id']) || strtolower(convertIDtoName($asConfig['loginPromptInteraction'])) === strtolower($content['_id']))){
    unset($content['userGroups']);
}

// Also need a dirty hack for the homepage. Sigh.
if (strtolower($content['_id']) === strtolower($content['siteName'])){
    $content = array_merge($asConfig, $content);
}

// Only give the user what they want if they are allowed to have it, you little tease you
header('Content-Type: application/json');
if (isset($asConfig['loginAccess'], $asConfig['loginUseInteractions'], $asConfig['loginStatusInteraction'], $content['userGroups']) && $asConfig['loginAccess'] && $asConfig['loginUseInteractions']) {
    require_once 'deviceConfig/answerSpaceMap.php';
    $siteMap = new answerSpaceMap($answer_space_id);
    $loginAccount = $siteMap->checkLoginStatusInteraction();
    if (isset($loginAccount, $loginAccount['groups'])) {
        // Check the group is within the list
        $passedChecks = TRUE;
        foreach ($content['userGroups'] as $group) {
            if ($passedChecks && array_search($group, $loginAccount['groups']) === FALSE) {
                $passedChecks = FALSE;
            }
        }
        if ($passedChecks) {
            echo json_encode($content);
        }
    } else {
        $content['content'] = $content['accessDeniedMessage'];
        echo json_encode($content);
    }    
} else {
    echo json_encode($content);
}


function convertIDtoName($id) {
    $db = BlinkPlatformConfig::openMainDatabaseConnection();
    $db->SetFetchMode(ADODB_FETCH_ASSOC);
    $rs = $db->Execute('SELECT keyword FROM keyword WHERE id = ?', array($id));
    if ($rs === false || empty($rs->fields)) {
        header('HTTP/1.1 404 Not Found', true, 404);
        exit('interaction id ' . $_REQUEST['iact'] . ' could not be located, despite database magic');
    }
    return $rs->fields['keyword'];
}
