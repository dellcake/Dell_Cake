/**
 * Image Processor Utility
 * Handles: Resizing, Compression, Watermarking, WebP conversion
 */
export const ImageProcessor = {
    /**
     * Process an image file
     * @param {File} file - The original image file
     * @param {Object} options - { maxWidth, quality, watermarkText, logoUrl }
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
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Add Watermark Logo
                    try {
                        await this.addLogoWatermark(ctx, width, height, logoUrl);
                    } catch (e) {
                        console.warn('Logo watermark failed, falling back to text:', e);
                        this.addTextWatermark(ctx, width, height, watermarkText);
                    }

                    // Convert to WebP
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/webp', quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    },

    /**
     * Generate a small thumbnail
     */
    async generateThumbnail(file, size = 400) {
        return this.process(file, { maxWidth: size, quality: 0.6 });
    },

    async addLogoWatermark(ctx, width, height, logoUrl) {
        return new Promise((resolve, reject) => {
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.src = logoUrl;
            logo.onload = () => {
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
            };
            logo.onerror = reject;
        });
    },

    addTextWatermark(ctx, width, height, text) {
        const fontSize = Math.max(20, width * 0.03);
        ctx.font = `${fontSize}px Vazirmatn, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        // Shadow for readability
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4;

        ctx.fillText(text, width - 20, height - 20);

        ctx.shadowBlur = 0;
    }
};
