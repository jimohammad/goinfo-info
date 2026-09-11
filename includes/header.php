<?php
/**
 * AdmissionEU — Global Header
 * Include at the top of every page
 */

if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/seo.php';

// Default page meta (can be overridden before including header)
$pageMeta = $pageMeta ?? [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <?php renderMeta($pageMeta); ?>

    <!-- Preconnect for fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">

    <!-- Phosphor Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.0.3/src/regular/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.0.3/src/fill/style.css">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css?v=<?= ASSET_VERSION ?>">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/responsive.css?v=<?= ASSET_VERSION ?>">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="<?= BASE_URL ?>/assets/images/favicon.svg">
</head>
<body>

<!-- Main Navigation -->
<header class="main-header" id="mainHeader">
    <div class="container header-inner">
        <!-- Logo -->
        <a href="<?= BASE_URL ?>/study" class="logo">
            <span class="logo-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="#121113"/>
                    <path d="M16 8L6 13.5L16 19L26 13.5L16 8Z" fill="#e78a53"/>
                    <path d="M10 16V21.5L16 25L22 21.5V16L16 19.5L10 16Z" fill="#e78a53"/>
                    <rect x="23" y="13" width="2" height="10" rx="1" fill="#e78a53"/>
                    <ellipse cx="24" cy="24" rx="2.5" ry="1.5" fill="#e78a53" opacity="0.7"/>
                </svg>
            </span>
            <span class="logo-text">
                <strong>Admission</strong><span class="logo-accent">EU</span>
            </span>
        </a>

        <!-- Nav Links -->
        <nav class="main-nav" id="mainNav">
            <a href="<?= BASE_URL ?>/" class="nav-link">
                <i class="ph ph-squares-four"></i> Apps
            </a>
            <a href="<?= BASE_URL ?>/study" class="nav-link">
                <i class="ph ph-house"></i> Study
            </a>
            <a href="<?= BASE_URL ?>/pages/universities.php" class="nav-link">
                <i class="ph ph-buildings"></i> Universities
            </a>
            <a href="<?= BASE_URL ?>/pages/programs.php" class="nav-link">
                <i class="ph ph-graduation-cap"></i> Programs
            </a>

            <div class="nav-dropdown">
                <button class="nav-link dropdown-trigger">
                    <i class="ph ph-compass"></i> Tools <i class="ph ph-caret-down"></i>
                </button>
                <div class="dropdown-menu">
                    <a href="<?= BASE_URL ?>/pages/budget.php"><i class="ph ph-calculator"></i> Budget Calculator</a>
                    <a href="<?= BASE_URL ?>/pages/trending.php"><i class="ph ph-fire"></i> Trending Fields</a>
                    <a href="<?= BASE_URL ?>/pages/visa-docs.php"><i class="ph ph-file-text"></i> Visa & Application Docs</a>
                    <a href="<?= BASE_URL ?>/pages/arrival-guide.php"><i class="ph ph-airplane-landing"></i> Arrival Guide</a>
                    <a href="<?= BASE_URL ?>/pages/pr-jobs.php"><i class="ph ph-briefcase"></i> PR & Jobs</a>
                    <a href="<?= BASE_URL ?>/pages/degree-recognition.php"><i class="ph ph-shield-check"></i> Degree Recognition</a>
                    <a href="<?= BASE_URL ?>/pages/field-suggester.php"><i class="ph ph-lightbulb"></i> Field Suggester</a>
                    <a href="<?= BASE_URL ?>/pages/scholarships.php"><i class="ph ph-medal"></i> Scholarships</a>
                </div>
            </div>

        </nav>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle menu">
            <span></span><span></span><span></span>
        </button>
    </div>
</header>

<!-- Flash Messages -->
<div class="container">
    <?php showFlash(); ?>
</div>

<!-- Main Content Begins -->
<main>
