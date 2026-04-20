const modal = document.querySelector("#contact-modal");

if (modal) {
    const openButtons = document.querySelectorAll(".js-open-contact-modal");
    const closeButtons = document.querySelectorAll(".js-close-contact-modal");

    const openModal = () => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    };

    const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    };

    openButtons.forEach((button) => {
        button.addEventListener("click", openModal);
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
    });
}

const galleryRoot = document.querySelector(".js-product-gallery");
const lightbox = document.querySelector("#gallery-lightbox");
const fitHero = document.querySelector(".js-fit-hero");
const productCards = Array.from(document.querySelectorAll(".product-card"));

if (productCards.length) {
    productCards.forEach((card) => {
        const image = card.querySelector(".js-product-card-image");
        const slides = Array.from(card.querySelectorAll(".product-card__slides [data-slide-src]"))
            .map((slide) => ({
                src: slide.dataset.slideSrc || "",
                position: slide.dataset.slidePosition || image?.dataset.defaultPosition || "50% 50%",
            }))
            .filter((slide) => slide.src);

        if (!image || slides.length < 2) {
            return;
        }

        let currentSlide = 0;
        let hoverDelay = 0;
        let hoverInterval = 0;

        const clearSlideshowTimers = () => {
            if (hoverDelay) {
                window.clearTimeout(hoverDelay);
                hoverDelay = 0;
            }

            if (hoverInterval) {
                window.clearInterval(hoverInterval);
                hoverInterval = 0;
            }
        };

        const renderSlide = (index, immediate = false) => {
            const nextSlide = slides[index];
            if (!nextSlide) {
                return;
            }

            currentSlide = index;

            if (immediate) {
                image.src = nextSlide.src;
                image.style.objectPosition = nextSlide.position;
                image.classList.remove("is-switching");
                return;
            }

            image.classList.add("is-switching");
            window.setTimeout(() => {
                image.src = nextSlide.src;
                image.style.objectPosition = nextSlide.position;
                window.requestAnimationFrame(() => {
                    image.classList.remove("is-switching");
                });
            }, 180);
        };

        const stepSlide = () => {
            renderSlide((currentSlide + 1) % slides.length);
        };

        const startSlideshow = () => {
            if (hoverDelay || hoverInterval) {
                return;
            }

            hoverDelay = window.setTimeout(() => {
                stepSlide();
                hoverInterval = window.setInterval(stepSlide, 2200);
            }, 900);
        };

        const stopSlideshow = () => {
            clearSlideshowTimers();
            renderSlide(0, true);
        };

        card.addEventListener("mouseenter", startSlideshow);
        card.addEventListener("mouseleave", stopSlideshow);
    });
}

if (fitHero) {
    const fitTarget = fitHero.querySelector(".js-fit-hero-target");
    const topbar = document.querySelector(".topbar");
    let fitHeroFrame = 0;

    const updateFitHero = () => {
        fitHeroFrame = 0;

        if (!fitTarget) {
            return;
        }

        if (window.innerWidth <= 1080) {
            fitHero.style.removeProperty("--fit-hero-header-offset");
            fitTarget.style.removeProperty("transform");
            return;
        }

        const headerHeight = topbar ? topbar.getBoundingClientRect().height : 0;
        const heroStyles = window.getComputedStyle(fitHero);
        const paddingTop = parseFloat(heroStyles.paddingTop) || 0;
        const paddingBottom = parseFloat(heroStyles.paddingBottom) || 0;

        fitHero.style.setProperty("--fit-hero-header-offset", `${Math.round(headerHeight)}px`);
        fitTarget.style.transform = "scale(1)";

        const availableHeight = Math.max(320, window.innerHeight - headerHeight - paddingTop - paddingBottom);
        const availableWidth = Math.max(320, fitHero.clientWidth - 32);
        const naturalHeight = fitTarget.offsetHeight;
        const naturalWidth = fitTarget.offsetWidth;
        const scale = Math.min(1, availableHeight / naturalHeight, availableWidth / naturalWidth);

        fitTarget.style.transform = `scale(${scale})`;
    };

    const scheduleFitHero = () => {
        if (fitHeroFrame) {
            cancelAnimationFrame(fitHeroFrame);
        }

        fitHeroFrame = requestAnimationFrame(updateFitHero);
    };

    window.addEventListener("load", scheduleFitHero);
    window.addEventListener("resize", scheduleFitHero);

    if (document.fonts?.ready) {
        document.fonts.ready.then(scheduleFitHero).catch(() => {});
    }

    fitTarget?.querySelectorAll("img").forEach((image) => {
        if (!image.complete) {
            image.addEventListener("load", scheduleFitHero);
        }
    });

    scheduleFitHero();
}

if (galleryRoot && lightbox) {
    const mainImage = galleryRoot.querySelector(".js-product-gallery-main-image");
    const mainVideo = galleryRoot.querySelector(".js-product-gallery-main-video");
    const mainOpenButton = galleryRoot.querySelector(".js-gallery-open");
    const thumbs = Array.from(galleryRoot.querySelectorAll(".js-gallery-thumb"));
    const extraOpenButtons = Array.from(document.querySelectorAll(".product-extra-card .js-gallery-open"));
    const closeButtons = lightbox.querySelectorAll(".js-close-lightbox");
    const prevButton = lightbox.querySelector(".js-lightbox-prev");
    const nextButton = lightbox.querySelector(".js-lightbox-next");
    const lightboxImage = lightbox.querySelector("#lightbox-image");
    const lightboxVideo = lightbox.querySelector("#lightbox-video");
    const lightboxTitle = lightbox.querySelector("#gallery-lightbox-title");

    let currentIndex = 0;
    const items = thumbs.map((thumb) => ({
        type: thumb.dataset.mediaType || "image",
        src: thumb.dataset.imageSrc || "",
        videoSrc: thumb.dataset.videoSrc || "",
        videoMuted: thumb.dataset.videoMuted === "true",
        alt: thumb.dataset.imageAlt || "",
        title: thumb.dataset.imageTitle || thumb.dataset.imageAlt || "",
    }));

    const stopVideo = (video) => {
        if (!video) {
            return;
        }

        video.pause();
        video.currentTime = 0;
        video.loop = false;
    };

    const startVideo = (video) => {
        if (!video) {
            return;
        }

        video.currentTime = 0;
        video.loop = false;
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(() => {});
        }
    };

    const setActiveThumb = (index) => {
        thumbs.forEach((thumb) => {
            thumb.classList.toggle("product-gallery__thumb--active", Number(thumb.dataset.galleryIndex) === index);
        });
    };

    const showMedia = (index) => {
        const item = items[index];

        if (!item || !mainImage || !mainVideo) {
            return;
        }

        currentIndex = index;

        if (item.type === "video") {
            mainImage.hidden = true;
            mainVideo.hidden = false;
            mainVideo.src = item.videoSrc;
            mainVideo.muted = item.videoMuted;
            mainVideo.load();
            mainVideo.addEventListener("loadeddata", () => startVideo(mainVideo), { once: true });
        } else {
            stopVideo(mainVideo);
            mainVideo.hidden = true;
            mainImage.hidden = false;
            mainImage.src = item.src;
            mainImage.alt = item.alt;
        }

        if (mainOpenButton) {
            mainOpenButton.dataset.galleryIndex = String(index);
        }
        setActiveThumb(index);
    };

    const openLightbox = (index) => {
        const item = items[index];

        if (!item || !lightboxImage || !lightboxVideo || !lightboxTitle) {
            return;
        }

        currentIndex = index;

        if (item.type === "video") {
            lightboxImage.hidden = true;
            lightboxVideo.hidden = false;
            lightboxVideo.src = item.videoSrc;
            lightboxVideo.muted = item.videoMuted;
            lightboxVideo.load();
            lightboxVideo.addEventListener("loadeddata", () => startVideo(lightboxVideo), { once: true });
        } else {
            stopVideo(lightboxVideo);
            lightboxVideo.hidden = true;
            lightboxImage.hidden = false;
            lightboxImage.src = item.src;
            lightboxImage.alt = item.alt;
        }

        lightboxTitle.textContent = item.title;
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    };

    const closeLightbox = () => {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        stopVideo(lightboxVideo);
    };

    const stepGallery = (direction) => {
        if (!items.length) {
            return;
        }

        const nextIndex = (currentIndex + direction + items.length) % items.length;
        showMedia(nextIndex);
        if (lightbox.classList.contains("is-open")) {
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

        element.addEventListener("touchstart", (event) => {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            active = true;
        }, { passive: true });

        element.addEventListener("touchend", (event) => {
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
        thumb.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            showMedia(Number(thumb.dataset.galleryIndex));
        });
    });

    galleryRoot.addEventListener("click", (event) => {
        const thumb = event.target.closest(".js-gallery-thumb");

        if (!thumb) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        showMedia(Number(thumb.dataset.galleryIndex));
    });

    [mainOpenButton, ...extraOpenButtons].filter(Boolean).forEach((button) => {
        button.addEventListener("click", () => {
            openLightbox(Number(button.dataset.galleryIndex || 0));
        });

        button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(Number(button.dataset.galleryIndex || 0));
            }
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeLightbox);
    });

    prevButton?.addEventListener("click", () => stepGallery(-1));
    nextButton?.addEventListener("click", () => stepGallery(1));

    bindSwipe(mainOpenButton, () => stepGallery(1), () => stepGallery(-1));
    bindSwipe(lightbox.querySelector(".lightbox__figure"), () => stepGallery(1), () => stepGallery(-1));

    document.addEventListener("keydown", (event) => {
        if (!lightbox.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowLeft") {
            stepGallery(-1);
        }

        if (event.key === "ArrowRight") {
            stepGallery(1);
        }
    });

    showMedia(0);
}
