import base64
import binascii

from django.conf import settings
from django.http import HttpResponse, HttpResponseForbidden
from django.utils.crypto import constant_time_compare


class ProtectedPanelMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if self._is_protected_path(request.path_info):
            if settings.PANEL_ALLOWED_IPS and not self._ip_allowed(request):
                return HttpResponseForbidden("Access denied.")

            if settings.PANEL_BASIC_AUTH_ENABLED and not self._basic_auth_allowed(request):
                response = HttpResponse("Authentication required.", status=401)
                response["WWW-Authenticate"] = 'Basic realm="Restricted panel"'
                return response

        return self.get_response(request)

    def _is_protected_path(self, path):
        return any(path.startswith(prefix) for prefix in settings.PROTECTED_PANEL_PREFIXES)

    def _ip_allowed(self, request):
        client_ip = request.META.get("REMOTE_ADDR", "")

        if settings.ADMIN_TRUST_PROXY_HEADERS:
            forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
            real_ip = request.META.get("HTTP_X_REAL_IP", "")
            if forwarded_for:
                client_ip = forwarded_for.split(",")[0].strip()
            elif real_ip:
                client_ip = real_ip.strip()

        return client_ip in settings.PANEL_ALLOWED_IPS

    def _basic_auth_allowed(self, request):
        header = request.META.get("HTTP_AUTHORIZATION", "")
        if not header.startswith("Basic "):
            return False

        encoded = header.split(" ", 1)[1].strip()
        try:
            decoded = base64.b64decode(encoded).decode("utf-8")
        except (binascii.Error, UnicodeDecodeError):
            return False

        username, separator, password = decoded.partition(":")
        if not separator:
            return False

        return (
            constant_time_compare(username, settings.PANEL_BASIC_AUTH_USERNAME)
            and constant_time_compare(password, settings.PANEL_BASIC_AUTH_PASSWORD)
        )
