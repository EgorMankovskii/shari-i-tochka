const modal = document.querySelector('#contact-modal');

if (modal) {
    const openButtons = document.querySelectorAll('.js-open-contact-modal');
    const closeButtons = document.querySelectorAll('.js-close-contact-modal');

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    openButtons.forEach((button) => {
        button.addEventListener('click', openModal);
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

const galleryRoot = document.querySelector('.js-product-gallery');
const lightbox = document.querySelector('#gallery-lightbox');

if (galleryRoot && lightbox) {
    const mainImage = galleryRoot.querySelector('.js-product-gallery-main-image');
    const mainOpenButton = galleryRoot.querySelector('.js-gallery-open');
    const thumbs = Array.from(galleryRoot.querySelectorAll('.js-gallery-thumb'));
    const extraOpenButtons = Array.from(document.querySelectorAll('.product-extra-card .js-gallery-open'));
    const closeButtons = lightbox.querySelectorAll('.js-close-lightbox');
    const prevButton = lightbox.querySelector('.js-lightbox-prev');
    const nextButton = lightbox.querySelector('.js-lightbox-next');
    const lightboxImage = lightbox.querySelector('#lightbox-image');
    const lightboxTitle = lightbox.querySelector('#gallery-lightbox-title');

    let currentIndex = 0;
    const items = thumbs.map((thumb) => ({
        src: thumb.dataset.imageSrc || '',
        alt: thumb.dataset.imageAlt || '',
        title: thumb.dataset.imageTitle || thumb.dataset.imageAlt || '',
    }));

    const setActiveThumb = (index) => {
        thumbs.forEach((thumb) => {
            thumb.classList.toggle('product-gallery__thumb--active', Number(thumb.dataset.galleryIndex) === index);
        });
    };

    const showImage = (index) => {
        const item = items[index];

        if (!item || !mainImage) {
            return;
        }

        currentIndex = index;
        mainImage.src = item.src;
        mainImage.alt = item.alt;
        if (mainOpenButton) {
            mainOpenButton.dataset.galleryIndex = String(index);
        }
        setActiveThumb(index);
    };

    const openLightbox = (index) => {
        const item = items[index];

        if (!item || !lightboxImage || !lightboxTitle) {
            return;
        }

        currentIndex = index;
        lightboxImage.src = item.src;
        lightboxImage.alt = item.alt;
        lightboxTitle.textContent = item.title;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    const stepGallery = (direction) => {
        if (!items.length) {
            return;
        }

        const nextIndex = (currentIndex + direction + items.length) % items.length;
        showImage(nextIndex);
        if (lightbox.classList.contains('is-open')) {
            openLightbox(nextIndex);
        }
    };

    const bindSwipe = (element, onLeft, onRight) => {
        if (!element) {
            return;
        }

        let startX = 0;
        let startY = 0;
        let active = false;

        element.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            active = true;
        }, { passive: true });

        element.addEventListener('touchend', (event) => {
            if (!active) {
                return;
            }

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            active = false;

            if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
                return;
            }

            if (deltaX < 0) {
                onLeft();
            } else {
                onRight();
            }
        }, { passive: true });
    };

    thumbs.forEach((thumb) => {
        thumb.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            showImage(Number(thumb.dataset.galleryIndex));
        });
    });

    galleryRoot.addEventListener('click', (event) => {
        const thumb = event.target.closest('.js-gallery-thumb');

        if (!thumb) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        showImage(Number(thumb.dataset.galleryIndex));
    });

    [mainOpenButton, ...extraOpenButtons].filter(Boolean).forEach((button) => {
        button.addEventListener('click', () => {
            openLightbox(Number(button.dataset.galleryIndex || 0));
        });

        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(Number(button.dataset.galleryIndex || 0));
            }
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', closeLightbox);
    });

    prevButton?.addEventListener('click', () => stepGallery(-1));
    nextButton?.addEventListener('click', () => stepGallery(1));

    bindSwipe(mainOpenButton, () => stepGallery(1), () => stepGallery(-1));
    bindSwipe(lightbox.querySelector('.lightbox__figure'), () => stepGallery(1), () => stepGallery(-1));

    document.addEventListener('keydown', (event) => {
        if (!lightbox.classList.contains('is-open')) {
            return;
        }

        if (event.key === 'Escape') {
            closeLightbox();
        }

        if (event.key === 'ArrowLeft') {
            stepGallery(-1);
        }

        if (event.key === 'ArrowRight') {
            stepGallery(1);
        }
    });

    showImage(0);
}
