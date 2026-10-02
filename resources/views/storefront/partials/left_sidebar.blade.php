<!-- Sidebar Overlay & Category Drawer -->
<div class="mn-sidebar-overlay"></div>
<div class="mn-sidebar">
	<div class="mn-sidebar-body">
		<button type="button" class="side-close" title="Close"></button>
		<ul class="mn-sb-list">
			@if(isset($navCategories) && $navCategories->isNotEmpty())
				@foreach($navCategories as $cat)
					@if($cat->children->isNotEmpty())
						<li class="mn-sb-item sb-drop-item">
							<a href="javascript:void(0)" class="mn-drop-toggle">
								@if($cat->icon)
									<img src="{{ $cat->icon }}" alt="{{ $cat->name }}">
								@else
									<img src="{{ asset('storefront/img/icons/clothes-2.svg') }}" alt="{{ $cat->name }}">
								@endif
								<span class="condense">{{ $cat->name }}<i class="drop-arrow ri-arrow-down-s-line"></i></span>
							</a>
							<ul class="mn-sb-drop">
								@foreach($cat->children as $subCat)
									<li class="list">
										<a href="{{ route('home') }}?category={{ $subCat->slug }}" class="mn-page-link drop">{{ $subCat->name }}</a>
									</li>
								@endforeach
							</ul>
						</li>
					@else
						<li class="mn-sb-item sb-drop-item">
							<a href="{{ route('home') }}?category={{ $cat->slug }}" class="mn-drop-toggle">
								@if($cat->icon)
									<img src="{{ $cat->icon }}" alt="{{ $cat->name }}">
								@else
									<img src="{{ asset('storefront/img/icons/shoes.svg') }}" alt="{{ $cat->name }}">
								@endif
								<span class="condense">{{ $cat->name }}</span>
							</a>
						</li>
					@endif
				@endforeach
			@else
				<li class="mn-sb-title condense"><span>Categories</span></li>
				<li class="mn-sb-item sb-drop-item">
					<a href="{{ route('home') }}" class="mn-drop-toggle">
						<span class="condense">All Products</span>
					</a>
				</li>
			@endif
		</ul>
	</div>
</div>
