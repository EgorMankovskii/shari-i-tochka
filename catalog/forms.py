from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.forms import inlineformset_factory
from django.forms.widgets import HiddenInput

from .models import Category, Product, ProductImage, ProductVideo


class CropFieldsMixin:
    crop_field_names = ("crop_x", "crop_y", "crop_scale")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name in self.crop_field_names:
            if field_name in self.fields:
                self.fields[field_name].widget = HiddenInput()


class ProductAdminForm(CropFieldsMixin, forms.ModelForm):
    class Meta:
        model = Product
        fields = "__all__"


class ProductImageAdminForm(CropFieldsMixin, forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = "__all__"


class ProductVideoAdminForm(CropFieldsMixin, forms.ModelForm):
    class Meta:
        model = ProductVideo
        fields = "__all__"


class StudioBaseFormMixin:
    text_input_classes = "studio-field__input"
    textarea_classes = "studio-field__input studio-field__input--textarea"
    checkbox_classes = "studio-field__checkbox"
    file_classes = "studio-field__file"
    multi_classes = "studio-field__input studio-field__input--multi"

    def apply_studio_widgets(self):
        for name, field in self.fields.items():
            widget = field.widget
            existing = widget.attrs.get("class", "")
            if isinstance(widget, forms.Textarea):
                widget.attrs["class"] = f"{existing} {self.textarea_classes}".strip()
                widget.attrs.setdefault("rows", 4)
                if name in {"description", "composition", "default_product_description"}:
                    widget.attrs["class"] = f"{widget.attrs['class']} studio-field__input--description".strip()
                    widget.attrs["rows"] = 3
            elif isinstance(widget, forms.CheckboxInput):
                widget.attrs["class"] = f"{existing} {self.checkbox_classes}".strip()
            elif isinstance(widget, forms.ClearableFileInput):
                field.widget = forms.FileInput(
                    attrs={
                        **widget.attrs,
                        "class": f"{existing} {self.file_classes}".strip(),
                    }
                )
            elif isinstance(widget, forms.SelectMultiple):
                widget.attrs["class"] = f"{existing} {self.multi_classes}".strip()
                widget.attrs.setdefault("size", 8)
            elif isinstance(widget, forms.PasswordInput):
                widget.attrs["class"] = f"{existing} {self.text_input_classes}".strip()
            elif isinstance(widget, (forms.TextInput, forms.NumberInput, forms.Select, forms.URLInput)):
                widget.attrs["class"] = f"{existing} {self.text_input_classes}".strip()
                if name in {"price", "sort_order"}:
                    widget.attrs["class"] = f"{widget.attrs['class']} studio-field__input--compact".strip()


class CategoryStudioForm(StudioBaseFormMixin, forms.ModelForm):
    class Meta:
        model = Category
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.apply_studio_widgets()


class ProductStudioForm(StudioBaseFormMixin, CropFieldsMixin, forms.ModelForm):
    class Meta:
        model = Product
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.apply_studio_widgets()


class ProductImageStudioForm(StudioBaseFormMixin, CropFieldsMixin, forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.apply_studio_widgets()

    def _has_media_payload(self):
        uploaded = self.files.get(self.add_prefix("image"))
        static_path = (self.data.get(self.add_prefix("static_image"), "") or "").strip()
        existing_image = bool(getattr(self.instance, "image", None))
        existing_static = bool(getattr(self.instance, "static_image", ""))
        return bool(uploaded or static_path or existing_image or existing_static)

    def has_changed(self):
        changed = super().has_changed()
        if not changed:
            return False

        if self.instance.pk:
            return True

        return self._has_media_payload()

    def clean(self):
        cleaned_data = super().clean()

        if cleaned_data.get("DELETE"):
            return cleaned_data

        title = (cleaned_data.get("title") or "").strip()
        static_path = (cleaned_data.get("static_image") or "").strip()
        uploaded = cleaned_data.get("image")
        sort_order = cleaned_data.get("sort_order")
        has_media = bool(uploaded or static_path or getattr(self.instance, "image", None) or getattr(self.instance, "static_image", ""))
        has_other_content = bool(title or sort_order)

        if has_other_content and not has_media:
            raise forms.ValidationError("Для дополнительного фото нужно загрузить изображение или указать путь к статическому файлу.")

        return cleaned_data


class ProductVideoStudioForm(StudioBaseFormMixin, CropFieldsMixin, forms.ModelForm):
    class Meta:
        model = ProductVideo
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.apply_studio_widgets()

    def _has_media_payload(self):
        uploaded = self.files.get(self.add_prefix("video"))
        existing_video = bool(getattr(self.instance, "video", None))
        return bool(uploaded or existing_video)

    def has_changed(self):
        changed = super().has_changed()
        if not changed:
            return False

        if self.instance.pk:
            return True

        return self._has_media_payload()

    def clean(self):
        cleaned_data = super().clean()

        if cleaned_data.get("DELETE"):
            return cleaned_data

        title = (cleaned_data.get("title") or "").strip()
        uploaded = cleaned_data.get("video")
        sort_order = cleaned_data.get("sort_order")
        has_media = bool(uploaded or getattr(self.instance, "video", None))
        has_other_content = bool(title or sort_order)

        if has_other_content and not has_media:
            raise forms.ValidationError("Для видео товара нужно загрузить видеофайл.")

        return cleaned_data


UserModel = get_user_model()


class StudioUserForm(StudioBaseFormMixin, forms.ModelForm):
    password1 = forms.CharField(
        label="Новый пароль",
        required=False,
        widget=forms.PasswordInput(render_value=False),
        help_text="Оставь пустым, чтобы не менять пароль. Для нового пользователя без пароля будет создана неактивная парольная запись.",
    )
    password2 = forms.CharField(
        label="Повтори пароль",
        required=False,
        widget=forms.PasswordInput(render_value=False),
    )

    class Meta:
        model = UserModel
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
            "user_permissions",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.apply_studio_widgets()

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 or password2:
            if password1 != password2:
                raise forms.ValidationError("Пароли не совпадают.")

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get("password1")

        if password:
            user.set_password(password)
        elif not user.pk:
            user.set_unusable_password()

        if commit:
            user.save()
            self.save_m2m()

        return user


class StudioGroupForm(StudioBaseFormMixin, forms.ModelForm):
    class Meta:
        model = Group
        fields = ("name", "permissions")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.apply_studio_widgets()


ProductImageStudioFormSet = inlineformset_factory(
    Product,
    ProductImage,
    form=ProductImageStudioForm,
    extra=0,
    can_delete=True,
    fields=("title", "static_image", "image", "crop_x", "crop_y", "crop_scale", "sort_order"),
)


ProductVideoStudioFormSet = inlineformset_factory(
    Product,
    ProductVideo,
    form=ProductVideoStudioForm,
    extra=0,
    can_delete=True,
    fields=("title", "video", "crop_x", "crop_y", "crop_scale", "is_muted", "sort_order"),
)
