const sitePreloader = document.querySelector(".site-preloader");

if (sitePreloader) {
    const preloaderStartedAt = window.performance?.now?.() || Date.now();
    const minimumPreloaderTime = 550;
    let preloaderHidden = false;

    const hideSitePreloader = () => {
        if (preloaderHidden) {
            return;
        }

        preloaderHidden = true;

        const now = window.performance?.now?.() || Date.now();
        const delay = Math.max(minimumPreloaderTime - (now - preloaderStartedAt), 0);

        window.setTimeout(() => {
            sitePreloader.classList.add("is-hidden");
            window.setTimeout(() => {
                sitePreloader.remove();
            }, 420);
        }, delay);
    };

    if (document.readyState === "complete") {
        hideSitePreloader();
    } else {
        window.addEventListener("load", hideSitePreloader, { once: true });
        window.setTimeout(hideSitePreloader, 1200);
    }
}

document.addEventListener("contextmenu", (event) => {
    if (event.target.closest("img, video, picture")) {
        event.preventDefault();
    }
});

document.addEventListener("dragstart", (event) => {
    if (event.target.closest("img, video, picture")) {
        event.preventDefault();
    }
});

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
const subcategoryPickers = document.querySelectorAll(".js-subcategory-picker");
const CROP_CARD_RATIO = 4 / 5.5;
const DEFAULT_FRAME_WIDTH_RATIO = 0.58;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const resolveCropBox = (naturalWidth, naturalHeight, cropScale) => {
    let cropBoxWidth = (naturalWidth * DEFAULT_FRAME_WIDTH_RATIO) / (cropScale / 100);
    let cropBoxHeight = cropBoxWidth / CROP_CARD_RATIO;

    if (cropBoxHeight > naturalHeight) {
        cropBoxHeight = naturalHeight;
        cropBoxWidth = cropBoxHeight * CROP_CARD_RATIO;
    }

    if (cropBoxWidth > naturalWidth) {
        cropBoxWidth = naturalWidth;
        cropBoxHeight = cropBoxWidth / CROP_CARD_RATIO;
    }

    if (cropBoxHeight > naturalHeight) {
        cropBoxHeight = naturalHeight;
        cropBoxWidth = cropBoxHeight * CROP_CARD_RATIO;
    }

    return {
        width: cropBoxWidth,
        height: cropBoxHeight,
    };
};

const getCropContainer = (media) => (
    media.closest(".product-gallery__thumb-media") ||
    media.closest(".product-card__image-link") ||
    media.closest(".product-gallery__main") ||
    media.closest(".product-extra-card__button")
);

const getMediaNaturalSize = (media) => {
    if (!media) {
        return { width: 0, height: 0 };
    }

    if (media.tagName === "VIDEO") {
        return {
            width: media.videoWidth || 0,
            height: media.videoHeight || 0,
        };
    }

    return {
        width: media.naturalWidth || 0,
        height: media.naturalHeight || 0,
    };
};

const applySavedCrop = (media) => {
    if (!media) {
        return;
    }

    const container = getCropContainer(media);
    const cropScale = Math.max(Number(media.dataset.cropScale || 100), 20);
    const cropX = clamp(Number(media.dataset.cropX || 50), 0, 100);
    const cropY = clamp(Number(media.dataset.cropY || 50), 0, 100);
    const { width: naturalWidth, height: naturalHeight } = getMediaNaturalSize(media);

    if (!container || !naturalWidth || !naturalHeight || !container.clientWidth || !container.clientHeight) {
        media.classList.remove("crop-managed-media");
        media.style.removeProperty("left");
        media.style.removeProperty("top");
        media.style.removeProperty("width");
        media.style.removeProperty("height");
        return;
    }

    const cropBox = resolveCropBox(naturalWidth, naturalHeight, cropScale);
    const renderScale = Math.max(
        container.clientWidth / cropBox.width,
        container.clientHeight / cropBox.height,
    );
    const renderWidth = naturalWidth * renderScale;
    const renderHeight = naturalHeight * renderScale;
    const centerX = (cropX / 100) * naturalWidth;
    const centerY = (cropY / 100) * naturalHeight;
    const left = container.clientWidth / 2 - centerX * renderScale;
    const top = container.clientHeight / 2 - centerY * renderScale;

    media.classList.add("crop-managed-media");
    media.style.width = `${renderWidth}px`;
    media.style.height = `${renderHeight}px`;
    media.style.left = `${left}px`;
    media.style.top = `${top}px`;
};

const scheduleCropApply = (media) => {
    if (!media) {
        return;
    }

    const { width: naturalWidth } = getMediaNaturalSize(media);

    if (media.tagName === "VIDEO") {
        if (naturalWidth) {
            applySavedCrop(media);
            return;
        }

        media.addEventListener("loadedmetadata", () => applySavedCrop(media), { once: true });
        media.addEventListener("loadeddata", () => applySavedCrop(media), { once: true });
        return;
    }

    if (media.complete && naturalWidth) {
        applySavedCrop(media);
        return;
    }

    media.addEventListener("load", () => applySavedCrop(media), { once: true });
};

const applyAllSavedCrops = () => {
    document.querySelectorAll("img[data-crop-scale], video[data-crop-scale]").forEach((media) => {
        scheduleCropApply(media);
    });
};

subcategoryPickers.forEach((picker) => {
    const toggle = picker.querySelector(".subcategory-picker__toggle");
    const menu = picker.querySelector(".subcategory-picker__menu");

    if (!toggle || !menu) {
        return;
    }

    const closePicker = () => {
        picker.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        window.setTimeout(() => {
            if (!picker.classList.contains("is-open")) {
                menu.hidden = true;
            }
        }, 210);
    };

    const openPicker = () => {
        menu.hidden = false;
        window.requestAnimationFrame(() => {
            picker.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
        });
    };

    toggle.addEventListener("click", () => {
        if (picker.classList.contains("is-open")) {
            closePicker();
        } else {
            openPicker();
        }
    });

    document.addEventListener("click", (event) => {
        if (!picker.contains(event.target)) {
            closePicker();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closePicker();
        }
    });
});

if (productCards.length) {
    const mobileProductCardQuery = window.matchMedia("(max-width: 560px)");
    const cardSlideshows = [];
    const cardSlideshowByElement = new Map();

    const isMobileProductSlideshow = () => mobileProductCardQuery.matches;

    productCards.forEach((card) => {
        const image = card.querySelector(".js-product-card-image");
        const slides = Array.from(card.querySelectorAll(".product-card__slides [data-slide-src]"))
            .map((slide) => ({
                src: slide.dataset.slideSrc || "",
                cropX: slide.dataset.slideCropX || image?.dataset.cropX || "50",
                cropY: slide.dataset.slideCropY || image?.dataset.cropY || "50",
                cropScale: slide.dataset.slideCropScale || image?.dataset.cropScale || "100",
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
                image.dataset.cropX = nextSlide.cropX;
                image.dataset.cropY = nextSlide.cropY;
                image.dataset.cropScale = nextSlide.cropScale;
                scheduleCropApply(image);
                image.classList.remove("is-switching");
                return;
            }

            image.classList.add("is-switching");
            window.setTimeout(() => {
                image.src = nextSlide.src;
                image.dataset.cropX = nextSlide.cropX;
                image.dataset.cropY = nextSlide.cropY;
                image.dataset.cropScale = nextSlide.cropScale;
                scheduleCropApply(image);
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
                hoverInterval = window.setInterval(stepSlide, 3200);
            }, 1200);
        };

        const stopSlideshow = () => {
            clearSlideshowTimers();
            renderSlide(0, true);
        };

        const controller = {
            card,
            start: startSlideshow,
            stop: stopSlideshow,
        };

        cardSlideshows.push(controller);
        cardSlideshowByElement.set(card, controller);

        card.addEventListener("mouseenter", () => {
            if (!isMobileProductSlideshow()) {
                startSlideshow();
            }
        });

        card.addEventListener("mouseleave", () => {
            if (!isMobileProductSlideshow()) {
                stopSlideshow();
            }
        });
    });

    if (cardSlideshows.length && "IntersectionObserver" in window) {
        const visibleMobileCards = new Map();
        let activeMobileCard = null;

        const stopActiveMobileCard = () => {
            if (!activeMobileCard) {
                return;
            }

            activeMobileCard.stop();
            activeMobileCard = null;
        };

        const syncMobileCardSlideshow = () => {
            if (!isMobileProductSlideshow()) {
                visibleMobileCards.clear();
                stopActiveMobileCard();
                return;
            }

            let nextCard = null;
            let nextRatio = 0;

            visibleMobileCards.forEach((entry, controller) => {
                if (entry.intersectionRatio > nextRatio) {
                    nextRatio = entry.intersectionRatio;
                    nextCard = controller;
                }
            });

            if (!nextCard || nextRatio < 0.45) {
                stopActiveMobileCard();
                return;
            }

            if (activeMobileCard === nextCard) {
                return;
            }

            stopActiveMobileCard();
            activeMobileCard = nextCard;
            activeMobileCard.start();
        };

        const mobileCardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const controller = cardSlideshowByElement.get(entry.target);

                if (!controller) {
                    return;
                }

                if (entry.isIntersecting) {
                    visibleMobileCards.set(controller, entry);
                } else {
                    visibleMobileCards.delete(controller);

                    if (activeMobileCard === controller) {
                        stopActiveMobileCard();
                    }
                }
            });

            syncMobileCardSlideshow();
        }, {
            rootMargin: "-12% 0px -18% 0px",
            threshold: [0, 0.25, 0.45, 0.6, 0.75, 1],
        });

        cardSlideshows.forEach(({ card }) => {
            mobileCardObserver.observe(card);
        });

        if (typeof mobileProductCardQuery.addEventListener === "function") {
            mobileProductCardQuery.addEventListener("change", syncMobileCardSlideshow);
        } else if (typeof mobileProductCardQuery.addListener === "function") {
            mobileProductCardQuery.addListener(syncMobileCardSlideshow);
        }

        window.addEventListener("resize", syncMobileCardSlideshow);
        window.addEventListener("orientationchange", syncMobileCardSlideshow);
    }
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
        cropX: thumb.dataset.cropX || "50",
        cropY: thumb.dataset.cropY || "50",
        cropScale: thumb.dataset.cropScale || "100",
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
            mainVideo.dataset.cropX = item.cropX;
            mainVideo.dataset.cropY = item.cropY;
            mainVideo.dataset.cropScale = item.cropScale;
            mainVideo.load();
            mainVideo.addEventListener("loadeddata", () => {
                scheduleCropApply(mainVideo);
                startVideo(mainVideo);
            }, { once: true });
        } else {
            stopVideo(mainVideo);
            mainVideo.hidden = true;
            mainImage.hidden = false;
            mainImage.src = item.src;
            mainImage.alt = item.alt;
            mainImage.dataset.cropX = item.cropX;
            mainImage.dataset.cropY = item.cropY;
            mainImage.dataset.cropScale = item.cropScale;
            scheduleCropApply(mainImage);
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
            lightboxVideo.dataset.cropX = item.cropX;
            lightboxVideo.dataset.cropY = item.cropY;
            lightboxVideo.dataset.cropScale = item.cropScale;
            lightboxVideo.load();
            lightboxVideo.addEventListener("loadeddata", () => {
                scheduleCropApply(lightboxVideo);
                startVideo(lightboxVideo);
            }, { once: true });
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

window.addEventListener("load", applyAllSavedCrops);
window.addEventListener("resize", applyAllSavedCrops);
