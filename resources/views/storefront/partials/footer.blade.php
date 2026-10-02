<!-- Footer -->
<footer>
	<div class="mn-footer">
		<div class="container-fluid">
			<div class="row">
				<div class="col-lg-3 col-sm-6 m-b-30">
					<div class="mn-footer-widget">
						<h4 class="mn-footer-heading">About Us</h4>
						<p class="mn-footer-text">
							{{ $settings['site_tagline'] ?? 'Enterprise Single-Vendor E-Commerce Platform' }}
						</p>
						<ul class="mn-footer-links">
							@if(!empty($settings['store_address']))
								<li><i class="ri-map-pin-line me-2"></i>{{ $settings['store_address'] }}</li>
							@endif
							@if(!empty($settings['support_phone']))
								<li><i class="ri-phone-line me-2"></i><a href="tel:{{ $settings['support_phone'] }}">{{ $settings['support_phone'] }}</a></li>
							@endif
							@if(!empty($settings['support_email']))
								<li><i class="ri-mail-line me-2"></i><a href="mailto:{{ $settings['support_email'] }}">{{ $settings['support_email'] }}</a></li>
							@endif
						</ul>
					</div>
				</div>
				<div class="col-lg-3 col-sm-6 m-b-30">
					<div class="mn-footer-widget">
						<h4 class="mn-footer-heading">Quick Links</h4>
						<ul class="mn-footer-links">
							<li><a href="{{ route('home') }}">Home</a></li>
							<li><a href="{{ route('home') }}#featured-products">Featured Products</a></li>
							<li><a href="{{ route('home') }}#new-arrivals">New Arrivals</a></li>
							<li><a href="{{ route('login') }}">My Account</a></li>
						</ul>
					</div>
				</div>
				<div class="col-lg-3 col-sm-6 m-b-30">
					<div class="mn-footer-widget">
						<h4 class="mn-footer-heading">Categories</h4>
						<ul class="mn-footer-links">
							@if(isset($navCategories) && $navCategories->isNotEmpty())
								@foreach($navCategories->take(5) as $footerCat)
									<li><a href="{{ route('home') }}?category={{ $footerCat->slug }}">{{ $footerCat->name }}</a></li>
								@endforeach
							@endif
						</ul>
					</div>
				</div>
				<div class="col-lg-3 col-sm-6 m-b-30">
					<div class="mn-footer-widget">
						<h4 class="mn-footer-heading">Customer Care</h4>
						<ul class="mn-footer-links">
							<li><span>Hours: {{ $settings['business_hours'] ?? 'Sat - Thu: 9:00 AM - 9:00 PM' }}</span></li>
							<li><span>Inside City Shipping: {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format($settings['shipping_charge_inside'] ?? 70, 2) }}</span></li>
							<li><span>Outside City Shipping: {{ $settings['currency_symbol'] ?? '৳' }}{{ number_format($settings['shipping_charge_outside'] ?? 130, 2) }}</span></li>
						</ul>
					</div>
				</div>
			</div>
			<div class="row pt-4 border-top">
				<div class="col-md-6">
					<p class="mb-0 text-muted">{{ $settings['copyright_text'] ?? '© 2026 ORIO STYLE LTD. All rights reserved.' }}</p>
				</div>
				<div class="col-md-6 text-md-end">
					<img src="{{ asset('storefront/img/banner/payment.png') }}" alt="Payment Methods" style="max-height: 30px;">
				</div>
			</div>
		</div>
	</div>
</footer>
