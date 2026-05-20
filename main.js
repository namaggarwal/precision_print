document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        view: 'landing', // landing, editor, preview
        imgSrc: null,
        imgNaturalWidth: 0,
        imgNaturalHeight: 0,
        docType: JSON.parse(document.getElementById('doc-type-select').value),
        printSize: JSON.parse(document.getElementById('print-size-select').value),
        x: 0,
        y: 0,
        scale: 1,
        showBoundaries: true,
        maskScale: 10 // 10 pixels per mm in editor
    };

    // DOM Elements
    const views = {
        landing: document.getElementById('view-landing'),
        editor: document.getElementById('view-editor'),
        preview: document.getElementById('view-preview')
    };

    const uploadInput = document.getElementById('upload-input');
    const docTypeSelect = document.getElementById('doc-type-select');
    const printSizeSelect = document.getElementById('print-size-select');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomVal = document.getElementById('zoom-val');
    const boundaryToggle = document.getElementById('cut-boundary-toggle');

    const cropContainer = document.getElementById('crop-container');
    const cropImage = document.getElementById('crop-image');

    const editorMaskName = document.getElementById('editor-mask-name');
    const editorMaskDims = document.getElementById('editor-mask-dims');

    const paperContainer = document.getElementById('paper-container');
    const previewPrintName = document.getElementById('preview-print-name');
    const previewPhotoCount = document.getElementById('preview-photo-count');
    const previewPrintDims = document.getElementById('preview-print-dims');

    // Editor UI scaling for responsive mobile viewports
    function getEditorScaleFactor() {
        const wrapper = document.getElementById('crop-container-wrapper');
        if (!wrapper) return 1;
        const rect = wrapper.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return 1;
        
        const style = window.getComputedStyle(wrapper);
        const paddingX = (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)) || 32;
        const paddingY = (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)) || 32;
        
        const availW = rect.width - paddingX;
        const availH = rect.height - paddingY;
        
        const maskW = state.docType.w * state.maskScale;
        const maskH = state.docType.h * state.maskScale;
        
        const scale = Math.min(availW / maskW, availH / maskH);
        return scale < 1 ? scale : 1;
    }

    function fitEditorToScreen() {
        const factor = getEditorScaleFactor();
        cropContainer.style.transform = `scale(${factor})`;
    }

    function fitPaperToScreen() {
        const main = paperContainer.parentElement;
        if (!main) return;
        const rect = main.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        const style = window.getComputedStyle(main);
        const paddingX = (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)) || 32;
        const paddingY = (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)) || 32;
        
        const availW = rect.width - paddingX;
        const availH = rect.height - paddingY;
        
        const screenPxPerMm = 3;
        const paperW = state.printSize.w * screenPxPerMm;
        const paperH = state.printSize.h * screenPxPerMm;
        
        const scale = Math.min(availW / paperW, availH / paperH);
        paperContainer.style.transform = scale < 1 ? `scale(${scale})` : 'scale(1)';
    }

    // Navigation
    function setView(viewName) {
        Object.values(views).forEach(el => {
            el.classList.add('opacity-0', 'pointer-events-none');
            el.classList.remove('opacity-100');
        });
        views[viewName].classList.remove('opacity-0', 'pointer-events-none');
        views[viewName].classList.add('opacity-100');
        state.view = viewName;

        if (viewName === 'editor') {
            updateEditorMask();
            updateTransform();
            requestAnimationFrame(() => {
                fitEditorToScreen();
            });
        } else if (viewName === 'preview') {
            generatePreview();
            requestAnimationFrame(() => {
                fitPaperToScreen();
            });
        }
    }

    // Upload Handler
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    state.imgSrc = event.target.result;
                    state.imgNaturalWidth = img.width;
                    state.imgNaturalHeight = img.height;
                    cropImage.src = state.imgSrc;

                    // Reset transform to cover
                    const maskW = state.docType.w * state.maskScale;
                    const maskH = state.docType.h * state.maskScale;
                    const scaleX = maskW / img.width;
                    const scaleY = maskH / img.height;
                    state.scale = Math.max(scaleX, scaleY);

                    // Center
                    state.x = (maskW - img.width * state.scale) / 2;
                    state.y = (maskH - img.height * state.scale) / 2;

                    // Update slider bounds based on initial scale
                    zoomSlider.min = (state.scale * 0.5 * 100).toFixed(0);
                    zoomSlider.max = (state.scale * 3 * 100).toFixed(0);
                    zoomSlider.value = (state.scale * 100).toFixed(0);

                    setView('editor');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Editor Logic
    function updateEditorMask() {
        const w = state.docType.w * state.maskScale;
        const h = state.docType.h * state.maskScale;
        cropContainer.style.width = `${w}px`;
        cropContainer.style.height = `${h}px`;
        editorMaskName.textContent = state.docType.name;
        editorMaskDims.textContent = `${state.docType.w} x ${state.docType.h} mm`;
        fitEditorToScreen();
    }

    function updateTransform() {
        cropImage.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
        zoomVal.textContent = `${Math.round(state.scale * 100)}%`;
    }

    // Drag logic
    let isDragging = false;
    let startX, startY, initialX, initialY;

    cropContainer.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = state.x;
        initialY = state.y;
        cropContainer.setPointerCapture(e.pointerId);
    });

    cropContainer.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const factor = getEditorScaleFactor();
        state.x = initialX + dx / factor;
        state.y = initialY + dy / factor;
        updateTransform();
    });

    cropContainer.addEventListener('pointerup', (e) => {
        isDragging = false;
        cropContainer.releasePointerCapture(e.pointerId);
    });

    // Zoom slider
    zoomSlider.addEventListener('input', (e) => {
        const newScale = e.target.value / 100;

        // Zoom from center of mask
        const maskW = state.docType.w * state.maskScale;
        const maskH = state.docType.h * state.maskScale;

        const cx = maskW / 2;
        const cy = maskH / 2;

        const relX = (cx - state.x) / state.scale;
        const relY = (cy - state.y) / state.scale;

        state.x = cx - relX * newScale;
        state.y = cy - relY * newScale;
        state.scale = newScale;

        updateTransform();
    });

    // Config Changes
    docTypeSelect.addEventListener('change', (e) => {
        state.docType = JSON.parse(e.target.value);
        updateEditorMask();
        updateTransform();
    });

    printSizeSelect.addEventListener('change', (e) => {
        state.printSize = JSON.parse(e.target.value);
    });

    boundaryToggle.addEventListener('change', (e) => {
        state.showBoundaries = e.target.checked;
        if (state.view === 'preview') {
            generatePreview();
        }
    });

    // Buttons
    document.getElementById('btn-back-upload').addEventListener('click', () => setView('landing'));
    document.getElementById('btn-preview').addEventListener('click', () => setView('preview'));
    document.getElementById('btn-back-editor').addEventListener('click', () => setView('editor'));
    document.getElementById('btn-print').addEventListener('click', () => window.print());

    document.getElementById('btn-download-single').addEventListener('click', () => {
        const canvas = getCroppedCanvas();
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `passport_photo_${state.docType.w}x${state.docType.h}.jpg`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 5000);
        }, 'image/jpeg', 1.0);
    });

    document.getElementById('btn-download-sheet').addEventListener('click', () => {
        const dpiScale = 11.811;
        const canvas = document.createElement('canvas');
        const paperW = state.printSize.w * dpiScale;
        const paperH = state.printSize.h * dpiScale;
        canvas.width = paperW;
        canvas.height = paperH;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const photoW = state.docType.w * dpiScale;
        const photoH = state.docType.h * dpiScale;
        const margin = 2 * dpiScale;

        const cols1 = Math.floor((paperW - margin) / (photoW + margin));
        const rows1 = Math.floor((paperH - margin) / (photoH + margin));
        const total1 = cols1 * rows1;

        const cols2 = Math.floor((paperW - margin) / (photoH + margin));
        const rows2 = Math.floor((paperH - margin) / (photoW + margin));
        const total2 = cols2 * rows2;

        let cols, rows, actualW, actualH;
        let isRotated = false;

        if (total1 >= total2) {
            cols = cols1; rows = rows1;
            actualW = photoW; actualH = photoH;
        } else {
            cols = cols2; rows = rows2;
            actualW = photoH; actualH = photoW;
            isRotated = true;
        }

        const gridW = cols * actualW + (cols - 1) * margin;
        const gridH = rows * actualH + (rows - 1) * margin;
        const offsetX = (paperW - gridW) / 2;
        const offsetY = (paperH - gridH) / 2;

        const singlePhoto = new Image();
        singlePhoto.onload = () => {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = offsetX + c * (actualW + margin);
                    const y = offsetY + r * (actualH + margin);

                    ctx.save();
                    if (isRotated) {
                        ctx.translate(x + actualW / 2, y + actualH / 2);
                        ctx.rotate(Math.PI / 2);
                        ctx.drawImage(singlePhoto, -actualH / 2, -actualW / 2, actualH, actualW);
                    } else {
                        ctx.drawImage(singlePhoto, x, y, actualW, actualH);
                    }
                    ctx.restore();

                    if (state.showBoundaries) {
                        ctx.fillStyle = '#9ca3af'; // Thin, gray
                        const markLen = 40; // 40px ~ 3.5mm at 300DPI
                        const thick = 2;
                        
                        // Top Left
                        ctx.fillRect(x, y, markLen, thick);
                        ctx.fillRect(x, y, thick, markLen);
                        // Top Right
                        ctx.fillRect(x + actualW - markLen, y, markLen, thick);
                        ctx.fillRect(x + actualW - thick, y, thick, markLen);
                        // Bottom Left
                        ctx.fillRect(x, y + actualH - thick, markLen, thick);
                        ctx.fillRect(x, y + actualH - markLen, thick, markLen);
                        // Bottom Right
                        ctx.fillRect(x + actualW - markLen, y + actualH - thick, markLen, thick);
                        ctx.fillRect(x + actualW - thick, y + actualH - markLen, thick, markLen);
                    }
                }
            }
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `print_sheet_${state.printSize.w}x${state.printSize.h}.jpg`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 5000);
            }, 'image/jpeg', 1.0);
        };
        singlePhoto.src = getCroppedImageDataUrl();
    });

    // Preview Logic
    function getCroppedCanvas() {
        const canvas = document.createElement('canvas');
        // Let's render at 300 DPI for high quality (approx 11.8 px per mm)
        const dpiScale = 11.811;
        canvas.width = state.docType.w * dpiScale;
        canvas.height = state.docType.h * dpiScale;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate crop mapping
        // In editor: scale = editor pixels / natural pixels. maskScale = editor pixels / mm.
        // We want to map natural pixels to canvas pixels.
        // Canvas width = w_mm * dpiScale.
        // In editor, maskW = w_mm * maskScale.
        const drawScale = (dpiScale / state.maskScale) * state.scale;

        const drawX = state.x * (dpiScale / state.maskScale);
        const drawY = state.y * (dpiScale / state.maskScale);

        ctx.drawImage(
            cropImage,
            0, 0, state.imgNaturalWidth, state.imgNaturalHeight,
            drawX, drawY, state.imgNaturalWidth * drawScale, state.imgNaturalHeight * drawScale
        );

        return canvas;
    }

    function getCroppedImageDataUrl() {
        return getCroppedCanvas().toDataURL('image/jpeg', 1.0);
    }

    function generatePreview() {
        const croppedUrl = getCroppedImageDataUrl();

        // Paper setup (scale for screen preview, e.g. 4 pixels per mm)
        const screenPxPerMm = 3;
        const paperW = state.printSize.w * screenPxPerMm;
        const paperH = state.printSize.h * screenPxPerMm;

        paperContainer.style.width = `${paperW}px`;
        paperContainer.style.height = `${paperH}px`;
        paperContainer.innerHTML = ''; // clear

        previewPrintName.textContent = state.printSize.name;
        previewPrintDims.textContent = `${(state.printSize.w / 10).toFixed(1)} x ${(state.printSize.h / 10).toFixed(1)} cm`;

        const photoW = state.docType.w * screenPxPerMm;
        const photoH = state.docType.h * screenPxPerMm;

        // Calculate max tiles
        // Add 2mm margin between photos to avoid overlap and give cutting space
        const margin = 2 * screenPxPerMm;

        // Case 1: unrotated photos
        const cols1 = Math.floor((paperW - margin) / (photoW + margin));
        const rows1 = Math.floor((paperH - margin) / (photoH + margin));
        const total1 = cols1 * rows1;

        // Case 2: rotated photos
        const cols2 = Math.floor((paperW - margin) / (photoH + margin));
        const rows2 = Math.floor((paperH - margin) / (photoW + margin));
        const total2 = cols2 * rows2;

        let cols, rows, actualW, actualH;
        let isRotated = false;

        if (total1 >= total2) {
            cols = cols1; rows = rows1;
            actualW = photoW; actualH = photoH;
        } else {
            cols = cols2; rows = rows2;
            actualW = photoH; actualH = photoW;
            isRotated = true;
        }

        previewPhotoCount.textContent = `${Math.max(total1, total2)} Photos per sheet`;

        // Center the grid on the paper
        const gridW = cols * actualW + (cols - 1) * margin;
        const gridH = rows * actualH + (rows - 1) * margin;
        const offsetX = (paperW - gridW) / 2;
        const offsetY = (paperH - gridH) / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = offsetX + c * (actualW + margin);
                const y = offsetY + r * (actualH + margin);

                const tile = document.createElement('div');
                tile.className = 'absolute bg-surface-container overflow-hidden shadow-sm';
                tile.style.width = `${actualW}px`;
                tile.style.height = `${actualH}px`;
                tile.style.left = `${x}px`;
                tile.style.top = `${y}px`;

                const img = document.createElement('img');
                img.src = croppedUrl;
                if (isRotated) {
                    img.style.width = `${actualH}px`;
                    img.style.height = `${actualW}px`;
                    img.style.transformOrigin = 'center';
                    img.style.transform = `translate(${(actualW - actualH) / 2}px, ${(actualH - actualW) / 2}px) rotate(90deg)`;
                } else {
                    img.style.width = '100%';
                    img.style.height = '100%';
                }
                img.className = 'object-cover block absolute top-0 left-0';

                tile.appendChild(img);

                if (state.showBoundaries) {
                    const boundary = document.createElement('div');
                    boundary.className = 'absolute inset-0 pointer-events-none cut-boundary opacity-80';
                    tile.appendChild(boundary);
                }

                paperContainer.appendChild(tile);
            }
        }
    }
    // Auto-fit resizing using ResizeObservers
    const cropWrapper = document.getElementById('crop-container-wrapper');
    if (cropWrapper) {
        new ResizeObserver(() => {
            if (state.view === 'editor') fitEditorToScreen();
        }).observe(cropWrapper);
    }

    const paperParent = paperContainer.parentElement;
    if (paperParent) {
        new ResizeObserver(() => {
            if (state.view === 'preview') fitPaperToScreen();
        }).observe(paperParent);
    }

    window.addEventListener('resize', () => {
        if (state.view === 'editor') {
            fitEditorToScreen();
        } else if (state.view === 'preview') {
            fitPaperToScreen();
        }
    });
});
