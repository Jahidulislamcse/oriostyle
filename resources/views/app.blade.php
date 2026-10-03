<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'ORIO STYLE') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    @if(request()->is('admin*') || request()->is('login') || request()->is('register'))
        <!-- Theme Initialization Script for Admin & Auth -->
        <script>
            (function() {
                try {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } catch (e) {}
            })();
        </script>
        <!-- Isolated Tailwind CSS -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @else
        <!-- Isolated Storefront CSS Files -->
        <link href="{{ asset('storefront/css/vendor/materialdesignicons.min.css') }}" rel="stylesheet">
        <link href="{{ asset('storefront/css/vendor/remixicon.css') }}" rel="stylesheet">
        <link href="{{ asset('storefront/css/vendor/bootstrap.min.css') }}" rel="stylesheet">
        <link href="{{ asset('storefront/css/vendor/animate.min.css') }}" rel="stylesheet">
        <link href="{{ asset('storefront/css/vendor/owl.carousel.min.css') }}" rel="stylesheet">
        <link href="{{ asset('storefront/css/vendor/slick.min.css') }}" rel="stylesheet">
        <link href="{{ asset('storefront/css/vendor/swiper-bundle.min.css') }}" rel="stylesheet">
        <link href="{{ asset('storefront/css/vendor/nouislider.css') }}" rel="stylesheet">
        <link id="mainCss" href="{{ asset('storefront/css/style.css') }}" rel="stylesheet">
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
    @endif

    @inertiaHead
</head>
<body class="{{ request()->is('admin*') || request()->is('login') || request()->is('register') ? 'h-full font-sans antialiased bg-[#F4F7FB] text-slate-800 dark:bg-[#071324] dark:text-slate-100 selection:bg-[#D4AF37] selection:text-[#071324] transition-colors duration-200' : 'sb-default' }}">
    @inertia
</body>
</html>
