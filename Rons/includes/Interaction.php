<?php namespace Blink\BIC;

class Interaction {
  
  public static $db;
  
  private $config;
  private $answerSpaceId;
  
  /**
   * @param {Array} $config key=>value array of Interaction properties
   * @param {Number} $answerSpaceId the numeric ID of the parent answerSpace
   */
  function __construct($config, $answerSpaceId) {
    if (!empty($config) && is_array($config)) {
      $this->config = $config;
    } else {
      $this->config = array();
    }
    $this->answerSpaceId = $answerSpaceId;
  }
  
  public function toHTML() {
    $config = $this->config;
    $returnValue = '';
    if ($config['type'] === 'message') { // normally performed on the device
      $returnValue = $config['message'];
      if (strpos($returnValue, '<p>') === false) {
        $returnValue = '<p>' . $returnValue . '<p>';
      }
      
    } elseif ($config['type'] === 'madl code') {
      require_once 'tools.php';
      if (stringContainsFromArray(\BlinkPlatformConfig::$MADL_BLACKLIST, $config['madl'])) {
        $returnValue = 'Unable to proceed due to use of reserved keywords.';
      } else {
        if(!empty($_REQUEST['args']) && is_array($_REQUEST['args'])) {
          foreach ($_REQUEST['args'] as &$arg) {
            if (is_string($arg)) {
              $arg = rawurldecode($arg);
            }
          }
          $args = $_REQUEST['args'];
        }
        require_once 'scrape.php';
		require_once 'blink/evaluator/evaluator.class.php';
        $t = new \Scrape('dynamic', $this->answerSpaceId, null, "", 0, 50);
		$madl = new \Blink\Evaluator();
		$madl->setCode($config['madl']);
		$madl->setScrape($t);
		$temp = array('args' => $args);
		$returnValue = (string) $madl->execute($temp);
      }
      
    } elseif ($config['type'] === 'xslt') { // normally performed on the device where possible
      $xsl = $config['xsl'];
      $xml = $config['xml'];
      if (empty($xml)) {
        $xml = '';
      } else if (substr($xml, 0, 6) !== 'stars:') {
        // TODO: look at doing server-side star lists (is it possible?)
      } else {
        self::$db->SetFetchMode(ADODB_FETCH_ASSOC);
        $rs = self::$db->Execute('SELECT * FROM object WHERE answer_space_id = ? AND key = ?', array($this->answerSpaceId, $xml));
        if ($rs === false && empty($rs->fields)) {
          header('HTTP/1.1 404 Not Found', true, 404);
          exit('MoJO ' . $xml . ' (required for interaction with ID ' . $_REQUEST['_i'] . ') could not be located');
        }
        $xml = $rs->fields['data'];
      }
      if(!empty($_REQUEST['args']) && is_array($_REQUEST['args'])) {
        foreach ($_REQUEST['args'] as &$arg) {
          if (is_string($arg)) {
            $arg = rawurldecode($arg);
          }
        }
        $xsl = preg_replace("|\\\$args\[([0-9]+)\]|Ue", "\$_REQUEST['args'][$1]", $xsl);
      }
      $xmlDom = new DOMDocument();
      $xmlDom->loadXML($xml);
      $xslDom = new DOMDocument;
      $xslDom->loadXML($xsl);
      $xslt = new XSLTProcessor();
      $xslt->importStyleSheet($xslDom);
      $returnValue = $xslt->transformToXML($xmlDom);
      
    } elseif ($config['form'] === 'madl code') {
      $returnValue = 'insert [form] here';
      
    } else {
      $returnValue = 'insert [unknown] here';
      
    }

    return $returnValue;
    
  }
  
}
