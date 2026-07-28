// Cloudinary Configuration
var CloudinaryConfig = {
    cloudName: 'qqwevfkz',
    uploadPreset: 'mercysolutions',
    defaultFolder: 'mercy-senior-solutions',
    
    // Hero image upload settings
    hero: {
        folder: 'mercy-senior-solutions/hero',
        maxFiles: 10,
        maxFileSize: 5000000, // 5MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1920, height: 1080, crop: 'fill', quality: 'auto' }
        ]
    },
    
    // Community/facility image upload settings
    community: {
        folder: 'mercy-senior-solutions/communities',
        maxFiles: 20,
        maxFileSize: 5000000,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto' }
        ]
    },
    
    // General media upload settings
    media: {
        folder: 'mercy-senior-solutions/media',
        maxFiles: 50,
        maxFileSize: 10000000, // 10MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf'],
        transformation: [
            { width: 1600, height: 1200, crop: 'limit', quality: 'auto' }
        ]
    },
    
    // Helper: generate thumbnail URL from Cloudinary URL
    getThumbnail: function(url, width, height) {
        if (!url || url.indexOf('cloudinary') === -1) return url;
        width = width || 400;
        height = height || 300;
        return url.replace('/upload/', '/upload/w_' + width + ',h_' + height + ',c_fill,q_auto/');
    },
    
    // Helper: generate optimized URL
    getOptimized: function(url, width) {
        if (!url || url.indexOf('cloudinary') === -1) return url;
        width = width || 1200;
        return url.replace('/upload/', '/upload/w_' + width + ',q_auto,f_auto/');
    }
};
