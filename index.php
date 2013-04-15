<!DOCTYPE html>
<?php
// Ron's BIC Thang
require_once('blink/bic/getConfigs.php');

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
$router = new Router();

$getConfigs = new GetConfigs();

$content = $router->route($_SERVER['REQUEST_URI'], $_REQUEST, $handler, $renderer, $answer_space_id, $asConfig, $cdnp, $cdna, $getConfigs);

if (array_key_exists('themeSwatch', $content) && $content['themeSwatch']){ 
    $attrs = 'data-theme="' . $content['themeSwatch'] . '"';
} else {
    $attrs = '';
}
?>

<html>
    <head>
        <title>BICv3</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <?php
        if (array_key_exists('themePack', $content) && strlen($content['themePack']) > 0) {
            echo '<link rel="stylesheet" href="' . $cdna->getURI($asConfig['themePack']) . '" />';
        } else {
            if (array_key_exists('platformCSS', $content) && strlen($content['platformCSS']) > 0 && $content['platformCSS'] === 'default') {
                echo '<link rel="stylesheet" href="https://d1c6dfkb81l78v.cloudfront.net/jquery.mobile/1.3.0/jqm.theme.min.css" />';
            }
        }

        if (array_key_exists('platformCSS', $content) && strlen($content['platformCSS']) > 0 && $content['platformCSS'] !== 'none') {
            echo '<link rel="stylesheet" href="https://d1c6dfkb81l78v.cloudfront.net/jquery.mobile/1.3.0/jqm.structure.min.css" />';
        }
        ?>
       
        <script>
          <?php
          if (strpos($_SERVER['HTTP_USER_AGENT'], 'BlinkGap') === FALSE){
            echo 'window.NativeApp = false;';
          } else {
            echo 'window.NativeApp = true;';
          }
          ?>
        </script>
        <script data-main="/_BICv3_/source/main" src="https://d1c6dfkb81l78v.cloudfront.net/requirejs/2.1.2/require.min.js"></script>
        <?php
        if(array_key_exists('externalJavaScript', $content) && strlen($content['externalJavaScript']) > 0){
           $js = explode("\n", $content['externalJavaScript']);
           foreach ($js as $jsitem) {
             echo '<script src="' . $jsitem . '"></script>';
           }
        }
        
        if(array_key_exists('externalCSS', $content) && strlen($content['externalCSS']) > 0){
           $css = explode("\n", $content['externalCSS']);
           foreach ($css as $cssitem) {
              echo '<link rel="stylesheet" href="' . $cssitem . '" />';
           }
        }
        
        if(array_key_exists('styleSheet', $content) && strlen($content['styleSheet']) > 0){
           echo '<style type="text/css">' . $content['styleSheet'] . '</style>';
        }
        ?>
    </head>
    <body>
        <noscript>You currently have JavaScript disabled. This application requires JavaScript to work correctly.</noscript>
        <div data-role="page" id="temp">Loading, please wait.</div>
    </body>
</html>
