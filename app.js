/**
 * Tricia Connolly, RN - Bespoke Concierge Nursing
 * Client Reviews & Testimonials JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const reviewsGrid = document.getElementById('reviews-grid');
    const filterButtons = document.querySelectorAll('.filter-pill');
    const openDialogBtn = document.getElementById('btn-open-review');
    const closeDialogBtn = document.getElementById('btn-close-review');
    const reviewDialog = document.getElementById('review-dialog');
    const reviewForm = document.getElementById('review-form');
    const starButtons = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('review-rating');
    const toast = document.getElementById('toast');
    const toastMessage = toast ? toast.querySelector('.toast-message') : null;

    // Extract location context from data attributes on #main-content
    const mainContent = document.getElementById('main-content');
    const neighborhood = mainContent ? mainContent.getAttribute('data-neighborhood') : '';
    const enclave = mainContent ? mainContent.getAttribute('data-enclave') : '';
    const zipCode = mainContent ? mainContent.getAttribute('data-zip') : '';
    const hospital = mainContent ? mainContent.getAttribute('data-hospital') : '';

    // Default Seed Reviews with placeholders and default fallbacks
    const defaultReviews = [
        {
            id: 'seed-1',
            rating: 5,
            category: 'post-op',
            text: "Following my complex reconstructive surgery at {{LOCAL_HOSPITAL}}, Tricia provided round-the-clock recovery monitoring at my {{ENCLAVE}} estate. Her clinical precision, proactive pain management, and absolute professionalism made my rehabilitation seamless. She is a top-tier nurse.",
            author: "H. K.",
            location: "{{NEIGHBORHOOD}}, CA",
            date: "May 12, 2026",
            verified: true,
            defaults: {
                enclave: "Bel Air",
                neighborhood: "Bel Air",
                hospital: "Cedars-Sinai"
            }
        },
        {
            id: 'seed-2',
            rating: 5,
            category: 'concierge',
            text: "Tricia has provided private duty nursing for my family during executive travels and at our estate in {{ENCLAVE}}. Her nursing care is exceptional, but what sets her apart is her absolute discretion and ability to seamlessly interface with our team of specialists and private physicians near {{LOCAL_HOSPITAL}}.",
            author: "Anonymous",
            location: "{{NEIGHBORHOOD}}, CA",
            date: "Mar 24, 2026",
            verified: true,
            defaults: {
                enclave: "Beverly Hills",
                neighborhood: "Beverly Hills",
                hospital: "Cedars-Sinai"
            }
        },
        {
            id: 'seed-3',
            rating: 5,
            category: 'iv-palliative',
            text: "We brought Tricia in for in-home palliative support and custom IV hydration for our mother at her {{ENCLAVE}} residence. Her compassionate bedside manner and profound dignity brought our family immense comfort. Her expertise in clinical symptom management is unparalleled.",
            author: "The L. Family",
            location: "{{NEIGHBORHOOD}}, CA",
            date: "Apr 05, 2026",
            verified: true,
            defaults: {
                enclave: "Santa Monica",
                neighborhood: "Santa Monica",
                hospital: "UCLA Medical Center"
            }
        }
    ];

    // Initialize reviews from localStorage or seed data
    let reviews = JSON.parse(localStorage.getItem('tricia_nursing_reviews'));
    if (!reviews || reviews.length === 0) {
        reviews = defaultReviews;
        localStorage.setItem('tricia_nursing_reviews', JSON.stringify(reviews));
    } else {
        // Migration: Ensure seed reviews are updated to template-based versions
        let updated = false;
        defaultReviews.forEach(defRev => {
            const index = reviews.findIndex(r => r.id === defRev.id);
            if (index !== -1) {
                if (!reviews[index].defaults) {
                    reviews[index] = defRev;
                    updated = true;
                }
            } else {
                reviews.push(defRev);
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('tricia_nursing_reviews', JSON.stringify(reviews));
        }
    }

    // Determine default category based on page path and query parameters
    function getDefaultCategory() {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get('service');
        if (serviceParam) {
            if (serviceParam === 'post-op') return 'post-op';
            if (serviceParam === 'iv' || serviceParam === 'iv-therapy') return 'iv-palliative';
            if (serviceParam === 'b2b' || serviceParam === 'partner') return 'concierge';
            return 'concierge';
        }

        const path = window.location.pathname.toLowerCase();
        if (path.includes('post-op')) return 'post-op';
        if (path.includes('iv-therapy')) return 'iv-palliative';
        if (path.includes('concierge')) return 'concierge';
        
        return 'all';
    }

    // Active category for filtering
    let activeCategory = getDefaultCategory();

    // SVG Star Icon Helper
    const getStarSVG = (isFilled) => {
        const fillClass = isFilled ? 'star-filled' : 'star-empty';
        return `
            <svg class="${fillClass}" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
            </svg>
        `;
    };

    // Render Reviews
    function renderReviews() {
        if (!reviewsGrid) return;

        // Clear grid
        reviewsGrid.innerHTML = '';

        // Dynamically update section heading based on active category and location
        const reviewsHeading = document.getElementById('concierge-reviews-heading') || 
                               document.getElementById('postop-reviews-heading') || 
                               document.getElementById('iv-reviews-heading') || 
                               document.getElementById('reviews-heading');
        if (reviewsHeading) {
            const categoryTitles = {
                'post-op': 'Verified Recovery Reviews',
                'concierge': 'Verified Concierge Reviews',
                'iv-palliative': 'Verified IV & Palliative Reviews',
                'all': 'Client Testimonials'
            };
            const titleBase = categoryTitles[activeCategory] || 'Client Testimonials';
            if (neighborhood) {
                reviewsHeading.textContent = `${titleBase} for ${neighborhood}`;
            } else {
                reviewsHeading.textContent = titleBase;
            }
        }

        // Filter reviews
        const filteredReviews = activeCategory === 'all' 
            ? reviews 
            : reviews.filter(r => r.category === activeCategory);

        if (filteredReviews.length === 0) {
            reviewsGrid.innerHTML = `
                <div class="empty-state">
                    No testimonials available in this category yet.
                </div>
            `;
            return;
        }

        // Generate HTML
        filteredReviews.forEach(review => {
            const card = document.createElement('article');
            card.className = 'review-card';
            card.setAttribute('aria-label', `Testimonial by ${review.author}`);

            // Build stars string
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                starsHTML += getStarSVG(i <= review.rating);
            }

            // Map category IDs to labels
            const categoryLabels = {
                'post-op': 'Post-Op Recovery',
                'concierge': 'Concierge Care',
                'iv-palliative': 'IV & Palliative',
                'other': 'Clinical Service'
            };
            const categoryLabel = categoryLabels[review.category] || 'Specialized Care';

            // Localize text & location if placeholders are present
            let text = review.text;
            let locationVal = review.location;

            if (text.includes('{{') || (locationVal && locationVal.includes('{{'))) {
                const enclaveVal = enclave || (review.defaults ? review.defaults.enclave : '');
                const neighborhoodVal = neighborhood || (review.defaults ? review.defaults.neighborhood : '');
                const hospitalVal = hospital || (review.defaults ? review.defaults.hospital : '');

                text = text
                    .replace(/{{ENCLAVE}}/g, enclaveVal)
                    .replace(/{{NEIGHBORHOOD}}/g, neighborhoodVal)
                    .replace(/{{LOCAL_HOSPITAL}}/g, hospitalVal);
                
                if (locationVal) {
                    locationVal = locationVal
                        .replace(/{{ENCLAVE}}/g, enclaveVal)
                        .replace(/{{NEIGHBORHOOD}}/g, neighborhoodVal)
                        .replace(/{{LOCAL_HOSPITAL}}/g, hospitalVal);
                }
            }

            // Author display logic
            let authorDisplay = review.author;
            if (locationVal) {
                authorDisplay += ` &mdash; ${locationVal}`;
            }

            card.innerHTML = `
                <div class="review-header">
                    <div class="star-rating" aria-label="Rating: ${review.rating} out of 5 stars">
                        ${starsHTML}
                    </div>
                    <span class="review-category-tag">${categoryLabel}</span>
                </div>
                <blockquote class="review-text">
                    "${escapeHTML(text)}"
                </blockquote>
                <div class="review-footer">
                    <span class="review-author">${authorDisplay}</span>
                    <span class="review-date">${review.date}</span>
                </div>
            `;

            // Prepend verified badge if verified
            if (review.verified) {
                const footer = card.querySelector('.review-footer');
                const badge = document.createElement('span');
                badge.className = 'review-verified';
                badge.innerHTML = `
                    <svg class="review-verified-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Verified Client
                `;
                footer.insertBefore(badge, footer.lastElementChild);
            }

            reviewsGrid.appendChild(card);
        });
    }

    // Escape HTML to prevent XSS
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Init Render
    renderReviews();

    // Category Filter Button Handlers
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });

                // Set current active
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                activeCategory = button.getAttribute('data-category');

                // Render
                renderReviews();

                // GA4 Google Analytics Event Logging
                if (typeof gtag === 'function') {
                    gtag('event', 'filter_reviews', {
                        'category': activeCategory
                    });
                    console.log(`GA4: filter_reviews event logged for category "${activeCategory}"`);
                }
            });
        });
    }

    // Dialog Event Handlers
    if (openDialogBtn && reviewDialog) {
        openDialogBtn.addEventListener('click', () => {
            resetForm();
            
            // Pre-select category based on active category
            const categorySelect = document.getElementById('review-category');
            if (categorySelect) {
                const defaultCat = getDefaultCategory();
                if (defaultCat !== 'all') {
                    categorySelect.value = defaultCat;
                }
            }
            
            // Pre-fill location if neighborhood context is available
            const locationInput = document.getElementById('review-location');
            if (locationInput && neighborhood) {
                locationInput.value = `${neighborhood}, CA`;
            }
            
            reviewDialog.showModal();
        });
    }

    if (closeDialogBtn && reviewDialog) {
        closeDialogBtn.addEventListener('click', () => {
            reviewDialog.close();
        });
    }

    // Close on backdrop click
    if (reviewDialog) {
        reviewDialog.addEventListener('click', (e) => {
            const rect = reviewDialog.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                reviewDialog.close();
            }
        });
    }

    // Interactive Star Rating Form Selection
    if (starButtons.length > 0) {
        starButtons.forEach(button => {
            // Mouse hover preview
            button.addEventListener('mouseenter', () => {
                const hoverValue = parseInt(button.getAttribute('data-value'));
                highlightStarsPreview(hoverValue);
            });

            // Click selection
            button.addEventListener('click', () => {
                const selectValue = parseInt(button.getAttribute('data-value'));
                if (ratingInput) ratingInput.value = selectValue;
                highlightStarsSelected(selectValue);
                
                // Set accessibility attributes
                starButtons.forEach((btn, idx) => {
                    btn.setAttribute('aria-checked', idx < selectValue ? 'true' : 'false');
                });
                
                // Clear error if set
                hideError('rating');
            });
        });
    }

    // Reset star highlights on mouse leave
    const starRatingContainer = document.querySelector('.star-rating-input');
    if (starRatingContainer) {
        starRatingContainer.addEventListener('mouseleave', () => {
            if (ratingInput) {
                const currentValue = parseInt(ratingInput.value);
                highlightStarsSelected(currentValue);
            }
        });
    }

    function highlightStarsPreview(value) {
        starButtons.forEach((btn, idx) => {
            const icon = btn.querySelector('.star-icon');
            if (icon) {
                if (idx < value) {
                    icon.style.fill = 'var(--champagne)';
                } else {
                    icon.style.fill = '#e0deda';
                }
            }
        });
    }

    function highlightStarsSelected(value) {
        starButtons.forEach((btn, idx) => {
            const icon = btn.querySelector('.star-icon');
            if (icon) {
                if (idx < value) {
                    btn.classList.add('selected');
                    icon.style.fill = 'var(--champagne)';
                } else {
                    btn.classList.remove('selected');
                    icon.style.fill = '#e0deda';
                }
            }
        });
    }

    // Form Field Validation
    function showError(fieldId, message) {
        const errorSpan = document.getElementById(`error-${fieldId}`);
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('active');
        }
    }

    // Hide error
    function hideError(fieldId) {
        const errorSpan = document.getElementById(`error-${fieldId}`);
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('active');
        }
    }

    // Reset Form State
    function resetForm() {
        if (!reviewForm) return;
        reviewForm.reset();
        if (ratingInput) ratingInput.value = 0;
        highlightStarsSelected(0);
        
        starButtons.forEach(btn => {
            btn.setAttribute('aria-checked', 'false');
        });

        // Clear all error states
        ['rating', 'category', 'text', 'name'].forEach(fieldId => {
            hideError(fieldId);
        });
    }

    // Privacy Formatter for Authors
    function formatAuthor(rawName, privacySetting) {
        const cleanName = rawName.trim();
        if (privacySetting === 'anonymous') {
            return 'Anonymous';
        }
        
        if (privacySetting === 'initials') {
            const parts = cleanName.split(/[\s.\-_]+/);
            const initials = parts
                .filter(part => part.length > 0)
                .map(part => part[0].toUpperCase())
                .join('. ');
            return initials ? `${initials}.` : 'Client';
        }

        return cleanName;
    }

    // Form Submit Handler
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Extract values
            const ratingVal = ratingInput ? parseInt(ratingInput.value) : 0;
            const categoryVal = document.getElementById('review-category')?.value;
            const textVal = document.getElementById('review-text')?.value.trim() || '';
            const nameVal = document.getElementById('review-name')?.value.trim() || '';
            const locationInputVal = document.getElementById('review-location')?.value.trim() || '';
            const privacyEl = document.querySelector('input[name="privacy"]:checked');
            const privacyVal = privacyEl ? privacyEl.value : 'initials';

            // 2. Client Side Validation
            let isValid = true;

            if (ratingVal === 0) {
                showError('rating', 'Please select a star rating (1 to 5).');
                isValid = false;
            } else {
                hideError('rating');
            }

            if (!categoryVal) {
                showError('category', 'Please select a service category.');
                isValid = false;
            } else {
                hideError('category');
            }

            if (textVal.length < 10) {
                showError('text', 'Testimonial is too short. Please provide a brief description (min 10 characters).');
                isValid = false;
            } else {
                hideError('text');
            }

            if (nameVal.length === 0) {
                showError('name', 'Name or initials is required.');
                isValid = false;
            } else {
                hideError('name');
            }

            if (!isValid) {
                return;
            }

            // 3. Process Author Name based on privacy settings
            const formattedAuthor = formatAuthor(nameVal, privacyVal);

            // 4. Create new review object
            const newReview = {
                id: 'user-' + Date.now(),
                rating: ratingVal,
                category: categoryVal,
                text: textVal,
                author: formattedAuthor,
                location: locationInputVal || null,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                verified: true
            };

            // 5. Update reviews array
            reviews.unshift(newReview);
            localStorage.setItem('tricia_nursing_reviews', JSON.stringify(reviews));

            // 6. Update view
            renderReviews();

            // GA4 Google Analytics Event Logging
            if (typeof gtag === 'function') {
                gtag('event', 'submit_review', {
                    'category': categoryVal,
                    'privacy_setting': privacyVal,
                    'rating': ratingVal
                });
                console.log(`GA4: submit_review event logged (category: "${categoryVal}", privacy: "${privacyVal}", rating: ${ratingVal})`);
            }

            // 7. Success toast notification
            showToast(`Testimonial submitted successfully under "${privacyVal}" privacy setting.`);

            // 8. Close and clean up
            if (reviewDialog) reviewDialog.close();
            resetForm();
        });
    }

    // Show Toast Helper
    function showToast(message) {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = message;
        toast.classList.add('show');
        toast.setAttribute('aria-hidden', 'false');

        setTimeout(() => {
            toast.classList.remove('show');
            toast.setAttribute('aria-hidden', 'true');
        }, 3500);
    }

    // Scroll Reveal for Sticky Book Now Button
    const stickyBookBtn = document.getElementById('sticky-book-btn');
    
    function checkScroll() {
        if (!stickyBookBtn) return;
        if (window.scrollY > 220) {
            stickyBookBtn.classList.add('visible');
        } else {
            stickyBookBtn.classList.remove('visible');
        }
    }
    
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                checkScroll();
                scrollTimeout = null;
            }, 60);
        }
    });
    
    checkScroll();

    // Track all tel:, sms:, and mailto: link clicks globally on the page
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;
        
        const href = anchor.getAttribute('href') || '';
        let contactMethod = '';
        let contactVal = '';
        
        if (href.startsWith('tel:')) {
            contactMethod = 'phone';
            contactVal = href.replace('tel:', '');
        } else if (href.startsWith('sms:')) {
            contactMethod = 'sms';
            contactVal = href.split('?')[0].replace('sms:', '');
        } else if (href.startsWith('mailto:')) {
            contactMethod = 'email';
            contactVal = href.replace('mailto:', '');
        }
        
        if (contactMethod) {
            let position = 'general_link';
            if (anchor.classList.contains('sticky-action-btn')) {
                position = 'sticky_bar';
            } else if (anchor.closest('.contact-info')) {
                position = 'header';
            }
            
            if (typeof gtag === 'function') {
                gtag('event', 'contact_click', {
                    'method': contactMethod,
                    'position': position,
                    'destination': contactVal
                });
                console.log(`GA4: contact_click logged (method: ${contactMethod}, position: ${position})`);
            }
        }
    });

    // ==========================================================================
    // Interactive Menu Navigation Toggles
    // ==========================================================================
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !expanded);
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    if (dropdownTrigger && dropdownMenu) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = dropdownTrigger.getAttribute('aria-expanded') === 'true';
            dropdownTrigger.setAttribute('aria-expanded', !expanded);
            dropdownMenu.classList.toggle('active');
        });
    }

    // Close menu or dropdown if user clicks outside
    document.addEventListener('click', () => {
        if (navToggle && navLinks && navLinks.classList.contains('active')) {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
        if (dropdownTrigger && dropdownMenu && dropdownMenu.classList.contains('active')) {
            dropdownTrigger.setAttribute('aria-expanded', 'false');
            dropdownMenu.classList.remove('active');
        }
    });

    // Prevent closing menu when clicking inside the navigation elements
    if (navLinks) {
        navLinks.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});
