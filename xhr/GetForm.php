<?php
header('Content-Type: application/json');

switch($_REQUEST['form']){
    case "Sample1":
        $content = '{"definition":{"default":{"name":"form1","label":"Form 1","_elements":[{"default":{"name":"id","type":"hidden"}},{"default":{"name":"date","label":"Date","type":"date"}},{"default":{"name":"time","label":"Time","type":"time"}},{"default":{"name":"datetime","label":"Date + Time","type":"datetime"}}]}}}';
        break;
    case "Sample2":
        $content = '{"definition":{"default":{"name":"form1","label":"Form 1","_elements":[{"default":{"name":"id","type":"hidden"}},{"default":{"name":"file","label":"File","type":"file"}},{"default":{"name":"image","label":"Image","type":"image"}},{"default":{"name":"selectc","label":"Select C","type":"select","mode":"collapsed","options":{"a":"alpha","b":"beta","g":"gamma"}}},{"default":{"name":"selecte","label":"Select E","type":"select","mode":"expanded","layout":"horizontal","options":{"a":"alpha","b":"beta","g":"gamma"}}},{"default":{"name":"multic","label":"Multi C","type":"multi","mode":"collapsed","options":{"a":"alpha","b":"beta","g":"gamma"}}},{"default":{"name":"multie","label":"Multi E","type":"multi","mode":"expanded","options":{"a":"alpha","b":"beta","g":"gamma"}}},{"default":{"name":"boolean","label":"Boolean","type":"boolean","options":{"0":"false","1":"true"}}},{"default":{"name":"question","label":"Question","type":"boolean","options":{"n":"no","y":"yes"}}}]}}}';
        break;
    case "Sample3":
        $content = '{"definition":{"default":{"name":"form1","label":"Form 1","_elements":[{"default":{"name":"id","type":"hidden"}},{"default":{"name":"url","label":"URL","type":"url","defaultValue":"https://blinkm.co/ron"}},{"default":{"name":"email","label":"Email","type":"email","defaultValue":"ron@blinkmobile.com.au","section":"account"}},{"default":{"name":"password","label":"Password","type":"password","defaultValue":"secret","section":"account"}},{"default":{"name":"streetAddress","label":"Street Address","type":"textarea","defaultValue":"Suite 2\r\n125 Donnison Street","section":"address"}},{"default":{"name":"city","label":"City","type":"text","defaultValue":"Gosford","section":"address"}},{"default":{"name":"telephone","label":"Telephone","type":"telephone","defaultValue":"+61 439 901 787"}},{"default":{"name":"number","label":"Number","type":"number","min":15,"max":400,"step":5,"defaultValue":35}},{"default":{"name":"currency","label":"Currency","type":"number","minDecimals":2,"maxDecimals":2,"defaultValue":"876.54"}},{"default":{"name":"heading","type":"heading","level":1,"text":"Heading!"}},{"default":{"name":"message","type":"message","html":"This is <strong>static</strong> text."}}],"_sections":[{"default":{"name":"account","class":"myClass"}},{"default":{"name":"address","class":"myClass"}}]}}}';
        break;
    case "Sample4":
        $content = '{"definition":{"default":{"name":"form1","label":"Form 1","_elements":[{"default":{"name":"id","type":"hidden"}},{"default":{"name":"datetime","label":"Date + Time","type":"datetime","defaultValue":"now"}},{"default":{"name":"name","label":"Name","type":"text"}},{"default":{"name":"age","label":"Age","type":"number","section":"col1"}},{"default":{"name":"weight","label":"Weight","type":"number","section":"col2"}},{"default":{"name":"comments","label":"Comments","type":"subForm","subForm":"form2"}}],"_sections":[{"default":{"name":"grid","class":"ui-responsive ui-grid-a"}},{"default":{"name":"col1","class":"ui-block-a","section":"grid"}},{"default":{"name":"col2","class":"ui-block-b","section":"grid"}}]}}}';
        break;
    case "Sample5":
        $content = '{"definition":{"default":{"name":"form1","label":"Form 1","_elements":[{"default":{"name":"id","type":"hidden"}},{"default":{"name":"url","label":"URL","type":"url","defaultValue":"https://blinkm.co/ron"}},{"default":{"name":"email","label":"Email","type":"email","defaultValue":"ron@blinkmobile.com.au","section":"account"}},{"default":{"name":"password","label":"Password","type":"password","defaultValue":"secret","section":"account"}},{"default":{"name":"streetAddress","label":"Street Address","type":"textarea","defaultValue":"Suite 2\r\n125 Donnison Street","section":"address"}},{"default":{"name":"city","label":"City","type":"text","defaultValue":"Gosford","section":"address","toolTip":"Enter City Name","required":true}},{"default":{"name":"telephone","label":"Telephone","type":"telephone","defaultValue":"+61 439 901 787"}},{"default":{"name":"number","label":"Number","type":"number","min":15,"max":400,"step":5,"defaultValue":35,"maxDecimalPlaces":2,"prefix":"$"}},{"default":{"name":"currency","label":"Currency","type":"number","minDecimals":2,"maxDecimals":2,"defaultValue":"876.54"}},{"default":{"name":"heading","type":"heading","level":1,"text":"Heading!"}},{"default":{"name":"message","type":"message","html":"This is <strong>static</strong> text."}}],"_sections":[{"default":{"name":"account","class":"myClass"}},{"default":{"name":"address","class":"myClass"}}]}}}';
        break;
    default:
        $content = "";
        break;
}




echo $content;
