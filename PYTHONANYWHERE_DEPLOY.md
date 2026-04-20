# Деплой на PythonAnywhere

Ниже готовая инструкция для выкладки проекта на `PythonAnywhere`.

## Что уже подготовлено в проекте

- `sitecore/settings.py` читает `SECRET_KEY`, `DEBUG` и `ALLOWED_HOSTS` из переменных окружения.
- `STATIC_ROOT` настроен на `staticfiles/`.
- `MEDIA_ROOT` настроен на `media/`.
- `sitecore/wsgi.py` уже подходит для запуска Django-проекта.

## 1. Создай Web app

В панели `PythonAnywhere`:

1. Открой раздел `Web`.
2. Нажми `Add a new web app`.
3. Выбери `Manual configuration`.
4. Выбери совместимую версию Python.

Рекомендуемый домен:

```text
zamp1ai.pythonanywhere.com
```

## 2. Загрузи проект на сервер

Рекомендуемая папка проекта:

```text
/home/Zamp1ai/shary-i-tochka
```

Если загружаешь через `git`:

```bash
git clone <repo_url> /home/Zamp1ai/shary-i-tochka
cd /home/Zamp1ai/shary-i-tochka
```

Если без `git`, просто загрузи архив проекта и распакуй его в ту же директорию.

## 3. Создай виртуальное окружение

```bash
mkvirtualenv --python=/usr/bin/python3.12 shary-i-tochka-env
cd /home/Zamp1ai/shary-i-tochka
pip install -r requirements.txt
```

## 4. Настрой переменные окружения

Можно задать их в консоли перед запуском команд:

```bash
export DJANGO_SECRET_KEY='замени-на-свой-секретный-ключ'
export DJANGO_DEBUG='False'
export DJANGO_ALLOWED_HOSTS='zamp1ai.pythonanywhere.com,Zamp1ai.pythonanywhere.com'
```

Либо вставить эти значения прямо в WSGI-конфиг `PythonAnywhere`.

Готовый пример лежит в файле:

```text
pythonanywhere_wsgi.py
```

## 5. Выполни миграции и собери статику

```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

Если нужен вход в админку:

```bash
python manage.py createsuperuser
```

## 6. Заполни настройки Web app

В панели `Web` укажи:

- Source code:

```text
/home/Zamp1ai/shary-i-tochka
```

- Working directory:

```text
/home/Zamp1ai/shary-i-tochka
```

- Virtualenv:

```text
/home/Zamp1ai/.virtualenvs/shary-i-tochka-env
```

## 7. Замени содержимое WSGI-файла

Открой WSGI-файл приложения в `PythonAnywhere` и вставь содержимое из файла:

```text
pythonanywhere_wsgi.py
```

Если вставляешь вручную, шаблон такой:

```python
import os
import sys

path = '/home/Zamp1ai/shary-i-tochka'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'sitecore.settings'
os.environ['DJANGO_SECRET_KEY'] = 'замени-на-свой-секретный-ключ'
os.environ['DJANGO_DEBUG'] = 'False'
os.environ['DJANGO_ALLOWED_HOSTS'] = 'zamp1ai.pythonanywhere.com,Zamp1ai.pythonanywhere.com'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

## 8. Настрой static и media mappings

В разделе `Static files` добавь:

- URL: `/static/`
- Directory:

```text
/home/Zamp1ai/shary-i-tochka/staticfiles
```

- URL: `/media/`
- Directory:

```text
/home/Zamp1ai/shary-i-tochka/media
```

## 9. Перезагрузи приложение

В панели `Web` нажми `Reload`.

## 10. Что проверить после выкладки

- открывается главная страница сайта
- открывается `/admin/`
- стили загружаются без ошибок
- изображения и видео товаров открываются
- работает страница товара и галерея
- через админку можно загружать новые фото и видео
- новые медиафайлы сохраняются и видны на сайте
