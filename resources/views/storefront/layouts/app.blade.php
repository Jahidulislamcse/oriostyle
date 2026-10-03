<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="keywords" content="ecommerce, store, fashion, super store, online shop, {{ $settings['site_name'] ?? 'ORIO STYLE' }}">
	<meta name="description" content="{{ $settings['site_tagline'] ?? 'Enterprise Single-Vendor E-Commerce Platform' }}">
	<meta name="csrf-token" content="{{ csrf_token() }}">

	<title>@yield('title', ($settings['site_name'] ?? 'ORIO STYLE') . ' - ' . ($settings['site_tagline'] ?? 'E-Commerce Store'))</title>

	<!-- App Favicon -->
	@if(!empty($settings['site_favicon']))
		<link rel="shortcut icon" href="{{ $settings['site_favicon'] }}">
	@else
		<link rel="shortcut icon" href="{{ asset('storefront/img/favicon/favicon.png') }}">
	@endif

	<!-- Storefront Isolated Icon CSS -->
	<link href="{{ asset('storefront/css/vendor/materialdesignicons.min.css') }}" rel="stylesheet">
	<link href="{{ asset('storefront/css/vendor/remixicon.css') }}" rel="stylesheet">

	<!-- Storefront Isolated Vendor CSS -->
	<link href="{{ asset('storefront/css/vendor/bootstrap.min.css') }}" rel="stylesheet">
	<link href="{{ asset('storefront/css/vendor/animate.min.css') }}" rel="stylesheet">
	<link href="{{ asset('storefront/css/vendor/owl.carousel.min.css') }}" rel="stylesheet">
	<link href="{{ asset('storefront/css/vendor/slick.min.css') }}" rel="stylesheet">
	<link href="{{ asset('storefront/css/vendor/swiper-bundle.min.css') }}" rel="stylesheet">
	<link href="{{ asset('storefront/css/vendor/nouislider.css') }}" rel="stylesheet">

	<!-- Storefront Isolated Main CSS -->
	<link id="mainCss" href="{{ asset('storefront/css/style.css') }}?v={{ file_exists(public_path('storefront/css/style.css')) ? filemtime(public_path('storefront/css/style.css')) : time() }}" rel="stylesheet">

	@stack('styles')
</head>

<body data-mn-mode="light">

	<main class="wrapper sb-default">

		<!-- Loader -->
		<div id="mn-overlay">
			<div class="loader">
				@if(!empty($settings['site_logo']))
					<img src="{{ $settings['site_logo'] }}" alt="loader" style="max-height: 40px;">
				@else
					<img src="{{ asset('storefront/img/logo/loader.png') }}" alt="loader">
				@endif
				<span class="shape"></span>
			</div>
		</div>

		<!-- Mobile Category Sidebar -->
		@include('storefront.partials.left_sidebar')

		<!-- Storefront Header -->
		@include('storefront.partials.header')

		<!-- Main Content Slot -->
		@yield('content')

		<!-- Storefront Footer -->
		@include('storefront.partials.footer')

		<!-- Wishlist Sidebar Drawer -->
		@include('storefront.partials.wishlist_sidebar')

		<!-- Cart Sidebar Drawer -->
		@include('storefront.partials.cart_sidebar')

	</main>

	<!-- Storefront Isolated Vendor Scripts -->
	<script src="{{ asset('storefront/js/vendor/jquery-3.7.1.min.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/bootstrap.bundle.min.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/owl.carousel.min.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/slick.min.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/swiper-bundle.min.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/countdownTimer.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/infiniteslidev2.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/nouislider.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/smoothscroll.min.js') }}"></script>
	<script src="{{ asset('storefront/js/vendor/jquery.zoom.min.js') }}"></script>

	<!-- Storefront Isolated Main Script -->
	<script src="{{ asset('storefront/js/main.js') }}"></script>

	@stack('scripts')
</body>

</html>
