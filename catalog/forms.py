from django import forms
from django.forms.widgets import HiddenInput

from .models import Product


class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'crop_x': HiddenInput(),
            'crop_y': HiddenInput(),
            'crop_scale': HiddenInput(),
        }
