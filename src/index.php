<?php

// comment out the following two lines when deployed to production

require __DIR__ . '/../../backend/vendor/autoload.php';

require __DIR__ . '/../../backend/vendor/env.php';
require __DIR__ . '/../../backend/vendor/yiisoft/yii2/Yii.php';

$config = require __DIR__ . '/../../backend/config/web.php';

(new yii\web\Application($config))->run();
