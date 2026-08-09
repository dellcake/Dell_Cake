/**
 * Image Processor Utility - Refactored for Robustness and Zero Race-Conditions
 * Handles: Resizing, Compression, Watermarking, WebP conversion
 */
export const ImageProcessor = {
    /**
     * Process an image file
     * @param {File} file - The original image file
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

        return new Promise((resolve, reject) => {
            // 1. Pre-processing Validations
            if (!file) {
                return reject(new Error('No file provided to ImageProcessor'));
            }
            if (!(file instanceof File)) {
                return reject(new Error('Provided object is not a valid File instance'));
            }
            if (file.size <= 0) {
                return reject(new Error('Provided file is empty (size is 0)'));
            }
            if (!file.type || !file.type.startsWith('image/')) {
                return reject(new Error(`Provided file type is invalid: ${file.type || 'unknown'}`));
            }

            // 2. Set up FileReader with strict order: define event handlers BEFORE reading
            const reader = new FileReader();

            reader.onload = (event) => {
                if (!event.target || !event.target.result) {
                    return reject(new Error('FileReader target result is empty'));
                }

                // 3. Set up Image with strict order: define event handlers BEFORE setting .src
                const img = new Image();

                img.onload = async () => {
                    try {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        if (width === 0 || height === 0) {
                            return reject(new Error('Loaded image has invalid dimensions (0x0)'));
                        }

                        // Resize logic
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            return reject(new Error('Failed to obtain 2D canvas context'));
                        }
                        ctx.drawImage(img, 0, 0, width, height);

                        // Add Watermark Logo
                        if (options.watermarkEnabled !== false) {
                            try {
                                await this.addLogoWatermark(ctx, width, height, logoUrl);
                            } catch (e) {
                                console.warn('Logo watermark failed, falling back to text:', e);
                                this.addTextWatermark(ctx, width, height, watermarkText);
                            }
                        }

                        // Convert to WebP and resolve Blob
                        canvas.toBlob((blob) => {
                            if (!blob) {
                                reject(new Error('Canvas toBlob conversion failed and returned null'));
                            } else {
                                resolve(blob);
                            }
                        }, 'image/webp', quality);
                    } catch (err) {
                        reject(new Error(`Error during canvas processing: ${err.message}`));
                    }
                };

                img.onerror = (err) => {
                    reject(new Error('Failed to load image into ImageProcessor (corrupt file or unsupported format)'));
                };

                img.src = event.target.result;
            };

            reader.onerror = (err) => {
                reject(new Error('FileReader encountered an error while reading the image file'));
            };

            reader.onabort = () => {
                reject(new Error('FileReader operation was aborted'));
            };

            // Start reading after all handlers are attached
            try {
                reader.readAsDataURL(file);
            } catch (err) {
                reject(new Error(`Failed to initiate FileReader readAsDataURL: ${err.message}`));
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
            logo.crossOrigin = 'anonymous';

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
                    reject(new Error(`Error rendering logo watermark: ${e.message}`));
                }
            };

            logo.onerror = (err) => {
                reject(new Error(`Failed to load logo watermark image: ${logoUrl}`));
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
