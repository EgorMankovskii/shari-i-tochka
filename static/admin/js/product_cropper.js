(function () {
    const CARD_RATIO = 4 / 5.5;
    const DEFAULT_FRAME_WIDTH_RATIO = 0.58;
    const MAX_STAGE_WIDTH = 560;
    const MAX_STAGE_HEIGHT = 420;
    const MIN_FRAME_WIDTH = 88;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const getScope = (root) => (
        root.closest(".inline-related") ||
        root.closest("fieldset") ||
        root.closest("form") ||
        document
    );

    const findField = (scope, fieldName) => (
        scope.querySelector(`[name="${fieldName}"]`) ||
        scope.querySelector(`#id_${fieldName}`) ||
        scope.querySelector(`[name$="-${fieldName}"]`)
    );

    const findImageInput = (scope) => (
        scope.querySelector('input[type="file"][name="image"]') ||
        scope.querySelector('input[type="file"][id="id_image"]') ||
        scope.querySelector('input[type="file"][name$="-image"]') ||
        scope.querySelector('input[type="file"][id$="-image"]') ||
        scope.querySelector('input[type="file"]')
    );

    const findClearInput = (scope) => (
        scope.querySelector('input[type="checkbox"][name="image-clear"]') ||
        scope.querySelector('input[type="checkbox"][id="id_image-clear"]') ||
        scope.querySelector('input[type="checkbox"][name$="-image-clear"]')
    );

    const initCropper = (root) => {
        if (root.dataset.cropperReady === "true") {
            return;
        }

        const scope = getScope(root);
        const workspace = root.querySelector(".product-cropper__workspace");
        const empty = root.querySelector(".product-cropper__empty");
        const stage = root.querySelector(".product-cropper__stage");
        const shell = root.querySelector(".product-cropper__image-shell");
        const image = root.querySelector(".product-cropper__image");
        const frame = root.querySelector(".product-cropper__frame");
        const previewCanvas = root.querySelector(".product-cropper__preview-canvas");
        const handles = Array.from(root.querySelectorAll("[data-resize-dir]"));
        const cropXInput = findField(scope, "crop_x");
        const cropYInput = findField(scope, "crop_y");
        const cropScaleInput = findField(scope, "crop_scale");
        const imageInput = findImageInput(scope);
        const clearInput = findClearInput(scope);

        if (!workspace || !empty || !stage || !shell || !image || !frame || !previewCanvas || !cropXInput || !cropYInput || !cropScaleInput) {
            return;
        }

        root.dataset.cropperReady = "true";

        const previewContext = previewCanvas.getContext("2d");
        const persistedSrc = root.dataset.imageUrl || "";
        let temporaryUrl = "";
        let currentSrc = "";
        let shellWidth = 0;
        let shellHeight = 0;
        let pointerMode = null;
        let activePointerId = null;
        let resizeDir = "";
        let startPointerX = 0;
        let startPointerY = 0;
        let startBox = { x: 0, y: 0, width: 0, height: 0 };
        let box = { x: 0, y: 0, width: 0, height: 0 };
        let resizeFrame = 0;

        const revokeTemporaryUrl = () => {
            if (temporaryUrl) {
                URL.revokeObjectURL(temporaryUrl);
                temporaryUrl = "";
            }
        };

        const clearPreview = () => {
            previewContext?.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        };

        const setVisible = (isVisible) => {
            workspace.hidden = !isVisible;
            empty.hidden = isVisible;
        };

        const positionHandles = () => {
            const points = {
                n: [box.x + box.width / 2, box.y],
                e: [box.x + box.width, box.y + box.height / 2],
                s: [box.x + box.width / 2, box.y + box.height],
                w: [box.x, box.y + box.height / 2],
                ne: [box.x + box.width, box.y],
                nw: [box.x, box.y],
                se: [box.x + box.width, box.y + box.height],
                sw: [box.x, box.y + box.height],
            };

            handles.forEach((handle) => {
                const [left, top] = points[handle.dataset.resizeDir] || [0, 0];
                handle.style.left = `${left}px`;
                handle.style.top = `${top}px`;
            });
        };

        const syncInputs = () => {
            if (!shellWidth || !shellHeight) {
                return;
            }

            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const defaultWidth = shellWidth * DEFAULT_FRAME_WIDTH_RATIO;
            const scale = defaultWidth > 0 ? Math.round((defaultWidth / box.width) * 100) : 100;

            cropXInput.value = clamp(Math.round((centerX / shellWidth) * 100), 0, 100);
            cropYInput.value = clamp(Math.round((centerY / shellHeight) * 100), 0, 100);
            cropScaleInput.value = clamp(scale, 20, 500);
        };

        const drawPreview = () => {
            if (!previewContext || !image.naturalWidth || !image.naturalHeight || !shellWidth || !shellHeight) {
                clearPreview();
                return;
            }

            const scaleX = image.naturalWidth / shellWidth;
            const scaleY = image.naturalHeight / shellHeight;
            const sourceX = box.x * scaleX;
            const sourceY = box.y * scaleY;
            const sourceWidth = box.width * scaleX;
            const sourceHeight = box.height * scaleY;

            clearPreview();
            previewContext.drawImage(
                image,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                previewCanvas.width,
                previewCanvas.height,
            );
        };

        const applyBox = () => {
            if (!shellWidth || !shellHeight) {
                return;
            }

            const minWidth = Math.min(MIN_FRAME_WIDTH, shellWidth);
            box.width = clamp(box.width, minWidth, shellWidth);
            box.height = box.width / CARD_RATIO;

            if (box.height > shellHeight) {
                box.height = shellHeight;
                box.width = box.height * CARD_RATIO;
            }

            box.x = clamp(box.x, 0, shellWidth - box.width);
            box.y = clamp(box.y, 0, shellHeight - box.height);

            frame.style.left = `${box.x}px`;
            frame.style.top = `${box.y}px`;
            frame.style.width = `${box.width}px`;
            frame.style.height = `${box.height}px`;

            positionHandles();
            syncInputs();
            drawPreview();
        };

        const placeBoxFromInputs = () => {
            if (!shellWidth || !shellHeight) {
                return;
            }

            const centerXPercent = Number(cropXInput.value || root.dataset.cropX || 50);
            const centerYPercent = Number(cropYInput.value || root.dataset.cropY || 50);
            const scalePercent = Math.max(Number(cropScaleInput.value || root.dataset.cropScale || 100), 20);
            const defaultWidth = shellWidth * DEFAULT_FRAME_WIDTH_RATIO;
            const targetWidth = clamp(defaultWidth / (scalePercent / 100), Math.min(MIN_FRAME_WIDTH, shellWidth), shellWidth);
            const targetHeight = targetWidth / CARD_RATIO;

            box.width = targetWidth;
            box.height = targetHeight;
            box.x = (centerXPercent / 100) * shellWidth - targetWidth / 2;
            box.y = (centerYPercent / 100) * shellHeight - targetHeight / 2;
            applyBox();
        };

        const updateShellSize = () => {
            if (!image.naturalWidth || !image.naturalHeight) {
                return;
            }

            const availableWidth = Math.min(stage.clientWidth || MAX_STAGE_WIDTH, MAX_STAGE_WIDTH);
            const widthRatio = availableWidth / image.naturalWidth;
            const heightRatio = MAX_STAGE_HEIGHT / image.naturalHeight;
            const scale = Math.min(widthRatio, heightRatio, 1);

            shellWidth = Math.max(Math.round(image.naturalWidth * scale), 1);
            shellHeight = Math.max(Math.round(image.naturalHeight * scale), 1);

            shell.style.width = `${shellWidth}px`;
            shell.style.height = `${shellHeight}px`;
        };

        const scheduleReflow = () => {
            if (resizeFrame) {
                cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = requestAnimationFrame(() => {
                resizeFrame = 0;
                if (!currentSrc || !image.complete) {
                    return;
                }

                updateShellSize();
                placeBoxFromInputs();
            });
        };

        const showEmptyState = () => {
            currentSrc = "";
            image.removeAttribute("src");
            shell.removeAttribute("style");
            shellWidth = 0;
            shellHeight = 0;
            setVisible(false);
            clearPreview();
        };

        const showImage = (src) => {
            if (!src) {
                showEmptyState();
                return;
            }

            currentSrc = src;
            setVisible(true);

            image.onload = () => {
                updateShellSize();
                placeBoxFromInputs();
            };

            image.onerror = () => {
                showEmptyState();
            };

            image.src = src;
        };

        const restorePersistedImage = () => {
            if (imageInput?.files?.length) {
                return;
            }

            if (clearInput?.checked) {
                showEmptyState();
                return;
            }

            showImage(persistedSrc);
        };

        const showSelectedFile = (file) => {
            revokeTemporaryUrl();

            if (!file) {
                restorePersistedImage();
                return;
            }

            temporaryUrl = URL.createObjectURL(file);
            showImage(temporaryUrl);
        };

        const resizeBox = (deltaX, deltaY) => {
            const startRight = startBox.x + startBox.width;
            const startBottom = startBox.y + startBox.height;
            let nextWidth = startBox.width;

            const horizontalWidth = resizeDir.includes("e")
                ? startBox.width + deltaX
                : resizeDir.includes("w")
                    ? startBox.width - deltaX
                    : null;

            const verticalWidth = resizeDir.includes("s")
                ? startBox.width + deltaY * CARD_RATIO
                : resizeDir.includes("n")
                    ? startBox.width - deltaY * CARD_RATIO
                    : null;

            if (horizontalWidth !== null && verticalWidth !== null) {
                nextWidth = Math.abs(horizontalWidth - startBox.width) > Math.abs(verticalWidth - startBox.width)
                    ? horizontalWidth
                    : verticalWidth;
            } else if (horizontalWidth !== null) {
                nextWidth = horizontalWidth;
            } else if (verticalWidth !== null) {
                nextWidth = verticalWidth;
            }

            nextWidth = clamp(nextWidth, Math.min(MIN_FRAME_WIDTH, shellWidth), shellWidth);
            const nextHeight = nextWidth / CARD_RATIO;
            let nextX = startBox.x;
            let nextY = startBox.y;

            if (resizeDir.includes("w")) {
                nextX = startRight - nextWidth;
            } else if (!resizeDir.includes("e")) {
                nextX = startBox.x + (startBox.width - nextWidth) / 2;
            }

            if (resizeDir.includes("n")) {
                nextY = startBottom - nextHeight;
            } else if (!resizeDir.includes("s")) {
                nextY = startBox.y + (startBox.height - nextHeight) / 2;
            }

            box = {
                x: nextX,
                y: nextY,
                width: nextWidth,
                height: nextHeight,
            };
            applyBox();
        };

        const stopPointerInteraction = () => {
            pointerMode = null;
            resizeDir = "";
            activePointerId = null;
        };

        const handlePointerMove = (event) => {
            if (!pointerMode || activePointerId !== event.pointerId) {
                return;
            }

            const deltaX = event.clientX - startPointerX;
            const deltaY = event.clientY - startPointerY;

            if (pointerMode === "move") {
                box.x = startBox.x + deltaX;
                box.y = startBox.y + deltaY;
                applyBox();
                return;
            }

            resizeBox(deltaX, deltaY);
        };

        frame.addEventListener("pointerdown", (event) => {
            if (event.target !== frame || !shellWidth || !shellHeight) {
                return;
            }

            event.preventDefault();
            pointerMode = "move";
            activePointerId = event.pointerId;
            startPointerX = event.clientX;
            startPointerY = event.clientY;
            startBox = { ...box };
            frame.setPointerCapture?.(event.pointerId);
        });

        handles.forEach((handle) => {
            handle.addEventListener("pointerdown", (event) => {
                if (!shellWidth || !shellHeight) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                pointerMode = "resize";
                resizeDir = handle.dataset.resizeDir || "";
                activePointerId = event.pointerId;
                startPointerX = event.clientX;
                startPointerY = event.clientY;
                startBox = { ...box };
                handle.setPointerCapture?.(event.pointerId);
            });
        });

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", stopPointerInteraction);
        window.addEventListener("pointercancel", stopPointerInteraction);
        window.addEventListener("resize", scheduleReflow);

        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(scheduleReflow);
            observer.observe(stage);
        }

        imageInput?.addEventListener("change", () => {
            const [file] = imageInput.files || [];
            showSelectedFile(file || null);
        });

        clearInput?.addEventListener("change", () => {
            if (imageInput?.files?.length) {
                const [file] = imageInput.files || [];
                showSelectedFile(file || null);
                return;
            }

            if (clearInput.checked) {
                showEmptyState();
                return;
            }

            restorePersistedImage();
        });

        if (persistedSrc) {
            showImage(persistedSrc);
        } else {
            showEmptyState();
        }
    };

    const initAllCroppers = () => {
        document.querySelectorAll("[data-product-cropper]").forEach(initCropper);
    };

    window.addEventListener("load", initAllCroppers);
    document.addEventListener("formset:added", initAllCroppers);
})();
