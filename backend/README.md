# SkyMart Django Backend

## Why there is a nested `backend/backend` folder?

This is the standard Django project layout:

- `backend/` is the root folder for the backend application.
- `backend/manage.py` is the Django command-line utility.
- `backend/backend/` is the Django project package containing settings, URLs, and WSGI/ASGI entrypoints.

The nested folder name matches the Django project name and keeps the Django configuration separate from the app code.

## Setup

1. Create and activate a Python virtual environment:

   python -m venv venv
   .\venv\Scripts\Activate.ps1

2. Install dependencies:

   pip install -r requirements.txt

3. Configure MySQL environment variables:

   setx MYSQL_DATABASE "skymart"
   setx MYSQL_USER "skymart_user"
   setx MYSQL_PASSWORD "skymart_password"
   setx MYSQL_HOST "127.0.0.1"
   setx MYSQL_PORT "3306"
   setx DJANGO_SECRET_KEY "your-secret-key"
   setx DJANGO_DEBUG "True"

   Or create a `.env` file in `backend/` with these values.

4. Configure MySQL Workbench:
   - Open MySQL Workbench.
   - Connect to your local MySQL server.
   - Create a new schema named `skymart`.
   - Create a new user account such as `skymart_user` with password `skymart_password`.
   - Grant `ALL PRIVILEGES` on `skymart.*` to that user.

   Alternatively, run the SQL below in MySQL Workbench or the MySQL shell:

   ```sql
   CREATE DATABASE IF NOT EXISTS skymart;
   CREATE USER IF NOT EXISTS 'skymart_user'@'localhost' IDENTIFIED BY 'Hitheshwar@2007';
   GRANT ALL PRIVILEGES ON skymart.* TO 'skymart_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. (Optional) Create a `.env` file in `backend/` with:

   MYSQL_DATABASE=skymart
   MYSQL_USER=skymart_user
   MYSQL_PASSWORD=skymart_password
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   DJANGO_SECRET_KEY=your-secret-key
   DJANGO_DEBUG=True

6. Run Django migrations:

   python manage.py migrate

7. Create a superuser if needed:

   python manage.py createsuperuser

8. Run the development server:

   python manage.py runserver

## API Endpoints

- `GET /api/products/` - list products
- `POST /api/products/` - create product
- `GET /api/products/<id>/` - retrieve product
- `GET /api/purchases/` - list purchases
- `POST /api/purchases/` - create purchase

## Notes

- Uses MySQL via `django.db.backends.mysql`
- CORS is enabled for frontend integration
