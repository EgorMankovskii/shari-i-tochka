from django.db import migrations


def seed_catalog(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    Product = apps.get_model('catalog', 'Product')

    categories = [
        {
            'title': 'Цветы',
            'slug': 'flowers',
            'home_description': 'Монобукеты, сборные композиции и коробки в мягкой светлой палитре.',
            'page_title': 'Букеты и композиции',
            'page_lead': 'Страница оформлена в духе исходного сайта: витрина, фильтры-кнопки и крупные карточки товаров.',
            'accent': 'Сборные букеты, монобукеты, коробки',
            'filters_text': 'Все, Монобукеты, Сборные букеты, Композиции',
            'static_image': 'images/products/flowers.svg',
            'sort_order': 10,
        },
        {
            'title': 'Шары',
            'slug': 'balloons',
            'home_description': 'Фонтаны из шаров, сетки, наборы на день рождения и welcome-композиции.',
            'page_title': 'Композиции из шаров',
            'page_lead': 'Упрощённая витрина для шаров с карточками, ценами и кнопкой открытия pop-up вместо оплаты.',
            'accent': 'Фонтаны, наборы, шары с конфетти',
            'filters_text': 'Все, Фонтаны, Детские, Праздничные',
            'static_image': 'images/products/balloons.svg',
            'sort_order': 20,
        },
        {
            'title': 'Подарки',
            'slug': 'gifts',
            'home_description': 'Сладкие боксы, свечи, открытки и маленькие приятные дополнения к заказу.',
            'page_title': 'Подарки и дополнения',
            'page_lead': 'Небольшой раздел с сопутствующими товарами, который визуально поддерживает главный каталог.',
            'accent': 'Свечи, открытки, сладкие боксы',
            'filters_text': 'Все, Сладости, Открытки, Декор',
            'static_image': 'images/products/gifts.svg',
            'sort_order': 30,
        },
    ]

    category_map = {}
    for item in categories:
        category, _ = Category.objects.update_or_create(
            slug=item['slug'],
            defaults=item,
        )
        category_map[item['slug']] = category

    products = [
        {
            'category_slug': 'flowers',
            'title': 'Пудровый букет',
            'price': 'от 4 900 ₽',
            'tag': 'Хит',
            'static_image': 'images/products/card-bouquet.svg',
            'is_featured': True,
            'sort_order': 10,
        },
        {
            'category_slug': 'flowers',
            'title': 'Розовый акцент',
            'price': '5 400 ₽',
            'tag': '',
            'static_image': 'images/products/card-bouquet.svg',
            'is_featured': False,
            'sort_order': 20,
        },
        {
            'category_slug': 'flowers',
            'title': 'Шляпная коробка',
            'price': '6 200 ₽',
            'tag': '',
            'static_image': 'images/products/card-gift.svg',
            'is_featured': False,
            'sort_order': 30,
        },
        {
            'category_slug': 'flowers',
            'title': 'Белые розы mono',
            'price': '5 900 ₽',
            'tag': '',
            'static_image': 'images/products/card-bouquet.svg',
            'is_featured': False,
            'sort_order': 40,
        },
        {
            'category_slug': 'balloons',
            'title': 'Фонтан из 9 шаров',
            'price': 'от 3 600 ₽',
            'tag': 'Праздник',
            'static_image': 'images/products/card-balloons.svg',
            'is_featured': True,
            'sort_order': 10,
        },
        {
            'category_slug': 'balloons',
            'title': 'Набор на выписку',
            'price': '4 300 ₽',
            'tag': '',
            'static_image': 'images/products/card-balloons.svg',
            'is_featured': False,
            'sort_order': 20,
        },
        {
            'category_slug': 'balloons',
            'title': 'Композиция с цифрой',
            'price': '5 100 ₽',
            'tag': '',
            'static_image': 'images/products/card-balloons.svg',
            'is_featured': False,
            'sort_order': 30,
        },
        {
            'category_slug': 'balloons',
            'title': 'Праздничный микс',
            'price': '4 700 ₽',
            'tag': '',
            'static_image': 'images/products/card-balloons.svg',
            'is_featured': False,
            'sort_order': 40,
        },
        {
            'category_slug': 'gifts',
            'title': 'Подарочный набор',
            'price': 'от 2 800 ₽',
            'tag': 'Новинка',
            'static_image': 'images/products/card-gift.svg',
            'is_featured': True,
            'sort_order': 10,
        },
        {
            'category_slug': 'gifts',
            'title': 'Сладкий бокс',
            'price': '2 800 ₽',
            'tag': '',
            'static_image': 'images/products/card-gift.svg',
            'is_featured': False,
            'sort_order': 20,
        },
        {
            'category_slug': 'gifts',
            'title': 'Свеча и открытка',
            'price': '1 600 ₽',
            'tag': '',
            'static_image': 'images/products/card-gift.svg',
            'is_featured': False,
            'sort_order': 30,
        },
        {
            'category_slug': 'gifts',
            'title': 'Праздничный декор',
            'price': '1 900 ₽',
            'tag': '',
            'static_image': 'images/products/card-gift.svg',
            'is_featured': False,
            'sort_order': 40,
        },
    ]

    for item in products:
        category = category_map[item.pop('category_slug')]
        Product.objects.update_or_create(
            category=category,
            title=item['title'],
            defaults=item,
        )


def unseed_catalog(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    Product = apps.get_model('catalog', 'Product')

    Product.objects.filter(
        title__in=[
            'Пудровый букет',
            'Розовый акцент',
            'Шляпная коробка',
            'Белые розы mono',
            'Фонтан из 9 шаров',
            'Набор на выписку',
            'Композиция с цифрой',
            'Праздничный микс',
            'Подарочный набор',
            'Сладкий бокс',
            'Свеча и открытка',
            'Праздничный декор',
        ]
    ).delete()
    Category.objects.filter(slug__in=['flowers', 'balloons', 'gifts']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_catalog, unseed_catalog),
    ]
