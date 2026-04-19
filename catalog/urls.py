from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('delivery/', views.delivery, name='delivery'),
    path('contacts/', views.contacts, name='contacts'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    path('<slug:slug>/', views.category_page, name='category_detail'),
]
