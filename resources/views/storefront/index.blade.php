@extends('storefront.layouts.app')

@section('title', ($settings['site_name'] ?? 'ORIO STYLE') . ' - Enterprise Storefront')

@section('content')
<!-- Main Content Container Start -->
<div class="mn-main-content">
	<div class="row">
		<div class="col-xxl-12">

			<!-- Hero Banner Section -->
			<section class="mn-hero swiper-container m-b-15">
				<div class="mn-hero-slider owl-carousel">
					<div class="mn-hero-slide swiper-slide slide-1">
						<div class="mn-hero-detail">
							<p class="label"><span>50%<br>OFF</span></p>
							<h1>Fashion & Style<br>Collection 2026</h1>
							<p>Discover premium apparel and trending dynamic catalog items.</p>
							<a href="#featured-products" class="mn-btn-2"><span>Shop Now</span></a>
						</div>
					</div>
					<div class="mn-hero-slide swiper-slide slide-2">
						<div class="mn-hero-detail">
							<p class="label"><span>Hot<br>Deal</span></p>
							<h2>Exclusive Brands<br>& Accessories</h2>
							<p>Elevate your wardrobe with top quality verified products.</p>
							<a href="#new-arrivals" class="mn-btn-2"><span>Explore Collection</span></a>
						</div>
					</div>
				</div>
			</section>

			<!-- Categories Carousel Section -->
			@if(isset($featuredCategories) && $featuredCategories->isNotEmpty())
				<section class="mn-category p-tb-15">
					<div class="mn-title mb-4">
						<h2>Featured <span>Categories</span></h2>
					</div>
					<div class="mn-cat owl-carousel">
						@foreach($featuredCategories as $index => $cat)
							<div class="mn-cat-card cat-card-{{ ($index % 6) + 1 }}">
								<span class="bg">{{ $cat->products_count }}</span>
								<h4>Category</h4>
								<h3>{{ $cat->name }}</h3>
								<p>Items ({{ $cat->products_count }})</p>
								<ul>
									<li>
										<a href="{{ route('home') }}?category={{ $cat->slug }}">
											@if($cat->image)
												<img src="{{ $cat->image }}" alt="{{ $cat->name }}">
											@else
												<img src="{{ asset('storefront/img/category/' . (($index % 12) + 1) . '.jpg') }}" alt="{{ $cat->name }}">
											@endif
										</a>
									</li>
								</ul>
							</div>
						@endforeach
					</div>
				</section>
			@endif

			<!-- Featured Products Section -->
			@if(isset($featuredProducts) && $featuredProducts->isNotEmpty())
				<section id="featured-products" class="mn-new-product p-tb-15">
					<div class="mn-title">
						<h2>Featured <span>Products</span></h2>
					</div>
					<div class="row g-2 g-md-3">
						@foreach($featuredProducts as $product)
							<div class="col-6 col-md-4 col-lg-3 m-b-15 m-b-md-30">
								<div class="mn-product-card">
									<div class="mn-product-img">
										@if($product->compare_price && $product->compare_price > $product->price)
											<div class="lbl">
												<span class="trending">Sale</span>
											</div>
										@elseif($product->is_featured)
											<div class="lbl">
												<span class="new">Featured</span>
											</div>
										@endif
										<div class="mn-img">
											<a href="{{ route('home') }}" class="image">
												@if($product->primaryImage)
													<img class="main-img" src="{{ $product->primaryImage->image_path }}" alt="{{ $product->name }}">
												@else
													<img class="main-img" src="{{ asset('storefront/img/product/1.jpg') }}" alt="{{ $product->name }}">
												@endif
											</a>
											<div class="mn-options">
												<ul>
													<li>
														<a href="javascript:void(0)" class="mn-add-cart" title="Add To Cart">
															<i class="ri-shopping-cart-line"></i>
														</a>
													</li>
												</ul>
											</div>
										</div>
									</div>
									<div class="mn-product-detail">
										<div class="cat">
											<a href="{{ route('home') }}?category={{ $product->category->slug ?? '' }}">
												{{ $product->category->name ?? 'General' }}
											</a>
										</div>
										<h5><a href="{{ route('home') }}">{{ $product->name }}</a></h5>
										<div class="mn-price">
											<div class="mn-price-new">{{ $settings['currency_symbol'] ?? '৳' }}{{ number_format($product->price, 2) }}</div>
											@if($product->compare_price && $product->compare_price > $product->price)
												<div class="mn-price-old">{{ $settings['currency_symbol'] ?? '৳' }}{{ number_format($product->compare_price, 2) }}</div>
											@endif
										</div>
									</div>
								</div>
							</div>
						@endforeach
					</div>
				</section>
			@endif

			<!-- New Arrivals Section -->
			@if(isset($newArrivals) && $newArrivals->isNotEmpty())
				<section id="new-arrivals" class="mn-new-product p-tb-15">
					<div class="mn-title">
						<h2>New <span>Arrivals</span></h2>
					</div>
					<div class="row g-2 g-md-3">
						@foreach($newArrivals as $product)
							<div class="col-6 col-md-4 col-lg-3 m-b-15 m-b-md-30">
								<div class="mn-product-card">
									<div class="mn-product-img">
										<div class="lbl">
											<span class="new">New</span>
										</div>
										<div class="mn-img">
											<a href="{{ route('home') }}" class="image">
												@if($product->primaryImage)
													<img class="main-img" src="{{ $product->primaryImage->image_path }}" alt="{{ $product->name }}">
												@else
													<img class="main-img" src="{{ asset('storefront/img/product/5.jpg') }}" alt="{{ $product->name }}">
												@endif
											</a>
											<div class="mn-options">
												<ul>
													<li>
														<a href="javascript:void(0)" class="mn-add-cart" title="Add To Cart">
															<i class="ri-shopping-cart-line"></i>
														</a>
													</li>
												</ul>
											</div>
										</div>
									</div>
									<div class="mn-product-detail">
										<div class="cat">
											<a href="{{ route('home') }}?category={{ $product->category->slug ?? '' }}">
												{{ $product->category->name ?? 'General' }}
											</a>
										</div>
										<h5><a href="{{ route('home') }}">{{ $product->name }}</a></h5>
										<div class="mn-price">
											<div class="mn-price-new">{{ $settings['currency_symbol'] ?? '৳' }}{{ number_format($product->price, 2) }}</div>
											@if($product->compare_price && $product->compare_price > $product->price)
												<div class="mn-price-old">{{ $settings['currency_symbol'] ?? '৳' }}{{ number_format($product->compare_price, 2) }}</div>
											@endif
										</div>
									</div>
								</div>
							</div>
						@endforeach
					</div>
				</section>
			@endif

			<!-- Service Highlights Section -->
			<section class="mn-service p-tb-15 my-4">
				<div class="row">
					<div class="col-lg-3 col-sm-6 m-b-15">
						<div class="mn-service-box p-3 border rounded text-center">
							<i class="ri-truck-line display-6 text-primary mb-2"></i>
							<h5>Fast Delivery</h5>
							<p class="text-muted mb-0">Inside city: {{ $settings['estimated_delivery_inside'] ?? '24-48 Hours' }}</p>
						</div>
					</div>
					<div class="col-lg-3 col-sm-6 m-b-15">
						<div class="mn-service-box p-3 border rounded text-center">
							<i class="ri-shield-check-line display-6 text-primary mb-2"></i>
							<h5>100% Genuine</h5>
							<p class="text-muted mb-0">Authentic products directly from brands</p>
						</div>
					</div>
					<div class="col-lg-3 col-sm-6 m-b-15">
						<div class="mn-service-box p-3 border rounded text-center">
							<i class="ri-customer-service-2-line display-6 text-primary mb-2"></i>
							<h5>24/7 Support</h5>
							<p class="text-muted mb-0">Dedicated customer care assistance</p>
						</div>
					</div>
					<div class="col-lg-3 col-sm-6 m-b-15">
						<div class="mn-service-box p-3 border rounded text-center">
							<i class="ri-secure-payment-line display-6 text-primary mb-2"></i>
							<h5>Secure Payment</h5>
							<p class="text-muted mb-0">COD & encrypted payment processing</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Brands Section -->
			@if(isset($brands) && $brands->isNotEmpty())
				<section class="mn-brand p-tb-15">
					<div class="mn-title mb-4">
						<h2>Partner <span>Brands</span></h2>
					</div>
					<div class="row align-items-center">
						@foreach($brands as $brand)
							<div class="col-lg-2 col-md-3 col-4 text-center mb-3">
								@if($brand->logo)
									<img src="{{ $brand->logo }}" alt="{{ $brand->name }}" style="max-height: 50px; filter: grayscale(80%); opacity: 0.8;" class="img-fluid">
								@else
									<span class="fw-bold text-muted">{{ $brand->name }}</span>
								@endif
							</div>
						@endforeach
					</div>
				</section>
			@endif

		</div>
	</div>
</div>
<!-- Main Content Container End -->
@endsection
