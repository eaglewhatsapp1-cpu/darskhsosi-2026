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

// Maximum accepted upload size at the storage/application boundary.
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// PDFs are split below the hard limit to leave room for storage/API boundary differences.
export const PDF_SPLIT_TARGET_SIZE = 8 * 1024 * 1024;
