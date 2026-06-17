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
    const toastMessage = toast.querySelector('.toast-message');

    // Default Seed Reviews
    const defaultReviews = [
        {
            id: 'seed-1',
            rating: 5,
            category: 'post-op',
            text: "Following my complex orthopedic surgery, Tricia provided round-the-clock recovery monitoring at my residence. Her clinical precision, proactive pain management, and absolute professionalism made my rehabilitation seamless. She is a top-tier nurse.",
            author: "H. K.",
            location: "Bel Air, CA",
            date: "May 12, 2026",
            verified: true
        },
        {
            id: 'seed-2',
            rating: 5,
            category: 'concierge',
            text: "Tricia has provided private duty nursing for my family during executive travels and at our estate. Her nursing care is exceptional, but what sets her apart is her absolute discretion and ability to seamlessly interface with our team of specialists.",
            author: "Anonymous",
            location: "Beverly Hills, CA",
            date: "Mar 24, 2026",
            verified: true
        },
        {
            id: 'seed-3',
            rating: 5,
            category: 'iv-palliative',
            text: "We brought Tricia in for home palliative support and custom IV hydration for our mother. Her compassionate bedside manner and profound dignity brought our family immense comfort. Her expertise in clinical symptom management is unparalleled.",
            author: "The L. Family",
            location: "Santa Monica, CA",
            date: "Apr 05, 2026",
            verified: true
        }
    ];

    // Initialize reviews from localStorage or seed data
    let reviews = JSON.parse(localStorage.getItem('tricia_nursing_reviews'));
    if (!reviews || reviews.length === 0) {
        reviews = defaultReviews;
        localStorage.setItem('tricia_nursing_reviews', JSON.stringify(reviews));
    }

    // Active category for filtering
    let activeCategory = 'all';

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
        // Clear grid
        reviewsGrid.innerHTML = '';

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

            // Author display logic
            let authorDisplay = review.author;
            if (review.location) {
                authorDisplay += ` &mdash; ${review.location}`;
            }

            card.innerHTML = `
                <div class="review-header">
                    <div class="star-rating" aria-label="Rating: ${review.rating} out of 5 stars">
                        ${starsHTML}
                    </div>
                    <span class="review-category-tag">${categoryLabel}</span>
                </div>
                <blockquote class="review-text">
                    "${escapeHTML(review.text)}"
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

    // Dialog Event Handlers
    openDialogBtn.addEventListener('click', () => {
        resetForm();
        reviewDialog.showModal();
    });

    closeDialogBtn.addEventListener('click', () => {
        reviewDialog.close();
    });

    // Close on backdrop click
    reviewDialog.addEventListener('click', (e) => {
        const rect = reviewDialog.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            reviewDialog.close();
        }
    });

    // Interactive Star Rating Form Selection
    starButtons.forEach(button => {
        // Mouse hover preview
        button.addEventListener('mouseenter', () => {
            const hoverValue = parseInt(button.getAttribute('data-value'));
            highlightStarsPreview(hoverValue);
        });

        // Click selection
        button.addEventListener('click', () => {
            const selectValue = parseInt(button.getAttribute('data-value'));
            ratingInput.value = selectValue;
            highlightStarsSelected(selectValue);
            
            // Set accessibility attributes
            starButtons.forEach((btn, idx) => {
                btn.setAttribute('aria-checked', idx < selectValue ? 'true' : 'false');
            });
            
            // Clear error if set
            hideError('rating');
        });
    });

    // Reset star highlights on mouse leave
    const starRatingContainer = document.querySelector('.star-rating-input');
    starRatingContainer.addEventListener('mouseleave', () => {
        const currentValue = parseInt(ratingInput.value);
        highlightStarsSelected(currentValue);
    });

    function highlightStarsPreview(value) {
        starButtons.forEach((btn, idx) => {
            const icon = btn.querySelector('.star-icon');
            if (idx < value) {
                icon.style.fill = 'var(--champagne)';
            } else {
                icon.style.fill = '#e0deda';
            }
        });
    }

    function highlightStarsSelected(value) {
        starButtons.forEach((btn, idx) => {
            const icon = btn.querySelector('.star-icon');
            if (idx < value) {
                btn.classList.add('selected');
                icon.style.fill = 'var(--champagne)';
            } else {
                btn.classList.remove('selected');
                icon.style.fill = '#e0deda';
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

    function hideError(fieldId) {
        const errorSpan = document.getElementById(`error-${fieldId}`);
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('active');
        }
    }

    // Reset Form State
    function resetForm() {
        reviewForm.reset();
        ratingInput.value = 0;
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
            // Split by space/hyphens/dots
            const parts = cleanName.split(/[\s.\-_]+/);
            const initials = parts
                .filter(part => part.length > 0)
                .map(part => part[0].toUpperCase())
                .join('. ');
            return initials ? `${initials}.` : 'Client';
        }

        // Return full name formatted nicely
        return cleanName;
    }

    // Form Submit Handler
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Extract values
        const ratingVal = parseInt(ratingInput.value);
        const categoryVal = document.getElementById('review-category').value;
        const textVal = document.getElementById('review-text').value.trim();
        const nameVal = document.getElementById('review-name').value.trim();
        const locationVal = document.getElementById('review-location').value.trim();
        const privacyVal = document.querySelector('input[name="privacy"]:checked').value;

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
            return; // Halt if validation fails
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
            location: locationVal || null,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            verified: true // Mark as verified since it represents client-initiated feedback
        };

        // 5. Update reviews array
        reviews.unshift(newReview); // Prepend to the top of list
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
        reviewDialog.close();
        resetForm();
    });

    // Show Toast Helper
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        toast.setAttribute('aria-hidden', 'false');

        // Automatically hide toast
        setTimeout(() => {
            toast.classList.remove('show');
            toast.setAttribute('aria-hidden', 'true');
        }, 3500);
    }

    // Scroll Reveal for Sticky Book Now Button
    const stickyBookBtn = document.getElementById('sticky-book-btn');
    
    function checkScroll() {
        if (window.scrollY > 220) {
            stickyBookBtn.classList.add('visible');
        } else {
            stickyBookBtn.classList.remove('visible');
        }
    }
    
    // Throttle scroll handler for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                checkScroll();
                scrollTimeout = null;
            }, 60);
        }
    });
    
    // Initial check in case they refresh while scrolled down
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
            // Determine position/type
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
});

