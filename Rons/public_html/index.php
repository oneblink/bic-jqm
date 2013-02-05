<?php

$configs = array(); //
if ($_SERVER['REQUEST_URI'] === '/_BICv3_/index.php') { // called directly
  
  set_include_path('../../includes/');
  require_once 'tools.php';
  dispelAllMagic();
  
  if (!empty($_REQUEST['_answerSpace'])) {
    $answerSpace = $_REQUEST['_answerSpace'];
  } else {
    $answerSpace = '';
  }
  if (!empty($_REQUEST['_path'])) {
    $path = $_REQUEST['_path'];
  } else {
    $path = $answerSpace;
  }

  require_once 'adodb5/adodb.inc.php';
  require_once 'adodb5/adodb-exceptions.inc.php';

  // connect to database
  $db = BlinkPlatformConfig::openMainDatabaseConnection();
  if (!$db) {
    header('HTTP/1.1 500 Internal Server Error', true, 500);
    exit('unable to open main database connection');
  }
  
  // perform device detection if device is new
  if (!isset($_SESSION['mydot_device']) || !is_array($_SESSION['mydot_device'])) {
    $_SESSION['mydot_device'] = array();
  }
  if (empty($_SESSION['mydot_device']['features'])
          || !isset($_SESSION['mydot_device']['featuresChecked'])
          || (time() - $_SESSION['mydot_device']['featuresChecked'] > 900)) { // 60 * 15 == 15 minutes
    // TODO: drop Tera-WURFL, it shouldn't be necessary
    require_once 'Tera-WURFL/TeraWurfl.php';
    require_once 'deviceConfig/DeviceIdentifier.php';
    $di = new DeviceIdentifier($_SERVER['HTTP_USER_AGENT']);
    $_SESSION['mydot_device']['features'] = $di->features;
    $_SESSION['mydot_device']['featuresChecked'] = time();
  }

  // get answerSpace Config
  $db->SetFetchMode(ADODB_FETCH_ASSOC);
  $rs = $db->Execute('SELECT * FROM answer_space WHERE uid = ?', array($answerSpace));
  if ($rs !== false && !empty($rs->fields)) {
    require_once "blink/cdn/cdn_factory.php";
    require_once 'deviceConfig/SettingsParser.php';
    $sp = SettingsParser::resurrect($db, get_include_path() . 'deviceConfig/answerSpace.xml');
    require_once 'deviceConfig/FeatureProcessor.php';
    require_once 'deviceConfig/config.php';
    try {
      // determine the string to pass to CDN_Factory
      $defaultLoc = \Blink\CDN_Factory::getDefaultLocation($answer_space_id);
      // set Config::$cdn to freshly created CDN_Driver
      Config::$cdn = \Blink\CDN_Factory::openCDN($defaultLoc, $answer_space_id);
    } catch(Exception $e) {
      error_log($e->getMessage());
    }
    $asConfig = new Config($rs->fields, $_SESSION['mydot_device']['features'], $sp);
    $asConfig = $asConfig->config['pertinent'];
    $configs[$answerSpace] = $asConfig;
    $answer_space_id = $rs->fields['id'];
  }
  
} else { // included by mobi_site.php
  
  $matches = array();
  preg_match_all('/[\w.\-]+/', $_SERVER['REQUEST_URI'], $matches);

  $answerSpace = count($matches[0]) > 0 ? $matches[0][0] : '';
  $path = implode('/', $matches[0]);
  $configs[$answerSpace] = $asConfig;
  
}

require_once 'blink/cdn/PlatformCDN.php';

\Blink\CDN\PlatformCDN::setConfig(BlinkPlatformConfig::$CDN_PLATFORM);
$cdnp = new \Blink\CDN\PlatformCDN();

$itemNames = array_unique(explode('/', $path));

// retrieve configs for all items in the path
$neededNames = $itemNames;
array_shift($neededNames); // we already have the answerSpace config
$configs = array_merge($configs, getConfigsByNames($neededNames));

$config = array();
foreach ($itemNames as $name) {
  if (isset($configs[$name]) && is_array($configs[$name])) {
    $config = array_merge($config, $configs[$name]);
  }
}

if (count($itemNames) < 1) { // no answerSpace or category
  
  $page = 'insert [page] here';
  
} else if (empty($config['type'])) { // process answerSpace / Category
  
  if (empty($config['name']) && !empty($config['siteName'])) {
    $config['name'] = $config['siteName'];
  }
  
  if (count($itemNames) === 1) { // answerSpace-only
    $children = getConfigsByTags(array(''));
    
  } else { // answerSpace with category
    $children = getConfigsByTags(array('nav-' . $config['name']));
    
  }
    
  require_once 'blink/bic/InteractionList.php';
  \Blink\BIC\InteractionList::$db = $db;
  $list = new \Blink\BIC\InteractionList($config, $answer_space_id, $children);
  $list->setPath($path);
  
  $page = '<div data-role="content">';
  $page .= $list->toHTML();
  $page .= '</div>';
  
  // TODO: retrieve configs for all items with this "nav-..." tag
  
} else { // process Interaction
  
  require_once 'blink/bic/Interaction.php';
  \Blink\BIC\Interaction::$db = $db;
  $interaction = new \Blink\BIC\Interaction($config, $answer_space_id);
  
  $page = '<div data-role="content">';
  $page .= $interaction->toHTML();
  $page .= '</div>';
  
}

if (!empty($config['header']) && is_string($config['header'])) {
  $page = $config['header'] . PHP_EOL . $page;
}

if (!empty($config['footer']) && is_string($config['footer'])) {
  $page .= $config['footer'];
}

// TODO: tamper with $page, hide Back button, etc

// record a URL against the page so that A-grade can recognise work done here
unset($_REQUEST['uid']);
unset($_REQUEST['_answerSpace']);
unset($_REQUEST['_path']);
$url = $path;
if (!empty($_REQUEST)) {
  $url .= '?' . http_build_query($_REQUEST);
}
$url = trim($url, '/');

?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <title></title>
    <meta name="description" content="" />
    <meta name="author" content="" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
<?php include_once 'blink/JavaScriptEnv.php'; ?>
    <link rel="stylesheet" href="<?=$cdnp->getURL('jquery.mobile/1.1.0/jquery.mobile.min.css')?>" />
    <script src="<?=$cdnp->getURL('modernizr/modernizr-2.6.1-2012W33.min.js')?>"></script>
    <script>
      // this will (hopefully) be our only global variable
      window.BlinkApp = {};
      // from Modernizr/feature-detects/css-mediaqueries.js
      if (Modernizr.mq('only all')) {
        // if we have CSS Media Queries then continue loading A/B-grade BIC
          document.write(unescape('%3Cscript data-main="/_BICv3_/js/bootstrap" src="<?=$cdnp->getURL('requirejs/2.0.2/require.min.js')?>"%3E%3C/script%3E'));
      } else {
        window.BlinkApp.grade === 'c';
      }
    </script>
  </head>
  <body>
    <div data-role="page" data-url="<?=$url?>">
      <?=$page?>
    </div>
  </body>
</html>
<?php

/* old startup structure
    <div data-role="page" id="startup"> 
      <article data-role="content">
        <fieldset data-role="controlgroup">
          <input type="checkbox" id="startup_platform" name="startup_platform" disabled="disabled" />
          <label for="startup_platform">platform logic</label>
          <input type="checkbox" id="startup_storage" name="startup_storage" disabled="disabled" />
          <label for="startup_storage">acquiring storage</label>
          <input type="checkbox" id="startup_configuration" name="startup_configuration" disabled="disabled" />
          <label for="startup_configuration">requesting configuration</label>
        </fieldset>
      </article>
    </div> 
 */

/**
 * fetch a config associative-array from the database
 * @requires previously initialised $sp (SettingsParser)
 * @param {Array} $names 0-indexed array of strings
 * @param {Boolean} $raw will not compact down to "pertinent" if true
 * @return {Array}
 */
function getConfigsByNames($names, $raw=false) {
	$db = $GLOBALS['db']; $sp = $GLOBALS['sp'];
	$answer_space_id = $GLOBALS['answer_space_id'];
  if (!is_array($names) || empty($names)) {
    return array();
  }
  $names = '"' . implode('","', $names) . '"';
	$db->SetFetchMode(ADODB_FETCH_ASSOC);
  $sql = <<< EOF
(
SELECT `id`, `keyword` AS `name`, 'i' AS `table`,
  `order`, `status`, `config`, `registered_only`, `tags`
FROM `keyword`
WHERE `status` != 'inactive'
  AND `answer_space_id` = ?
  AND `keyword` IN ($names)
)
UNION
(
SELECT `id`,  `name`, 'c' AS `table`,
  `order`, `status`, `config`, `registered_only`, `tags`
FROM `category`
WHERE `status` != 'inactive'
  AND `answer_space_id` = ?
  AND `name` IN ($names)
)
ORDER BY `order`
EOF;
  $rs = $db->Execute($sql, array($answer_space_id, $answer_space_id));
	if ($rs === false || empty($rs->fields)) {
		return array();
	}
  $result = array();
  while ($row = $rs->FetchRow()) {
    if ($raw) {
      $result[$row['name']] = json_decode($row['config'], true);
    } else {
      $config = new Config($row, $_SESSION['mydot_device']['features'], $sp);
      $result[$row['name']] = $config->config['pertinent'];
    }
    
  }
  return $result;
}

/**
 * fetch a config associative-array from the database
 * @requires previously initialised $sp (SettingsParser)
 * @param {Array} $names 0-indexed array of strings
 * @param {Boolean} $raw will not compact down to "pertinent" if true
 * @return {Array}
 */
function getConfigsByTags($tags, $raw=false) {
	$db = $GLOBALS['db']; $sp = $GLOBALS['sp'];
	$answer_space_id = $GLOBALS['answer_space_id'];
  $answerSpace = $GLOBALS['answerSpace'];
  if (!is_array($tags) || empty($tags)) {
    $tags = array('');
  }
	$db->SetFetchMode(ADODB_FETCH_ASSOC);
  $interactionSql = <<< EOF
SELECT `id`, `keyword` AS `name`, 'i' AS `table`,
  `order`, `status`, `config`, `registered_only`, `tags`
FROM `keyword`
WHERE `status` != 'inactive'
  AND `answer_space_id` = ?
EOF;
  $categorySql = <<< EOF
SELECT `id`,  `name`, 'c' AS `table`,
  `order`, `status`, `config`, `registered_only`, `tags`
FROM `category`
WHERE `status` != 'inactive'
  AND `answer_space_id` = ?
EOF;
  $orSql = '';
  foreach ($tags as $tag) {
    if (strlen($orSql) > 0) {
      $orSql .= ' OR ';
    }
    if (empty($tag)) {
      $orSql .= '`tags` IS NULL OR `tags` = \'\' OR `tags` LIKE \'%"nav-' . $answerSpace . '"%\'';
    } else {
      $orSql .= '`tags` LIKE \'%"' . $tag . '"%\'';
    }
  }
  if (strlen($orSql) > 0) {
    $interactionSql .= ' AND (' . $orSql . ')';
    $categorySql .= ' AND (' . $orSql . ')';
  }
  $sql = '(' . $interactionSql . ') UNION (' . $categorySql . ') ORDER BY `order`';
  $rs = $db->Execute($sql, array($answer_space_id, $answer_space_id));
	if ($rs === false || empty($rs->fields)) {
		return array();
	}
  $result = array();
  while ($row = $rs->FetchRow()) {
    if ($raw) {
      $result[$row['name']] = json_decode($row['config'], true);
    } else {
      $config = new Config($row, $_SESSION['mydot_device']['features'], $sp);
      $result[$row['name']] = $config->config['pertinent'];
    }
    
  }
  return $result;
}
