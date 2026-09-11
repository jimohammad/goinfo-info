</main>
<!-- Main Content Ends -->

<!-- Footer -->
<footer class="main-footer">
    <div class="footer-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="currentColor"/>
        </svg>
    </div>

    <div class="container">
        <div class="footer-grid">
            <!-- Column 1: About -->
            <div class="footer-col">
                <a href="<?= BASE_URL ?>/study" class="footer-logo">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;margin-right:6px;">
                        <rect width="32" height="32" rx="6" fill="#121113"/>
                        <path d="M16 8L6 13.5L16 19L26 13.5L16 8Z" fill="#e78a53"/>
                        <path d="M10 16V21.5L16 25L22 21.5V16L16 19.5L10 16Z" fill="#e78a53"/>
                        <rect x="23" y="13" width="2" height="10" rx="1" fill="#e78a53"/>
                        <ellipse cx="24" cy="24" rx="2.5" ry="1.5" fill="#e78a53" opacity="0.7"/>
                    </svg>
                    <strong>Admission</strong><span class="logo-accent">EU</span>
                </a>
                <p class="footer-about">
                    The comprehensive directory of <?= getSetting('university_count', '645') ?>+ accredited universities across Europe. 
                    Find programs, compare costs, and start your European education journey.
                </p>
                <div class="footer-social">
                    <?php if ($fb = getSetting('social_facebook')): ?>
                        <a href="<?= clean($fb) ?>" target="_blank" aria-label="Facebook"><i class="ph ph-facebook-logo"></i></a>
                    <?php endif; ?>
                    <?php if ($ig = getSetting('social_instagram')): ?>
                        <a href="<?= clean($ig) ?>" target="_blank" aria-label="Instagram"><i class="ph ph-instagram-logo"></i></a>
                    <?php endif; ?>
                    <?php if ($tw = getSetting('social_twitter')): ?>
                        <a href="<?= clean($tw) ?>" target="_blank" aria-label="Twitter"><i class="ph ph-twitter-logo"></i></a>
                    <?php endif; ?>
                    <?php if ($li = getSetting('social_linkedin')): ?>
                        <a href="<?= clean($li) ?>" target="_blank" aria-label="LinkedIn"><i class="ph ph-linkedin-logo"></i></a>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Column 2: Explore -->
            <div class="footer-col">
                <h4>Explore</h4>
                <ul>
                    <li><a href="<?= BASE_URL ?>/">All GoInfo apps</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/universities.php">University Directory</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/programs.php">Find Programs</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/budget.php">Budget Calculator</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/trending.php">Trending Fields</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/field-suggester.php">Field Suggester</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/scholarships.php">Scholarships</a></li>
                </ul>
            </div>

            <!-- Column 3: Popular Countries -->
            <div class="footer-col">
                <h4>Popular Countries</h4>
                <ul>
                    <li><a href="<?= BASE_URL ?>/pages/country.php?slug=germany">Germany</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/country.php?slug=france">France</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/country.php?slug=netherlands">Netherlands</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/country.php?slug=italy">Italy</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/country.php?slug=spain">Spain</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/country.php?slug=hungary">Hungary</a></li>
                </ul>
            </div>

            <!-- Column 4: Resources -->
            <div class="footer-col">
                <h4>Resources</h4>
                <ul>
                    <li><a href="<?= BASE_URL ?>/pages/visa-docs.php">Visa & Application Docs</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/arrival-guide.php">Arrival Guide</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/pr-jobs.php">PR & Jobs</a></li>
                    <li><a href="<?= BASE_URL ?>/pages/degree-recognition.php">Degree Recognition</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom" style="flex-direction:column;align-items:center;gap:0.6rem;text-align:center;">
            <p style="font-size:0.84rem;color:rgba(255,255,255,0.45);line-height:1.6;margin:0;">
                An <a href="https://iqbal.app" target="_blank" style="color:#e78a53;font-weight:700;text-decoration:none;">Iqbal Sons</a> initiative — spreading the light of knowledge, freely and openly,<br>to every student dreaming of a brighter future.
            </p>
            <div style="width:60px;height:1px;background:rgba(255,255,255,0.1);margin:0.25rem 0;"></div>
            <p style="font-size:0.8rem;color:rgba(255,255,255,0.35);margin:0;">&copy; <?= date('Y') ?> AdmissionEU. All rights reserved.</p>
            <p style="font-size:0.8rem;color:rgba(255,255,255,0.3);margin:0;display:flex;align-items:center;gap:0.5rem;">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#121113"/><path d="M16 8L6 13.5L16 19L26 13.5L16 8Z" fill="#e78a53"/><path d="M10 16V21.5L16 25L22 21.5V16L16 19.5L10 16Z" fill="#e78a53"/></svg>
                <strong style="color:rgba(255,255,255,0.5);">AdmissionEU</strong>
                <span style="color:rgba(255,255,255,0.15);">&bull;</span>
                Developed by <a href="https://iqbal.app" target="_blank" style="color:rgba(255,255,255,0.55);text-decoration:none;font-weight:700;">Iqbal Sons</a>
            </p>
        </div>
    </div>
</footer>

<!-- Scripts -->
<script src="<?= BASE_URL ?>/assets/js/main.js?v=<?= ASSET_VERSION ?>"></script>
<?php if (isset($pageScripts)): ?>
    <?php foreach ($pageScripts as $script): ?>
        <script src="<?= BASE_URL ?>/assets/js/<?= $script ?>?v=<?= ASSET_VERSION ?>"></script>
    <?php endforeach; ?>
<?php endif; ?>

</body>
</html>
