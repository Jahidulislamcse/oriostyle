<!-- Cart Sidebar Drawer Start -->
<div class="mn-side-cart-overlay"></div>
<div id="mn-side-cart" class="mn-side-cart">
	<div class="mn-cart-inner">
		<div class="mn-cart-top">
			<div class="mn-cart-title">
				<span class="cart_title">My Cart</span>
				<a href="javascript:void(0)" class="mn-cart-close">
					<i class="ri-close-line"></i>
				</a>
			</div>
			<ul class="mn-cart-pro-items">
				<li class="cart-sidebar-list text-center text-muted py-4">
					<p class="mb-0">Your shopping cart is currently empty.</p>
				</li>
			</ul>
		</div>
		<div class="mn-cart-bottom">
			<div class="cart-sub-total d-flex justify-content-between my-3">
				<span class="text-muted">Subtotal:</span>
				<span class="cart-sub-total-amount fw-bold">{{ $settings['currency_symbol'] ?? '৳' }}0.00</span>
			</div>
			<div class="cart_btn">
				<a href="{{ route('home') }}" class="mn-btn-1"><span>Continue Shopping<i class="ri-arrow-right-s-line"></i></span></a>
			</div>
		</div>
	</div>
</div>
