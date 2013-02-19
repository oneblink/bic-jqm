<!DOCTYPE html>
<html>
    <head>
        <title>BICv3</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/_BICv3_/assets/css/jquery.mobile.min.css" />
        <script data-main="/_BICv3_/source/main" src="/_BICv3_/assets/js/require.min.js"></script>
    </head>
        <body>
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

                echo '<noscript>You currently have JavaScript disabled. This application requires JavaScript to work correctly.</noscript>';
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