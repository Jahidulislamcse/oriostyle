<!-- Sidebar Overlay & Category Drawer -->
<div class="mn-sidebar-overlay"></div>
<div class="mn-sidebar">
	<div class="mn-sidebar-body">
		<button type="button" class="side-close" title="Close Category Sidebar">
			<i class="ri-close-line"></i>
		</button>
		<ul class="mn-sb-list">
			<li class="mn-sb-title condense"><span>Categories</span></li>
			@if(isset($navCategories) && $navCategories->isNotEmpty())
				@foreach($navCategories as $cat)
					@php
						$rawImg = $cat->image_url ?? $cat->image;
						$catImg = null;
						if ($rawImg && (str_starts_with($rawImg, 'http') || str_starts_with($rawImg, '/') || preg_match('/\.(png|jpe?g|webp|svg|gif|avif)$/i', $rawImg))) {
							$catImg = $rawImg;
						}
						$catIcon = $cat->icon ?? '';
						if (empty($catIcon) || !str_starts_with($catIcon, 'ri-')) {
							$nameL = strtolower($cat->name ?? $cat->slug ?? $catIcon);
							$catIcon = match(true) {
								str_contains($nameL, 'shirt') || str_contains($nameL, 'polo') || str_contains($nameL, 'men') || str_contains($nameL, 'fashion') || str_contains($nameL, 'pant') => 'ri-t-shirt-line',
								str_contains($nameL, 'women') || str_contains($nameL, 'saree') || str_contains($nameL, 'kurti') || str_contains($nameL, 'dress') || str_contains($nameL, 'sparkles') => 'ri-sparkling-line',
								str_contains($nameL, 'shoe') || str_contains($nameL, 'foot') || str_contains($nameL, 'sneaker') => 'ri-footprint-line',
								str_contains($nameL, 'watch') || str_contains($nameL, 'clock') || str_contains($nameL, 'time') || str_contains($nameL, 'jewel') => 'ri-time-line',
								str_contains($nameL, 'bag') || str_contains($nameL, 'pack') => 'ri-handbag-line',
								str_contains($nameL, 'tech') || str_contains($nameL, 'phone') => 'ri-smartphone-line',
								str_contains($nameL, 'home') || str_contains($nameL, 'living') => 'ri-home-4-line',
								default => 'ri-folder-3-line'
							};
						}
					@endphp
					@if($cat->children->isNotEmpty())
						<li class="mn-sb-item sb-drop-item">
							<a href="javascript:void(0)" class="mn-drop-toggle">
								@if($catImg)
									<img src="{{ $catImg }}" alt="{{ $cat->name }}" class="cat-sidebar-img">
								@else
									<i class="{{ $catIcon }} cat-sidebar-icon"></i>
								@endif
								<span class="condense">{{ $cat->name }}<i class="drop-arrow ri-arrow-down-s-line"></i></span>
							</a>
							<ul class="mn-sb-drop">
								<li class="list">
									<a href="{{ route('home') }}?category={{ $cat->slug }}" class="mn-page-link drop d-flex align-items-center gap-2">
										<i class="ri-apps-2-line cat-sidebar-sub-icon"></i>
										<span>All {{ $cat->name }}</span>
									</a>
								</li>
								@foreach($cat->children as $subCat)
									@php
										$rawSubImg = $subCat->image_url ?? $subCat->image;
										$subImg = null;
										if ($rawSubImg && (str_starts_with($rawSubImg, 'http') || str_starts_with($rawSubImg, '/') || preg_match('/\.(png|jpe?g|webp|svg|gif|avif)$/i', $rawSubImg))) {
											$subImg = $rawSubImg;
										}
										$subIcon = $subCat->icon ?? '';
										if (empty($subIcon) || !str_starts_with($subIcon, 'ri-')) {
											$subNameL = strtolower($subCat->name ?? $subCat->slug ?? $subIcon);
											$subIcon = match(true) {
												str_contains($subNameL, 'shirt') || str_contains($subNameL, 'polo') || str_contains($subNameL, 'men') || str_contains($subNameL, 'fashion') || str_contains($subNameL, 'pant') => 'ri-t-shirt-line',
												str_contains($subNameL, 'women') || str_contains($subNameL, 'saree') || str_contains($subNameL, 'kurti') || str_contains($subNameL, 'dress') || str_contains($subNameL, 'sparkles') => 'ri-sparkling-line',
												str_contains($subNameL, 'shoe') || str_contains($subNameL, 'foot') || str_contains($subNameL, 'sneaker') => 'ri-footprint-line',
												str_contains($subNameL, 'watch') || str_contains($subNameL, 'clock') || str_contains($subNameL, 'time') || str_contains($subNameL, 'jewel') => 'ri-time-line',
												str_contains($subNameL, 'bag') || str_contains($subNameL, 'pack') => 'ri-handbag-line',
												str_contains($subNameL, 'tech') || str_contains($subNameL, 'phone') => 'ri-smartphone-line',
												str_contains($subNameL, 'home') || str_contains($subNameL, 'living') => 'ri-home-4-line',
												default => 'ri-price-tag-3-line'
											};
										}
									@endphp
									<li class="list">
										<a href="{{ route('home') }}?category={{ $subCat->slug }}" class="mn-page-link drop d-flex align-items-center gap-2">
											@if($subImg)
												<img src="{{ $subImg }}" alt="{{ $subCat->name }}" class="cat-sidebar-sub-img">
											@else
												<i class="{{ $subIcon }} cat-sidebar-sub-icon"></i>
											@endif
											<span>{{ $subCat->name }}</span>
										</a>
									</li>
								@endforeach
							</ul>
						</li>
					@else
						<li class="mn-sb-item sb-drop-item">
							<a href="{{ route('home') }}?category={{ $cat->slug }}" class="mn-drop-toggle">
								@if($catImg)
									<img src="{{ $catImg }}" alt="{{ $cat->name }}" class="cat-sidebar-img">
								@else
									<i class="{{ $catIcon }} cat-sidebar-icon"></i>
								@endif
								<span class="condense">{{ $cat->name }}</span>
							</a>
						</li>
					@endif
				@endforeach
			@else
				<li class="mn-sb-item sb-drop-item">
					<a href="{{ route('home') }}" class="mn-drop-toggle">
						<i class="ri-store-2-line cat-sidebar-icon"></i>
						<span class="condense">All Products</span>
					</a>
				</li>
			@endif
		</ul>
	</div>
</div>
