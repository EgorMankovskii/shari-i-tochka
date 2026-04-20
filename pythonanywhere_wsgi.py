import os
import sys

path = '/home/Zamp1ai/shary-i-tochka'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'sitecore.settings'
os.environ['DJANGO_SECRET_KEY'] = 'replace-with-your-secret-key'
os.environ['DJANGO_DEBUG'] = 'False'
os.environ['DJANGO_ALLOWED_HOSTS'] = 'zamp1ai.pythonanywhere.com,Zamp1ai.pythonanywhere.com'

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
