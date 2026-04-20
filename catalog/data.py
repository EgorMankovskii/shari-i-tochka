CONTACTS = {
    'phone_display': '+7 (903) 268-76-33',
    'phone_link': 'tel:+79032687633',
    'telegram_label': '@M_Olga_G_2022',
    'telegram_link': 'https://t.me/M_Olga_G_2022',
    'max_label': 'Max',
    'max_link': 'https://max.ru/u/f9LHodD0cOK0QwFUlmjTORPRY-pSs8QK2_eRwDoAaEf5PIhQ5rZcOCrxDr8',
    'whatsapp_label': '+7 903 268 7633',
    'whatsapp_link': 'https://wa.me/79032687633',
    'manager_name': 'Макс',
    'address': 'Москва, район Тушино',
    'hours': 'ежедневно, 09:00-22:00',
}

NAV_ITEMS = [
    {'title': 'Главная', 'url_name': 'home'},
    {'title': 'Цветы', 'url_name': 'flowers'},
    {'title': 'Шары', 'url_name': 'balloons'},
    {'title': 'Подарки', 'url_name': 'gifts'},
    {'title': 'Доставка', 'url_name': 'delivery'},
    {'title': 'Контакты', 'url_name': 'contacts'},
]

HOME_PAGE = {
    'hero_title': 'Цветы, шары и подарки с доставкой по Москве',
    'hero_text': (
        'Собрали лёгкую витрину в стиле премиального цветочного магазина: '
        'крупные карточки, понятное меню и быстрый сценарий связи без оплаты на сайте.'
    ),
    'hero_badges': ['Доставка от 60 минут', 'Фото перед отправкой', 'Без онлайн-оплаты'],
    'categories': [
        {
            'title': 'Цветы',
            'description': 'Монобукеты, сборные композиции и коробки в мягкой светлой палитре.',
            'url_name': 'flowers',
            'image': 'images/products/flowers.svg',
        },
        {
            'title': 'Шары',
            'description': 'Фонтаны из шаров, сетки, наборы на день рождения и welcome-композиции.',
            'url_name': 'balloons',
            'image': 'images/products/balloons.svg',
        },
        {
            'title': 'Подарки',
            'description': 'Сладкие боксы, свечи, открытки и маленькие приятные дополнения к заказу.',
            'url_name': 'gifts',
            'image': 'images/products/gifts.svg',
        },
    ],
    'featured_products': [
        {
            'title': 'Пудровый букет',
            'price': 'от 4 900 ₽',
            'tag': 'Хит',
            'category': 'Цветы',
            'image': 'images/products/card-bouquet.svg',
        },
        {
            'title': 'Фонтан из 9 шаров',
            'price': 'от 3 600 ₽',
            'tag': 'Праздник',
            'category': 'Шары',
            'image': 'images/products/card-balloons.svg',
        },
        {
            'title': 'Подарочный набор',
            'price': 'от 2 800 ₽',
            'tag': 'Новинка',
            'category': 'Подарки',
            'image': 'images/products/card-gift.svg',
        },
    ],
    'advantages': [
        {
            'title': 'Быстро и бережно',
            'text': 'Композиции приезжают в транспортировочной упаковке, а менеджер контролирует выдачу заказа.',
        },
        {
            'title': 'Удобный сценарий связи',
            'text': 'Вместо корзины и оплаты посетитель сразу видит окно связи с Telegram и WhatsApp.',
        },
        {
            'title': 'Готово под замену контента',
            'text': 'Фотографии можно складывать в отдельную папку и быстро менять карточки без переделки вёрстки.',
        },
    ],
    'occasions': [
        'День рождения',
        'Свидание',
        'Корпоративный подарок',
        'Выписка из роддома',
        'Сюрприз без повода',
    ],
}

CATEGORIES = {
    'flowers': {
        'menu_title': 'Цветы',
        'page_title': 'Букеты и композиции',
        'lead': 'Страница оформлена в духе исходного сайта: витрина, фильтры-кнопки и крупные карточки товаров.',
        'accent': 'Сборные букеты, монобукеты, коробки',
        'image': 'images/products/flowers.svg',
        'filters': ['Все', 'Монобукеты', 'Сборные букеты', 'Композиции'],
        'products': [
            {'title': 'Нежный кремовый букет', 'price': '4 900 ₽', 'image': 'images/products/card-bouquet.svg'},
            {'title': 'Розовый акцент', 'price': '5 400 ₽', 'image': 'images/products/card-bouquet.svg'},
            {'title': 'Шляпная коробка', 'price': '6 200 ₽', 'image': 'images/products/card-gift.svg'},
            {'title': 'Белые розы mono', 'price': '5 900 ₽', 'image': 'images/products/card-bouquet.svg'},
        ],
    },
    'balloons': {
        'menu_title': 'Шары',
        'page_title': 'Композиции из шаров',
        'lead': 'Упрощённая витрина для шаров с карточками, ценами и кнопкой связи вместо оплаты.',
        'accent': 'Фонтаны, наборы, шары с конфетти',
        'image': 'images/products/balloons.svg',
        'filters': ['Все', 'Фонтаны', 'Детские', 'Праздничные'],
        'products': [
            {'title': 'Фонтан пастель', 'price': '3 600 ₽', 'image': 'images/products/card-balloons.svg'},
            {'title': 'Набор на выписку', 'price': '4 300 ₽', 'image': 'images/products/card-balloons.svg'},
            {'title': 'Композиция с цифрой', 'price': '5 100 ₽', 'image': 'images/products/card-balloons.svg'},
            {'title': 'Праздничный микс', 'price': '4 700 ₽', 'image': 'images/products/card-balloons.svg'},
        ],
    },
    'gifts': {
        'menu_title': 'Подарки',
        'page_title': 'Подарки и дополнения',
        'lead': 'Небольшой раздел с сопутствующими товарами, который визуально поддерживает главный каталог.',
        'accent': 'Свечи, открытки, сладкие боксы',
        'image': 'images/products/gifts.svg',
        'filters': ['Все', 'Сладости', 'Открытки', 'Декор'],
        'products': [
            {'title': 'Сладкий бокс', 'price': '2 800 ₽', 'image': 'images/products/card-gift.svg'},
            {'title': 'Свеча и открытка', 'price': '1 600 ₽', 'image': 'images/products/card-gift.svg'},
            {'title': 'Подарочный мини-набор', 'price': '2 200 ₽', 'image': 'images/products/card-gift.svg'},
            {'title': 'Праздничный декор', 'price': '1 900 ₽', 'image': 'images/products/card-gift.svg'},
        ],
    },
}

DELIVERY_INFO = {
    'preview': {
        'title': 'Доставка в пределах Тушино и по соседним районам',
        'text': 'Заказы принимаются ежедневно. Среднее время сборки и отправки составляет 60-90 минут.',
    },
    'steps': [
        'Выбираете раздел и нажимаете кнопку связи.',
        'Открывается окно связи с Telegram и WhatsApp.',
        'Подтверждаете состав, стоимость и адрес напрямую в мессенджере.',
        'Получаете фото готового заказа перед отправкой.',
    ],
    'zones': [
        {'name': 'Северное Тушино', 'price': 'от 400 ₽'},
        {'name': 'Южное Тушино', 'price': 'от 600 ₽'},
        {'name': 'Покровское-Стрешнево', 'price': 'от 700 ₽'},
        {'name': 'Куркино и рядом', 'price': 'от 1 100 ₽'},
    ],
    'notes': [
        'Онлайн-оплата на сайте отключена: все детали согласуются вручную.',
        'Точная стоимость зависит от состава, адреса и времени доставки.',
        'Фото заказа отправляется перед выездом курьера.',
    ],
}
