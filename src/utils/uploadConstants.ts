// MIME type validation for security
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_MATERIAL_TYPES = [
    'text/plain',
    'text/markdown',
    'text/csv',
    'text/x-markdown',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
