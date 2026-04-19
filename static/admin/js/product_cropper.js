(function () {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const CARD_RATIO = 4 / 5.5;
    const DEFAULT_FRAME_WIDTH_RATIO = 0.62;
    const MIN_FRAME_WIDTH = 120;

    const initCropper = (root) => {
        const workspace = root.querySelector('.product-cropper__workspace');
        const empty = root.querySelector('.product-cropper__empty');
        const stage = root.querySelector('.product-cropper__stage');
        const image = root.querySelector('.product-cropper__image');
        const frame = root.querySelector('.product-cropper__frame');
        const previewCanvas = root.querySelector('.product-cropper__preview-canvas');
        const handles = root.querySelectorAll('[data-resize-dir]');
        const imageInput = document.querySelector('#id_image');
        const cropXInput = document.querySelector('#id_crop_x');
        const cropYInput = document.querySelector('#id_crop_y');
        const cropScaleInput = document.querySelector('#id_crop_scale');

        if (!workspace || !empty || !stage || !image || !frame || !previewCanvas || !cropXInput || !cropYInput || !cropScaleInput) {
            return;
        }

        const previewContext = previewCanvas.getContext('2d');
        let currentSrc = root.dataset.imageUrl || '';
        let mode = null;
        let activePointerId = null;
        let resizeDir = '';
        let startPointerX = 0;
        let startPointerY = 0;
        let startBox = { x: 0, y: 0, width: 0, height: 0 };
        let box = { x: 0, y: 0, width: 0, height: 0 };

        const stageHeight = () => image.clientHeight || stage.clientHeight;
        const maxBoxWidth = () => stage.clientWidth;
        const maxBoxHeight = () => stageHeight();

        const applyBox = () => {
            const maxWidth = maxBoxWidth();
            const maxHeight = maxBoxHeight();
            const minWidth = Math.min(MIN_FRAME_WIDTH, maxWidth);
            const minHeight = minWidth / CARD_RATIO;

            box.width = clamp(box.width, minWidth, maxWidth);
            box.height = box.width / CARD_RATIO;

            if (box.height > maxHeight) {
                box.height = maxHeight;
                box.width = box.height * CARD_RATIO;
            }

            box.x = clamp(box.x, 0, maxWidth - box.width);
            box.y = clamp(box.y, 0, maxHeight - box.height);

            frame.style.width = `${box.width}px`;
            frame.style.height = `${box.height}px`;
            frame.style.left = `${box.x}px`;
            frame.style.top = `${box.y}px`;

            positionHandles();
            syncInputs();
            drawPreview();
        };

        const positionHandles = () => {
            const left = box.x;
            const top = box.y;
            const right = box.x + box.width;
            const bottom = box.y + box.height;
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const map = {
                n: [centerX, top],
                e: [right, centerY],
                s: [centerX, bottom],
                w: [left, centerY],
                ne: [right, top],
                nw: [left, top],
                se: [right, bottom],
                sw: [left, bottom],
            };

            handles.forEach((handle) => {
                const dir = handle.dataset.resizeDir;
                const [x, y] = map[dir];
                handle.style.left = `${x}px`;
                handle.style.top = `${y}px`;
            });
        };

        const syncInputs = () => {
            const centerX = box.x + (box.width / 2);
            const centerY = box.y + (box.height / 2);
            const stageW = stage.clientWidth;
            const stageH = stageHeight();
            const defaultWidth = stageW * DEFAULT_FRAME_WIDTH_RATIO;
            const scale = defaultWidth > 0 ? Math.round((defaultWidth / box.width) * 100) : 100;

            cropXInput.value = clamp(Math.round((centerX / stageW) * 100), 0, 100);
            cropYInput.value = clamp(Math.round((centerY / stageH) * 100), 0, 100);
            cropScaleInput.value = clamp(scale, 20, 500);
        };

        const drawPreview = () => {
            if (!currentSrc || !image.naturalWidth || !image.naturalHeight || !previewContext) {
                previewContext?.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                return;
            }

            const sx = (box.x / stage.clientWidth) * image.naturalWidth;
            const sy = (box.y / stageHeight()) * image.naturalHeight;
            const sw = (box.width / stage.clientWidth) * image.naturalWidth;
            const sh = (box.height / stageHeight()) * image.naturalHeight;

            previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            previewContext.drawImage(
                image,
                sx,
                sy,
                sw,
                sh,
                0,
                0,
                previewCanvas.width,
                previewCanvas.height,
            );
        };

        const placeBoxFromInputs = () => {
            const stageW = stage.clientWidth;
            const stageH = stageHeight();
            const centerXPercent = Number(cropXInput.value || root.dataset.cropX || 50);
            const centerYPercent = Number(cropYInput.value || root.dataset.cropY || 50);
            const scale = Number(cropScaleInput.value || root.dataset.cropScale || 100);
            const defaultWidth = stageW * DEFAULT_FRAME_WIDTH_RATIO;
            const width = clamp(defaultWidth / Math.max(scale / 100, 0.2), MIN_FRAME_WIDTH, stageW);
            const height = width / CARD_RATIO;

            box.width = width;
            box.height = height;
            box.x = ((centerXPercent / 100) * stageW) - (width / 2);
            box.y = ((centerYPercent / 100) * stageH) - (height / 2);
            applyBox();
        };

        const showImage = (src) => {
            currentSrc = src;

            if (!currentSrc) {
                workspace.hidden = true;
                empty.hidden = false;
                return;
            }

            image.onload = () => {
                workspace.hidden = false;
                empty.hidden = true;
                placeBoxFromInputs();
            };

            image.src = currentSrc;
        };

        const resizeBox = (deltaX, deltaY) => {
            const startRight = startBox.x + startBox.width;
            const startBottom = startBox.y + startBox.height;
            let targetWidth = startBox.width;

            const widthFromX = resizeDir.includes('e')
                ? startBox.width + deltaX
                : resizeDir.includes('w')
                    ? startBox.width - deltaX
                    : null;
            const widthFromY = resizeDir.includes('s')
                ? startBox.width + (deltaY * CARD_RATIO)
                : resizeDir.includes('n')
                    ? startBox.width - (deltaY * CARD_RATIO)
                    : null;

            if (widthFromX !== null && widthFromY !== null) {
                const diffX = Math.abs(widthFromX - startBox.width);
                const diffY = Math.abs(widthFromY - startBox.width);
                targetWidth = diffX > diffY ? widthFromX : widthFromY;
            } else if (widthFromX !== null) {
                targetWidth = widthFromX;
            } else if (widthFromY !== null) {
                targetWidth = widthFromY;
            }

            targetWidth = clamp(targetWidth, Math.min(MIN_FRAME_WIDTH, stage.clientWidth), stage.clientWidth);
            const targetHeight = targetWidth / CARD_RATIO;
            let nextX = startBox.x;
            let nextY = startBox.y;

            if (resizeDir.includes('w')) {
                nextX = startRight - targetWidth;
            } else if (!resizeDir.includes('e')) {
                nextX = startBox.x + ((startBox.width - targetWidth) / 2);
            }

            if (resizeDir.includes('n')) {
                nextY = startBottom - targetHeight;
            } else if (!resizeDir.includes('s')) {
                nextY = startBox.y + ((startBox.height - targetHeight) / 2);
            }

            box = {
                x: nextX,
                y: nextY,
                width: targetWidth,
                height: targetHeight,
            };
            applyBox();
        };

        const onPointerMove = (event) => {
            if (!mode) {
                return;
            }

            const deltaX = event.clientX - startPointerX;
            const deltaY = event.clientY - startPointerY;

            if (mode === 'move') {
                box.x = startBox.x + deltaX;
                box.y = startBox.y + deltaY;
                applyBox();
                return;
            }

            if (mode === 'resize') {
                resizeBox(deltaX, deltaY);
            }
        };

        const stopInteraction = () => {
            mode = null;
            resizeDir = '';
            if (activePointerId !== null) {
                frame.releasePointerCapture?.(activePointerId);
            }
            activePointerId = null;
        };

        frame.addEventListener('pointerdown', (event) => {
            if (event.target !== frame) {
                return;
            }
            mode = 'move';
            activePointerId = event.pointerId;
            startPointerX = event.clientX;
            startPointerY = event.clientY;
            startBox = { ...box };
            frame.setPointerCapture?.(event.pointerId);
        });

        handles.forEach((handle) => {
            handle.addEventListener('pointerdown', (event) => {
                event.preventDefault();
                event.stopPropagation();
                mode = 'resize';
                resizeDir = handle.dataset.resizeDir || '';
                activePointerId = event.pointerId;
                startPointerX = event.clientX;
                startPointerY = event.clientY;
                startBox = { ...box };
                frame.setPointerCapture?.(event.pointerId);
            });
        });

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', stopInteraction);
        window.addEventListener('resize', () => {
            if (currentSrc) {
                placeBoxFromInputs();
            }
        });

        if (imageInput) {
            imageInput.addEventListener('change', (event) => {
                const [file] = event.target.files || [];
                if (!file) {
                    showImage(root.dataset.imageUrl || '');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    showImage(loadEvent.target?.result || '');
                };
                reader.readAsDataURL(file);
            });
        }

        showImage(currentSrc);
    };

    window.addEventListener('load', () => {
        document.querySelectorAll('[data-product-cropper]').forEach(initCropper);
    });
})();
