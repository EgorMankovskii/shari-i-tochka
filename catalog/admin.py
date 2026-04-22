from django.contrib import admin
from django.utils.html import format_html

from .forms import ProductAdminForm, ProductImageAdminForm, ProductVideoAdminForm
from .models import Category, Product, ProductImage, ProductVideo


def render_crop_preview(obj, empty_text):
    image_url = obj.image.url if obj and getattr(obj, "image", None) else ""
    crop_x = getattr(obj, "crop_x", 50) if obj else 50
    crop_y = getattr(obj, "crop_y", 50) if obj else 50
    crop_scale = getattr(obj, "crop_scale", 100) if obj else 100

    return format_html(
        (
            '<div class="product-cropper" data-product-cropper '
            'data-image-url="{}" data-crop-x="{}" data-crop-y="{}" data-crop-scale="{}">'
            '<div class="product-cropper__empty">{}</div>'
            '<div class="product-cropper__workspace" hidden>'
            '<div class="product-cropper__stage">'
            '<div class="product-cropper__image-shell">'
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
            "</div>"
            "</div>"
            '<div class="product-cropper__preview-wrap">'
            '<div class="product-cropper__preview-title">Что попадет в карточку</div>'
            '<div class="product-cropper__hint">Рамка двигается мышкой, а размер меняется за углы и края.</div>'
            '<div class="product-cropper__preview">'
            '<canvas class="product-cropper__preview-canvas" width="240" height="330" aria-label="Предпросмотр обрезки"></canvas>'
            "</div>"
            "</div>"
            "</div>"
            "</div>"
        ),
        image_url,
        crop_x,
        crop_y,
        crop_scale,
        empty_text,
    )


class CropperMediaMixin:
    class Media:
        css = {
            "all": ("admin/css/product_cropper.css",),
        }
        js = ("admin/js/product_cropper.js",)


class ProductInline(admin.TabularInline):
    model = Product
    extra = 0
    fields = ("title", "price", "tag", "is_featured", "is_active", "sort_order")
    ordering = ("sort_order", "title")


class ProductImageInline(CropperMediaMixin, admin.StackedInline):
    model = ProductImage
    form = ProductImageAdminForm
    extra = 0
    ordering = ("sort_order", "id")
    readonly_fields = ("crop_preview",)
    fieldsets = (
        (
            "Дополнительное фото",
            {
                "fields": (
                    "title",
                    "static_image",
                    "image",
                    "crop_x",
                    "crop_y",
                    "crop_scale",
                    "crop_preview",
                    "sort_order",
                ),
            },
        ),
    )

    @admin.display(description="Визуальная обрезка дополнительного фото")
    def crop_preview(self, obj):
        return render_crop_preview(
            obj,
            "Загрузи дополнительное фото и перетаскивай рамку мышкой, чтобы выбрать кадр для миниатюры товара.",
        )


class ProductVideoInline(admin.StackedInline):
    model = ProductVideo
    form = ProductVideoAdminForm
    extra = 1
    ordering = ("sort_order", "id")
    fieldsets = (
        (
            "Видео товара",
            {
                "fields": ("title", "video", "is_muted", "sort_order"),
            },
        ),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_visible", "sort_order")
    list_editable = ("is_visible", "sort_order")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProductInline]
    fieldsets = (
        ("Основное", {"fields": ("title", "slug", "is_visible", "sort_order")}),
        ("Карточка на главной", {"fields": ("home_description", "static_image", "image")}),
        ("Страница категории", {"fields": ("page_title", "page_lead", "accent", "filters_text")}),
    )


@admin.register(Product)
class ProductAdmin(CropperMediaMixin, admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ("title", "category", "price", "tag", "is_featured", "is_active", "sort_order")
    list_filter = ("category", "is_featured", "is_active")
    list_editable = ("price", "tag", "is_featured", "is_active", "sort_order")
    search_fields = ("title", "description")
    autocomplete_fields = ("category",)
    inlines = [ProductImageInline, ProductVideoInline]
    readonly_fields = ("crop_preview",)
    fieldsets = (
        ("Основное", {"fields": ("category", "title", "description", "price", "tag")}),
        ("Изображение", {"fields": ("static_image", "image", "crop_x", "crop_y", "crop_scale", "crop_preview")}),
        ("Публикация", {"fields": ("is_featured", "is_active", "sort_order")}),
    )

    @admin.display(description="Визуальная обрезка карточки")
    def crop_preview(self, obj):
        return render_crop_preview(
            obj,
            "Загрузи фото товара и перетаскивай рамку мышкой, чтобы выбрать кадр для карточки.",
        )


@admin.register(ProductImage)
class ProductImageAdmin(CropperMediaMixin, admin.ModelAdmin):
    form = ProductImageAdminForm
    list_display = ("__str__", "product", "sort_order")
    list_editable = ("sort_order",)
    list_filter = ("product__category",)
    search_fields = ("title", "product__title")
    autocomplete_fields = ("product",)
    readonly_fields = ("crop_preview",)
    fieldsets = (
        ("Основное", {"fields": ("product", "title", "sort_order")}),
        ("Изображение", {"fields": ("static_image", "image", "crop_x", "crop_y", "crop_scale", "crop_preview")}),
    )

    @admin.display(description="Визуальная обрезка дополнительного фото")
    def crop_preview(self, obj):
        return render_crop_preview(
            obj,
            "Загрузи дополнительное фото и перетаскивай рамку мышкой, чтобы выбрать кадр для миниатюры товара.",
        )


@admin.register(ProductVideo)
class ProductVideoAdmin(admin.ModelAdmin):
    form = ProductVideoAdminForm
    list_display = ("__str__", "product", "is_muted", "sort_order")
    list_editable = ("is_muted", "sort_order")
    list_filter = ("product__category", "is_muted")
    search_fields = ("title", "product__title")
    autocomplete_fields = ("product",)


admin.site.site_header = "Шары и Точка"
admin.site.site_title = "Шары и Точка"
admin.site.index_title = "Управление карточками и категориями"
