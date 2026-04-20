from django import forms
from django.forms.widgets import HiddenInput

from .models import Product, ProductImage, ProductVideo


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


class ProductVideoAdminForm(forms.ModelForm):
    class Meta:
        model = ProductVideo
        fields = "__all__"
