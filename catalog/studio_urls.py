from django.urls import path

from . import studio_views


urlpatterns = [
    path("", studio_views.studio_home, name="studio_home"),
    path("products/", studio_views.studio_product_list, name="studio_product_list"),
    path("products/new/", studio_views.studio_product_create, name="studio_product_create"),
    path("products/<int:pk>/", studio_views.studio_product_edit, name="studio_product_edit"),
    path("products/<int:pk>/toggle-status/", studio_views.studio_product_toggle_status, name="studio_product_toggle_status"),
    path("categories/", studio_views.studio_category_list, name="studio_category_list"),
    path("categories/new/", studio_views.studio_category_create, name="studio_category_create"),
    path("categories/<int:pk>/", studio_views.studio_category_edit, name="studio_category_edit"),
    path("categories/<int:pk>/toggle-status/", studio_views.studio_category_toggle_status, name="studio_category_toggle_status"),
    path("users/", studio_views.studio_user_list, name="studio_user_list"),
    path("users/new/", studio_views.studio_user_create, name="studio_user_create"),
    path("users/<int:pk>/", studio_views.studio_user_edit, name="studio_user_edit"),
    path("groups/", studio_views.studio_group_list, name="studio_group_list"),
    path("groups/new/", studio_views.studio_group_create, name="studio_group_create"),
    path("groups/<int:pk>/", studio_views.studio_group_edit, name="studio_group_edit"),
]
