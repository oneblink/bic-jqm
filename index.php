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
        if(array_key_exists('themePack', $content) && strlen($content['themePack']) > 0){
            echo '<link rel="stylesheet" href="' . $cdna->getURI($asConfig['themePack']) . '" />';
        } else {
            echo '<link rel="stylesheet" href="' . $cdnp->getURL('jquery.mobile/1.2.0/jqm.theme.min.css') . '" />';
        }
        ?>
        <link rel="stylesheet" href="https://d1c6dfkb81l78v.cloudfront.net/jquery.mobile/1.2.0/jqm.structure.min.css" />
        <script data-main="/_BICv3_/source/main" src="https://d1c6dfkb81l78v.cloudfront.net/requirejs/2.1.2/require.min.js"></script>
        <?php
        if(array_key_exists('defaultTransition', $content) && strlen($content['defaultTransition']) > 0){
            echo '<script>$.mobile.defaultPageTransition = "' . $content['defaultTransition'] . '"</script>';
	    }
        
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
            <?php
            echo '<div data-role="page" ' . $attrs . ' class="ui-page">';
            echo $content['header'];
            echo '<div data-role="content">';
            echo $content['content'];
            echo '</div>';
            echo $content['footer'];
            echo '</div>';
            ?>
        </body>
    </html>
