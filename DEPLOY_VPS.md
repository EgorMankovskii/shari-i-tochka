# Django deploy on VPS

This project is prepared for deployment to a Linux VPS with:

- Ubuntu 24.04
- Nginx
- Gunicorn
- PostgreSQL
- systemd

## 1. Server preparation

Install base packages:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y python3 python3-venv python3-pip nginx postgresql postgresql-contrib git
```

## 2. Project directory

```bash
sudo mkdir -p /var/www/Shari-i-tochka
sudo chown $USER:$USER /var/www/Shari-i-tochka
cd /var/www/Shari-i-tochka
```

Copy the project files here.

If you use Git:

```bash
git clone <your-repository-url> /var/www/Shari-i-tochka
cd /var/www/Shari-i-tochka
```

## 3. Domain DNS

Point the domain to your server IP address with A records:

- `example.ru` -> `SERVER_IP`
- `www.example.ru` -> `SERVER_IP`

Wait until DNS records start resolving to the new server.

## 4. Virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 5. PostgreSQL

```bash
sudo -u postgres psql
```

Inside psql:

```sql
CREATE DATABASE shari_db;
CREATE USER shari_user WITH PASSWORD 'replace-password';
ALTER ROLE shari_user SET client_encoding TO 'utf8';
ALTER ROLE shari_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE shari_user SET timezone TO 'Europe/Moscow';
GRANT ALL PRIVILEGES ON DATABASE shari_db TO shari_user;
\q
```

## 6. Environment file

Copy `.env.vps.example` to `.env` and replace the values with real ones.

```bash
cp .env.vps.example .env
nano .env
```

## 7. Migrations and static files

```bash
source .venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

## 8. Permissions

Gunicorn in the provided template runs as `www-data`, so set access rights:

```bash
sudo chown -R www-data:www-data /var/www/Shari-i-tochka
sudo chmod -R u+rwX,g+rX /var/www/Shari-i-tochka
sudo chmod 750 /var/www/Shari-i-tochka
sudo chmod 600 /var/www/Shari-i-tochka/.env
```

## 9. Gunicorn

```bash
sudo cp deploy/gunicorn.service /etc/systemd/system/gunicorn.service
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
sudo systemctl status gunicorn
```

## 10. Nginx

Edit `deploy/nginx.conf` and replace `example.ru` with your real domain, then:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/shari-i-tochka
sudo ln -s /etc/nginx/sites-available/shari-i-tochka /etc/nginx/sites-enabled/shari-i-tochka
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 11. SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.ru -d www.example.ru
```

## 12. Updates

```bash
cd /var/www/Shari-i-tochka
git pull
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

## 13. Media backups

Back up these paths regularly:

- `/var/www/Shari-i-tochka/media/`
- PostgreSQL database `shari_db`
