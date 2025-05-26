<?php

return [
  'paths'=> ['api/*','login','sanctum/csrf-cookie'],
  'allowed_methods' => ['*'],
  'allowed_origins' => ['http://localhost:4200'],
  'allowed_headers' => ['*'],
  'supports_credentials' => true,
];


