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
						$catImg = $cat->image_url ?? $cat->icon;
					@endphp
					@if($cat->children->isNotEmpty())
						<li class="mn-sb-item sb-drop-item">
							<a href="javascript:void(0)" class="mn-drop-toggle">
								@if($catImg)
									<img src="{{ $catImg }}" alt="{{ $cat->name }}" class="cat-sidebar-img">
								@else
									<i class="ri-folder-3-line cat-sidebar-icon"></i>
								@endif
								<span class="condense">{{ $cat->name }}<i class="drop-arrow ri-arrow-down-s-line"></i></span>
							</a>
							<ul class="mn-sb-drop">
								<li class="list">
									<a href="{{ route('home') }}?category={{ $cat->slug }}" class="mn-page-link drop">All {{ $cat->name }}</a>
								</li>
								@foreach($cat->children as $subCat)
									@php
										$subImg = $subCat->image_url ?? $subCat->icon;
									@endphp
									<li class="list">
										<a href="{{ route('home') }}?category={{ $subCat->slug }}" class="mn-page-link drop d-flex align-items-center gap-2">
											@if($subImg)
												<img src="{{ $subImg }}" alt="{{ $subCat->name }}" class="cat-sidebar-sub-img">
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
									<i class="ri-folder-3-line cat-sidebar-icon"></i>
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
