/**
 * Image Processor Utility - Refactored for Robustness and Android Chrome Compatibility
 * Uses URL.createObjectURL as the primary path to prevent mobile memory exhaustion,
 * with a robust FileReader fallback path.
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

        console.log('[ImageProcessor] Initiating processing for:', fileMeta);

        return new Promise((resolve, reject) => {
            // 1. Rigorous pre-processing validation
            if (!file) {
                console.error('[ImageProcessor] Validation failed: No file provided');
                return reject(new Error('لطفاً یک فایل تصویر انتخاب کنید.'));
            }
            if (!(file instanceof File) && !(file instanceof Blob)) {
                console.error('[ImageProcessor] Validation failed: Object is not a File or Blob instance');
                return reject(new Error('فایل انتخاب شده معتبر نیست.'));
            }
            if (file.size <= 0) {
                console.error('[ImageProcessor] Validation failed: File size is 0');
                return reject(new Error('فایل انتخاب شده خالی است یا حجم آن صفر است.'));
            }
            if (!file.type || !file.type.startsWith('image/')) {
                console.error('[ImageProcessor] Validation failed: Invalid MIME type:', file.type);
                return reject(new Error('فرمت فایل نامعتبر است. لطفاً فقط تصویر انتخاب کنید.'));
            }

            // Fallback function using FileReader
            const runFileReaderFallback = (primaryErrorMsg) => {
                console.log('[ImageProcessor] Executing fallback FileReader path. Primary failure reason:', primaryErrorMsg);
                const reader = new FileReader();

                reader.onload = (event) => {
                    if (!event.target || !event.target.result) {
                        return reject(new Error('محتوای فایل در FileReader یافت نشد.'));
                    }
                    const img = new Image();
                    img.onload = async () => {
                        try {
                            console.log('[ImageProcessor] [Fallback] Image loaded successfully, dimensions:', img.width, 'x', img.height);
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            if (width === 0 || height === 0) {
                                return reject(new Error('ابعاد تصویر معتبر نیست (0x0).'));
                            }

                            if (width > maxWidth) {
                                height *= maxWidth / width;
                                width = maxWidth;
                            }

                            canvas.width = width;
                            canvas.height = height;

                            const ctx = canvas.getContext('2d');
                            if (!ctx) {
                                return reject(new Error('امکان ایجاد محیط طراحی دو بعدی وجود ندارد.'));
                            }

                            ctx.drawImage(img, 0, 0, width, height);

                            if (options.watermarkEnabled !== false) {
                                try {
                                    await this.addLogoWatermark(ctx, width, height, logoUrl);
                                } catch (e) {
                                    console.warn('[ImageProcessor] [Fallback] Logo watermark failed, falling back to text:', e);
                                    this.addTextWatermark(ctx, width, height, watermarkText);
                                }
                            }

                            canvas.toBlob((blob) => {
                                if (!blob) {
                                    reject(new Error('تبدیل تصویر به فرمت WebP با شکست مواجه شد.'));
                                } else {
                                    console.log('[ImageProcessor] [Fallback] Processing complete, final size:', blob.size);
                                    resolve(blob);
                                }
                            }, 'image/webp', quality);
                        } catch (err) {
                            console.error('[ImageProcessor] [Fallback] Processing exception:', err);
                            reject(new Error(`خطا در پردازش تصویر (Fallback): ${err.message}`));
                        }
                    };

                    img.onerror = (err) => {
                        console.error('[ImageProcessor] [Fallback] Image load error:', err);
                        reject(new Error('لود تصویر در مرورگر با خطا مواجه شد. لطفاً فرمت تصویر یا حجم آن را بررسی کنید.'));
                    };

                    img.src = event.target.result;
                };

                reader.onerror = (err) => {
                    console.error('[ImageProcessor] [Fallback] FileReader error:', err);
                    reject(new Error(`خطا در خواندن فایل تصویر (FileReader): ${err.message || 'خطای عمومی خواندن'}`));
                };

                reader.onabort = () => {
                    console.warn('[ImageProcessor] [Fallback] FileReader aborted');
                    reject(new Error('عملیات خواندن فایل لغو شد.'));
                };

                try {
                    reader.readAsDataURL(file);
                } catch (err) {
                    console.error('[ImageProcessor] [Fallback] FileReader failed to start:', err);
                    reject(new Error(`عدم امکان شروع خواندن فایل تصویر: ${err.message}`));
                }
            };

            // 2. Setup the image loading helper
            const loadImageAndProcess = (srcUrl, isObjectURL = false) => {
                const img = new Image();

                img.onload = async () => {
                    try {
                        console.log('[ImageProcessor] Image loaded successfully, dimensions:', img.width, 'x', img.height);

                        // Clean up object URL as soon as the image is loaded to free memory
                        if (isObjectURL) {
                            URL.revokeObjectURL(srcUrl);
                        }

                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        if (width === 0 || height === 0) {
                            return reject(new Error('ابعاد تصویر معتبر نیست (0x0).'));
                        }

                        // Resize calculations
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            return reject(new Error('امکان ایجاد محیط طراحی دو بعدی وجود ندارد.'));
                        }

                        ctx.drawImage(img, 0, 0, width, height);

                        // Add Watermark Logo
                        if (options.watermarkEnabled !== false) {
                            try {
                                await this.addLogoWatermark(ctx, width, height, logoUrl);
                            } catch (e) {
                                console.warn('[ImageProcessor] Logo watermark failed, falling back to text:', e);
                                this.addTextWatermark(ctx, width, height, watermarkText);
                            }
                        }

                        // Convert Canvas to WebP Blob
                        canvas.toBlob((blob) => {
                            if (!blob) {
                                reject(new Error('تبدیل تصویر به فرمت نهایی با شکست مواجه شد.'));
                            } else {
                                console.log('[ImageProcessor] Processing complete, final size:', blob.size);
                                resolve(blob);
                            }
                        }, 'image/webp', quality);
                    } catch (err) {
                        if (isObjectURL) {
                            try { URL.revokeObjectURL(srcUrl); } catch (_) {}
                            console.warn('[ImageProcessor] Primary processing failed, falling back to FileReader...');
                            runFileReaderFallback(err.message);
                        } else {
                            console.error('[ImageProcessor] Processing exception:', err);
                            reject(new Error(`خطا در پردازش تصویر: ${err.message}`));
                        }
                    }
                };

                img.onerror = (err) => {
                    if (isObjectURL) {
                        try { URL.revokeObjectURL(srcUrl); } catch (_) {}
                        console.warn('[ImageProcessor] Primary ObjectURL image load failed, trying FileReader fallback...');
                        runFileReaderFallback('ObjectURL image load error');
                    } else {
                        console.error('[ImageProcessor] Image load error:', err);
                        reject(new Error('لود تصویر در مرورگر با خطا مواجه شد. احتمالاً فایل خراب است.'));
                    }
                };

                img.src = srcUrl;
            };

            // 3. Primary Path: Modern, high-performance URL.createObjectURL (prevents Base64 Android Chrome crashes)
            if (typeof URL !== 'undefined' && URL.createObjectURL) {
                try {
                    console.log('[ImageProcessor] Using primary URL.createObjectURL path');
                    const objectUrl = URL.createObjectURL(file);
                    loadImageAndProcess(objectUrl, true);
                } catch (e) {
                    console.warn('[ImageProcessor] URL.createObjectURL failed, trying FileReader fallback:', e);
                    runFileReaderFallback(e.message);
                }
            } else {
                runFileReaderFallback('URL.createObjectURL not supported');
            }
        });
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
