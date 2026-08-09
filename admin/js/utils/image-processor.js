/**
 * Image Processor Utility - Refactored for Robustness and Android Chrome Compatibility
 * Implements a multi-layered async cascade with:
 *   1. Modern and fast createImageBitmap()
 *   2. Modern and low-memory URL.createObjectURL()
 *   3. Robust fallback FileReader (Base64 Data URL)
 */
export const ImageProcessor = {
    /**
     * Process an image file
     * @param {File|Blob} file - The original image file or Blob
     * @param {Object} options - { maxWidth, quality, watermarkText, logoUrl, watermarkEnabled }
     * @returns {Promise<Blob>} - Processed image blob
     */
    async process(file, options = {}) {
        const {
            maxWidth = 1200,
            quality = 0.8,
            watermarkText = 'Dell Cake | دل‌کیک',
            logoUrl = '../images/logo/sweet-.png' // Default logo
        } = options;

        const fileMeta = {
            name: file?.name || 'Blob/Unnamed',
            type: file?.type || 'unknown',
            size: file?.size || 0
        };

        console.log('[ImageProcessor] Initiating processing cascade for:', fileMeta);

        // 1. Rigorous pre-processing validation
        if (!file) {
            console.error('[ImageProcessor] Validation failed: No file provided');
            throw new Error('لطفاً یک فایل تصویر انتخاب کنید.');
        }
        if (!(file instanceof File) && !(file instanceof Blob)) {
            console.error('[ImageProcessor] Validation failed: Object is not a File or Blob instance');
            throw new Error('فایل انتخاب شده معتبر نیست.');
        }
        if (file.size <= 0) {
            console.error('[ImageProcessor] Validation failed: File size is 0');
            throw new Error('فایل انتخاب شده خالی است یا حجم آن صفر است.');
        }
        if (!file.type || !file.type.startsWith('image/')) {
            console.error('[ImageProcessor] Validation failed: Invalid MIME type:', file.type);
            throw new Error('فرمت فایل نامعتبر است. لطفاً فقط تصویر انتخاب کنید.');
        }

        // Shared Canvas processor helper
        const handleCanvasProcessing = async (sourceImage, width, height) => {
            const canvas = document.createElement('canvas');
            let finalWidth = width;
            let finalHeight = height;

            if (finalWidth === 0 || finalHeight === 0) {
                throw new Error('ابعاد تصویر معتبر نیست (0x0).');
            }

            // Resize calculations
            if (finalWidth > maxWidth) {
                finalHeight *= maxWidth / finalWidth;
                finalWidth = maxWidth;
            }

            canvas.width = finalWidth;
            canvas.height = finalHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('امکان ایجاد محیط طراحی دو بعدی وجود ندارد.');
            }

            ctx.drawImage(sourceImage, 0, 0, finalWidth, finalHeight);

            // Add Watermark Logo
            if (options.watermarkEnabled !== false) {
                try {
                    await this.addLogoWatermark(ctx, finalWidth, finalHeight, logoUrl);
                } catch (e) {
                    console.warn('[ImageProcessor] Logo watermark failed, falling back to text:', e);
                    this.addTextWatermark(ctx, finalWidth, finalHeight, watermarkText);
                }
            }

            return new Promise((resolveBlob, rejectBlob) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        rejectBlob(new Error('تبدیل تصویر به فرمت نهایی با شکست مواجه شد.'));
                    } else {
                        console.log('[ImageProcessor] Processing complete, final size:', blob.size);
                        resolveBlob(blob);
                    }
                }, 'image/webp', quality);
            });
        };

        // --- METHOD 1: Modern & Ultra-fast createImageBitmap ---
        if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
            try {
                console.log('[ImageProcessor] Attempting Method 1: createImageBitmap');
                const imgBitmap = await createImageBitmap(file);
                console.log('[ImageProcessor] Method 1 Succeeded. ImageBitmap dimensions:', imgBitmap.width, 'x', imgBitmap.height);
                try {
                    const resultBlob = await handleCanvasProcessing(imgBitmap, imgBitmap.width, imgBitmap.height);
                    imgBitmap.close();
                    return resultBlob;
                } catch (canvasErr) {
                    imgBitmap.close();
                    throw canvasErr;
                }
            } catch (err) {
                console.warn('[ImageProcessor] Method 1 (createImageBitmap) failed, trying Method 2...', err);
            }
        }

        // --- METHOD 2: Modern & High-Performance URL.createObjectURL ---
        try {
            console.log('[ImageProcessor] Attempting Method 2: HTMLImageElement + URL.createObjectURL');
            const resultBlob = await new Promise((resolveMethod, rejectMethod) => {
                const objectUrl = URL.createObjectURL(file);
                const img = new Image();

                img.onload = async () => {
                    try {
                        console.log('[ImageProcessor] Method 2 Image loaded successfully, dimensions:', img.width, 'x', img.height);
                        const processedBlob = await handleCanvasProcessing(img, img.width, img.height);
                        URL.revokeObjectURL(objectUrl);
                        resolveMethod(processedBlob);
                    } catch (err) {
                        URL.revokeObjectURL(objectUrl);
                        rejectMethod(err);
                    }
                };

                img.onerror = (err) => {
                    URL.revokeObjectURL(objectUrl);
                    rejectMethod(new Error('خطا در لود آدرس موقت تصویر (ObjectURL)'));
                };

                img.src = objectUrl;
            });
            return resultBlob;
        } catch (err) {
            console.warn('[ImageProcessor] Method 2 (URL.createObjectURL) failed, trying Method 3 (FileReader)...', err);
        }

        // --- METHOD 3: Standard FileReader + HTMLImageElement ---
        try {
            console.log('[ImageProcessor] Attempting Method 3: FileReader + HTMLImageElement');
            const resultBlob = await new Promise((resolveMethod, rejectMethod) => {
                const reader = new FileReader();

                reader.onload = (event) => {
                    if (!event.target || !event.target.result) {
                        return rejectMethod(new Error('محتوای فایل در FileReader یافت نشد.'));
                    }

                    const img = new Image();
                    img.onload = async () => {
                        try {
                            console.log('[ImageProcessor] Method 3 Image loaded successfully, dimensions:', img.width, 'x', img.height);
                            const processedBlob = await handleCanvasProcessing(img, img.width, img.height);
                            resolveMethod(processedBlob);
                        } catch (err) {
                            rejectMethod(err);
                        }
                    };

                    img.onerror = (err) => {
                        rejectMethod(new Error('خطا در لود تگ تصویر با داده‌های FileReader'));
                    };

                    img.src = event.target.result;
                };

                reader.onerror = (err) => {
                    rejectMethod(new Error(`خطا در خواندن فایل توسط ریدر: ${err.message || 'خطای عمومی خواندن'}`));
                };

                reader.onabort = () => {
                    rejectMethod(new Error('عملیات خواندن فایل لغو شد.'));
                };

                reader.readAsDataURL(file);
            });
            return resultBlob;
        } catch (err) {
            console.error('[ImageProcessor] All image processing methods in cascade failed.', err);
            throw new Error(`پردازش تصویر با خطا مواجه شد: ${err.message || 'خطای ناشناخته در رمزگشایی تصویر'}`);
        }
    },

    /**
     * Generate a small thumbnail
     */
    async generateThumbnail(file, size = 400) {
        return this.process(file, { maxWidth: size, quality: 0.6, watermarkEnabled: false });
    },

    /**
     * Add logo watermark with strict handler order to avoid race conditions
     */
    async addLogoWatermark(ctx, width, height, logoUrl) {
        return new Promise((resolve, reject) => {
            const logo = new Image();

            const isAbsoluteRemote = logoUrl.startsWith('http://') || logoUrl.startsWith('https://');
            const isSameOrigin = isAbsoluteRemote ? logoUrl.startsWith(window.location.origin) : true;

            if (!isSameOrigin) {
                logo.crossOrigin = 'anonymous';
            }

            let triedFallback = false;

            logo.onload = () => {
                try {
                    const logoWidth = width * 0.15; // 15% of width
                    const logoHeight = (logo.height * logoWidth) / logo.width;
                    const margin = 20;

                    ctx.globalAlpha = 0.4;
                    ctx.drawImage(
                        logo,
                        width - logoWidth - margin,
                        height - logoHeight - margin,
                        logoWidth,
                        logoHeight
                    );
                    ctx.globalAlpha = 1.0;
                    resolve();
                } catch (e) {
                    reject(new Error(`خطا در طراحی لوگو واترمارک: ${e.message}`));
                }
            };

            logo.onerror = (err) => {
                if (!triedFallback && logoUrl.startsWith('..')) {
                    triedFallback = true;
                    const fallbackUrl = logoUrl.substring(2); // e.g. "/images/logo/sweet-.png"
                    console.log(`[ImageProcessor] Watermark logo relative load failed, trying absolute path fallback: ${fallbackUrl}`);
                    logo.src = fallbackUrl;
                } else {
                    reject(new Error(`Failed to load logo watermark image: ${logoUrl}`));
                }
            };

            logo.src = logoUrl;
        });
    },

    addTextWatermark(ctx, width, height, text) {
        const fontSize = Math.max(20, width * 0.03);
        ctx.font = `${fontSize}px Vazirmatn, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        // Shadow for readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;

        ctx.fillText(text, width - 20, height - 20);

        ctx.shadowBlur = 0;
    }
};

export const imageProcessor = ImageProcessor;
