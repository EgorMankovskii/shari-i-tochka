from django.contrib import admin
from django.utils.html import format_html

from .forms import ProductAdminForm
from .models import Category, Product, ProductImage


class ProductInline(admin.TabularInline):
    model = Product
    extra = 0
    fields = (
        'title',
        'price',
        'tag',
        'is_featured',
        'is_active',
        'sort_order',
    )
    ordering = ('sort_order', 'title')


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ('title', 'static_image', 'image', 'sort_order')
    ordering = ('sort_order', 'id')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_visible', 'sort_order')
    list_editable = ('is_visible', 'sort_order')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProductInline]
    fieldsets = (
        ('Основное', {
            'fields': ('title', 'slug', 'is_visible', 'sort_order'),
        }),
        ('Карточка на главной', {
            'fields': ('home_description', 'static_image', 'image'),
        }),
        ('Страница категории', {
            'fields': ('page_title', 'page_lead', 'accent', 'filters_text'),
        }),
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('title', 'category', 'price', 'tag', 'is_featured', 'is_active', 'sort_order')
    list_filter = ('category', 'is_featured', 'is_active')
    list_editable = ('price', 'tag', 'is_featured', 'is_active', 'sort_order')
    search_fields = ('title', 'description')
    autocomplete_fields = ('category',)
    inlines = [ProductImageInline]
    fieldsets = (
        ('Основное', {
            'fields': ('category', 'title', 'description', 'price', 'tag'),
        }),
        ('Изображение', {
            'fields': ('static_image', 'image', 'crop_x', 'crop_y', 'crop_scale', 'crop_preview'),
        }),
        ('Публикация', {
            'fields': ('is_featured', 'is_active', 'sort_order'),
        }),
    )

    readonly_fields = ('crop_preview',)

    class Media:
        css = {
            'all': ('admin/css/product_cropper.css',),
        }
        js = ('admin/js/product_cropper.js',)

    @admin.display(description='Визуальная обрезка карточки')
    def crop_preview(self, obj):
        image_url = obj.display_image_url if obj else ''
        crop_x = obj.crop_x if obj else 50
        crop_y = obj.crop_y if obj else 50
        crop_scale = obj.crop_scale if obj else 100
        return format_html(
            (
                '<div class="product-cropper" data-product-cropper '
                'data-image-url="{}" data-crop-x="{}" data-crop-y="{}" data-crop-scale="{}">'
                '<div class="product-cropper__empty">Загрузи фото товара и перетаскивай рамку мышкой, чтобы выбрать кадр для карточки.</div>'
                '<div class="product-cropper__workspace" hidden>'
                '<div class="product-cropper__stage">'
                '<img class="product-cropper__image" alt="Предпросмотр изображения">'
                '<div class="product-cropper__frame"></div>'
                '<button type="button" class="product-cropper__handle product-cropper__handle--n" data-resize-dir="n"></button>'
                '<button type="button" class="product-cropper__handle product-cropper__handle--e" data-resize-dir="e"></button>'
                '<button type="button" class="product-cropper__handle product-cropper__handle--s" data-resize-dir="s"></button>'
                '<button type="button" class="product-cropper__handle product-cropper__handle--w" data-resize-dir="w"></button>'
                '<button type="button" class="product-cropper__handle product-cropper__handle--ne" data-resize-dir="ne"></button>'
                '<button type="button" class="product-cropper__handle product-cropper__handle--nw" data-resize-dir="nw"></button>'
                '<button type="button" class="product-cropper__handle product-cropper__handle--se" data-resize-dir="se"></button>'
                '<button type="button" class="product-cropper__handle product-cropper__handle--sw" data-resize-dir="sw"></button>'
                '</div>'
                '<div class="product-cropper__preview-wrap">'
                '<div class="product-cropper__preview-title">Что попадёт в карточку</div>'
                '<div class="product-cropper__preview">'
                '<canvas class="product-cropper__preview-canvas" width="240" height="330" aria-label="Предпросмотр обрезки"></canvas>'
                '</div>'
                '</div>'
                '</div>'
                '</div>'
            ),
            image_url,
            crop_x,
            crop_y,
            crop_scale,
        )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'product', 'sort_order')
    list_editable = ('sort_order',)
    list_filter = ('product__category',)
    search_fields = ('title', 'product__title')
    autocomplete_fields = ('product',)


admin.site.site_header = 'Шары и Точка'
admin.site.site_title = 'Шары и Точка'
admin.site.index_title = 'Управление карточками и категориями'
