from django.db.models import Prefetch, Q
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from .data import CONTACTS, DELIVERY_INFO, HOME_PAGE
from .models import Category, Product, ProductImage


GALLERY_IMAGE_FILTER = Q(image__gt='') | Q(static_image__gt='')
GALLERY_IMAGE_PREFETCH = Prefetch(
    'gallery_images',
    queryset=ProductImage.objects.filter(GALLERY_IMAGE_FILTER).order_by('sort_order', 'id'),
)


def shared_context():
    categories = Category.objects.filter(is_visible=True).order_by('sort_order', 'title')
    nav_items = [{'title': 'Главная', 'href': reverse('home')}]
    nav_items.extend({'title': category.title, 'href': category.get_absolute_url()} for category in categories)
    nav_items.extend([
        {'title': 'Доставка', 'href': reverse('delivery')},
        {'title': 'Контакты', 'href': reverse('contacts')},
    ])

    return {
        'nav_items': nav_items,
        'contacts': CONTACTS,
    }


def home(request):
    context = shared_context() | {
        'page': HOME_PAGE,
        'categories': Category.objects.filter(is_visible=True).order_by('sort_order', 'title'),
        'featured_products': Product.objects.select_related('category').prefetch_related(GALLERY_IMAGE_PREFETCH).filter(
            is_active=True,
            is_featured=True,
            category__is_visible=True,
        ).order_by('sort_order', 'title'),
        'advantages': HOME_PAGE['advantages'],
        'occasions': HOME_PAGE['occasions'],
        'delivery_preview': DELIVERY_INFO['preview'],
    }
    return render(request, 'home.html', context)


def category_page(request, slug):
    category = get_object_or_404(Category, slug=slug, is_visible=True)
    subcategories = category.subcategories
    selected_subcategory = request.GET.get('subcategory', '').strip()
    has_subcategories = bool(subcategories)
    is_valid_subcategory = selected_subcategory in subcategories
    products = category.products.prefetch_related(GALLERY_IMAGE_PREFETCH).filter(is_active=True).order_by('sort_order', 'title')

    if has_subcategories:
        products = products.filter(subcategory=selected_subcategory) if is_valid_subcategory else products.none()

    context = shared_context() | {
        'category': category,
        'products': products,
        'subcategories': subcategories,
        'selected_subcategory': selected_subcategory if is_valid_subcategory else '',
        'has_subcategories': has_subcategories,
    }
    return render(request, 'category.html', context)


def product_detail(request, pk):
    product = get_object_or_404(
        Product.objects.select_related('category').prefetch_related(GALLERY_IMAGE_PREFETCH, 'gallery_videos'),
        pk=pk,
        is_active=True,
        category__is_visible=True,
    )
    product_description = product.description or product.category.default_product_description
    context = shared_context() | {
        'product': product,
        'product_description': product_description,
        'gallery_images': product.gallery_images.filter(GALLERY_IMAGE_FILTER),
        'gallery_videos': product.gallery_videos.all(),
        'related_products': product.category.products.prefetch_related(GALLERY_IMAGE_PREFETCH).filter(is_active=True).exclude(pk=product.pk)[:3],
    }
    return render(request, 'product_detail.html', context)


def delivery(request):
    context = shared_context() | {
        'delivery_page': DELIVERY_INFO,
    }
    return render(request, 'delivery.html', context)


def contacts(request):
    context = shared_context() | {
        'delivery_preview': DELIVERY_INFO['preview'],
    }
    return render(request, 'contacts.html', context)
