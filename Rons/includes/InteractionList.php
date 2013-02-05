<?php namespace Blink\BIC;

class InteractionList {
  
  public static $db;
  
  private $path;
  private $config;
  private $items;
  private $answerSpaceId;
  
  /**
   * @param {Array} $config key=>value array of Interaction properties
   * @param {Number} $answerSpaceId the numeric ID of the parent answerSpace
   * @param {Array} [$items] name=>config array of child items
   */
  function __construct($config, $answerSpaceId, $items=null) {
    if (!empty($config) && is_array($config)) {
      $this->config = $config;
    } else {
      $this->config = array();
    }
    if (!empty($items) && is_array($items)) {
      $this->items = $items;
    } else {
      $this->items = array();
    }
    $this->answerSpaceId = $answerSpaceId;
  }
  
  function setPath($path) {
    $this->path = $path;
  }
  
  public function toHTML() {
    $ul = new \SimpleXMLElement('<ul data-role="listview" />');
    foreach ($this->items as $name => $config) {
      if (empty($config['display']) || $config['display'] === 'show') {
        $li = $ul->addChild('li');
        $a = $li->addChild('a');
        // label
        $label = !empty($config['displayName']) ? $config['displayName'] : $name;
        $a->addChild('h3', htmlspecialchars($label, ENT_QUOTES));
        if (!empty($config['description'])) {
          $a->addChild('p', htmlspecialchars($config['description'], ENT_QUOTES));
        }
        $a->addAttribute('href', '/' . $this->path . '/' . $name);
      }
    }
    // doing an XPath to safely discard the <?xml... from the top
    $ul = $ul->xpath('/ul');
    $ul = $ul[0];
    return $ul->asXML();
  }
  
}
