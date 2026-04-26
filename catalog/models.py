from django.db import models
from django.templatetags.static import static
from django.urls import reverse


class Category(models.Model):
    title = models.CharField("Название", max_length=120)
    slug = models.SlugField("Slug", unique=True)
    home_description = models.TextField("Описание для главной", blank=True)
    default_product_description = models.TextField(
        "Описание товара по умолчанию",
        blank=True,
        help_text="Показывается на странице товара, если у конкретной карточки описание не заполнено.",
    )
    page_title = models.CharField("Заголовок страницы", max_length=180, blank=True)
    page_lead = models.TextField("Подзаголовок страницы", blank=True)
    accent = models.CharField("Акцентная строка", max_length=180, blank=True)
    filters_text = models.CharField(
        "Фильтры через запятую",
        max_length=255,
        blank=True,
        help_text="Например: Все, Монобукеты, Сборные букеты, Композиции",
    )
    static_image = models.CharField(
        "Путь к статичному изображению",
        max_length=255,
        blank=True,
        help_text="Например: images/products/flowers.svg",
    )
    image = models.FileField("Изображение категории", upload_to="categories/", blank=True)
    is_visible = models.BooleanField("Показывать на сайте", default=True)
    sort_order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["sort_order", "title"]
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("category_detail", kwargs={"slug": self.slug})

    @property
    def filters(self):
        items = [item.strip() for item in self.filters_text.split(",") if item.strip()]
        return items or ["Все"]

    @property
    def display_page_title(self):
        return self.page_title or self.title

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return ""

    @property
    def display_image_url(self):
        if self.image:
            return self.image.url
        if self.static_image:
            return static(self.static_image)
        return ""


class Product(models.Model):
    DEFAULT_PLACEHOLDER_IMAGE = "images/products/card-bouquet.svg"

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
        verbose_name="Категория",
    )
    title = models.CharField("Название", max_length=180)
    description = models.TextField("Описание", blank=True)
    composition = models.TextField("Состав", blank=True)
    price = models.CharField("Цена", max_length=80)
    tag = models.CharField("Метка", max_length=80, blank=True)
    static_image = models.CharField(
        "Путь к статичному изображению",
        max_length=255,
        blank=True,
        default=DEFAULT_PLACEHOLDER_IMAGE,
        help_text="Например: images/products/card-bouquet.svg",
    )
    image = models.FileField("Изображение товара", upload_to="products/", blank=True)
    crop_x = models.PositiveSmallIntegerField("Кадрирование X", default=50)
    crop_y = models.PositiveSmallIntegerField("Кадрирование Y", default=50)
    crop_scale = models.PositiveSmallIntegerField("Масштаб кадра", default=100)
    is_featured = models.BooleanField("Показывать в хитах на главной", default=False)
    is_active = models.BooleanField("Показывать на сайте", default=True)
    sort_order = models.PositiveIntegerField("Порядок", default=0)
    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        ordering = ["sort_order", "title"]
        verbose_name = "Карточка товара"
        verbose_name_plural = "Карточки товаров"

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("product_detail", kwargs={"pk": self.pk})

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return ""

    @property
    def display_image_url(self):
        if self.image:
            return self.image.url
        if self.static_image:
            return static(self.static_image)
        return static(self.DEFAULT_PLACEHOLDER_IMAGE)

    @property
    def object_position(self):
        return f"{self.crop_x}% {self.crop_y}%"

    @property
    def crop_scale_factor(self):
        return max(self.crop_scale, 20) / 100


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="gallery_images",
        verbose_name="Товар",
    )
    title = models.CharField("Название изображения", max_length=140, blank=True)
    static_image = models.CharField(
        "Путь к статичному изображению",
        max_length=255,
        blank=True,
        help_text="Например: images/products/card-bouquet.svg",
    )
    image = models.FileField("Файл изображения", upload_to="products/gallery/", blank=True)
    crop_x = models.PositiveSmallIntegerField("Кадрирование X", default=50)
    crop_y = models.PositiveSmallIntegerField("Кадрирование Y", default=50)
    crop_scale = models.PositiveSmallIntegerField("Масштаб кадра", default=100)
    sort_order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "Дополнительное изображение"
        verbose_name_plural = "Дополнительные изображения"

    def __str__(self):
        return self.title or f"Изображение для {self.product.title}"

    @property
    def display_image_url(self):
        if self.image:
            return self.image.url
        if self.static_image:
            return static(self.static_image)
        return ""

    @property
    def object_position(self):
        return f"{self.crop_x}% {self.crop_y}%"

    @property
    def crop_scale_factor(self):
        return max(self.crop_scale, 20) / 100


class ProductVideo(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="gallery_videos",
        verbose_name="Товар",
    )
    title = models.CharField("Название видео", max_length=140, blank=True)
    video = models.FileField("Видео", upload_to="products/videos/")
    crop_x = models.PositiveSmallIntegerField("Кадрирование X", default=50)
    crop_y = models.PositiveSmallIntegerField("Кадрирование Y", default=50)
    crop_scale = models.PositiveSmallIntegerField("Масштаб кадра", default=100)
    is_muted = models.BooleanField("Отключить звук", default=True)
    sort_order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "Видео товара"
        verbose_name_plural = "Видео товара"

    def __str__(self):
        return self.title or f"Видео для {self.product.title}"

    @property
    def video_url(self):
        if self.video:
            return self.video.url
        return ""

    @property
    def object_position(self):
        return f"{self.crop_x}% {self.crop_y}%"

    @property
    def crop_scale_factor(self):
        return max(self.crop_scale, 20) / 100
