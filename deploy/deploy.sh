#!/bin/bash
set -e

cd /var/www/Shari-i-tochka
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
