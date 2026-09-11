<?php
/**
 * AdmissionEU — SEO Meta Tag Generator
 */

function renderMeta($options = []) {
    $defaults = [
        'title'       => SITE_NAME . ' — ' . SITE_TAGLINE,
        'description' => 'The comprehensive directory of 645+ accredited universities across Europe. Explore programs, compare costs, and find your future.',
        'keywords'    => getSetting('meta_keywords', ''),
        'url'         => BASE_URL . $_SERVER['REQUEST_URI'],
        'image'       => BASE_URL . '/assets/images/og-default.jpg',
        'type'        => 'website',
    ];
    $meta = array_merge($defaults, $options);
    $title = clean($meta['title']);
    $desc  = clean(truncate($meta['description'], 160));
    $url   = clean($meta['url']);
    $img   = clean($meta['image']);

    echo '<title>' . $title . '</title>' . "\n";
    echo '<meta name="description" content="' . $desc . '">' . "\n";
    if (!empty($meta['keywords'])) {
        echo '<meta name="keywords" content="' . clean($meta['keywords']) . '">' . "\n";
    }
    echo '<link rel="canonical" href="' . $url . '">' . "\n";

    // Open Graph
    echo '<meta property="og:title" content="' . $title . '">' . "\n";
    echo '<meta property="og:description" content="' . $desc . '">' . "\n";
    echo '<meta property="og:url" content="' . $url . '">' . "\n";
    echo '<meta property="og:image" content="' . $img . '">' . "\n";
    echo '<meta property="og:type" content="' . clean($meta['type']) . '">' . "\n";
    echo '<meta property="og:site_name" content="' . SITE_NAME . '">' . "\n";

    // Twitter Card
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:title" content="' . $title . '">' . "\n";
    echo '<meta name="twitter:description" content="' . $desc . '">' . "\n";
    echo '<meta name="twitter:image" content="' . $img . '">' . "\n";
}

// Schema.org structured data for a university
function renderUniversitySchema($uni) {
    $schema = [
        '@context'    => 'https://schema.org',
        '@type'       => 'EducationalOrganization',
        'name'        => $uni['name'],
        'url'         => $uni['website_url'] ?? '',
        'description' => truncate($uni['description'] ?? '', 300),
        'address'     => [
            '@type'           => 'PostalAddress',
            'addressLocality' => $uni['city'] ?? '',
            'addressCountry'  => $uni['country_code'] ?? '',
        ],
    ];
    if (!empty($uni['founded_year'])) $schema['foundingDate'] = (string)$uni['founded_year'];
    if (!empty($uni['logo_url']))     $schema['logo'] = $uni['logo_url'];
    if (!empty($uni['latitude']) && !empty($uni['longitude'])) {
        $schema['geo'] = [
            '@type'     => 'GeoCoordinates',
            'latitude'  => $uni['latitude'],
            'longitude' => $uni['longitude'],
        ];
    }
    echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\n";
}
