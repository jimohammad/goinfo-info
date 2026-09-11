<?php
/**
 * AdmissionEU — Site Constants
 */

// Base URL — your domain
define('BASE_URL', 'https://goinfo.info');
define('SITE_NAME', 'AdmissionEU');
define('SITE_TAGLINE', 'European University Directory');

// Paths
define('ROOT_PATH', dirname(__DIR__));
define('UPLOADS_PATH', ROOT_PATH . '/uploads');
define('IMAGES_PATH', ROOT_PATH . '/assets/images');

// Pagination
define('ITEMS_PER_PAGE', 20);

// Session config
define('SESSION_LIFETIME', 86400);

// File upload limits
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024);
define('ALLOWED_EXTENSIONS', ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']);

// Email
define('MAIL_FROM', 'noreply@goinfo.info');
define('MAIL_FROM_NAME', 'AdmissionEU');
define('CONTACT_EMAIL', 'info@goinfo.info');

// Version (for cache-busting CSS/JS)
define('ASSET_VERSION', '1.6.2');