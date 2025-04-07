const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/400x300?text=No+Image';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate image size and type
const validateImage = (file) => {
    if (!file) {
        throw new Error('Image file is required');
    }

    if (file.size > MAX_IMAGE_SIZE) {
        throw new Error('Image size cannot exceed 5MB');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Only JPEG, PNG and WebP images are allowed');
    }

    return true;
};

// Get default image URL if upload fails
const getDefaultImageUrl = () => DEFAULT_IMAGE_URL;

// Check if URL is a valid image URL
const isValidImageUrl = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        return contentType.startsWith('image/');
    } catch (error) {
        console.error('Error validating image URL:', error);
        return false;
    }
};

module.exports = {
    validateImage,
    getDefaultImageUrl,
    isValidImageUrl,
    MAX_IMAGE_SIZE
};