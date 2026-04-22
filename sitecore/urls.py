from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path(settings.ADMIN_URL_PREFIX, admin.site.urls),
    path(settings.STUDIO_URL_PREFIX, include('catalog.studio_urls')),
    path('', include('catalog.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
