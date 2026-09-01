<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
    <link
      href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
      rel="stylesheet"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
      rel="stylesheet"
    />

    <title>SHOP.CO — Find clothes that match your style</title>

    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
