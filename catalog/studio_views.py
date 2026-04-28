from functools import wraps
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .forms import (
    CategoryStudioForm,
    ProductImageStudioFormSet,
    ProductStudioForm,
    ProductVideoStudioFormSet,
    StudioGroupForm,
    StudioUserForm,
)
from .models import Category, Product

UserModel = get_user_model()


def superuser_studio_required(view_func):
    @staff_member_required(login_url="admin:login")
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_superuser:
            raise PermissionDenied
        return view_func(request, *args, **kwargs)

    return wrapped


def studio_shared_context(request):
    product_count = Product.objects.count()
    active_count = Product.objects.filter(is_active=True).count()
    category_count = Category.objects.count()
    studio_nav = [
        {"title": "Обзор", "href": reverse("studio_home"), "match": "studio_home"},
        {"title": "Товары", "href": reverse("studio_product_list"), "match": "studio_product"},
        {"title": "Категории", "href": reverse("studio_category_list"), "match": "studio_category"},
    ]
    quicklinks = [
        {"title": "Новый товар", "href": reverse("studio_product_create")},
        {"title": "Новая категория", "href": reverse("studio_category_create")},
        {"title": "Резервный Django admin", "href": reverse("admin:index")},
    ]

    if request.user.is_superuser:
        studio_nav.extend([
            {"title": "Пользователи", "href": reverse("studio_user_list"), "match": "studio_user"},
            {"title": "Группы", "href": reverse("studio_group_list"), "match": "studio_group"},
        ])
        quicklinks[2:2] = [
            {"title": "Новый пользователь", "href": reverse("studio_user_create")},
            {"title": "Новая группа", "href": reverse("studio_group_create")},
        ]

    return {
        "studio_nav": studio_nav + [{"title": "Открыть сайт", "href": reverse("home"), "match": None, "external": True}],
        "studio_quicklinks": quicklinks,
        "studio_stats": {
            "products": product_count,
            "active_products": active_count,
            "categories": category_count,
            "users": UserModel.objects.count() if request.user.is_superuser else None,
            "groups": Group.objects.count() if request.user.is_superuser else None,
        },
    }


def _append_query_params(url, params):
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query.update({key: value for key, value in params.items() if value})
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def _redirect_back(request, fallback_name):
    target = request.POST.get("next") or request.GET.get("next")
    scroll = (request.POST.get("scroll") or "").strip()
    if target:
        if scroll:
            target = _append_query_params(target, {"studio_scroll": scroll})
        return redirect(target)
    return redirect(fallback_name)


def _build_next_query(next_url):
    if not next_url:
        return ""
    return f"?{urlencode({'next': next_url})}"


def render_crop_preview(obj, empty_text, media_kind="image"):
    media_url = ""
    if obj:
        if media_kind == "video" and getattr(obj, "video", None):
            media_url = obj.video.url
        elif media_kind == "image" and getattr(obj, "image", None):
            media_url = obj.image.url

    crop_x = getattr(obj, "crop_x", 50) if obj else 50
    crop_y = getattr(obj, "crop_y", 50) if obj else 50
    crop_scale = getattr(obj, "crop_scale", 100) if obj else 100
    cropper_attr = "data-product-video-cropper" if media_kind == "video" else "data-product-cropper"
    media_attr_name = "data-video-url" if media_kind == "video" else "data-image-url"
    media_markup = (
        '<video class="product-cropper__video" muted playsinline preload="metadata"></video>'
        if media_kind == "video"
        else '<img class="product-cropper__image" alt="Предпросмотр изображения">'
    )

    return format_html(
        (
            '<div class="product-cropper" {} data-cropper-kind="{}" {}="{}" '
            'data-crop-x="{}" data-crop-y="{}" data-crop-scale="{}">'
            '<div class="product-cropper__empty">{}</div>'
            '<div class="product-cropper__workspace" hidden>'
            '<div class="product-cropper__stage">'
            '<div class="product-cropper__image-shell">'
            '{}'
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
            '<div class="product-cropper__preview-title">Что попадёт в карточку</div>'
            '<div class="product-cropper__hint">Рамка двигается мышкой, а размер меняется за углы и края.</div>'
            '<div class="product-cropper__preview">'
            '<canvas class="product-cropper__preview-canvas" width="240" height="330" aria-label="Предпросмотр обрезки"></canvas>'
            "</div>"
            "</div>"
            "</div>"
            "</div>"
        ),
        mark_safe(cropper_attr),
        media_kind,
        mark_safe(media_attr_name),
        media_url,
        crop_x,
        crop_y,
        crop_scale,
        empty_text,
        mark_safe(media_markup),
    )


@staff_member_required(login_url="admin:login")
def studio_home(request):
    context = studio_shared_context(request) | {
        "recent_products": Product.objects.select_related("category").order_by("-updated_at")[:6],
        "recent_categories": Category.objects.order_by("sort_order", "title")[:6],
    }
    return render(request, "studio/dashboard.html", context)


@staff_member_required(login_url="admin:login")
def studio_product_list(request):
    products = Product.objects.select_related("category").order_by("sort_order", "title")
    query = request.GET.get("q", "").strip()
    category_id = request.GET.get("category", "").strip()
    status = request.GET.get("status", "").strip()

    if query:
        products = products.filter(title__icontains=query)
    if category_id:
        products = products.filter(category_id=category_id)
    if status == "active":
        products = products.filter(is_active=True)
    elif status == "hidden":
        products = products.filter(is_active=False)

    context = studio_shared_context(request) | {
        "products": products,
        "categories": Category.objects.order_by("sort_order", "title"),
        "query": query,
        "selected_category": category_id,
        "selected_status": status,
    }
    return render(request, "studio/product_list.html", context)


@staff_member_required(login_url="admin:login")
def studio_product_toggle_status(request, pk):
    if request.method != "POST":
        return redirect("studio_product_list")

    product = get_object_or_404(Product, pk=pk)
    product.is_active = not product.is_active
    product.save(update_fields=["is_active", "updated_at"])
    messages.success(
        request,
        f"Статус товара «{product.title}» изменён: {'на сайте' if product.is_active else 'скрыт'}.",
    )
    return _redirect_back(request, "studio_product_list")


@staff_member_required(login_url="admin:login")
def studio_category_list(request):
    categories = Category.objects.order_by("sort_order", "title")
    query = request.GET.get("q", "").strip()
    visibility = request.GET.get("visibility", "").strip()

    if query:
        categories = categories.filter(title__icontains=query)
    if visibility == "visible":
        categories = categories.filter(is_visible=True)
    elif visibility == "hidden":
        categories = categories.filter(is_visible=False)

    context = studio_shared_context(request) | {
        "categories": categories,
        "query": query,
        "selected_visibility": visibility,
    }
    return render(request, "studio/category_list.html", context)


@staff_member_required(login_url="admin:login")
def studio_category_toggle_status(request, pk):
    if request.method != "POST":
        return redirect("studio_category_list")

    category = get_object_or_404(Category, pk=pk)
    category.is_visible = not category.is_visible
    category.save(update_fields=["is_visible"])
    messages.success(
        request,
        f"Статус категории «{category.title}» изменён: {'на сайте' if category.is_visible else 'скрыта'}.",
    )
    return _redirect_back(request, "studio_category_list")


@staff_member_required(login_url="admin:login")
def studio_product_create(request):
    return _studio_product_form(request)


@staff_member_required(login_url="admin:login")
def studio_product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return _studio_product_form(request, product)


def _studio_product_form(request, product=None):
    is_create = product is None
    working_product = product or Product()
    next_url = request.POST.get("next") or request.GET.get("next") or ""
    form = ProductStudioForm(request.POST or None, request.FILES or None, instance=working_product)
    image_formset = ProductImageStudioFormSet(
        request.POST or None,
        request.FILES or None,
        instance=working_product,
        prefix="images",
    )
    video_formset = ProductVideoStudioFormSet(
        request.POST or None,
        request.FILES or None,
        instance=working_product,
        prefix="videos",
    )

    if request.method == "POST":
        if form.is_valid() and image_formset.is_valid() and video_formset.is_valid():
            saved_product = form.save()
            image_formset.instance = saved_product
            video_formset.instance = saved_product
            image_formset.save()
            video_formset.save()
            messages.success(request, "Карточка товара сохранена.")
            if "save_continue" in request.POST:
                return redirect(f"{reverse('studio_product_edit', kwargs={'pk': saved_product.pk})}{_build_next_query(next_url)}")
            return redirect(next_url or reverse("studio_product_list"))
        messages.error(request, "Проверь поля формы. Некоторые данные не сохранились.")

    crop_markup = render_crop_preview(
        product,
        "Загрузи фото товара и перетаскивай рамку мышкой, чтобы выбрать кадр для карточки.",
    )
    image_croppers = [
        {
            "form": image_form,
            "crop_preview": render_crop_preview(
                image_form.instance,
                "Загрузи дополнительное фото и перетаскивай рамку мышкой, чтобы выбрать кадр для миниатюры товара.",
            ),
        }
        for image_form in image_formset.forms
    ]
    video_croppers = [
        {
            "form": video_form,
            "crop_preview": render_crop_preview(
                video_form.instance,
                "Загрузи видео товара и выставь область кадра, которая должна быть видна в карточке.",
                media_kind="video",
            ),
        }
        for video_form in video_formset.forms
    ]

    context = studio_shared_context(request) | {
        "page_title": "Новая карточка товара" if is_create else f"Редактирование: {product.title}",
        "product": product,
        "form": form,
        "image_formset": image_formset,
        "image_croppers": image_croppers,
        "image_empty_form": image_formset.empty_form,
        "image_empty_crop_preview": render_crop_preview(
            None,
            "Загрузи дополнительное фото и перетаскивай рамку мышкой, чтобы выбрать кадр для миниатюры товара.",
        ),
        "video_formset": video_formset,
        "video_croppers": video_croppers,
        "video_empty_form": video_formset.empty_form,
        "video_empty_crop_preview": render_crop_preview(
            None,
            "Загрузи видео товара и выставь область кадра, которая должна быть видна в карточке.",
            media_kind="video",
        ),
        "crop_preview": crop_markup,
        "is_create": is_create,
        "next_url": next_url,
    }
    return render(request, "studio/product_form.html", context)


@staff_member_required(login_url="admin:login")
def studio_category_create(request):
    return _studio_category_form(request)


@staff_member_required(login_url="admin:login")
def studio_category_edit(request, pk):
    category = get_object_or_404(Category, pk=pk)
    return _studio_category_form(request, category)


def _studio_category_form(request, category=None):
    is_create = category is None
    next_url = request.POST.get("next") or request.GET.get("next") or ""
    form = CategoryStudioForm(request.POST or None, request.FILES or None, instance=category)

    if request.method == "POST":
        if form.is_valid():
            saved_category = form.save()
            messages.success(request, "Категория сохранена.")
            if "save_continue" in request.POST:
                return redirect(f"{reverse('studio_category_edit', kwargs={'pk': saved_category.pk})}{_build_next_query(next_url)}")
            return redirect(next_url or reverse("studio_category_list"))
        messages.error(request, "Проверь поля категории. Некоторые данные не сохранились.")

    context = studio_shared_context(request) | {
        "page_title": "Новая категория" if is_create else f"Редактирование категории: {category.title}",
        "category": category,
        "form": form,
        "is_create": is_create,
        "next_url": next_url,
    }
    return render(request, "studio/category_form.html", context)


@superuser_studio_required
def studio_user_list(request):
    users = UserModel.objects.prefetch_related("groups").order_by("username")
    query = request.GET.get("q", "").strip()
    role = request.GET.get("role", "").strip()

    if query:
        users = users.filter(username__icontains=query)
    if role == "staff":
        users = users.filter(is_staff=True)
    elif role == "superuser":
        users = users.filter(is_superuser=True)
    elif role == "active":
        users = users.filter(is_active=True)
    elif role == "inactive":
        users = users.filter(is_active=False)

    context = studio_shared_context(request) | {
        "users": users,
        "query": query,
        "selected_role": role,
    }
    return render(request, "studio/user_list.html", context)


@superuser_studio_required
def studio_user_create(request):
    return _studio_user_form(request)


@superuser_studio_required
def studio_user_edit(request, pk):
    user_obj = get_object_or_404(UserModel, pk=pk)
    return _studio_user_form(request, user_obj)


@superuser_studio_required
def studio_user_delete(request, pk):
    if request.method != "POST":
        return redirect("studio_user_list")

    user_obj = get_object_or_404(UserModel, pk=pk)
    next_url = request.POST.get("next") or reverse("studio_user_list")

    if user_obj.pk == request.user.pk:
        messages.error(request, "Нельзя удалить пользователя, под которым ты сейчас вошёл.")
        return redirect(next_url)

    if user_obj.is_superuser and UserModel.objects.filter(is_superuser=True, is_active=True).count() <= 1:
        messages.error(request, "Нельзя удалить последнего активного суперпользователя.")
        return redirect(next_url)

    username = user_obj.username
    user_obj.delete()
    messages.success(request, f"Пользователь «{username}» удалён.")
    return redirect(next_url)


def _studio_user_form(request, user_obj=None):
    is_create = user_obj is None
    next_url = request.POST.get("next") or request.GET.get("next") or ""
    form = StudioUserForm(request.POST or None, instance=user_obj)

    if request.method == "POST":
        if form.is_valid():
            saved_user = form.save()
            messages.success(request, "Пользователь сохранён.")
            if "save_continue" in request.POST:
                return redirect(f"{reverse('studio_user_edit', kwargs={'pk': saved_user.pk})}{_build_next_query(next_url)}")
            return redirect(next_url or reverse("studio_user_list"))
        messages.error(request, "Проверь поля пользователя. Некоторые данные не сохранились.")

    context = studio_shared_context(request) | {
        "page_title": "Новый пользователь" if is_create else f"Редактирование пользователя: {user_obj.username}",
        "form": form,
        "next_url": next_url,
        "is_create": is_create,
        "user_obj": user_obj,
        "can_delete": bool(user_obj and user_obj.pk != request.user.pk),
        "entity_name": "пользователя",
        "back_url_name": "studio_user_list",
    }
    return render(request, "studio/user_form.html", context)


@superuser_studio_required
def studio_group_list(request):
    groups = Group.objects.prefetch_related("permissions").order_by("name")
    query = request.GET.get("q", "").strip()

    if query:
        groups = groups.filter(name__icontains=query)

    context = studio_shared_context(request) | {
        "groups": groups,
        "query": query,
    }
    return render(request, "studio/group_list.html", context)


@superuser_studio_required
def studio_group_create(request):
    return _studio_group_form(request)


@superuser_studio_required
def studio_group_edit(request, pk):
    group = get_object_or_404(Group, pk=pk)
    return _studio_group_form(request, group)


def _studio_group_form(request, group=None):
    is_create = group is None
    next_url = request.POST.get("next") or request.GET.get("next") or ""
    form = StudioGroupForm(request.POST or None, instance=group)

    if request.method == "POST":
        if form.is_valid():
            saved_group = form.save()
            messages.success(request, "Группа сохранена.")
            if "save_continue" in request.POST:
                return redirect(f"{reverse('studio_group_edit', kwargs={'pk': saved_group.pk})}{_build_next_query(next_url)}")
            return redirect(next_url or reverse("studio_group_list"))
        messages.error(request, "Проверь поля группы. Некоторые данные не сохранились.")

    context = studio_shared_context(request) | {
        "page_title": "Новая группа" if is_create else f"Редактирование группы: {group.name}",
        "form": form,
        "next_url": next_url,
        "is_create": is_create,
        "entity_name": "группы",
        "back_url_name": "studio_group_list",
    }
    return render(request, "studio/group_form.html", context)
