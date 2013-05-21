<!DOCTYPE html>
<?php
require_once('vendor/autoload.php');
$cdna = \Blink\cdn\CDN_Factory::openCDN($asConfig['cdnLocation'], $answer_space_id);
$config = json_decode($asFields['config']);
?>

<html>
    <head>
        <title>BICv3</title>
        <meta name="viewport" content="initial-scale=1">
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <?php
        if (isset($config->default->themePack)) {
            echo '<link rel="stylesheet" href="' . $cdna->getURI($config->default->themePack) . '" />';
        } else {
            if (isset($config->default->platformCSS) && $config->default->platformCSS === 'default') {
                echo '<link rel="stylesheet" href="https://d1c6dfkb81l78v.cloudfront.net/jquery.mobile/1.3.0/jqm.theme.min.css" />';
            }
        }

        if (isset($config->default->platformCSS) && $config->default->platformCSS !== 'none') {
            echo '<link rel="stylesheet" href="https://d1c6dfkb81l78v.cloudfront.net/jquery.mobile/1.3.0/jqm.structure.min.css" />';
        }

        if(isset($config->default->externalCSS)){
           $css = explode("\n", $config->default->externalCSS);
           foreach ($css as $cssitem) {
              echo '<link rel="stylesheet" href="' . $cssitem . '" />';
           }
        }
        
        if(isset($config->default->styleSheet)){
           echo '<style type="text/css">' . $config->default->styleSheet . '</style>';
        }
        ?>
       
        <script>
          window.BMP = {
            siteVars: {
              answerSpaceId:  <?= $answer_space_id ?>,
              answerSpace: '<?php echo $asFields['uid']; ?>',
            },
            isBlinkGap: <?=$isBlinkGap ? 'true' : 'false'?>
          };
        </script>
    </head>
    <body>
        <noscript>You currently have JavaScript disabled. This application requires JavaScript to work correctly.</noscript>
        <div data-role="page" id="temp">Loading, please wait.</div>
        <script data-main="/_BICv3_/scripts/main" src="https://d1c6dfkb81l78v.cloudfront.net/blink/require/1/require.min.js"></script>
        <?php
        if(isset($config->default->externalJavaScript)){
           $js = explode("\n", $config->default->externalJavaScript);
           foreach ($js as $jsitem) {
             echo '<script src="' . $jsitem . '"></script>';
           }
        }
        ?>
    </body>
</html>
