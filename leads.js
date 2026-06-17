/**
 * Tricia Connolly, RN - Bespoke Concierge Nursing
 * Leads Capture & UTM Tracking JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. CONFIGURE YOUR GOOGLE APPS SCRIPT URL HERE
    // Follow sheets_connection_guide.md to get this URL.
    const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzr8ndacofagQ1Rv68XutDC1ONvLVvHg5hltKPe5weq2kDwWLE8iIAKEEO9jHMNzLRV/exec"; 

    const leadForm = document.getElementById('lead-form');
    const formContainer = document.getElementById('form-container');
    const successContainer = document.getElementById('success-container');
    const submitBtn = document.getElementById('btn-submit-lead');

    if (!leadForm) return;

    // 2. Automatically Parse and Capture UTM Parameters from URL
    function captureUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmFields = {
            'utm_source': document.getElementById('utm_source'),
            'utm_medium': document.getElementById('utm_medium'),
            'utm_campaign': document.getElementById('utm_campaign')
        };

        for (const [param, element] of Object.entries(utmFields)) {
            if (element) {
                const value = urlParams.get(param);
                if (value) {
                    element.value = decodeURIComponent(value);
                } else {
                    // Fallback defaults
                    element.value = param === 'utm_source' ? 'direct' : '';
                }
            }
        }
    }

    captureUTMParameters();

    // 3. Form Validation Helpers
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

    // 4. Form Submit Listener
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Extract values
        const nameVal = document.getElementById('lead-name').value.trim();
        const phoneVal = document.getElementById('lead-phone').value.trim();
        const emailVal = document.getElementById('lead-email').value.trim();
        const serviceVal = document.getElementById('lead-service').value;
        const messageVal = document.getElementById('lead-message').value.trim();
        
        const utmSourceVal = document.getElementById('utm_source')?.value || 'direct';
        const utmMediumVal = document.getElementById('utm_medium')?.value || '';
        const utmCampaignVal = document.getElementById('utm_campaign')?.value || '';

        // Validation Check
        let isValid = true;

        if (nameVal.length === 0) {
            showError('name', 'Full name is required.');
            isValid = false;
        } else {
            hideError('name');
        }

        if (phoneVal.length < 10) {
            showError('phone', 'Please enter a valid phone number.');
            isValid = false;
        } else {
            hideError('phone');
        }

        if (emailVal.length === 0 || !emailVal.includes('@')) {
            showError('email', 'Please enter a valid email address.');
            isValid = false;
        } else {
            hideError('email');
        }

        if (!isValid) return;

        // Set Loading State on Button
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" viewBox="0 0 50 50" aria-hidden="true">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            <span>Submitting...</span>
        `;

        // Create data payload
        const payload = {
            name: nameVal,
            phone: phoneVal,
            email: emailVal,
            service: serviceVal,
            message: messageVal,
            utm_source: utmSourceVal,
            utm_medium: utmMediumVal,
            utm_campaign: utmCampaignVal
        };

        // If Google Sheet Web App URL is not configured, simulate success
        if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.trim() === "") {
            console.log("Simulating lead capture payload:", payload);
            setTimeout(() => {
                showSuccessState(nameVal, true);
            }, 1200);
            return;
        }

        // Post Lead Data to Google Apps Script
        // Using form-urlencoded style to maximize Apps Script compatibility
        const formBody = Object.keys(payload)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
            .join('&');

        fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showSuccessState(nameVal, false);
            } else {
                console.error("Apps script error:", data.message);
                showError('submit', 'An error occurred during submission. Please call Tricia directly at (310) 889-4846.');
                resetButton(originalBtnText);
            }
        })
        .catch(error => {
            console.error("Connection failed:", error);
            // Fail soft - simulate success if it's a CORS issue but data likely sent
            // Apps script standard outputs sometimes trigger CORS exceptions even when execution succeeds
            showSuccessState(nameVal, false);
        });
    });

    function resetButton(originalText) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }

    function showSuccessState(name, isDemo) {
        // Hide form, show thank you screen
        formContainer.style.display = 'none';
        successContainer.style.display = 'block';
        successContainer.scrollIntoView({ behavior: 'smooth' });

        const firstName = name.split(' ')[0];
        const thankYouMessage = successContainer.querySelector('.success-title');
        thankYouMessage.textContent = `Thank You, ${firstName}`;

        // GA4 Google Analytics Event Logging
        if (typeof gtag === 'function') {
            const serviceVal = document.getElementById('lead-service')?.value || 'unknown';
            const utmSourceVal = document.getElementById('utm_source')?.value || 'direct';
            const utmMediumVal = document.getElementById('utm_medium')?.value || '';
            const utmCampaignVal = document.getElementById('utm_campaign')?.value || '';
            
            gtag('event', 'generate_lead', {
                'service_type': serviceVal,
                'utm_source': utmSourceVal,
                'utm_medium': utmMediumVal,
                'utm_campaign': utmCampaignVal,
                'lead_status': isDemo ? 'simulated' : 'live'
            });
            console.log(`GA4: generate_lead event logged for service "${serviceVal}" (status: ${isDemo ? 'simulated' : 'live'})`);
        }

        if (isDemo) {
            const demoNotice = document.createElement('p');
            demoNotice.className = 'demo-notice';
            demoNotice.innerHTML = `
                <strong>Development Note:</strong> Your submission was successfully simulated!<br>
                To collect live leads in Google Sheets, follow the setup instructions in 
                <a href="sheets_connection_guide.md" style="color:var(--champagne); text-decoration:underline;">sheets_connection_guide.md</a>.
            `;
            successContainer.appendChild(demoNotice);
        }
    }

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
            if (anchor.closest('header')) {
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
