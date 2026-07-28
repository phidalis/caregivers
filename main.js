// ==========================================
// MERCY SENIOR SOLUTIONS - Main JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', function() {

    // ------------------------------------------
    // NAVIGATION
    // ------------------------------------------
    
    // Sticky navbar with scroll effect
    var navbar = document.querySelector('.navbar');
    var lastScroll = 0;
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            var currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // Mobile hamburger menu
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    var mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    var mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    
    function toggleMobileNav() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    }
    
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileNav);
    }
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', toggleMobileNav);
    }
    
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', toggleMobileNav);
    });
    
    // ------------------------------------------
    // SCROLL ANIMATIONS (Intersection Observer)
    // ------------------------------------------
    
    var animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    var observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };
    
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(function(el) {
        observer.observe(el);
    });
    
    // ------------------------------------------
    // LIVE CHAT WIDGET
    // ------------------------------------------
    
    var chatButton = document.querySelector('.chat-toggle');
    var chatPopup = document.querySelector('.chat-popup');
    var chatClose = document.querySelector('.chat-close');
    var chatForm = document.querySelector('.chat-form');
    var chatInput = document.querySelector('.chat-input');
    var chatMessages = document.querySelector('.chat-messages');
    
    if (chatButton) {
        chatButton.addEventListener('click', function() {
            chatPopup.classList.toggle('active');
            if (chatPopup.classList.contains('active')) {
                chatInput.focus();
            }
        });
    }
    
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            chatPopup.classList.remove('active');
        });
    }
    
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var message = chatInput.value.trim();
            if (message === '') return;
            
            var userMsg = document.createElement('div');
            userMsg.className = 'chat-message sent';
            userMsg.innerHTML = '<p>' + escapeHtml(message) + '</p>';
            chatMessages.appendChild(userMsg);
            
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            setTimeout(function() {
                var advisorMsg = document.createElement('div');
                advisorMsg.className = 'chat-message received';
                var isOnline = typeof isWithinBusinessHours === 'function' && isWithinBusinessHours();
                var responses;
                if (isOnline) {
                    responses = [
                        'Thank you for reaching out. A Senior Advisor will be with you shortly.',
                        'We appreciate your message. How can we help you find the right care for your loved one?',
                        'Welcome to Mercy Senior Solutions. Our team is here to guide you through every step.',
                        'Thank you for your interest. Would you like to schedule a free consultation?'
                    ];
                } else {
                    responses = [
                        'Thank you for your message. Our office is currently closed. We have received your inquiry and will respond on the next business day.',
                        'We appreciate you reaching out. A team member will follow up during our next business day (Mon-Fri 8am-6pm).',
                        'Your message has been received. For urgent matters, please call (341) 618-9792.'
                    ];
                }
                var randomResponse = responses[Math.floor(Math.random() * responses.length)];
                advisorMsg.innerHTML = '<p>' + randomResponse + '</p>';
                chatMessages.appendChild(advisorMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1500);
        });
    }
    
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }
    
    // ------------------------------------------
    // FORM HANDLING - Submit to Firestore
    // ------------------------------------------
    
    // Care Request Form
    var careForm = document.getElementById('careRequestForm');
    if (careForm) {
        careForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(careForm)) return;
            
            var formData = new FormData(careForm);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            
            var btn = careForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.classList.add('loading');
            
            FirebaseServices.careRequests.create(data).then(function() {
                careForm.innerHTML = '<div class="inline-confirm">' +
                    '<div class="inline-confirm-icon"><i class="fas fa-check"></i></div>' +
                    '<h3>Request Submitted!</h3>' +
                    '<p>Thank you for reaching out, ' + escapeHtml(data.name || '') + '. Our care advisors will review your request and contact you within 24 hours.</p>' +
                    '<div class="inline-confirm-steps">' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">1</div><span>A senior care advisor will review your needs</span></div>' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">2</div><span>We will match you with the best care options</span></div>' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">3</div><span>You will receive a personalized care plan</span></div>' +
                    '</div>' +
                    '<a href="contact.html" class="btn btn-gold"><i class="fas fa-calendar-check"></i> Schedule a Call</a>' +
                    '</div>';
            }).catch(function(err) {
                showNotification('Error submitting request. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            });
        });
    }
    
    // Career Application Form
    var careerForm = document.getElementById('careerForm');
    if (careerForm) {
        careerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(careerForm)) return;
            
            var formData = new FormData(careerForm);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            data.type = 'career';
            
            var btn = careerForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.classList.add('loading');
            
            FirebaseServices.applications.create(data).then(function() {
                return FirebaseServices.activity.log({
                    type: 'application',
                    description: 'New career application from ' + data.name,
                    icon: 'fas fa-user-plus',
                    color: 'blue'
                });
            }).then(function() {
                showNotification('Your application has been submitted. We will review it and get back to you soon.', 'success');
                careerForm.reset();
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            }).catch(function(err) {
                showNotification('Error submitting application. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            });
        });
    }
    
    // Provider Application Form
    var providerForm = document.getElementById('providerForm');
    if (providerForm) {
        providerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(providerForm)) return;
            
            var formData = new FormData(providerForm);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            data.type = 'provider';
            
            var btn = providerForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.classList.add('loading');
            
            FirebaseServices.applications.create(data).then(function() {
                return FirebaseServices.activity.log({
                    type: 'application',
                    description: 'New provider application: ' + data.facilityName,
                    icon: 'fas fa-hospital',
                    color: 'gold'
                });
            }).then(function() {
                providerForm.innerHTML = '<div class="inline-confirm">' +
                    '<div class="inline-confirm-icon"><i class="fas fa-check"></i></div>' +
                    '<h3>Application Submitted!</h3>' +
                    '<p>Thank you for your interest in partnering with Mercy Senior Solutions. Our partnerships team will review your application and contact you within 48 hours.</p>' +
                    '<div class="inline-confirm-steps">' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">1</div><span>Our team will verify your facility credentials</span></div>' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">2</div><span>A partnership specialist will reach out to you</span></div>' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">3</div><span>We will set up your provider profile and listing</span></div>' +
                    '</div>' +
                    '<a href="contact.html" class="btn btn-gold"><i class="fas fa-phone"></i> Contact Us</a>' +
                    '</div>';
            }).catch(function(err) {
                showNotification('Error submitting application. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            });
        });
    }
    
    // Contact Form
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(contactForm)) return;
            
            var formData = new FormData(contactForm);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            
            var btn = contactForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.classList.add('loading');
            
            FirebaseServices.contactMessages.create(data).then(function() {
                showNotification('Your message has been sent. We will respond within 24 hours.', 'success');
                contactForm.reset();
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            }).catch(function(err) {
                showNotification('Error sending message. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            });
        });
    }
    
    // Newsletter Form
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var emailInput = newsletterForm.querySelector('input[type="email"]');
            var email = emailInput.value.trim();
            
            FirebaseServices.newsletter.subscribe(email).then(function() {
                showNotification('Thank you for subscribing to our newsletter.', 'success');
                newsletterForm.reset();
            }).catch(function(err) {
                showNotification('Error subscribing. Please try again.', 'error');
                console.error(err);
            });
        });
    }
    
    // ------------------------------------------
    // NOTIFICATION SYSTEM
    // ------------------------------------------
    
    function showNotification(message, type) {
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        var notification = document.createElement('div');
        notification.className = 'notification notification-' + (type || 'success');
        notification.innerHTML = '<div class="notification-content"><span>' + message + '</span><button class="notification-close">&times;</button></div>';
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.classList.add('show');
        }, 10);
        
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(function() { notification.remove(); }, 300);
        });
        
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() { notification.remove(); }, 300);
        }, 5000);
    }
    
    // Add notification CSS dynamically
    var notificationStyles = document.createElement('style');
    notificationStyles.textContent = '\
        .notification {\
            position: fixed;\
            top: 100px;\
            right: 30px;\
            z-index: 10000;\
            max-width: 420px;\
            transform: translateX(120%);\
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);\
        }\
        .notification.show {\
            transform: translateX(0);\
        }\
        .notification-content {\
            background: white;\
            padding: 20px 24px;\
            border-radius: 14px;\
            box-shadow: 0 10px 40px rgba(0,0,0,0.12);\
            display: flex;\
            align-items: center;\
            justify-content: space-between;\
            gap: 16px;\
            border-left: 4px solid #2F7D4A;\
        }\
        .notification-success { border-left-color: #2F7D4A; }\
        .notification-error { border-left-color: #DC2626; }\
        .notification-content span {\
            font-family: "Lato", sans-serif;\
            font-size: 14px;\
            color: #1F2937;\
            line-height: 1.5;\
        }\
        .notification-close {\
            background: none;\
            border: none;\
            font-size: 20px;\
            color: #6B7280;\
            cursor: pointer;\
            padding: 0 4px;\
            line-height: 1;\
        }\
    ';
    document.head.appendChild(notificationStyles);
    
    // ------------------------------------------
    // INLINE FIELD VALIDATION (TASK 3)
    // ------------------------------------------
    
    function validateField(field) {
        var formGroup = field.closest('.form-group');
        if (!formGroup) return true;
        
        var errorEl = formGroup.querySelector('.field-error-message');
        var isValid = true;
        var message = '';
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        } else if (field.type === 'email' && field.value.trim()) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value.trim())) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        } else if (field.type === 'tel' && field.value.trim()) {
            var phoneDigits = field.value.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }
        
        if (isValid) {
            formGroup.classList.remove('field-error');
            if (errorEl) errorEl.remove();
        } else {
            formGroup.classList.add('field-error');
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'field-error-message';
                formGroup.appendChild(errorEl);
            }
            errorEl.textContent = message;
        }
        
        return isValid;
    }
    
    function validateForm(form) {
        var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        var allValid = true;
        fields.forEach(function(field) {
            if (!validateField(field)) {
                allValid = false;
            }
        });
        return allValid;
    }
    
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function(field) {
        field.addEventListener('blur', function() {
            if (this.hasAttribute('required') || this.type === 'email' || this.type === 'tel') {
                validateField(this);
            }
        });
        field.addEventListener('input', function() {
            var formGroup = this.closest('.form-group');
            if (formGroup && formGroup.classList.contains('field-error')) {
                validateField(this);
            }
        });
    });
    
    // ------------------------------------------
    // CHAT WIDGET BUSINESS HOURS (TASK 6)
    // ------------------------------------------
    
    function isWithinBusinessHours() {
        var now = new Date();
        var day = now.getDay();
        var hour = now.getHours();
        var minutes = now.getMinutes();
        var timeInMinutes = hour * 60 + minutes;
        
        if (day === 0) return false;
        if (day >= 1 && day <= 5) {
            return timeInMinutes >= 480 && timeInMinutes < 1080;
        }
        if (day === 6) {
            return timeInMinutes >= 540 && timeInMinutes < 900;
        }
        return false;
    }
    
    var chatStatusEl = document.querySelector('.chat-status');
    if (chatStatusEl) {
        if (!isWithinBusinessHours()) {
            chatStatusEl.textContent = 'Offline - Leave a message';
            chatStatusEl.style.color = 'rgba(255,255,255,0.5)';
            chatStatusEl.style.setProperty('--dot-color', '#6B7280');
            
            var chatMessagesContainer = document.querySelector('.chat-messages');
            if (chatMessagesContainer) {
                var welcomeMsg = chatMessagesContainer.querySelector('.chat-message.received p');
                if (welcomeMsg) {
                    welcomeMsg.textContent = 'Our office is currently closed. Leave us a message and we will get back to you on the next business day.';
                }
            }
        }
    }
    
    // ------------------------------------------
    // COMMUNITY SEARCH (TASK 1)
    // ------------------------------------------
    
    var familySearchForm = document.getElementById('familySearchForm');
    if (familySearchForm) {
        var searchVisibleCount = 9;
        var allSearchResults = [];
        
        familySearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchVisibleCount = 9;
            performCommunitySearch();
        });
        
        function performCommunitySearch() {
            var searchCard = familySearchForm.closest('.search-card');
            var resultsContainer = document.getElementById('searchResults');
            
            if (!resultsContainer) {
                resultsContainer = document.createElement('div');
                resultsContainer.id = 'searchResults';
                resultsContainer.className = 'search-results-container';
                if (searchCard) {
                    searchCard.parentNode.insertBefore(resultsContainer, searchCard.nextSibling);
                } else {
                    var section = familySearchForm.closest('.section');
                    if (section) section.appendChild(resultsContainer);
                }
            }
            
            resultsContainer.innerHTML = '<div class="search-loading">' +
                '<div class="search-skeleton-card"><div class="skeleton-line title"></div><div class="skeleton-line short"></div><div class="skeleton-line medium"></div><div class="skeleton-line"></div></div>' +
                '<div class="search-skeleton-card"><div class="skeleton-line title"></div><div class="skeleton-line short"></div><div class="skeleton-line medium"></div><div class="skeleton-line"></div></div>' +
                '<div class="search-skeleton-card"><div class="skeleton-line title"></div><div class="skeleton-line short"></div><div class="skeleton-line medium"></div><div class="skeleton-line"></div></div>' +
                '</div>';
            
            var selects = familySearchForm.querySelectorAll('.filter-group select');
            var stateVal = selects[0] ? selects[0].value : '';
            var cityVal = selects[1] ? selects[1].value : '';
            var budgetVal = selects[2] ? selects[2].value : '';
            var careTypeVal = selects[3] ? selects[3].value : '';
            
            var advancedFilters = familySearchForm.querySelector('.advanced-filters');
            var advCheckboxes = advancedFilters ? advancedFilters.querySelectorAll('input[type="checkbox"]') : [];
            var wantsMemoryCare = advCheckboxes[0] ? advCheckboxes[0].checked : false;
            var wantsPetFriendly = advCheckboxes[1] ? advCheckboxes[1].checked : false;
            var wantsPrivateRoom = advCheckboxes[2] ? advCheckboxes[2].checked : false;
            var wantsVA = advCheckboxes[3] ? advCheckboxes[3].checked : false;
            
            db.collection('facilities').get().then(function(snap) {
                allSearchResults = [];
                
                snap.forEach(function(doc) {
                    var f = doc.data();
                    f.id = doc.id;
                    
                    if (stateVal && stateVal !== 'Select State' && f.state && f.state !== stateVal) return;
                    if (cityVal && cityVal !== 'Select City' && f.city && f.city !== cityVal) return;
                    
                    if (careTypeVal && careTypeVal !== 'Select Care Type') {
                        var types = f.careTypes || [];
                        if (types.indexOf(careTypeVal) === -1) return;
                    }
                    
                    if (budgetVal && budgetVal !== 'Select Budget' && f.pricingFrom) {
                        var price = f.pricingFrom;
                        if (budgetVal === 'Under $3,000/mo' && price >= 3000) return;
                        if (budgetVal === '$3,000 - $5,000/mo' && (price < 3000 || price > 5000)) return;
                        if (budgetVal === '$5,000 - $8,000/mo' && (price < 5000 || price > 8000)) return;
                        if (budgetVal === '$8,000+/mo' && price < 8000) return;
                    }
                    
                    if (wantsMemoryCare && !f.memoryCare) return;
                    if (wantsPetFriendly && !f.petFriendly) return;
                    if (wantsPrivateRoom && !f.privateRooms) return;
                    if (wantsVA && !f.vaBenefits) return;
                    
                    allSearchResults.push(f);
                });
                
                renderSearchResults();
            }).catch(function(err) {
                console.error('Search error:', err);
                resultsContainer.innerHTML = '<div class="search-empty"><i class="fas fa-exclamation-triangle"></i><h4>Search Unavailable</h4><p>We couldn\'t load communities right now. Please try again or call us at (341) 618-9792.</p></div>';
            });
        }
        
        function renderSearchResults() {
            var resultsContainer = document.getElementById('searchResults');
            if (!resultsContainer) return;
            
            if (allSearchResults.length === 0) {
                resultsContainer.innerHTML = '<div class="search-empty"><i class="fas fa-building"></i><h4>No Communities Found</h4><p>Try adjusting your filters or <a href="#careRequestForm" style="color: #D4A33A; font-weight: 700;">request a personalized recommendation</a>.</p></div>';
                return;
            }
            
            var showCount = Math.min(searchVisibleCount, allSearchResults.length);
            var html = '<div class="search-results-header"><h4>Communities Found</h4><span class="search-results-count">Showing ' + showCount + ' of ' + allSearchResults.length + '</span></div>';
            html += '<div class="search-results-grid">';
            
            for (var i = 0; i < showCount; i++) {
                var f = allSearchResults[i];
                var types = f.careTypes || [];
                var typesHtml = '';
                for (var t = 0; t < types.length && t < 3; t++) {
                    typesHtml += '<span class="search-result-type-tag">' + escapeHtml(types[t]) + '</span>';
                }
                
                var priceStr = f.pricingFrom ? FirebaseServices.formatCurrency(f.pricingFrom) + '<span>/mo</span>' : 'Contact for pricing';
                var vacancyHtml = '';
                if (f.vacancies > 0) {
                    vacancyHtml = '<span class="search-result-vacancy available"><i class="fas fa-circle-check"></i>' + f.vacancies + ' available</span>';
                } else {
                    vacancyHtml = '<span class="search-result-vacancy"><i class="fas fa-clock"></i>Waitlist</span>';
                }
                
                html += '<div class="search-result-card">' +
                    '<div class="search-result-name">' + escapeHtml(f.facilityName || 'Community') + '</div>' +
                    '<div class="search-result-location"><i class="fas fa-location-dot"></i> ' + escapeHtml(f.city || '') + (f.state ? ', ' + escapeHtml(f.state) : '') + '</div>' +
                    '<div class="search-result-types">' + typesHtml + '</div>' +
                    '<div class="search-result-meta"><span class="search-result-price">' + priceStr + '</span>' + vacancyHtml + '</div>' +
                    '</div>';
            }
            
            html += '</div>';
            
            if (allSearchResults.length > searchVisibleCount) {
                html += '<button class="search-show-more" id="showMoreResults">Show More Communities (' + (allSearchResults.length - showCount) + ' remaining)</button>';
            }
            
            html += '<div style="text-align: center; margin-top: 24px;"><a href="#careRequestForm" class="btn btn-gold"><i class="fas fa-paper-plane"></i> Request a Personalized Recommendation</a></div>';
            
            resultsContainer.innerHTML = html;
            
            var showMoreBtn = document.getElementById('showMoreResults');
            if (showMoreBtn) {
                showMoreBtn.addEventListener('click', function() {
                    searchVisibleCount += 9;
                    renderSearchResults();
                });
            }
        }
    }
    
    // ------------------------------------------
    // RESOURCE CATEGORY FILTER (TASK 5)
    // ------------------------------------------
    
    var filterPills = document.querySelectorAll('.resource-filter-pill');
    var resourceCards = document.querySelectorAll('.resource-card[data-modal]');
    
    if (filterPills.length > 0 && resourceCards.length > 0) {
        filterPills.forEach(function(pill) {
            pill.addEventListener('click', function() {
                filterPills.forEach(function(p) { p.classList.remove('active'); });
                this.classList.add('active');
                
                var filter = this.getAttribute('data-filter');
                
                resourceCards.forEach(function(card) {
                    if (filter === 'all') {
                        card.style.display = '';
                        return;
                    }
                    var badge = card.querySelector('.badge');
                    var category = badge ? badge.textContent.trim() : '';
                    card.style.display = (category === filter) ? '' : 'none';
                });
            });
        });
    }
    
    // ------------------------------------------
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ------------------------------------------
    
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ------------------------------------------
    // SEARCH FILTER TOGGLE (Families section)
    // ------------------------------------------
    
    var advancedToggle = document.querySelector('.advanced-toggle');
    var advancedFilters = document.querySelector('.advanced-filters');
    
    if (advancedToggle && advancedFilters) {
        advancedToggle.addEventListener('click', function() {
            advancedFilters.classList.toggle('active');
            this.textContent = advancedFilters.classList.contains('active') ? 'Hide Advanced Filters' : 'Show Advanced Filters';
        });
    }
    
    // ------------------------------------------
    // FILE UPLOAD PREVIEW
    // ------------------------------------------
    
    document.querySelectorAll('.file-upload input[type="file"]').forEach(function(input) {
        input.addEventListener('change', function() {
            var fileName = this.files[0] ? this.files[0].name : 'No file chosen';
            var label = this.parentElement.querySelector('.file-label');
            if (label) label.textContent = fileName;
        });
    });
    
    // ------------------------------------------
    // COUNTER ANIMATION (for stats)
    // ------------------------------------------
    
    var counters = document.querySelectorAll('.counter');
    
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'));
        var current = 0;
        var increment = target / 60;
        var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                el.textContent = target.toLocaleString() + '+';
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current).toLocaleString() + '+';
            }
        }, 30);
    }
    
    var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(function(counter) {
        counterObserver.observe(counter);
    });
    
    // ------------------------------------------
    // PORTAL SIDEBAR TOGGLE (mobile)
    // ------------------------------------------
    
    var sidebarToggle = document.querySelector('.sidebar-toggle');
    var sidebar = document.querySelector('.sidebar');
    var portalMain = document.querySelector('.portal-main');
    var sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    function setSidebarOpen(isOpen) {
        if (!sidebar) return;
        sidebar.classList.toggle('open', isOpen);
        if (sidebarToggle) {
            sidebarToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            sidebarToggle.classList.toggle('active', isOpen);
        }
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active', isOpen);
        }
        document.body.classList.toggle('portal-sidebar-open', isOpen);
    }
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            setSidebarOpen(!sidebar.classList.contains('open'));
        });
    }
    
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', function() {
            setSidebarOpen(false);
        });
    }

    document.querySelectorAll('.sidebar-close').forEach(function(closeButton) {
        closeButton.addEventListener('click', function() {
            setSidebarOpen(false);
        });
    });
    
    if (portalMain && sidebar) {
        portalMain.addEventListener('click', function() {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                setSidebarOpen(false);
            }
        });
    }
    
    document.querySelectorAll('.sidebar-nav a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            }
        });
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            setSidebarOpen(false);
        }
    });
    
    // ------------------------------------------
    // PORTAL LOGOUT
    // ------------------------------------------
    
    var logoutLinks = document.querySelectorAll('.sidebar-logout');
    logoutLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('adminCreds');
            if (typeof auth !== 'undefined') {
                auth.signOut().then(function() {
                    window.location.href = 'login.html';
                }).catch(function() {
                    window.location.href = 'login.html';
                });
            } else {
                window.location.href = 'login.html';
            }
        });
    });
    
    // ------------------------------------------
    // PORTAL TAB SWITCHING
    // ------------------------------------------
    
    var sidebarTabs = document.querySelectorAll('.sidebar-nav a[data-tab]');
    var portalTabs = document.querySelectorAll('.portal-tab');
    var quickActions = document.querySelectorAll('.portal-quick-action');
    
    function switchTab(tabId) {
        // Update sidebar active state
        sidebarTabs.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            }
        });
        
        // Show/hide tab content
        portalTabs.forEach(function(tab) {
            tab.classList.remove('active');
            if (tab.id === 'tab-' + tabId) {
                tab.classList.add('active');
            }
        });
        
        // Update URL hash without scrolling
        if (history.replaceState) {
            history.replaceState(null, null, '#' + tabId);
        }
        
        // Close mobile nav overlay
        var mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) mobileNav.classList.remove('active');
        var hamburger = document.querySelector('.hamburger');
        if (hamburger) hamburger.classList.remove('active');
        var overlay = document.querySelector('.mobile-nav-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Close portal sidebar on mobile
        var portalSidebar = document.querySelector('.sidebar');
        if (portalSidebar) {
            portalSidebar.classList.remove('open');
            var portalToggle = document.querySelector('.sidebar-toggle');
            if (portalToggle) portalToggle.setAttribute('aria-expanded', 'false');
            var portalOverlay = document.querySelector('.sidebar-overlay');
            if (portalOverlay) portalOverlay.classList.remove('active');
            document.body.classList.remove('portal-sidebar-open');
        }
    }
    
    sidebarTabs.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    quickActions.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tabId = this.getAttribute('data-tab');
            if (tabId) switchTab(tabId);
        });
    });
    
    // Load tab from URL hash
    var hash = window.location.hash.replace('#', '');
    if (hash) {
        switchTab(hash);
    }
    
    // ------------------------------------------
    // NAV SCROLL INDICATOR
    // ------------------------------------------
    
    var navLinksWrapper = document.querySelector('.nav-links-wrapper');
    var navScrollIndicator = document.querySelector('.nav-scroll-indicator');
    var navLinks = document.querySelector('.nav-links');
    
    if (navLinks && navScrollIndicator) {
        function checkNavScroll() {
            if (!navLinksWrapper || !navScrollIndicator) return;
            var isScrollable = navLinks.scrollWidth > navLinks.clientWidth;
            var isAtEnd = navLinks.scrollLeft + navLinks.clientWidth >= navLinks.scrollWidth - 10;
            
            if (!isScrollable || isAtEnd) {
                navScrollIndicator.classList.add('hidden');
            } else {
                navScrollIndicator.classList.remove('hidden');
            }
        }
        
        navLinks.addEventListener('scroll', checkNavScroll);
        window.addEventListener('resize', checkNavScroll);
        checkNavScroll();
    }
    
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
    
    // ------------------------------------------
    // RESOURCE MODALS
    // ------------------------------------------
    
    var resourceCards = document.querySelectorAll('.resource-card[data-modal]');
    var activeModal = null;
    
    resourceCards.forEach(function(card) {
        card.addEventListener('click', function() {
            var modalId = this.getAttribute('data-modal');
            var modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                activeModal = modal;
            }
        });
    });
    
    function closeResourceModal() {
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
            activeModal = null;
        }
    }
    
    document.querySelectorAll('.resource-modal-close').forEach(function(btn) {
        btn.addEventListener('click', closeResourceModal);
    });
    
    document.querySelectorAll('.resource-modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', closeResourceModal);
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeResourceModal();
    });
    
    // ------------------------------------------
    // TYPING EFFECT (for hero)
    // ------------------------------------------
    
    var typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        var words = ['the Right Care.', 'Trusted Providers.', 'Compassionate Caregivers.'];
        var wordIndex = 0;
        var charIndex = 0;
        var isDeleting = false;
        
        function typeEffect() {
            var currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            
            var typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }
            
            setTimeout(typeEffect, typeSpeed);
        }
        
        typeEffect();
    }
    
    // ------------------------------------------
    // HERO SLIDESHOW
    // ------------------------------------------
    
    var heroSlideshow = document.getElementById('heroSlideshow');
    var heroDotsContainer = document.getElementById('heroDots');
    
    if (heroSlideshow) {
        var heroSlides = heroSlideshow.querySelectorAll('.hero-slide');
        var currentSlide = 0;
        var slideInterval = null;
        var defaultHeroImages = [
            'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1920&h=1080&fit=crop'
        ];
        
        function buildHeroDots(count) {
            if (!heroDotsContainer) return;
            heroDotsContainer.innerHTML = '';
            for (var i = 0; i < count; i++) {
                var dot = document.createElement('div');
                dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('data-index', i);
                dot.addEventListener('click', function() {
                    goToSlide(parseInt(this.getAttribute('data-index')));
                });
                heroDotsContainer.appendChild(dot);
            }
        }
        
        function goToSlide(index) {
            if (heroSlides.length === 0) return;
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = index;
            heroSlides[currentSlide].classList.add('active');
            
            var dots = heroDotsContainer ? heroDotsContainer.querySelectorAll('.hero-dot') : [];
            dots.forEach(function(d, i) {
                d.classList.toggle('active', i === currentSlide);
            });
        }
        
        function nextSlide() {
            goToSlide((currentSlide + 1) % heroSlides.length);
        }
        
        function startSlideshow() {
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 6000);
        }
        
        buildHeroDots(heroSlides.length);
        startSlideshow();
        
        if (typeof FirebaseServices !== 'undefined' && FirebaseServices.heroImages) {
            FirebaseServices.heroImages.getAll().then(function(snap) {
                if (snap.empty) return;
                
                heroSlideshow.innerHTML = '';
                heroSlides = [];
                var images = [];
                
                snap.forEach(function(doc) {
                    var img = doc.data();
                    if (img.active !== false && img.url) {
                        images.push(img);
                    }
                });
                
                if (images.length === 0) return;
                
                images.forEach(function(img, i) {
                    var slide = document.createElement('div');
                    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
                    slide.style.backgroundImage = "url('" + img.url + "')";
                    heroSlideshow.appendChild(slide);
                    heroSlides.push(slide);
                });
                
                currentSlide = 0;
                buildHeroDots(images.length);
                startSlideshow();
            }).catch(function() {
                console.log('Using default hero images');
            });
        }
        
        heroSlideshow.addEventListener('mouseenter', function() {
            if (slideInterval) clearInterval(slideInterval);
        });
        
        heroSlideshow.addEventListener('mouseleave', function() {
            startSlideshow();
        });
    }
    
    // ------------------------------------------
    // PORTAL DATA LOADING FROM FIRESTORE
    // ------------------------------------------
    
    // Only run if FirebaseServices is available
    if (typeof FirebaseServices === 'undefined') return;
    
    var page = window.location.pathname.split('/').pop() || 'index.html';
    
    var portalPages = ['admin.html', 'family-portal.html', 'provider-portal.html', 'caregiver-portal.html'];
    
    if (portalPages.indexOf(page) !== -1) {
        auth.onAuthStateChanged(function(user) {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            db.collection('users').doc(user.uid).get().then(function(doc) {
                if (!doc.exists) {
                    auth.signOut();
                    window.location.href = 'login.html';
                    return;
                }
                
                var userData = doc.data();
                var role = userData.role;
                
                // Admin guard
                if (page === 'admin.html' && role !== 'admin') {
                    auth.signOut();
                    window.location.href = 'login.html';
                    return;
                }
                
                // Provider guard
                if (page === 'provider-portal.html' && role !== 'provider' && role !== 'admin') {
                    auth.signOut();
                    window.location.href = 'login.html';
                    return;
                }
                
                // Caregiver guard
                if (page === 'caregiver-portal.html' && role !== 'caregiver' && role !== 'admin') {
                    auth.signOut();
                    window.location.href = 'login.html';
                    return;
                }
                
                // Update user display
                var userName = userData.name || userData.firstName || user.email;
                
                if (page === 'admin.html') {
                    var adminUserEl = document.querySelector('.portal-user span');
                    if (adminUserEl) adminUserEl.textContent = 'Admin Dashboard';
                    initUserAvatar(document.getElementById('adminAvatar'), userName, user.uid, userData.profilePhoto);
                    loadAdminDashboard();
                }
                
                if (page === 'family-portal.html') {
                    var familyNameEl = document.getElementById('familyUserName');
                    if (familyNameEl) familyNameEl.textContent = 'Welcome, ' + userName;
                    initUserAvatar(document.getElementById('familyAvatar'), userName, user.uid, userData.profilePhoto);
                    loadFamilyDashboard(user.uid);
                    loadPortalReferral(user.uid, userName, 'family');
                }
                
                if (page === 'provider-portal.html') {
                    var provNameEl = document.getElementById('providerName');
                    if (provNameEl) provNameEl.textContent = userData.facilityName || userName;
                    initUserAvatar(document.getElementById('providerAvatar'), userName, user.uid, userData.profilePhoto);
                    loadProviderDashboard(user.uid);
                    loadPortalReferral(user.uid, userName, 'provider');
                }
                
                if (page === 'caregiver-portal.html') {
                    var cgNameEl = document.getElementById('caregiverUserName');
                    if (cgNameEl) cgNameEl.textContent = 'Welcome, ' + userName;
                    initUserAvatar(document.getElementById('caregiverAvatar'), userName, user.uid, userData.profilePhoto);
                    loadCaregiverDashboard(user.uid);
                    loadPortalReferral(user.uid, userName, 'cg');
                }
            });
        });
    }
    
    // ==========================================
    // USER AVATAR (INITIALS + CLOUDINARY UPLOAD)
    // ==========================================
    function getInitials(name) {
        if (!name) return '??';
        var parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
    }
    
    function initUserAvatar(avatarEl, name, userId, profilePhoto) {
        if (!avatarEl) return;
        avatarEl.innerHTML = '';
        
        if (profilePhoto) {
            var img = document.createElement('img');
            img.src = profilePhoto;
            img.alt = 'Profile';
            avatarEl.appendChild(img);
        } else {
            avatarEl.textContent = getInitials(name);
        }
        
        var overlay = document.createElement('div');
        overlay.className = 'avatar-upload-overlay';
        overlay.innerHTML = '<i class="fas fa-camera"></i>';
        avatarEl.appendChild(overlay);
        
        avatarEl.onclick = function() {
            openAvatarUpload(userId, avatarEl, name);
        };
    }
    
    function openAvatarUpload(userId, avatarEl, userName) {
        if (typeof cloudinary === 'undefined') {
            showNotification('Photo upload is not available right now.', 'error');
            return;
        }
        
        cloudinary.openUploadWidget({
            cloudName: 'qqwevfkz',
            uploadPreset: 'mercysolutions',
            folder: 'profiles',
            cropping: true,
            croppingAspectRatio: 1,
            maxImageSize: 2000000,
            sources: ['local', 'url'],
            styles: {
                palette: {
                    window: '#FFFFFF',
                    sourceBg: '#F5F7FA',
                    windowBorder: '#D4A33A',
                    activeTabBackground: '#081B3A',
                    activeTab: '#FFFFFF',
                    inactiveTab: '#6B7280',
                    inactiveTabBackground: '#E5E7EB'
                }
            }
        }, function(error, result) {
            if (error) {
                console.error('Avatar upload error:', error);
                return;
            }
            if (result && result.event === 'success') {
                var photoUrl = result.info.secure_url;
                avatarEl.innerHTML = '';
                var img = document.createElement('img');
                img.src = photoUrl;
                img.alt = 'Profile';
                avatarEl.appendChild(img);
                
                var overlay = document.createElement('div');
                overlay.className = 'avatar-upload-overlay';
                overlay.innerHTML = '<i class="fas fa-camera"></i>';
                avatarEl.appendChild(overlay);
                
                db.collection('users').doc(userId).update({ profilePhoto: photoUrl })
                    .then(function() {
                        showNotification('Profile photo updated.', 'success');
                    })
                    .catch(function() {
                        showNotification('Photo uploaded but could not save.', 'error');
                    });
            }
        });
    }
    
    // ==========================================
    // ADMIN DASHBOARD LOADER
    // ==========================================
    function loadAdminDashboard() {
        // Load counts from the 'users' collection by role
        FirebaseServices.users.countByRole('family').then(function(snap) {
            var el = document.getElementById('adminTotalFamilies');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalFamilies'); });
        
        FirebaseServices.users.countByRole('provider').then(function(snap) {
            var el = document.getElementById('adminTotalProviders');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalProviders'); });
        
        FirebaseServices.users.countByRole('caregiver').then(function(snap) {
            var el = document.getElementById('adminTotalCaregivers');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalCaregivers'); });
        
        FirebaseServices.referrals.count().then(function(snap) {
            var el = document.getElementById('adminTotalReferrals');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalReferrals'); });
        
        FirebaseServices.shifts.count().then(function(snap) {
            var el = document.getElementById('adminTotalShifts');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalShifts'); });
        
        FirebaseServices.applications.countPending().then(function(snap) {
            var el = document.getElementById('adminPendingApps');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminPendingApps'); });
        
        FirebaseServices.contactMessages.countUnread().then(function(snap) {
            var el = document.getElementById('adminUnreadMsgs');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminUnreadMsgs'); });
        
        // Revenue
        FirebaseServices.payments.getTotalThisMonth().then(function(snap) {
            var total = 0;
            snap.forEach(function(doc) {
                total += doc.data().amount || 0;
            });
            var el = document.getElementById('adminRevenue');
            if (el) el.textContent = FirebaseServices.formatCurrency(total);
        }).catch(function() { setFallback('adminRevenue', '$0'); });
        
        // Growth rate — compare this month vs last month users
        var now = new Date();
        var thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        var lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        var thisMonthCount = 0;
        var lastMonthCount = 0;
        
        db.collection('users').get().then(function(snap) {
            snap.forEach(function(doc) {
                var ts = doc.data().createdAt;
                if (!ts) return;
                var d;
                if (ts.toDate) d = ts.toDate();
                else if (ts.seconds) d = new Date(ts.seconds * 1000);
                else return;
                if (d >= thisMonthStart) thisMonthCount++;
                else if (d >= lastMonthStart) lastMonthCount++;
            });
            var growth = 0;
            if (lastMonthCount > 0) growth = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
            else if (thisMonthCount > 0) growth = 100;
            var gEl = document.getElementById('adminGrowth');
            if (gEl) gEl.textContent = (growth >= 0 ? '+' : '') + growth + '%';
        }).catch(function() { setFallback('adminGrowth', '0%'); });
        
        // Load activity
        loadAdminActivity();
        
        // Load pending actions
        loadAdminPendingActions();
        
        // Load charts
        loadAdminCharts();
    }
    
    function loadAdminActivity() {
        var container = document.getElementById('adminActivityList');
        if (!container) return;
        
        FirebaseServices.activity.getAll(10).then(function(snap) {
            if (snap.empty) {
                container.innerHTML = '<div class="activity-item" style="text-align:center; padding:40px; color:#6B7280;"><p>No activity yet. Activity will appear here as users interact with the platform.</p></div>';
                return;
            }
            
            container.innerHTML = '';
            snap.forEach(function(doc) {
                var a = doc.data();
                var timeStr = FirebaseServices.formatTimestamp(a.timestamp);
                var iconColor = a.color || 'blue';
                
                container.innerHTML += '\
                    <div class="activity-item">\
                        <div class="activity-icon ' + iconColor + '"><i class="' + (a.icon || 'fas fa-info-circle') + '"></i></div>\
                        <div class="activity-info">\
                            <p>' + escapeHtml(a.description) + '</p>\
                            <span>' + timeStr + '</span>\
                        </div>\
                    </div>\
                ';
            });
        }).catch(function(err) {
            console.error('Error loading admin activity:', err);
        });
    }
    
    function loadAdminPendingActions() {
        var tbody = document.getElementById('adminPendingTable');
        if (!tbody) return;
        
        FirebaseServices.applications.getByType('provider').then(function(snap) {
            var pendingApps = [];
            snap.forEach(function(doc) {
                var a = doc.data();
                if (a.status === 'pending') {
                    pendingApps.push(a);
                }
            });
            
            FirebaseServices.applications.getByType('career').then(function(snap2) {
                snap2.forEach(function(doc) {
                    var a = doc.data();
                    if (a.status === 'pending') {
                        pendingApps.push(a);
                    }
                });
                
                if (pendingApps.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No pending actions.</td></tr>';
                    return;
                }
                
                tbody.innerHTML = '';
                pendingApps.forEach(function(app) {
                    var dateStr = FirebaseServices.formatTimestamp(app.createdAt);
                    var priority = app.type === 'provider' ? 'active' : 'pending';
                    var priorityLabel = app.type === 'provider' ? 'High' : 'Medium';
                    
                    tbody.innerHTML += '\
                        <tr>\
                            <td><strong>' + escapeHtml(app.name || app.facilityName || 'Application') + '</strong></td>\
                            <td>' + (app.type === 'provider' ? 'Provider Application' : 'Career Application') + '</td>\
                            <td>' + dateStr + '</td>\
                            <td><span class="status-badge ' + priority + '">' + priorityLabel + '</span></td>\
                            <td><button class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">Review</button></td>\
                        </tr>\
                    ';
                });
            });
        }).catch(function(err) {
            console.error('Error loading pending actions:', err);
        });
    }
    
    function loadAdminCharts() {
        buildDashboardChart('adminReferralChart', 'referrals', 'rgba(8,27,58,');
        buildDashboardChart('adminRevenueChart', 'payments', 'rgba(212,163,58,');
    }
    
    function buildDashboardChart(containerId, collection, colorBase) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#6B7280;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        db.collection(collection).get().then(function(snap) {
            var monthCounts = {};
            var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var now = new Date();
            
            for (var i = 5; i >= 0; i--) {
                var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                var key = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
                monthCounts[key] = { label: monthNames[d.getMonth()], count: 0 };
            }
            
            snap.forEach(function(doc) {
                var data = doc.data();
                var ts = data.createdAt || data.timestamp;
                if (!ts) return;
                var date;
                if (ts.toDate) date = ts.toDate();
                else if (typeof ts === 'string') date = new Date(ts);
                else if (ts.seconds) date = new Date(ts.seconds * 1000);
                else return;
                var key = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
                if (monthCounts[key] !== undefined) monthCounts[key].count++;
            });
            
            var entries = Object.values(monthCounts);
            var maxVal = Math.max.apply(null, entries.map(function(e) { return e.count; }));
            if (maxVal === 0) maxVal = 1;
            
            container.innerHTML = '';
            entries.forEach(function(entry, i) {
                var heightPct = Math.max((entry.count / maxVal) * 100, 4);
                var shade = 0.15 + (i * 0.15);
                container.innerHTML += '<div style="flex:1; display:flex; flex-direction:column; align-items:center;">' +
                    '<div style="width:100%; background:' + colorBase + shade + '); border-radius: 8px 8px 0 0; height:' + heightPct + '%; min-height:4px; position:relative;">' +
                    '<span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-size:11px; font-weight:700; color:#081B3A;">' + entry.count + '</span></div>' +
                    '<span style="font-size:11px; color:#6B7280; margin-top:6px;">' + entry.label + '</span></div>';
            });
        }).catch(function(err) {
            console.error('Dashboard chart error:', err);
            container.innerHTML = '<div style="text-align:center; padding:20px; color:#DC2626;">Error loading chart.</div>';
        });
    }
    
    // ==========================================
    // ==========================================
    // PORTAL REFERRAL LINK LOADER
    // ==========================================
    function loadPortalReferral(userId, userName, prefix) {
        prefix = prefix || 'family';
        var linkEl = document.getElementById(prefix + 'ReferralLink');
        var countEl = document.getElementById(prefix + 'ReferralCount');
        var listEl = document.getElementById(prefix + 'ReferralList');
        
        if (!linkEl) return;
        
        var code = '';
        db.collection('users').doc(userId).get().then(function(doc) {
            if (!doc.exists) return;
            var data = doc.data();
            code = data.referralCode || '';
            if (!code) {
                code = (userName || 'USER').replace(/[^a-zA-Z]/g, '').substring(0, 5).toUpperCase() + userId.substring(0, 4).toUpperCase();
                return db.collection('users').doc(userId).update({ referralCode: code }).then(function() { return code; });
            }
            return code;
        }).then(function(finalCode) {
            if (!finalCode) return;
            var baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, 'register.html');
            linkEl.value = baseUrl + '?ref=' + finalCode;
            
            return FirebaseServices.users.countReferrals(userId);
        }).then(function(count) {
            if (countEl) countEl.textContent = count || 0;
            if (count > 0 && listEl) {
                return FirebaseServices.users.getReferralSignups(userId);
            }
        }).then(function(snap) {
            if (!snap || !listEl || snap.empty) return;
            var html = '<table class="dash-table" style="margin-top:12px;"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Date</th></tr></thead><tbody>';
            snap.forEach(function(doc) {
                var s = doc.data();
                html += '<tr><td>' + escapeHtml(s.newUserName || '--') + '</td><td>' + escapeHtml(s.newUserEmail || '--') + '</td><td>' + capitalize(s.newUserRole || 'family') + '</td><td>' + FirebaseServices.formatTimestamp(s.createdAt) + '</td></tr>';
            });
            html += '</tbody></table>';
            listEl.innerHTML = html;
        }).catch(function(err) {
            console.error('Referral loader error:', err);
        });
    }
    
    // ADMIN TAB SWITCHING & DATA LOADERS
    // ==========================================
    
    var adminTabsLoaded = {};
    
    var adminSidebarLinks = document.querySelectorAll('.sidebar-nav a[data-tab]');
    adminSidebarLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var tabId = this.getAttribute('data-tab');
            
            adminSidebarLinks.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');
            
            document.querySelectorAll('.portal-tab').forEach(function(tab) {
                tab.classList.remove('active');
            });
            var targetTab = document.getElementById('tab-' + tabId);
            if (targetTab) targetTab.classList.add('active');
            
            if (history.replaceState) {
                history.replaceState(null, null, '#' + tabId);
            }
            
            if (page === 'admin.html' && !adminTabsLoaded[tabId]) {
                adminTabsLoaded[tabId] = true;
                loadAdminTab(tabId);
            }
        });
    });
    
    var adminHash = window.location.hash.replace('#', '');
    if (adminHash && page === 'admin.html') {
        var hashLink = document.querySelector('.sidebar-nav a[data-tab="' + adminHash + '"]');
        if (hashLink) hashLink.click();
    }
    
    function loadAdminTab(tabId) {
        switch(tabId) {
            case 'families': loadAdminFamilies(); break;
            case 'providers': loadAdminProviders(); break;
            case 'caregivers': loadAdminCaregivers(); break;
            case 'communities': loadAdminCommunities(); break;
            case 'referrals': loadAdminReferrals(); break;
            case 'appointments': loadAdminAppointments(); break;
            case 'resources': loadAdminResources(); break;
            case 'applications': loadAdminApplications(); break;
            case 'shifts': loadAdminShifts(); break;
            case 'payments': loadAdminPayments(); break;
            case 'analytics': loadAdminAnalytics(); break;
            case 'reports': loadAdminReports(); break;
            case 'media': loadAdminMedia(); break;
            case 'content': loadAdminContent(); break;
            case 'settings': loadAdminSettings(); break;
            case 'admins': loadAdminAdmins(); break;
        }
    }
    
    // --- FAMILIES ---
    function loadAdminFamilies() {
        var tbody = document.getElementById('familiesTableBody');
        if (!tbody) return;
        
        FirebaseServices.users.getByRole('family').then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No family accounts found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var u = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(u.createdAt);
                var status = u.active !== false ? 'active' : 'pending';
                var statusLabel = u.active !== false ? 'Active' : 'Inactive';
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</strong></td>\
                    <td>' + escapeHtml(u.email || '') + '</td>\
                    <td>' + escapeHtml(u.phone || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + statusLabel + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" onclick="adminViewUser(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminToggleUserActive(\'' + doc.id + '\', ' + (u.active !== false) + ')"><i class="fas fa-power-off"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading families.</td></tr>';
        });
        
        var searchEl = document.getElementById('familiesSearch');
        if (searchEl) {
            searchEl.oninput = function() {
                var filter = this.value.toLowerCase();
                tbody.querySelectorAll('tr').forEach(function(row) {
                    row.style.display = row.textContent.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
                });
            };
        }
    }
    
    // --- PROVIDERS ---
    function loadAdminProviders() {
        var tbody = document.getElementById('providersTableBody');
        if (!tbody) return;
        
        FirebaseServices.users.getByRole('provider').then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#6B7280;">No provider accounts found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var u = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(u.createdAt);
                var status = u.active !== false ? 'active' : 'pending';
                var statusLabel = u.active !== false ? 'Active' : 'Inactive';
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(u.facilityName || '--') + '</strong></td>\
                    <td>' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</td>\
                    <td>' + escapeHtml(u.email || '') + '</td>\
                    <td>' + escapeHtml(u.phone || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + statusLabel + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" onclick="adminViewUser(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminToggleUserActive(\'' + doc.id + '\', ' + (u.active !== false) + ')"><i class="fas fa-power-off"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#DC2626;">Error loading providers.</td></tr>';
        });
        
        var searchEl = document.getElementById('providersSearch');
        if (searchEl) {
            searchEl.oninput = function() {
                var filter = this.value.toLowerCase();
                tbody.querySelectorAll('tr').forEach(function(row) {
                    row.style.display = row.textContent.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
                });
            };
        }
        
        var addBtn = document.getElementById('addProviderBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('providerCreateForm').reset();
                document.getElementById('providerCreateModal').classList.add('active');
            };
        }
        
        var providerCreateForm = document.getElementById('providerCreateForm');
        if (providerCreateForm) {
            providerCreateForm.onsubmit = function(e) {
                e.preventDefault();
                var fd = new FormData(this);
                var data = {};
                fd.forEach(function(val, key) { data[key] = val; });
                data.role = 'provider';
                
                var btn = this.querySelector('button[type="submit"]');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                btn.disabled = true;
                
                var adminCreds = JSON.parse(sessionStorage.getItem('adminCreds') || 'null');
                if (!adminCreds || !adminCreds.email || !adminCreds.password) {
                    var pw = prompt('To create this account, re-enter your admin password:');
                    if (!pw) {
                        btn.innerHTML = '<i class="fas fa-plus"></i> Create Provider';
                        btn.disabled = false;
                        return;
                    }
                    adminCreds = { email: auth.currentUser.email, password: pw };
                    sessionStorage.setItem('adminCreds', JSON.stringify(adminCreds));
                }
                
                FirebaseServices.users.adminCreateUser(data.email, data.password, data).then(function(newUid) {
                    showNotification('Provider account created successfully.', 'success');
                    document.getElementById('providerCreateModal').classList.remove('active');
                    btn.innerHTML = '<i class="fas fa-plus"></i> Create Provider';
                    btn.disabled = false;
                    
                    // Auto-approve pending application if one was loaded
                    if (window._pendingApproveId) {
                        FirebaseServices.applications.updateStatus(window._pendingApproveId, 'approved').catch(function(err) {
                            console.error('Error approving application:', err);
                        });
                        window._pendingApproveId = null;
                    }
                    
                    // Create linked facility if facilityName provided
                    if (data.facilityName) {
                        FirebaseServices.facilities.create({
                            facilityName: data.facilityName,
                            providerId: newUid,
                            providerName: data.firstName + ' ' + (data.lastName || ''),
                            city: data.city || '',
                            state: data.state || '',
                            status: 'active'
                        }).catch(function(err) {
                            console.error('Error creating linked facility:', err);
                        });
                    }
                    
                    return auth.signInWithEmailAndPassword(adminCreds.email, adminCreds.password);
                }).then(function() {
                    loadAdminProviders();
                }).catch(function(err) {
                    console.error('Error creating provider:', err);
                    showNotification('Error: ' + err.message, 'error');
                    btn.innerHTML = '<i class="fas fa-plus"></i> Create Provider';
                    btn.disabled = false;
                    sessionStorage.removeItem('adminCreds');
                });
            };
        }
        
        initModalClose('providerCreateModal');
    }
    
    // --- CAREGIVERS ---
    function loadAdminCaregivers() {
        var tbody = document.getElementById('caregiversTableBody');
        if (!tbody) return;
        
        FirebaseServices.users.getByRole('caregiver').then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#6B7280;">No caregiver accounts found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var u = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(u.createdAt);
                var status = u.active !== false ? 'active' : 'pending';
                var statusLabel = u.active !== false ? 'Active' : 'Inactive';
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</strong></td>\
                    <td>' + escapeHtml(u.email || '') + '</td>\
                    <td>' + escapeHtml(u.phone || '--') + '</td>\
                    <td>' + escapeHtml(u.availability || 'Flexible') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + statusLabel + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" onclick="adminViewUser(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminToggleUserActive(\'' + doc.id + '\', ' + (u.active !== false) + ')"><i class="fas fa-power-off"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#DC2626;">Error loading caregivers.</td></tr>';
        });
        
        var searchEl = document.getElementById('caregiversSearch');
        if (searchEl) {
            searchEl.oninput = function() {
                var filter = this.value.toLowerCase();
                tbody.querySelectorAll('tr').forEach(function(row) {
                    row.style.display = row.textContent.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
                });
            };
        }
        
        var addBtn = document.getElementById('addCaregiverBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('caregiverCreateForm').reset();
                document.getElementById('caregiverCreateModal').classList.add('active');
            };
        }
        
        var caregiverCreateForm = document.getElementById('caregiverCreateForm');
        if (caregiverCreateForm) {
            caregiverCreateForm.onsubmit = function(e) {
                e.preventDefault();
                var fd = new FormData(this);
                var data = {};
                fd.forEach(function(val, key) { data[key] = val; });
                data.role = 'caregiver';
                
                var btn = this.querySelector('button[type="submit"]');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                btn.disabled = true;
                
                var adminCreds = JSON.parse(sessionStorage.getItem('adminCreds') || 'null');
                if (!adminCreds || !adminCreds.email || !adminCreds.password) {
                    var pw = prompt('To create this account, re-enter your admin password:');
                    if (!pw) {
                        btn.innerHTML = '<i class="fas fa-plus"></i> Create Caregiver';
                        btn.disabled = false;
                        return;
                    }
                    adminCreds = { email: auth.currentUser.email, password: pw };
                    sessionStorage.setItem('adminCreds', JSON.stringify(adminCreds));
                }
                
                FirebaseServices.users.adminCreateUser(data.email, data.password, data).then(function() {
                    showNotification('Caregiver account created successfully.', 'success');
                    document.getElementById('caregiverCreateModal').classList.remove('active');
                    btn.innerHTML = '<i class="fas fa-plus"></i> Create Caregiver';
                    btn.disabled = false;
                    
                    // Auto-approve pending application if one was loaded
                    if (window._pendingApproveId) {
                        FirebaseServices.applications.updateStatus(window._pendingApproveId, 'approved').catch(function(err) {
                            console.error('Error approving application:', err);
                        });
                        window._pendingApproveId = null;
                    }
                    
                    return auth.signInWithEmailAndPassword(adminCreds.email, adminCreds.password);
                }).then(function() {
                    loadAdminCaregivers();
                }).catch(function(err) {
                    console.error('Error creating caregiver:', err);
                    showNotification('Error: ' + err.message, 'error');
                    btn.innerHTML = '<i class="fas fa-plus"></i> Create Caregiver';
                    btn.disabled = false;
                    sessionStorage.removeItem('adminCreds');
                });
            };
        }
        
        initModalClose('caregiverCreateModal');
    }
    
    // --- COMMUNITIES ---
    function loadAdminCommunities() {
        var tbody = document.getElementById('communitiesTableBody');
        if (!tbody) return;
        
        FirebaseServices.facilities.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#6B7280;">No communities found. Click "Add Community" to get started.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var f = doc.data();
                var types = (f.careTypes || []).join(', ') || '--';
                var priceStr = f.pricingFrom ? FirebaseServices.formatCurrency(f.pricingFrom) : '--';
                var vacancyStr = f.vacancies > 0 ? f.vacancies + ' open' : 'Waitlist';
                var vacancyClass = f.vacancies > 0 ? 'active' : 'pending';
                var status = f.status || 'active';
                
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(f.facilityName || '--') + '</strong></td>\
                    <td>' + escapeHtml(f.city || '--') + ', ' + escapeHtml(f.state || '') + '</td>\
                    <td>' + escapeHtml(types) + '</td>\
                    <td>' + priceStr + '/mo</td>\
                    <td><span class="status-badge ' + vacancyClass + '">' + vacancyStr + '</span></td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminEditCommunity(\'' + doc.id + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn delete" onclick="adminDeleteCommunity(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#DC2626;">Error loading communities.</td></tr>';
        });
        
        var searchEl = document.getElementById('communitiesSearch');
        if (searchEl) {
            searchEl.oninput = function() {
                var filter = this.value.toLowerCase();
                tbody.querySelectorAll('tr').forEach(function(row) {
                    row.style.display = row.textContent.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
                });
            };
        }
        
        var addBtn = document.getElementById('addCommunityBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('communityModalTitle').textContent = 'Add Community';
                document.getElementById('communityForm').reset();
                document.querySelector('input[name="communityId"]').value = '';
                poplateProviderSelect();
                document.getElementById('communityModal').classList.add('active');
            };
        }
        
        var communityForm = document.getElementById('communityForm');
        if (communityForm) {
            communityForm.onsubmit = function(e) {
                e.preventDefault();
                var fd = new FormData(this);
                var data = {};
                fd.forEach(function(val, key) { data[key] = val; });
                
                var careTypesSelect = this.querySelector('select[name="careTypes"]');
                if (careTypesSelect) {
                    var selected = [];
                    for (var i = 0; i < careTypesSelect.options.length; i++) {
                        if (careTypesSelect.options[i].selected) selected.push(careTypesSelect.options[i].value);
                    }
                    data.careTypes = selected;
                }
                
                data.petFriendly = this.querySelector('input[name="petFriendly"]').checked;
                data.privateRooms = this.querySelector('input[name="privateRooms"]').checked;
                data.vaBenefits = this.querySelector('input[name="vaBenefits"]').checked;
                data.memoryCare = this.querySelector('input[name="memoryCare"]').checked;
                
                var id = data.communityId;
                delete data.communityId;
                
                var btn = this.querySelector('button[type="submit"]');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                btn.disabled = true;
                
                var promise = id ? FirebaseServices.facilities.update(id, data) : FirebaseServices.facilities.create(data);
                
                promise.then(function() {
                    document.getElementById('communityModal').classList.remove('active');
                    btn.innerHTML = 'Save Community';
                    btn.disabled = false;
                    loadAdminCommunities();
                }).catch(function(err) {
                    showNotification('Error saving community: ' + err.message, 'error');
                    btn.innerHTML = 'Save Community';
                    btn.disabled = false;
                });
            };
        }
        
        initModalClose('communityModal');
    }
    
    // --- REFERRALS ---
    function loadAdminReferrals() {
        var tbody = document.getElementById('referralsTableBody');
        if (!tbody) return;
        
        FirebaseServices.referrals.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#6B7280;">No referrals found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);
                var budgetStr = r.budget ? FirebaseServices.formatCurrency(r.budget) : '--';
                var status = r.status || 'new';
                
                tbody.innerHTML += '<tr>\
                    <td>' + escapeHtml(r.familyName || r.name || '--') + '</td>\
                    <td>' + escapeHtml(r.patientName || '--') + '</td>\
                    <td>' + escapeHtml(r.careType || '--') + '</td>\
                    <td>' + budgetStr + '</td>\
                    <td>' + escapeHtml(r.providerName || 'Unassigned') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.replace('_', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); })) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminUpdateReferralStatus(\'' + doc.id + '\', \'' + status + '\')"><i class="fas fa-edit"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#DC2626;">Error loading referrals.</td></tr>';
        });
    }
    
    // --- APPOINTMENTS ---
    function loadAdminAppointments() {
        var tbody = document.getElementById('appointmentsTableBody');
        if (!tbody) return;
        
        FirebaseServices.tours.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No appointments scheduled.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var t = doc.data();
                var status = t.status || 'scheduled';
                
                tbody.innerHTML += '<tr>\
                    <td>' + escapeHtml(t.familyName || '--') + '</td>\
                    <td>' + escapeHtml(t.facilityName || '--') + '</td>\
                    <td>' + escapeHtml(t.date || '--') + '</td>\
                    <td>' + escapeHtml(t.time || '--') + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminUpdateTourStatus(\'' + doc.id + '\', \'' + status + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn delete" onclick="adminDeleteTour(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading appointments.</td></tr>';
        });
    }
    
    // --- RESOURCES ---
    function loadAdminResources() {
        var tbody = document.getElementById('resourcesTableBody');
        if (!tbody) return;
        
        FirebaseServices.blogPosts.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No resources found. Click "New Resource" to create one.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var p = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(p.createdAt);
                var status = p.status || 'draft';
                
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(p.title || '--') + '</strong></td>\
                    <td>' + escapeHtml(p.category || '--') + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td>' + (p.views || 0) + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminEditResource(\'' + doc.id + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn delete" onclick="adminDeleteResource(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading resources.</td></tr>';
        });
        
        var addBtn = document.getElementById('addResourceBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('resourceModalTitle').textContent = 'New Resource';
                document.getElementById('resourceForm').reset();
                document.querySelector('input[name="resourceId"]').value = '';
                document.getElementById('resourceModal').classList.add('active');
            };
        }
        
        var resourceForm = document.getElementById('resourceForm');
        if (resourceForm) {
            resourceForm.onsubmit = function(e) {
                e.preventDefault();
                var fd = new FormData(this);
                var data = {};
                fd.forEach(function(val, key) { data[key] = val; });
                
                var id = data.resourceId;
                delete data.resourceId;
                data.slug = (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                
                var btn = this.querySelector('button[type="submit"]');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                btn.disabled = true;
                
                var promise = id ? FirebaseServices.blogPosts.update(id, data) : FirebaseServices.blogPosts.create(data);
                
                promise.then(function() {
                    document.getElementById('resourceModal').classList.remove('active');
                    btn.innerHTML = 'Save Resource';
                    btn.disabled = false;
                    loadAdminResources();
                }).catch(function(err) {
                    showNotification('Error saving resource: ' + err.message, 'error');
                    btn.innerHTML = 'Save Resource';
                    btn.disabled = false;
                });
            };
        }
        
        initModalClose('resourceModal');
    }
    
    // --- APPLICATIONS ---
    function loadAdminApplications() {
        var tbody = document.getElementById('applicationsTableBody');
        if (!tbody) return;
        
        FirebaseServices.applications.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#6B7280;">No applications found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var a = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(a.createdAt);
                var status = a.status || 'pending';
                var typeLabel = a.type === 'provider' ? 'Provider' : 'Career';
                
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(a.name || a.facilityName || '--') + '</strong></td>\
                    <td>' + typeLabel + '</td>\
                    <td>' + escapeHtml(a.email || '--') + '</td>\
                    <td>' + escapeHtml(a.phone || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" onclick="adminUpdateApplicationStatus(\'' + doc.id + '\', \'approved\')"><i class="fas fa-check"></i></button>\
                        <button class="admin-action-btn delete" onclick="adminUpdateApplicationStatus(\'' + doc.id + '\', \'rejected\')"><i class="fas fa-times"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#DC2626;">Error loading applications.</td></tr>';
        });
    }
    
    // --- SHIFTS ---
    function loadAdminShifts() {
        var tbody = document.getElementById('shiftsTableBody');
        if (!tbody) return;
        
        FirebaseServices.shifts.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#6B7280;">No shifts found. Create one to assign a caregiver to a care request.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var s = doc.data();
                var dateStr = s.date || FirebaseServices.formatTimestamp(s.createdAt);
                var status = s.status || 'open';
                var statusClass = status === 'upcoming' ? 'active' : status === 'completed' ? 'green' : 'pending';
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(s.clientName || '--') + '</strong></td>\
                    <td>' + escapeHtml(s.caregiverName || 'Unassigned') + '</td>\
                    <td>' + escapeHtml(dateStr) + '</td>\
                    <td>' + escapeHtml(s.startTime || '--') + ' - ' + escapeHtml(s.endTime || '--') + '</td>\
                    <td>' + escapeHtml(s.type || '--') + '</td>\
                    <td>' + (s.rate ? '$' + s.rate + '/hr' : '--') + '</td>\
                    <td><span class="status-badge ' + statusClass + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminUpdateShiftStatus(\'' + doc.id + '\', \'completed\')"><i class="fas fa-check"></i></button>\
                        <button class="admin-action-btn delete" onclick="adminDeleteShift(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#DC2626;">Error loading shifts.</td></tr>';
        });
        
        // Add shift button handler
        var addBtn = document.getElementById('addShiftBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('shiftForm').reset();
                poplateShiftForm();
                document.getElementById('shiftModal').classList.add('active');
            };
        }
        
        // Shift form submit
        var shiftForm = document.getElementById('shiftForm');
        if (shiftForm) {
            shiftForm.onsubmit = function(e) {
                e.preventDefault();
                var sel = document.getElementById('shiftCareRequest');
                var careReq = sel.options[sel.selectedIndex];
                var caregiverSel = document.getElementById('shiftCaregiver');
                var caregiver = caregiverSel.options[caregiverSel.selectedIndex];
                
                if (!careReq || !careReq.value) { showNotification('Select a care request.', 'error'); return; }
                if (!caregiver || !caregiver.value) { showNotification('Select a caregiver.', 'error'); return; }
                
                var fd = new FormData(this);
                var data = {};
                fd.forEach(function(val, key) { data[key] = val; });
                
                data.clientName = careReq.getAttribute('data-name');
                data.caregiverId = caregiver.value;
                data.caregiverName = caregiver.text;
                data.careRequestId = careReq.value;
                data.status = 'open';
                
                var btn = this.querySelector('button[type="submit"]');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                btn.disabled = true;
                
                FirebaseServices.shifts.create(data).then(function() {
                    showNotification('Shift created!', 'success');
                    document.getElementById('shiftModal').classList.remove('active');
                    btn.innerHTML = '<i class="fas fa-plus"></i> Create Shift';
                    btn.disabled = false;
                    loadAdminShifts();
                }).catch(function(err) {
                    showNotification('Error: ' + err.message, 'error');
                    btn.innerHTML = '<i class="fas fa-plus"></i> Create Shift';
                    btn.disabled = false;
                });
            };
        }
        
        initModalClose('shiftModal');
    }
    
    function poplateShiftForm() {
        // Populate care requests
        var reqSel = document.getElementById('shiftCareRequest');
        if (reqSel) {
            reqSel.innerHTML = '<option value="">Select a care request</option>';
            FirebaseServices.careRequests.getAll().then(function(snap) {
                if (snap.empty) {
                    reqSel.innerHTML = '<option value="">No care requests found</option>';
                    return;
                }
                snap.forEach(function(doc) {
                    var r = doc.data();
                    reqSel.innerHTML += '<option value="' + doc.id + '" data-name="' + escapeHtml(r.name || r.familyName || 'Unknown') + '">' + escapeHtml(r.name || r.familyName || 'Unknown') + ' - ' + escapeHtml(r.careType || '--') + '</option>';
                });
            }).catch(function() {});
        }
        
        // Populate caregivers
        var cgSel = document.getElementById('shiftCaregiver');
        if (cgSel) {
            cgSel.innerHTML = '<option value="">Select a caregiver</option>';
            FirebaseServices.users.getByRole('caregiver').then(function(snap) {
                if (snap.empty) {
                    cgSel.innerHTML = '<option value="">No caregivers found</option>';
                    return;
                }
                snap.forEach(function(doc) {
                    var u = doc.data();
                    cgSel.innerHTML += '<option value="' + doc.id + '">' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</option>';
                });
            }).catch(function() {});
        }
    }
    
    // --- PAYMENTS ---
    function loadAdminPayments() {
        var tbody = document.getElementById('paymentsTableBody');
        if (!tbody) return;
        
        FirebaseServices.payments.getAll().then(function(snap) {
            var totalAll = 0;
            var totalMonth = 0;
            var count = 0;
            var now = new Date();
            var startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No payments found.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var p = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(p.createdAt);
                var amount = p.amount || 0;
                totalAll += amount;
                count++;
                
                if (p.createdAt && p.createdAt.toDate && p.createdAt.toDate() >= startOfMonth) {
                    totalMonth += amount;
                }
                
                var status = p.status || 'completed';
                
                tbody.innerHTML += '<tr>\
                    <td>' + escapeHtml(p.from || '--') + '</td>\
                    <td><strong>' + FirebaseServices.formatCurrency(amount) + '</strong></td>\
                    <td>' + escapeHtml(p.type || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                </tr>';
            });
            
            setFallback('adminTotalRevenue', FirebaseServices.formatCurrency(totalAll));
            setFallback('adminMonthRevenue', FirebaseServices.formatCurrency(totalMonth));
            setFallback('adminTotalPayments', count.toString());
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#DC2626;">Error loading payments.</td></tr>';
        });
    }
    
    // --- ANALYTICS ---
    function loadAdminAnalytics() {
        var counts = { users: 0, communities: 0, referrals: 0, posts: 0, applications: 0, messages: 0, payments: 0, shifts: 0 };
        var completed = 0;
        var total = 8;
        
        function checkDone() {
            completed++;
            if (completed >= total) {
                setFallback('analyticsTotalUsers', counts.users.toString());
                setFallback('analyticsTotalCommunities', counts.communities.toString());
                setFallback('analyticsTotalReferrals', counts.referrals.toString());
                setFallback('analyticsTotalPosts', counts.posts.toString());
                setFallback('analyticsTotalApplications', counts.applications.toString());
                setFallback('analyticsTotalMessages', counts.messages.toString());
                setFallback('analyticsTotalPayments', counts.payments.toString());
                setFallback('analyticsTotalShifts', counts.shifts.toString());
            }
        }
        
        FirebaseServices.users.count().then(function(snap) { counts.users = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.facilities.count().then(function(snap) { counts.communities = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.referrals.count().then(function(snap) { counts.referrals = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.blogPosts.count().then(function(snap) { counts.posts = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.applications.count().then(function(snap) { counts.applications = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.contactMessages.getAll().then(function(snap) { counts.messages = snap.size; checkDone(); }).catch(checkDone);
        FirebaseServices.payments.getAll().then(function(snap) { counts.payments = snap.size; checkDone(); }).catch(checkDone);
        FirebaseServices.shifts.count().then(function(snap) { counts.shifts = snap; checkDone(); }).catch(checkDone);
        
        buildRealChart('analyticsUserChart', 'users');
        buildRealChart('analyticsReferralChart', 'referrals');
        buildRealChart('analyticsApplicationChart', 'applications');
        buildRealChart('analyticsMessageChart', 'messages');
    }
    
    function buildRealChart(containerId, collection) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#6B7280;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        db.collection(collection).get().then(function(snap) {
            var monthCounts = {};
            var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var now = new Date();
            
            for (var i = 5; i >= 0; i--) {
                var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                var key = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
                monthCounts[key] = { label: monthNames[d.getMonth()], count: 0 };
            }
            
            snap.forEach(function(doc) {
                var data = doc.data();
                var ts = data.createdAt || data.timestamp || data.subscribedAt;
                if (!ts) return;
                var date;
                if (ts.toDate) {
                    date = ts.toDate();
                } else if (typeof ts === 'string') {
                    date = new Date(ts);
                } else if (ts.seconds) {
                    date = new Date(ts.seconds * 1000);
                } else {
                    return;
                }
                var key = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
                if (monthCounts[key] !== undefined) {
                    monthCounts[key].count++;
                }
            });
            
            var entries = Object.values(monthCounts);
            var maxVal = Math.max.apply(null, entries.map(function(e) { return e.count; }));
            if (maxVal === 0) maxVal = 1;
            
            var colors = {
                users: { base: 'rgba(8,27,58,', max: 0.9 },
                referrals: { base: 'rgba(212,163,58,', max: 0.9 },
                applications: { base: 'rgba(16,185,129,', max: 0.9 },
                messages: { base: 'rgba(99,102,241,', max: 0.9 }
            };
            var c = colors[collection] || colors.users;
            
            container.innerHTML = '';
            entries.forEach(function(entry, i) {
                var heightPct = Math.max((entry.count / maxVal) * 100, 4);
                var shade = 0.15 + (i * 0.15);
                if (shade > c.max) shade = c.max;
                container.innerHTML += '<div style="flex:1; display:flex; flex-direction:column; align-items:center;">' +
                    '<div style="width:100%; background:' + c.base + shade + '); border-radius: 8px 8px 0 0; height:' + heightPct + '%; min-height:4px; position:relative;">' +
                    '<span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-size:11px; font-weight:700; color:#081B3A;">' + entry.count + '</span></div>' +
                    '<span style="font-size:11px; color:#6B7280; margin-top:6px;">' + entry.label + '</span></div>';
            });
        }).catch(function(err) {
            console.error('Chart error for ' + collection + ':', err);
            container.innerHTML = '<div style="text-align:center; padding:20px; color:#DC2626;">Error loading chart data.</div>';
        });
    }
    
    function loadAdminReports() {
        buildReport('reportUserBreakdown', 'users');
        buildReport('reportReferralBreakdown', 'referrals');
        buildReport('reportApplicationBreakdown', 'applications');
        buildReport('reportPaymentBreakdown', 'payments');
        buildReport('reportMessageBreakdown', 'contactMessages');
        buildReport('reportCommunityBreakdown', 'facilities');
    }
    
    function buildReport(containerId, collection) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#6B7280;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        db.collection(collection).get().then(function(snap) {
            if (snap.empty) {
                container.innerHTML = '<p style="color:#6B7280; text-align:center;">No data available.</p>';
                return;
            }
            
            var total = snap.size;
            var breakdown = {};
            var statusBreakdown = {};
            var recentCount = 0;
            var thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            snap.forEach(function(doc) {
                var d = doc.data();
                
                if (d.role) {
                    breakdown[d.role] = (breakdown[d.role] || 0) + 1;
                } else if (d.status) {
                    statusBreakdown[d.status] = (statusBreakdown[d.status] || 0) + 1;
                } else if (d.type) {
                    breakdown[d.type] = (breakdown[d.type] || 0) + 1;
                }
                
                var ts = d.createdAt || d.timestamp || d.subscribedAt;
                if (ts) {
                    var date;
                    if (ts.toDate) date = ts.toDate();
                    else if (ts.seconds) date = new Date(ts.seconds * 1000);
                    else if (typeof ts === 'string') date = new Date(ts);
                    if (date && date >= thirtyDaysAgo) recentCount++;
                }
            });
            
            var html = '<div class="report-stats">';
            html += '<div class="report-stat"><span class="report-stat-num">' + total + '</span><span class="report-stat-label">Total</span></div>';
            html += '<div class="report-stat"><span class="report-stat-num">' + recentCount + '</span><span class="report-stat-label">Last 30 Days</span></div>';
            html += '</div>';
            
            var hasBreakdown = Object.keys(breakdown).length > 0;
            var hasStatus = Object.keys(statusBreakdown).length > 0;
            
            if (hasBreakdown) {
                html += '<div class="report-breakdown"><h5>Breakdown</h5>';
                Object.keys(breakdown).sort().forEach(function(key) {
                    var pct = total > 0 ? Math.round((breakdown[key] / total) * 100) : 0;
                    html += '<div class="report-bar-row"><span class="report-bar-label">' + capitalize(key) + '</span><div class="report-bar-track"><div class="report-bar-fill" style="width:' + pct + '%;"></div></div><span class="report-bar-pct">' + pct + '%</span></div>';
                });
                html += '</div>';
            }
            
            if (hasStatus) {
                html += '<div class="report-breakdown"><h5>Status</h5>';
                Object.keys(statusBreakdown).sort().forEach(function(key) {
                    var pct = total > 0 ? Math.round((statusBreakdown[key] / total) * 100) : 0;
                    html += '<div class="report-bar-row"><span class="report-bar-label">' + capitalize(key) + '</span><div class="report-bar-track"><div class="report-bar-fill status-' + key + '" style="width:' + pct + '%;"></div></div><span class="report-bar-pct">' + pct + '%</span></div>';
                });
                html += '</div>';
            }
            
            container.innerHTML = html;
        }).catch(function(err) {
            console.error('Report error for ' + collection + ':', err);
            container.innerHTML = '<p style="color:#DC2626;">Error loading report.</p>';
        });
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // --- MEDIA LIBRARY ---
    function loadAdminMedia() {
        var grid = document.getElementById('mediaGrid');
        if (!grid) return;
        
        FirebaseServices.heroImages.getAll().then(function(snap) {
            if (snap.empty) {
                grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #6B7280;"><i class="fas fa-photo-film" style="font-size: 48px; color: #D4A33A; margin-bottom: 16px; display: block;"></i><h4 style="color: #081B3A;">No Media Uploaded</h4><p>Upload hero images and community photos via the Upload button above.</p></div>';
                return;
            }
            grid.innerHTML = '';
            snap.forEach(function(doc) {
                var img = doc.data();
                grid.innerHTML += '<div class="admin-media-card">\
                    <img src="' + (img.url || '') + '" alt="' + escapeHtml(img.caption || 'Image') + '" onerror="this.src=\'https://via.placeholder.com/400x300?text=Image\'">\
                    <div class="admin-media-actions">\
                        <button onclick="adminDeleteMedia(\'' + doc.id + '\')" title="Delete"><i class="fas fa-trash"></i></button>\
                    </div>\
                    <div class="admin-media-info"><p>' + escapeHtml(img.caption || 'Untitled') + '</p></div>\
                </div>';
            });
        }).catch(function(err) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #DC2626;">Error loading media.</div>';
        });
        
        var uploadBtn = document.getElementById('uploadMediaBtn');
        if (uploadBtn) {
            uploadBtn.onclick = function() {
                openCloudinaryWidget('hero');
            };
        }
    }
    
    // --- WEBSITE CONTENT CMS ---
    var WEBSITE_CONTENT_DEFAULTS = {
        hero: {
            headline: 'Helping Families Find the Right Care.',
            subHeadline: 'Helping Providers Thrive.',
            description: 'Compassionate senior placement, private caregiver coordination, and healthcare consulting \u2014 all in one place.',
            btn1Text: 'Find Care', btn1Link: 'services.html',
            btn2Text: 'Request a Caregiver', btn2Link: 'caregiver-services.html',
            btn3Text: 'Become a Provider', btn3Link: 'providers.html'
        },
        services: {
            heading: 'Our Services',
            subtitle: 'Comprehensive care solutions designed to support families, empower providers, and connect caregivers with meaningful opportunities.',
            cards: [
                { title: 'Senior Placement', description: 'We help families find the perfect living arrangement for their loved ones, tailored to their unique needs and preferences.', icon: 'fas fa-home', color: 'blue', link: 'senior-placement.html', items: ['Assisted Living','Memory Care','Adult Family Homes','Residential Care Homes','Independent Living','Skilled Nursing','Respite Care'] },
                { title: 'Private Caregiver Services', description: 'Professional in-home care services that provide comfort, dignity, and independence for your loved ones.', icon: 'fas fa-hands-holding-heart', color: 'gold', link: 'caregiver-services.html', items: ['Companion Care','Personal Care','Live-In Care','Overnight Care','Dementia Care','Hospital Sitters','Post-Surgical Care','Respite Care'] },
                { title: 'Healthcare Consulting', description: 'Strategic consulting services to help healthcare providers grow, optimize, and deliver exceptional care.', icon: 'fas fa-chart-line', color: 'green', link: 'healthcare-consulting.html', items: ['Occupancy Growth','Licensing Support','Startup Consulting','Marketing Strategy','Policy Development','Referral Partnerships','Provider Partnerships'] }
            ]
        },
        howItWorks: {
            heading: 'How It Works', subtitle: 'A simple, guided process to ensure your family finds the perfect care solution.',
            steps: [
                { title: 'Free Consultation', description: 'Share your needs with our senior advisors at no cost.', icon: 'fas fa-comments' },
                { title: 'Care Assessment', description: 'We evaluate medical, emotional, and lifestyle requirements.', icon: 'fas fa-clipboard-check' },
                { title: 'Personalized Recommendations', description: 'Receive a curated list of matching communities and providers.', icon: 'fas fa-list-check' },
                { title: 'Tour Communities or Arrange Care', description: 'Visit top options with guided tours arranged by our team.', icon: 'fas fa-building' },
                { title: 'Move With Confidence', description: 'We support you through the transition and beyond.', icon: 'fas fa-heart' }
            ]
        },
        families: {
            heading: 'Find Senior Care', goldText: 'Near You',
            description: 'Search our network of verified communities and caregivers to find the perfect match for your loved one.',
            badges: ['Background Verified','Licensed Communities','Family Rated'], image: ''
        },
        caregivers: {
            heading: 'Need Care at Home?', goldText: 'You Can Trust.',
            description: 'Our verified caregivers provide compassionate, professional in-home care. Every caregiver undergoes thorough background checks and credential verification.',
            checklist: ['Companionship & Social Engagement','Bathing & Personal Hygiene','Meal Preparation & Nutrition','Medication Reminders','Transportation & Errands','Light Housekeeping','Hospital Discharge Support'],
            image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=700&h=500&fit=crop'
        },
        careers: {
            heading: 'Join Our Team of', goldText: 'Compassionate Caregivers',
            description: 'Make a difference in the lives of seniors. We offer competitive pay, flexible schedules, training, and a supportive work environment.',
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700&h=500&fit=crop'
        },
        providers: {
            title: 'Provider Partnership',
            description: 'Join our network of trusted communities and receive qualified referrals.',
            image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=700&h=500&fit=crop'
        },
        resources: {
            heading: 'Resources & Guides', subtitle: 'Educational resources to help you make informed decisions about senior care.',
            cards: [
                { title: 'Hospital Discharge Planning', description: 'Essential steps to ensure a smooth transition from hospital to home or care facility.', badge: 'Planning', badgeClass: 'badge-blue', image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=400&h=250&fit=crop' },
                { title: 'Memory Care Guide', description: 'Understanding memory care options and choosing the right community for dementia care.', badge: 'Guide', badgeClass: 'badge-gold', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop' },
                { title: 'Questions Before Touring', description: 'The top 20 questions every family should ask when touring a senior living community.', badge: 'Checklist', badgeClass: 'badge-green', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop' }
            ]
        },
        contact: {
            heading: 'Get in Touch', subtitle: 'Ready to find the right care? Contact us for a free, no-obligation consultation.',
            phone: '(341) 618-9792', email: 'info@mercyseniorsolutions.com',
            hoursWeekday: 'Mon - Fri: 8:00 AM - 6:00 PM', hoursSaturday: 'Sat: 9:00 AM - 3:00 PM', hoursSunday: 'Sun: Closed',
            mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d86258.61359165764!2d-122.2015!3d47.6062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490ab0d5e88f983%3A0x71e4897c420db!2sSeattle%2C%20WA!5e0!3m2!1sen!2sus!4v1690000000000!5m2!1sen!2sus'
        },
        footer: {
            description: 'Providing compassionate senior care solutions for families, healthcare providers, and private caregivers since 2020.',
            copyright: '\u00a9 2026 Mercy Senior Solutions. All rights reserved.',
            quickLinks: ['Home','About Us','Services','Careers','Contact'],
            serviceLinks: ['Senior Placement','Caregiver Services','Healthcare Consulting','Resources'],
            socialFacebook: '#', socialInstagram: '#', socialLinkedIn: '#', socialTwitter: '#'
        },
        about: {
            heading: 'About Mercy Senior Solutions',
            subheading: 'Compassionate care, personalized solutions, and a commitment to improving the lives of seniors and their families.',
            mission: 'Our mission is to bridge the gap between families seeking quality senior care and the providers who deliver it.',
            story: 'Founded in 2020, Mercy Senior Solutions started with a simple idea: make finding senior care easier.',
            values: ['Compassion','Integrity','Excellence','Community'], image: ''
        },
        chat: { welcomeMessage: 'Welcome to Mercy Senior Solutions. How can we help you today?', headerTitle: 'Talk to a Senior Advisor' }
    };
    
    var CMS_SECTIONS = [
        { key: 'hero', label: 'Hero Section', icon: 'fas fa-image' },
        { key: 'services', label: 'Services', icon: 'fas fa-concierge-bell' },
        { key: 'howItWorks', label: 'How It Works', icon: 'fas fa-list-ol' },
        { key: 'families', label: 'For Families', icon: 'fas fa-users' },
        { key: 'caregivers', label: 'For Caregivers', icon: 'fas fa-hands-holding-heart' },
        { key: 'careers', label: 'Careers', icon: 'fas fa-briefcase' },
        { key: 'providers', label: 'For Providers', icon: 'fas fa-hospital' },
        { key: 'resources', label: 'Resources & Guides', icon: 'fas fa-book' },
        { key: 'contact', label: 'Contact Info', icon: 'fas fa-phone' },
        { key: 'footer', label: 'Footer', icon: 'fas fa-shoe-prints' },
        { key: 'about', label: 'About Page', icon: 'fas fa-info-circle' },
        { key: 'chat', label: 'Live Chat', icon: 'fas fa-comments' }
    ];
    
    var cmsData = {};
    
    function seedWebsiteContent() {
        return db.collection('settings').doc('websiteContent').get().then(function(doc) {
            if (doc.exists) { cmsData = doc.data(); return false; }
            return db.collection('settings').doc('websiteContent').set(WEBSITE_CONTENT_DEFAULTS).then(function() {
                cmsData = JSON.parse(JSON.stringify(WEBSITE_CONTENT_DEFAULTS));
                return true;
            });
        });
    }
    
    function loadAdminContent() {
        var container = document.getElementById('cmsSections');
        if (!container) return;
        seedWebsiteContent().then(function(seeded) {
            if (seeded) showNotification('Content seeded to Firestore from current website.', 'success');
            renderCmsEditor(container);
        }).catch(function(err) { container.innerHTML = '<p style="color:#DC2626;">Error loading CMS: ' + err.message + '</p>'; });
        
        var seedBtn = document.getElementById('seedContentBtn');
        if (seedBtn) {
            seedBtn.onclick = function() {
                db.collection('settings').doc('websiteContent').set(WEBSITE_CONTENT_DEFAULTS).then(function() {
                    cmsData = JSON.parse(JSON.stringify(WEBSITE_CONTENT_DEFAULTS));
                    renderCmsEditor(container);
                    showNotification('All content reset to defaults and seeded to Firestore.', 'success');
                }).catch(function() { showNotification('Error seeding content.', 'error'); });
            };
        }
    }
    
    function renderCmsEditor(container) {
        var html = '';
        CMS_SECTIONS.forEach(function(section) {
            html += '<div class="admin-content-card" id="cms-' + section.key + '">';
            html += '<h4><i class="' + section.icon + '" style="margin-right:8px; color:#D4A33A;"></i>' + section.label + '</h4>';
            html += '<div class="cms-fields" data-section="' + section.key + '">' + renderCmsFields(section.key, cmsData[section.key] || {}) + '</div>';
            html += '<button class="btn btn-gold cms-save-btn" data-section="' + section.key + '" style="margin-top:16px;"><i class="fas fa-save"></i> Save ' + section.label + '</button>';
            html += '</div>';
        });
        container.innerHTML = html;
        container.querySelectorAll('.cms-save-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { saveCmsSection(this.getAttribute('data-section')); });
        });
        container.querySelectorAll('.cms-img-upload-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { openCmsImageUpload(this.getAttribute('data-target')); });
        });
    }
    
    function renderCmsFields(key, data) {
        data = data || {}; var html = '';
        if (key === 'hero') {
            html += cmsIn('Main Headline','headline',data.headline) + cmsIn('Sub Headline','subHeadline',data.subHeadline) + cmsTx('Description','description',data.description);
            html += '<div class="admin-form-grid">' + cmsIn('Button 1 Text','btn1Text',data.btn1Text) + cmsIn('Button 1 Link','btn1Link',data.btn1Link) + cmsIn('Button 2 Text','btn2Text',data.btn2Text) + cmsIn('Button 2 Link','btn2Link',data.btn2Link) + cmsIn('Button 3 Text','btn3Text',data.btn3Text) + cmsIn('Button 3 Link','btn3Link',data.btn3Link) + '</div>';
        } else if (key === 'services') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            (data.cards||[]).forEach(function(c,i) { html += '<div class="cms-repeater"><h5>Service Card '+(i+1)+'</h5>' + cmsIn('Title','cards.'+i+'.title',c.title) + cmsTx('Description','cards.'+i+'.description',c.description) + cmsIn('Icon Class','cards.'+i+'.icon',c.icon) + cmsIn('Link','cards.'+i+'.link',c.link) + cmsTx('Items (one per line)','cards.'+i+'.items',(c.items||[]).join('\n')) + '</div>'; });
        } else if (key === 'howItWorks') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            (data.steps||[]).forEach(function(s,i) { html += '<div class="cms-repeater"><h5>Step '+(i+1)+'</h5>' + cmsIn('Title','steps.'+i+'.title',s.title) + cmsTx('Description','steps.'+i+'.description',s.description) + cmsIn('Icon Class','steps.'+i+'.icon',s.icon) + '</div>'; });
        } else if (key === 'families') {
            html += cmsIn('Heading','heading',data.heading) + cmsIn('Gold Text','goldText',data.goldText) + cmsTx('Description','description',data.description) + cmsTx('Trust Badges (one per line)','badges',(data.badges||[]).join('\n')) + cmsImg('Section Image','image',data.image);
        } else if (key === 'caregivers') {
            html += cmsIn('Heading','heading',data.heading) + cmsIn('Gold Text','goldText',data.goldText) + cmsTx('Description','description',data.description) + cmsTx('Checklist (one per line)','checklist',(data.checklist||[]).join('\n')) + cmsImg('Section Image','image',data.image);
        } else if (key === 'careers') {
            html += cmsIn('Heading','heading',data.heading) + cmsIn('Gold Text','goldText',data.goldText) + cmsTx('Description','description',data.description) + cmsImg('Section Image','image',data.image);
        } else if (key === 'providers') {
            html += cmsIn('Title','title',data.title) + cmsTx('Description','description',data.description) + cmsImg('Section Image','image',data.image);
        } else if (key === 'resources') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            (data.cards||[]).forEach(function(c,i) { html += '<div class="cms-repeater"><h5>Resource Card '+(i+1)+'</h5>' + cmsIn('Title','cards.'+i+'.title',c.title) + cmsTx('Description','cards.'+i+'.description',c.description) + cmsIn('Badge Label','cards.'+i+'.badge',c.badge) + cmsIn('Badge Class (badge-blue/gold/green)','cards.'+i+'.badgeClass',c.badgeClass) + cmsImg('Card Image','cards.'+i+'.image',c.image) + '</div>'; });
        } else if (key === 'contact') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            html += '<div class="admin-form-grid">' + cmsIn('Phone','phone',data.phone) + cmsIn('Email','email',data.email) + '</div>';
            html += '<div class="admin-form-grid">' + cmsIn('Weekday Hours','hoursWeekday',data.hoursWeekday) + cmsIn('Saturday Hours','hoursSaturday',data.hoursSaturday) + cmsIn('Sunday Hours','hoursSunday',data.hoursSunday) + '</div>';
            html += cmsTx('Google Maps Embed URL','mapEmbed',data.mapEmbed);
        } else if (key === 'footer') {
            html += cmsTx('Footer Description','description',data.description) + cmsIn('Copyright Text','copyright',data.copyright);
            html += '<div class="admin-form-grid">' + cmsIn('Facebook URL','socialFacebook',data.socialFacebook) + cmsIn('Instagram URL','socialInstagram',data.socialInstagram) + cmsIn('LinkedIn URL','socialLinkedIn',data.socialLinkedIn) + cmsIn('Twitter URL','socialTwitter',data.socialTwitter) + '</div>';
        } else if (key === 'about') {
            html += cmsIn('Page Heading','heading',data.heading) + cmsIn('Subheading','subheading',data.subheading) + cmsTx('Mission Statement','mission',data.mission) + cmsTx('Our Story','story',data.story) + cmsTx('Core Values (one per line)','values',(data.values||[]).join('\n')) + cmsImg('About Image','image',data.image);
        } else if (key === 'chat') {
            html += cmsIn('Chat Header Title','headerTitle',data.headerTitle) + cmsTx('Welcome Message','welcomeMessage',data.welcomeMessage);
        }
        return html;
    }
    
    function cmsIn(label,field,value) { return '<div class="form-group"><label>'+label+'</label><input type="text" class="cms-field" data-field="'+field+'" value="'+escapeHtml(value||'')+'"></div>'; }
    function cmsTx(label,field,value) { return '<div class="form-group"><label>'+label+'</label><textarea class="cms-field" data-field="'+field+'" rows="3">'+escapeHtml(value||'')+'</textarea></div>'; }
    function cmsImg(label,field,value) { var preview = value ? '<img src="'+value+'" style="max-width:200px; border-radius:8px; margin-top:8px;">' : '<span style="color:#9CA3AF;">No image</span>'; return '<div class="form-group"><label>'+label+'</label>'+preview+'<div style="display:flex; gap:8px; margin-top:8px;"><input type="text" class="cms-field" data-field="'+field+'" value="'+escapeHtml(value||'')+'" placeholder="Image URL" style="flex:1;"><button class="btn btn-outline cms-img-upload-btn" data-target="'+field+'" type="button"><i class="fas fa-cloud-arrow-up"></i> Upload</button></div></div>'; }
    
    function saveCmsSection(sectionKey) {
        var sectionEl = document.getElementById('cms-'+sectionKey); if (!sectionEl) return;
        var fields = sectionEl.querySelectorAll('.cms-field'); var updateData = {};
        fields.forEach(function(el) {
            var field = el.getAttribute('data-field'); var value = el.value; var parts = field.split('.');
            if (parts.length === 1) {
                if (field==='badges'||field==='checklist'||field==='values') { updateData[field] = value.split('\n').map(function(s){return s.trim();}).filter(Boolean); }
                else { updateData[field] = value; }
            } else if (parts.length >= 3 && (parts[0]==='cards'||parts[0]==='steps')) {
                var idx = parseInt(parts[1]); var subField = parts[2];
                if (!updateData[parts[0]]) updateData[parts[0]] = [];
                if (!updateData[parts[0]][idx]) updateData[parts[0]][idx] = {};
                if (subField==='items') { updateData[parts[0]][idx][subField] = value.split('\n').map(function(s){return s.trim();}).filter(Boolean); }
                else { updateData[parts[0]][idx][subField] = value; }
            }
        });
        var btn = sectionEl.querySelector('.cms-save-btn'); btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; btn.disabled = true;
        db.collection('settings').doc('websiteContent').update(updateData).then(function() {
            Object.assign(cmsData[sectionKey], updateData);
            btn.innerHTML = '<i class="fas fa-check"></i> Saved!'; showNotification(sectionKey+' content saved.','success');
            setTimeout(function(){ btn.innerHTML = '<i class="fas fa-save"></i> Save'; btn.disabled = false; }, 2000);
        }).catch(function(err) { showNotification('Error saving: '+err.message,'error'); btn.innerHTML = '<i class="fas fa-save"></i> Save'; btn.disabled = false; });
    }
    
    function openCmsImageUpload(fieldPath) {
        if (typeof cloudinary==='undefined') { showNotification('Upload widget not loaded.','error'); return; }
        cloudinary.openUploadWidget({ cloudName:'qqwevfkz', uploadPreset:'mercysolutions', folder:'website-content', cropping:true, maxImageSize:5000000, sources:['local','url'], styles:{palette:{window:'#FFFFFF',sourceBg:'#F5F7FA',windowBorder:'#D4A33A',activeTabBackground:'#081B3A',activeTab:'#FFFFFF',inactiveTab:'#6B7280',inactiveTabBackground:'#E5E7EB'}} }, function(error,result) {
            if (error) return;
            if (result&&result.event==='success') { var url=result.info.secure_url; var fieldEl=document.querySelector('.cms-field[data-field="'+fieldPath+'"]'); if(fieldEl) fieldEl.value=url; showNotification('Image uploaded. Click Save to apply.','success'); }
        });
    }
    
    // --- WEBSITE CONTENT LOADER (Guest pages) ---
    function loadWebsiteContent() {
        var page = window.location.pathname.split('/').pop() || 'index.html';
        if (page==='login.html'||page==='register.html'||page==='admin.html'||page.indexOf('portal')>-1) return;
        return db.collection('settings').doc('websiteContent').get().then(function(doc) {
            if (!doc.exists) return;
            var c = doc.data();
            if (page==='index.html') applyHomepageContent(c);
            if (page==='about.html'&&c.about) applyAboutContent(c.about);
            applyGlobalContent(c);
        }).catch(function() {});
    }
    
    function applyHomepageContent(c) {
        if (c.hero) {
            var h1=document.querySelector('.hero-content h1'); if(h1) h1.innerHTML=c.hero.headline+'<br><span class="gold">'+(c.hero.subHeadline||'')+'</span>';
            var hp=document.querySelector('.hero-content > p'); if(hp) hp.textContent=c.hero.description||'';
        }
        if (c.services) {
            var sh=document.querySelector('.services .section-header h2'); if(sh) sh.textContent=c.services.heading||'';
            var sp=document.querySelector('.services .section-header p'); if(sp) sp.textContent=c.services.subtitle||'';
            var cards=document.querySelectorAll('.services .service-card'); (c.services.cards||[]).forEach(function(crd,i){ if(cards[i]){var h3=cards[i].querySelector('h3');if(h3)h3.textContent=crd.title||'';var p=cards[i].querySelector('p');if(p)p.textContent=crd.description||'';} });
        }
        if (c.howItWorks) {
            var hh=document.querySelector('.how-it-works .section-header h2'); if(hh) hh.textContent=c.howItWorks.heading||'';
            var steps=document.querySelectorAll('.how-it-works .step'); (c.howItWorks.steps||[]).forEach(function(s,i){ if(steps[i]){var h4=steps[i].querySelector('h4');if(h4)h4.textContent=s.title||'';var p=steps[i].querySelector('p');if(p)p.textContent=s.description||'';} });
        }
        if (c.resources) {
            var rh=document.querySelector('.resources .section-header h2'); if(rh) rh.textContent=c.resources.heading||'';
            var rp=document.querySelector('.resources .section-header p'); if(rp) rp.textContent=c.resources.subtitle||'';
            var rc=document.querySelectorAll('.resources .resource-card'); (c.resources.cards||[]).forEach(function(crd,i){ if(rc[i]){var h3=rc[i].querySelector('h3');if(h3)h3.textContent=crd.title||'';var p=rc[i].querySelector('p');if(p)p.textContent=crd.description||'';var img=rc[i].querySelector('img');if(img&&crd.image)img.src=crd.image;var badge=rc[i].querySelector('.badge');if(badge){badge.textContent=crd.badge||'';badge.className='badge '+(crd.badgeClass||'');}} });
        }
        if (c.contact) { var ch=document.querySelector('.contact .section-header h2'); if(ch) ch.textContent=c.contact.heading||''; }
        if (c.caregivers&&c.caregivers.image) { var cgi=document.querySelector('.caregivers-section .split-left img'); if(cgi)cgi.src=c.caregivers.image; }
        if (c.careers&&c.careers.image) { var cri=document.querySelector('.careers-section .split-left img'); if(cri)cri.src=c.careers.image; }
        if (c.providers&&c.providers.image) { var pri=document.querySelector('.providers-section .split-right img'); if(pri)pri.src=c.providers.image; }
    }
    function applyAboutContent(a) { var h1=document.querySelector('.page-hero h1');if(h1&&a.heading)h1.textContent=a.heading;var sp=document.querySelector('.page-hero p');if(sp&&a.subheading)sp.textContent=a.subheading; }
    function applyGlobalContent(c) {
        if (c.chat) { var cw=document.querySelector('.chat-message.received p');if(cw)cw.textContent=c.chat.welcomeMessage||'';var ct=document.querySelector('.chat-header h4');if(ct)ct.textContent=c.chat.headerTitle||''; }
        if (c.footer) { var fp=document.querySelector('.footer-col p');if(fp&&c.footer.description)fp.textContent=c.footer.description;var cp=document.querySelector('.footer-bottom p');if(cp&&c.footer.copyright)cp.textContent=c.footer.copyright; }
    }
    
    // --- SETTINGS ---
    function loadAdminSettings() {
        auth.onAuthStateChanged(function(user) {
            if (!user) return;
            var nameEl = document.getElementById('adminProfileName');
            var emailEl = document.getElementById('adminProfileEmail');
            var phoneEl = document.getElementById('adminProfilePhone');
            
            FirebaseServices.users.getById(user.uid).then(function(doc) {
                if (!doc.exists) return;
                var data = doc.data();
                if (nameEl) nameEl.value = data.name || '';
                if (emailEl) emailEl.value = data.email || user.email || '';
                if (phoneEl) phoneEl.value = data.phone || '';
            });
        });
        
        var profileForm = document.getElementById('adminProfileForm');
        if (profileForm) {
            profileForm.onsubmit = function(e) {
                e.preventDefault();
                var user = auth.currentUser;
                if (!user) return;
                FirebaseServices.users.update(user.uid, {
                    name: document.getElementById('adminProfileName').value,
                    phone: document.getElementById('adminProfilePhone').value
                }).then(function() { showNotification('Profile saved.', 'success'); })
                .catch(function() { showNotification('Error saving profile.', 'error'); });
            };
        }
        
        var saveSettings = document.getElementById('savePlatformSettings');
        if (saveSettings) {
            saveSettings.onclick = function() {
                FirebaseServices.settings.update('platform', {
                    maintenance: document.getElementById('settingMaintenance').checked,
                    chatEnabled: document.getElementById('settingChatEnabled').checked,
                    registration: document.getElementById('settingRegistration').checked
                }).then(function() { showNotification('Platform settings saved.', 'success'); })
                .catch(function() { showNotification('Error saving settings.', 'error'); });
            };
        }
    }
    
    // --- ADMINS ---
    function loadAdminAdmins() {
        var tbody = document.getElementById('adminsTableBody');
        if (!tbody) return;
        
        FirebaseServices.users.getByRole('admin').then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No admin accounts found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var u = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(u.createdAt);
                var status = u.active !== false ? 'active' : 'pending';
                var statusLabel = u.active !== false ? 'Active' : 'Inactive';
                
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</strong></td>\
                    <td>' + escapeHtml(u.email || '') + '</td>\
                    <td>' + escapeHtml(u.role || 'admin') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + statusLabel + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminEditAdminRole(\'' + doc.id + '\', \'' + (u.role || 'admin') + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminToggleUserActive(\'' + doc.id + '\', ' + (u.active !== false) + ')"><i class="fas fa-power-off"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading admins.</td></tr>';
        });
        
        var addBtn = document.getElementById('addAdminBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('adminModal').classList.add('active');
            };
        }
        
        var adminForm = document.getElementById('adminForm');
        if (adminForm) {
            adminForm.onsubmit = function(e) {
                e.preventDefault();
                var uid = document.getElementById('adminFormUid').value.trim();
                var role = this.querySelector('select[name="role"]').value;
                if (!uid) return;
                
                FirebaseServices.users.updateRole(uid, role).then(function() {
                    document.getElementById('adminModal').classList.remove('active');
                    showNotification('Admin role updated.', 'success');
                    loadAdminAdmins();
                }).catch(function(err) {
                    showNotification('Error: ' + err.message, 'error');
                });
            };
        }
        
        initModalClose('adminModal');
    }
    
    // ==========================================
    // ADMIN HELPER FUNCTIONS
    // ==========================================
    
    function initModalClose(modalId) {
        var modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.querySelectorAll('.admin-modal-close, .admin-modal-close-btn').forEach(function(btn) {
            btn.onclick = function() { modal.classList.remove('active'); };
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.remove('active');
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }
    
    function poplateProviderSelect(selectedId) {
        var sel = document.getElementById('communityProviderSelect');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- No provider linked --</option>';
        FirebaseServices.users.getByRole('provider').then(function(snap) {
            snap.forEach(function(doc) {
                var u = doc.data();
                var name = escapeHtml(u.name || u.firstName + ' ' + (u.lastName || ''));
                var facility = u.facilityName ? ' (' + escapeHtml(u.facilityName) + ')' : '';
                sel.innerHTML += '<option value="' + doc.id + '"' + (doc.id === selectedId ? ' selected' : '') + '>' + name + facility + '</option>';
            });
        }).catch(function() {});
    }
    
    window.adminViewUser = function(uid) {
        FirebaseServices.users.getById(uid).then(function(doc) {
            if (!doc.exists) { showNotification('User not found.', 'error'); return; }
            var u = doc.data();
            alert('User Profile:\n\nName: ' + (u.name || u.firstName + ' ' + (u.lastName || '')) + '\nEmail: ' + u.email + '\nPhone: ' + (u.phone || '--') + '\nRole: ' + u.role + '\nJoined: ' + FirebaseServices.formatTimestamp(u.createdAt));
        });
    };
    
    window.adminToggleUserActive = function(uid, currentlyActive) {
        var action = currentlyActive ? 'deactivate' : 'activate';
        if (!confirm('Are you sure you want to ' + action + ' this user?')) return;
        
        var fn = currentlyActive ? FirebaseServices.users.deactivate : FirebaseServices.users.activate;
        fn(uid).then(function() {
            showNotification('User ' + action + 'd successfully.', 'success');
            adminTabsLoaded = {};
            loadAdminTab(document.querySelector('.sidebar-nav a.active').getAttribute('data-tab'));
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminEditCommunity = function(id) {
        FirebaseServices.facilities.getById(id).then(function(doc) {
            if (!doc.exists) return;
            var f = doc.data();
            document.getElementById('communityModalTitle').textContent = 'Edit Community';
            var form = document.getElementById('communityForm');
            form.reset();
            form.querySelector('input[name="communityId"]').value = id;
            form.querySelector('input[name="facilityName"]').value = f.facilityName || '';
            form.querySelector('select[name="facilityType"]').value = f.facilityType || '';
            form.querySelector('input[name="city"]').value = f.city || '';
            form.querySelector('input[name="state"]').value = f.state || '';
            form.querySelector('input[name="phone"]').value = f.phone || '';
            form.querySelector('input[name="email"]').value = f.email || '';
            form.querySelector('input[name="pricingFrom"]').value = f.pricingFrom || '';
            form.querySelector('input[name="vacancies"]').value = f.vacancies || '';
            form.querySelector('textarea[name="description"]').value = f.description || '';
            form.querySelector('input[name="petFriendly"]').checked = f.petFriendly || false;
            form.querySelector('input[name="privateRooms"]').checked = f.privateRooms || false;
            form.querySelector('input[name="vaBenefits"]').checked = f.vaBenefits || false;
            form.querySelector('input[name="memoryCare"]').checked = f.memoryCare || false;
            poplateProviderSelect(f.providerId || '');
            document.getElementById('communityModal').classList.add('active');
        });
    };
    
    window.adminDeleteCommunity = function(id) {
        if (!confirm('Are you sure you want to delete this community? This cannot be undone.')) return;
        FirebaseServices.facilities.remove(id).then(function() {
            showNotification('Community deleted.', 'success');
            loadAdminCommunities();
        }).catch(function(err) {
            showNotification('Error deleting community: ' + err.message, 'error');
        });
    };
    
    window.adminUpdateReferralStatus = function(id, currentStatus) {
        var statuses = ['new', 'contacted', 'tour_scheduled', 'admitted'];
        var idx = statuses.indexOf(currentStatus);
        var next = prompt('Update status.\n\nCurrent: ' + currentStatus + '\nOptions: new, contacted, tour_scheduled, admitted', currentStatus);
        if (!next || next === currentStatus) return;
        
        FirebaseServices.referrals.updateStatus(id, next).then(function() {
            showNotification('Referral status updated to ' + next + '.', 'success');
            loadAdminReferrals();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminUpdateTourStatus = function(id, currentStatus) {
        var next = prompt('Update tour status.\n\nCurrent: ' + currentStatus + '\nOptions: scheduled, completed, cancelled', currentStatus);
        if (!next || next === currentStatus) return;
        
        FirebaseServices.tours.updateStatus(id, next).then(function() {
            showNotification('Tour status updated.', 'success');
            loadAdminAppointments();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteTour = function(id) {
        if (!confirm('Delete this appointment?')) return;
        FirebaseServices.tours.remove(id).then(function() {
            showNotification('Appointment deleted.', 'success');
            loadAdminAppointments();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminEditResource = function(id) {
        FirebaseServices.blogPosts.getById(id).then(function(doc) {
            if (!doc.exists) return;
            var p = doc.data();
            document.getElementById('resourceModalTitle').textContent = 'Edit Resource';
            var form = document.getElementById('resourceForm');
            form.reset();
            form.querySelector('input[name="resourceId"]').value = id;
            form.querySelector('input[name="title"]').value = p.title || '';
            form.querySelector('select[name="category"]').value = p.category || '';
            form.querySelector('select[name="status"]').value = p.status || 'draft';
            form.querySelector('input[name="image"]').value = p.image || '';
            form.querySelector('textarea[name="excerpt"]').value = p.excerpt || '';
            form.querySelector('textarea[name="content"]').value = p.content || '';
            document.getElementById('resourceModal').classList.add('active');
        });
    };
    
    window.adminDeleteResource = function(id) {
        if (!confirm('Delete this resource?')) return;
        FirebaseServices.blogPosts.remove(id).then(function() {
            showNotification('Resource deleted.', 'success');
            loadAdminResources();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminUpdateApplicationStatus = function(id, status) {
        if (status === 'approved') {
            // Pre-populate create account form from application data
            FirebaseServices.applications.getById(id).then(function(doc) {
                if (!doc.exists) return;
                var a = doc.data();
                if (a.type === 'provider') {
                    var names = (a.name || '').split(' ');
                    document.getElementById('providerCreateForm').querySelector('input[name="firstName"]').value = names[0] || '';
                    document.getElementById('providerCreateForm').querySelector('input[name="lastName"]').value = names.slice(1).join(' ') || '';
                    document.getElementById('providerCreateForm').querySelector('input[name="email"]').value = a.email || '';
                    document.getElementById('providerCreateForm').querySelector('input[name="phone"]').value = a.phone || '';
                    document.getElementById('providerCreateForm').querySelector('input[name="facilityName"]').value = a.facilityName || '';
                    // Store application ID for status update on submit
                    window._pendingApproveId = id;
                    document.getElementById('providerCreateModal').classList.add('active');
                    showNotification('Application data loaded into create form. Set a password and submit.', 'success');
                } else if (a.type === 'career') {
                    var names = (a.name || '').split(' ');
                    document.getElementById('caregiverCreateForm').querySelector('input[name="firstName"]').value = names[0] || '';
                    document.getElementById('caregiverCreateForm').querySelector('input[name="lastName"]').value = names.slice(1).join(' ') || '';
                    document.getElementById('caregiverCreateForm').querySelector('input[name="email"]').value = a.email || '';
                    document.getElementById('caregiverCreateForm').querySelector('input[name="phone"]').value = a.phone || '';
                    window._pendingApproveId = id;
                    document.getElementById('caregiverCreateModal').classList.add('active');
                    showNotification('Application data loaded into create form. Set a password and submit.', 'success');
                }
            });
        } else {
            if (!confirm('Mark this application as ' + status + '?')) return;
            FirebaseServices.applications.updateStatus(id, status).then(function() {
                showNotification('Application ' + status + '.', 'success');
                loadAdminApplications();
            }).catch(function(err) {
                showNotification('Error: ' + err.message, 'error');
            });
        }
    };
    
    window.adminUpdateShiftStatus = function(id, status) {
        if (status === 'completed' && !confirm('Mark this shift as completed?')) return;
        FirebaseServices.shifts.update(id, { status: status }).then(function() {
            showNotification('Shift updated.', 'success');
            loadAdminShifts();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteShift = function(id) {
        if (!confirm('Delete this shift?')) return;
        FirebaseServices.shifts.remove(id).then(function() {
            showNotification('Shift deleted.', 'success');
            loadAdminShifts();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminEditAdminRole = function(uid, currentRole) {
        var newRole = prompt('Update admin role.\n\nCurrent: ' + currentRole + '\nOptions: admin, super-admin', currentRole);
        if (!newRole || newRole === currentRole) return;
        
        FirebaseServices.users.updateRole(uid, newRole).then(function() {
            showNotification('Admin role updated.', 'success');
            loadAdminAdmins();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteMedia = function(id) {
        if (!confirm('Delete this media item?')) return;
        FirebaseServices.heroImages.remove(id).then(function() {
            showNotification('Media deleted.', 'success');
            loadAdminMedia();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    // ==========================================
    // CLOUDINARY UPLOAD WIDGET
    // ==========================================
    
    function openCloudinaryWidget(type) {
        if (typeof CloudinaryConfig === 'undefined') {
            showNotification('Cloudinary not configured.', 'error');
            return;
        }
        
        var config = type === 'hero' ? CloudinaryConfig.hero : CloudinaryConfig.media;
        
        var widget = cloudinary.createUploadWidget({
            cloudName: CloudinaryConfig.cloudName,
            uploadPreset: CloudinaryConfig.uploadPreset,
            folder: config.folder,
            maxFiles: config.maxFiles,
            maxFileSize: config.maxFileSize,
            allowedFormats: config.allowedFormats,
            sources: ['local', 'url'],
            styles: {
                palette: {
                    window: '#FFFFFF',
                    sourceBg: '#F5F7FA',
                    windowBorder: '#D4A33A',
                    activeTabBackground: '#081B3A',
                    activeTab: '#FFFFFF',
                    inactiveTab: '#6B7280',
                    inactiveTabBackground: '#E5E7EB'
                }
            }
        }, function(error, result) {
            if (error) {
                console.error('Cloudinary error:', error);
                return;
            }
            if (result && result.event === 'success') {
                var imageData = {
                    url: result.info.secure_url,
                    caption: result.info.original_filename || 'Hero Image',
                    order: 0,
                    active: true
                };
                
                FirebaseServices.heroImages.add(imageData).then(function() {
                    showNotification('Image uploaded successfully!', 'success');
                    loadAdminMedia();
                }).catch(function(err) {
                    showNotification('Error saving image: ' + err.message, 'error');
                });
            }
        });
        
        widget.open();
    }
    
    // ==========================================
    // FAMILY PORTAL LOADER
    // ==========================================
    function loadFamilyDashboard(userId) {
        var familyId = userId;
        
        var nameEl = document.getElementById('familyUserName');
        
        // Load referrals count
        FirebaseServices.referrals.getByFamily(familyId).then(function(snap) {
            var count = 0;
            var tourCount = 0;
            var activityItems = [];
            
            snap.forEach(function(doc) {
                var r = doc.data();
                count++;
                if (r.status === 'tour_scheduled') tourCount++;
                
                activityItems.push({
                    type: r.status,
                    description: 'Referral for <strong>' + escapeHtml(r.careType || 'Care') + '</strong> - Status: ' + r.status.replace('_', ' '),
                    icon: r.status === 'new' ? 'fas fa-link' : r.status === 'tour_scheduled' ? 'fas fa-calendar' : 'fas fa-check-circle',
                    color: r.status === 'new' ? 'blue' : r.status === 'tour_scheduled' ? 'gold' : 'green'
                });
            });
            
            var refEl = document.getElementById('familyActiveReferrals');
            if (refEl) refEl.textContent = count;
            
            var tourEl = document.getElementById('familyUpcomingTours');
            if (tourEl) tourEl.textContent = tourCount;
            
            // Load activity
            loadFamilyActivity(familyId);
        }).catch(function() { setFallback('familyActiveReferrals'); });
        
        // Load saved communities
        FirebaseServices.savedCommunities.getByFamily(familyId).then(function(snap) {
            var el = document.getElementById('familySavedCommunities');
            if (el) el.textContent = snap.size;
            
            var tbody = document.getElementById('familySavedTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No saved communities yet. Browse our services to find the right fit.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var c = doc.data();
                var statusClass = c.status === 'active' ? 'active' : c.status === 'tour_scheduled' ? 'pending' : 'review';
                var statusLabel = c.status === 'active' ? 'Active' : c.status === 'tour_scheduled' ? 'Tour Scheduled' : 'Under Review';
                
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(c.communityName) + '</strong></td>\
                        <td>' + escapeHtml(c.location) + '</td>\
                        <td>' + escapeHtml(c.careType) + '</td>\
                        <td>' + FirebaseServices.formatCurrency(c.monthlyCost) + '/mo</td>\
                        <td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>\
                    </tr>\
                ';
            });
        }).catch(function() { setFallback('familySavedCommunities'); });
        
        // Messages count
        var msgEl = document.getElementById('familyUnreadMsgs');
        if (msgEl) msgEl.textContent = '0';
        
        // Load referrals list
        loadFamilyReferrals(userId);
        
        // Load settings
        loadFamilySettings(userId);
    }
    
    function loadFamilyActivity(familyId) {
        var container = document.getElementById('familyActivityList');
        if (!container) return;
        
        FirebaseServices.activity.getAll(5).then(function(snap) {
            if (snap.empty) {
                container.innerHTML = '<div class="activity-item" style="text-align:center; padding:40px; color:#6B7280;"><p>No activity yet. Your referral updates will appear here.</p></div>';
                return;
            }
            
            container.innerHTML = '';
            snap.forEach(function(doc) {
                var a = doc.data();
                var timeStr = FirebaseServices.formatTimestamp(a.timestamp);
                var iconColor = a.color || 'blue';
                
                container.innerHTML += '\
                    <div class="activity-item">\
                        <div class="activity-icon ' + iconColor + '"><i class="' + (a.icon || 'fas fa-info-circle') + '"></i></div>\
                        <div class="activity-info">\
                            <p>' + escapeHtml(a.description) + '</p>\
                            <span>' + timeStr + '</span>\
                        </div>\
                    </div>\
                ';
            });
        }).catch(function(err) {
            console.error('Error loading family activity:', err);
        });
    }
    
    function loadFamilySettings(userId) {
        db.collection('users').doc(userId).get().then(function(doc) {
            if (!doc.exists) return;
            var u = doc.data();
            
            var firstEl = document.getElementById('settingsFirstName');
            var lastEl = document.getElementById('settingsLastName');
            var emailEl = document.getElementById('settingsEmail');
            var phoneEl = document.getElementById('settingsPhone');
            
            if (firstEl) firstEl.value = u.firstName || '';
            if (lastEl) lastEl.value = u.lastName || '';
            if (emailEl) emailEl.value = u.email || '';
            if (phoneEl) phoneEl.value = u.phone || '';
        });
    }
    
    // ==========================================
    // FAMILY PORTAL FORM HANDLERS
    // ==========================================
    
    // Referral Form
    var referralForm = document.getElementById('referralForm');
    if (referralForm) {
        referralForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var errEl = document.getElementById('referralError');
            var successEl = document.getElementById('referralSuccess');
            var submitBtn = document.getElementById('referralSubmitBtn');
            
            errEl.style.display = 'none';
            successEl.style.display = 'none';
            
            var referralData = {
                familyId: auth.currentUser ? auth.currentUser.uid : '',
                familyName: auth.currentUser ? auth.currentUser.email : '',
                patientName: document.getElementById('refPatientName').value.trim(),
                patientAge: document.getElementById('refPatientAge').value,
                relationship: document.getElementById('refRelationship').value,
                phone: document.getElementById('refPhone').value.trim(),
                careType: document.getElementById('refCareType').value,
                budget: document.getElementById('refBudget').value,
                location: document.getElementById('refLocation').value.trim(),
                timeline: document.getElementById('refTimeline').value,
                conditions: document.getElementById('refConditions').value.trim(),
                notes: document.getElementById('refNotes').value.trim(),
                contactMethod: document.querySelector('input[name="refContactMethod"]:checked').value
            };
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            FirebaseServices.referrals.create(referralData).then(function() {
                return FirebaseServices.activity.log({
                    type: 'referral',
                    description: 'New referral submitted for ' + referralData.patientName + ' (' + referralData.careType + ')',
                    icon: 'fas fa-link',
                    color: 'blue'
                });
            }).then(function() {
                successEl.textContent = 'Referral submitted successfully! A senior care advisor will contact you within 24 hours to discuss options for ' + referralData.patientName + '.';
                successEl.style.display = 'block';
                referralForm.reset();
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Referral';
                submitBtn.disabled = false;
                
                // Refresh referrals table
                loadFamilyReferrals(auth.currentUser.uid);
            }).catch(function(err) {
                errEl.textContent = 'Error submitting referral: ' + err.message;
                errEl.style.display = 'block';
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Referral';
                submitBtn.disabled = false;
                console.error(err);
            });
        });
    }
    
    // Tour Request Form
    var tourForm = document.getElementById('tourForm');
    if (tourForm) {
        tourForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var successEl = document.getElementById('tourSuccess');
            
            var tourData = {
                familyId: auth.currentUser ? auth.currentUser.uid : '',
                community: document.getElementById('tourCommunity').value.trim(),
                date: document.getElementById('tourDate').value,
                time: document.getElementById('tourTime').value,
                notes: document.getElementById('tourNotes').value.trim()
            };
            
            FirebaseServices.activity.log({
                type: 'tour',
                description: 'Tour requested at ' + tourData.community + ' on ' + FirebaseServices.formatDate(tourData.date),
                icon: 'fas fa-calendar-check',
                color: 'green'
            }).then(function() {
                successEl.textContent = 'Tour request submitted for ' + tourData.community + ' on ' + FirebaseServices.formatDate(tourData.date) + ' at ' + tourData.time + '. We will confirm shortly.';
                successEl.style.display = 'block';
                tourForm.reset();
            }).catch(function(err) {
                successEl.textContent = 'Error: ' + err.message;
                successEl.style.display = 'block';
                successEl.style.background = '#FEF2F2';
                successEl.style.borderColor = '#FECACA';
                successEl.style.color = '#DC2626';
            });
        });
    }
    
    // Settings Form
    var settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var successEl = document.getElementById('settingsSuccess');
            
            if (!auth.currentUser) return;
            
            db.collection('users').doc(auth.currentUser.uid).update({
                firstName: document.getElementById('settingsFirstName').value.trim(),
                lastName: document.getElementById('settingsLastName').value.trim(),
                name: document.getElementById('settingsFirstName').value.trim() + ' ' + document.getElementById('settingsLastName').value.trim(),
                phone: document.getElementById('settingsPhone').value.trim()
            }).then(function() {
                successEl.textContent = 'Profile updated successfully!';
                successEl.style.display = 'block';
                setTimeout(function() { successEl.style.display = 'none'; }, 3000);
                
                var nameEl = document.getElementById('familyUserName');
                if (nameEl) nameEl.textContent = 'Welcome, ' + document.getElementById('settingsFirstName').value.trim();
            }).catch(function(err) {
                successEl.textContent = 'Error: ' + err.message;
                successEl.style.display = 'block';
                successEl.style.background = '#FEF2F2';
                successEl.style.color = '#DC2626';
            });
        });
    }
    
    // Document Upload
    var docUploadArea = document.getElementById('docUploadArea');
    var docFileInput = document.getElementById('docFileInput');
    var docFileName = document.getElementById('docFileName');
    var docUploadBtn = document.getElementById('docUploadBtn');
    
    if (docUploadArea && docFileInput) {
        docUploadArea.addEventListener('click', function() {
            docFileInput.click();
        });
        
        docFileInput.addEventListener('change', function() {
            if (this.files[0]) {
                docFileName.textContent = this.files[0].name;
                docFileName.style.display = 'block';
                docUploadBtn.style.display = 'inline-block';
            }
        });
        
        if (docUploadBtn) {
            docUploadBtn.addEventListener('click', function() {
                if (!docFileInput.files[0] || !auth.currentUser) return;
                
                var file = docFileInput.files[0];
                var storageRef = storage.ref('documents/' + auth.currentUser.uid + '/' + Date.now() + '_' + file.name);
                
                docUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                docUploadBtn.disabled = true;
                
                storageRef.put(file).then(function() {
                    return storageRef.getDownloadURL();
                }).then(function(url) {
                    return db.collection('documents').add({
                        userId: auth.currentUser.uid,
                        fileName: file.name,
                        fileUrl: url,
                        fileType: document.getElementById('docType').value,
                        fileSize: file.size,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }).then(function() {
                    docFileName.textContent = 'Upload successful!';
                    docUploadBtn.innerHTML = '<i class="fas fa-check"></i> Uploaded';
                    docUploadBtn.style.background = '#2F7D4A';
                    docFileInput.value = '';
                    setTimeout(function() {
                        docUploadBtn.style.display = 'none';
                        docFileName.style.display = 'none';
                        docUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
                        docUploadBtn.style.background = '';
                        docUploadBtn.disabled = false;
                    }, 2000);
                }).catch(function(err) {
                    docFileName.textContent = 'Upload failed: ' + err.message;
                    docFileName.style.color = '#DC2626';
                    docUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
                    docUploadBtn.disabled = false;
                });
            });
        }
    }
    
    // Load referrals list for family portal
    function loadFamilyReferrals(userId) {
        var tbody = document.getElementById('familyReferralsTable');
        if (!tbody) return;
        
        FirebaseServices.referrals.getByFamily(userId).then(function(snap) {
            var el = document.getElementById('familyActiveReferrals');
            if (el) el.textContent = snap.size;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#6B7280;">No referrals yet. Submit your first referral to get started.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);
                var statusClass = 'active';
                var statusLabel = r.status.charAt(0).toUpperCase() + r.status.slice(1).replace('_', ' ');
                
                if (r.status === 'new') { statusClass = 'active'; }
                else if (r.status === 'contacted') { statusClass = 'pending'; }
                else if (r.status === 'tour_scheduled') { statusClass = 'review'; }
                else if (r.status === 'admitted') { statusClass = 'green'; }
                
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(r.careType) + '</strong></td>\
                        <td>' + escapeHtml(r.providerName || 'Pending') + '</td>\
                        <td>' + escapeHtml(r.budget) + '</td>\
                        <td>' + dateStr + '</td>\
                        <td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>\
                        <td>' + escapeHtml(r.notes || '--') + '</td>\
                    </tr>\
                ';
            });
        }).catch(function(err) {
            console.error('Error loading referrals:', err);
        });
    }
    
    // ==========================================
    // PROVIDER PORTAL LOADER
    // ==========================================
    function loadProviderDashboard(userId) {
        var providerId = userId;
        
        // Load linked facility data (vacancies, pricing from facilities doc)
        FirebaseServices.facilities.getByProvider(providerId).then(function(snap) {
            if (!snap.empty) {
                var fac = snap.docs[0].data();
                var vacEl = document.getElementById('providerVacancies');
                if (vacEl) vacEl.textContent = fac.vacancies || '0';
                var resEl = document.getElementById('providerResidents');
                if (resEl) resEl.textContent = fac.totalBeds ? (fac.totalBeds - (fac.vacancies || 0)) : '--';
                var revEl = document.getElementById('providerRevenue');
                if (revEl) revEl.textContent = fac.pricingFrom ? '$' + fac.pricingFrom + '+/mo' : '$--';
            } else {
                setFallback('providerVacancies');
                setFallback('providerResidents');
                setFallback('providerRevenue');
            }
        }).catch(function() {
            setFallback('providerVacancies');
            setFallback('providerResidents');
            setFallback('providerRevenue');
        });
        
        // Load referrals
        FirebaseServices.referrals.getByProvider(providerId).then(function(snap) {
            var el = document.getElementById('providerIncomingReferrals');
            if (el) el.textContent = snap.size;
            
            var tbody = document.getElementById('providerReferralsTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No referrals yet.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);
                var statusClass = r.status === 'new' ? 'active' : r.status === 'contacted' ? 'pending' : r.status === 'admitted' ? 'green' : 'active';
                var statusLabel = r.status.charAt(0).toUpperCase() + r.status.slice(1).replace('_', ' ');
                
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(r.familyName) + '</strong></td>\
                        <td>' + escapeHtml(r.careType) + '</td>\
                        <td>' + escapeHtml(r.budget) + '</td>\
                        <td>' + dateStr + '</td>\
                        <td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>\
                    </tr>\
                ';
            });
        }).catch(function() { setFallback('providerIncomingReferrals'); });
        
        // Load vacancies (per-room table only, stat cards read from facility doc)
        FirebaseServices.vacancies.getByProvider(providerId).then(function(snap) {
            var totalAvailable = 0;
            var totalOccupied = 0;
            var tbody = document.getElementById('providerVacanciesTable');
            
            if (snap.empty) {
                if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No vacancy data. Add your facility vacancies to get started.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var v = doc.data();
                totalAvailable += v.available || 0;
                totalOccupied += v.occupied || 0;
                var rate = v.occupied && v.available ? Math.round((v.occupied / (v.occupied + v.available)) * 100) : 0;
                
                tbody.innerHTML += '\
                    <tr>\
                        <td>' + escapeHtml(v.roomType) + '</td>\
                        <td>' + v.available + '</td>\
                        <td>' + v.occupied + '</td>\
                        <td>' + rate + '%</td>\
                        <td>' + FirebaseServices.formatCurrency(v.monthlyPrice) + '/mo</td>\
                    </tr>\
                ';
            });
        }).catch(function() {});
        
        // Load full referrals list
        loadProviderAllReferrals(userId);
        
        // Load vacancies management table
        loadProviderVacanciesManage(userId);
        
        // Load settings
        loadProviderSettings(userId);
        
        // Load photos
        loadProviderPhotos(userId);
    }
    
    // ==========================================
    // PROVIDER PORTAL - ALL REFERRALS
    // ==========================================
    
    function loadProviderAllReferrals(userId, filter) {
        var tbody = document.getElementById('providerAllReferralsTable');
        if (!tbody) return;
        
        FirebaseServices.referrals.getByProvider(userId).then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#6B7280;">No referrals yet.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var docId = doc.id;
                
                if (filter && filter !== 'all' && r.status !== filter) return;
                
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);
                var statusClass = 'active';
                var statusLabel = r.status.charAt(0).toUpperCase() + r.status.slice(1).replace('_', ' ');
                if (r.status === 'contacted') statusClass = 'pending';
                else if (r.status === 'tour_scheduled') statusClass = 'review';
                else if (r.status === 'admitted') statusClass = 'green';
                
                var actions = '';
                if (r.status === 'new') {
                    actions = '<button class="btn btn-sm btn-primary prov-ref-action" data-id="' + docId + '" data-status="contacted">Contact</button>';
                } else if (r.status === 'contacted') {
                    actions = '<button class="btn btn-sm btn-gold prov-ref-action" data-id="' + docId + '" data-status="tour_scheduled">Schedule Tour</button>';
                } else if (r.status === 'tour_scheduled') {
                    actions = '<button class="btn btn-sm btn-primary prov-ref-action" data-id="' + docId + '" data-status="admitted">Admit</button>';
                } else {
                    actions = '<span style="color:#6B7280; font-size:13px;">Completed</span>';
                }
                
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(r.familyName || 'N/A') + '</strong></td>\
                        <td>' + escapeHtml(r.patientName || '--') + '</td>\
                        <td>' + escapeHtml(r.careType) + '</td>\
                        <td>' + escapeHtml(r.budget) + '</td>\
                        <td>' + escapeHtml(r.timeline || '--') + '</td>\
                        <td>' + dateStr + '</td>\
                        <td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>\
                        <td>' + actions + '</td>\
                    </tr>\
                ';
            });
            
            // Attach action handlers
            document.querySelectorAll('.prov-ref-action').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var refId = this.getAttribute('data-id');
                    var newStatus = this.getAttribute('data-status');
                    FirebaseServices.referrals.updateStatus(refId, newStatus).then(function() {
                        loadProviderAllReferrals(userId, filter);
                        loadProviderDashboard(userId);
                    });
                });
            });
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.ref-filter').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.ref-filter').forEach(function(b) {
                b.classList.remove('active');
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline');
            });
            this.classList.add('active');
            this.classList.add('btn-primary');
            this.classList.remove('btn-outline');
            
            var filter = this.getAttribute('data-filter');
            var provUser = auth.currentUser;
            if (provUser) loadProviderAllReferrals(provUser.uid, filter);
        });
    });
    
    // ==========================================
    // PROVIDER PORTAL - VACANCY MANAGEMENT
    // ==========================================
    
    function loadProviderVacanciesManage(userId) {
        var tbody = document.getElementById('providerVacanciesManageTable');
        if (!tbody) return;
        
        FirebaseServices.vacancies.getByProvider(userId).then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No vacancies added yet.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var v = doc.data();
                var docId = doc.id;
                var rate = v.occupied && v.available ? Math.round((v.occupied / (v.occupied + v.available)) * 100) : 0;
                
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(v.roomType) + '</strong></td>\
                        <td>' + v.available + '</td>\
                        <td>' + v.occupied + '</td>\
                        <td>' + rate + '%</td>\
                        <td>' + FirebaseServices.formatCurrency(v.monthlyPrice) + '/mo</td>\
                        <td>\
                            <button class="btn btn-sm btn-outline prov-vac-edit" data-id="' + docId + '" data-type="' + escapeHtml(v.roomType) + '" data-price="' + v.monthlyPrice + '" data-available="' + v.available + '" data-occupied="' + v.occupied + '" style="margin-right: 6px;"><i class="fas fa-edit"></i></button>\
                            <button class="btn btn-sm btn-outline prov-vac-delete" data-id="' + docId + '" style="color: #DC2626; border-color: #DC2626;"><i class="fas fa-trash"></i></button>\
                        </td>\
                    </tr>\
                ';
            });
            
            // Edit handlers
            document.querySelectorAll('.prov-vac-edit').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    document.getElementById('vacRoomType').value = this.getAttribute('data-type');
                    document.getElementById('vacPrice').value = this.getAttribute('data-price');
                    document.getElementById('vacAvailable').value = this.getAttribute('data-available');
                    document.getElementById('vacOccupied').value = this.getAttribute('data-occupied');
                    document.getElementById('vacEditId').value = this.getAttribute('data-id');
                    document.getElementById('vacancySubmitBtn').innerHTML = '<i class="fas fa-save"></i> Update Vacancy';
                    document.getElementById('vacancyCancelBtn').style.display = 'inline-block';
                });
            });
            
            // Delete handlers
            document.querySelectorAll('.prov-vac-delete').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    if (!confirm('Delete this vacancy?')) return;
                    var vacId = this.getAttribute('data-id');
                    db.collection('vacancies').doc(vacId).delete().then(function() {
                        loadProviderVacanciesManage(userId);
                        loadProviderDashboard(userId);
                        syncFacilityVacancies(userId);
                    });
                });
            });
        });
    }
    
    // Vacancy form
    var vacancyForm = document.getElementById('vacancyForm');
    if (vacancyForm) {
        vacancyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var errEl = document.getElementById('vacancyError');
            var successEl = document.getElementById('vacancySuccess');
            errEl.style.display = 'none';
            successEl.style.display = 'none';
            
            var user = auth.currentUser;
            if (!user) return;
            
            var data = {
                providerId: user.uid,
                roomType: document.getElementById('vacRoomType').value,
                monthlyPrice: parseInt(document.getElementById('vacPrice').value),
                available: parseInt(document.getElementById('vacAvailable').value),
                occupied: parseInt(document.getElementById('vacOccupied').value)
            };
            
            var editId = document.getElementById('vacEditId').value;
            
            var promise;
            if (editId) {
                promise = db.collection('vacancies').doc(editId).update(data);
            } else {
                promise = FirebaseServices.vacancies.create(data);
            }
            
            promise.then(function() {
                successEl.textContent = editId ? 'Vacancy updated!' : 'Vacancy added!';
                successEl.style.display = 'block';
                vacancyForm.reset();
                document.getElementById('vacEditId').value = '';
                document.getElementById('vacancySubmitBtn').innerHTML = '<i class="fas fa-save"></i> Save Vacancy';
                document.getElementById('vacancyCancelBtn').style.display = 'none';
                loadProviderVacanciesManage(user.uid);
                loadProviderDashboard(user.uid);
                syncFacilityVacancies(user.uid);
                setTimeout(function() { successEl.style.display = 'none'; }, 3000);
            }).catch(function(err) {
                errEl.textContent = 'Error: ' + err.message;
                errEl.style.display = 'block';
            });
        });
        
        var vacCancelBtn = document.getElementById('vacancyCancelBtn');
        if (vacCancelBtn) {
            vacCancelBtn.addEventListener('click', function() {
                vacancyForm.reset();
                document.getElementById('vacEditId').value = '';
                document.getElementById('vacancySubmitBtn').innerHTML = '<i class="fas fa-save"></i> Save Vacancy';
                this.style.display = 'none';
            });
        }
    }
    
    function syncFacilityVacancies(providerId) {
        FirebaseServices.vacancies.getByProvider(providerId).then(function(snap) {
            var totalAvailable = 0;
            snap.forEach(function(doc) {
                totalAvailable += doc.data().available || 0;
            });
            return FirebaseServices.facilities.getByProvider(providerId).then(function(facSnap) {
                if (!facSnap.empty) {
                    return FirebaseServices.facilities.update(facSnap.docs[0].id, { vacancies: totalAvailable });
                }
            });
        }).catch(function(err) {
            console.error('Error syncing facility vacancies:', err);
        });
    }
    
    // ==========================================
    // PROVIDER PORTAL - PRICING
    // ==========================================
    
    var pricingForm = document.getElementById('pricingForm');
    if (pricingForm) {
        // Load existing pricing
        auth.onAuthStateChanged(function(user) {
            if (user && window.location.pathname.indexOf('provider-portal') !== -1) {
                db.collection('providerPricing').doc(user.uid).get().then(function(doc) {
                    if (doc.exists) {
                        var p = doc.data();
                        if (document.getElementById('priceBase')) document.getElementById('priceBase').value = p.base || '';
                        if (document.getElementById('priceAssisted')) document.getElementById('priceAssisted').value = p.assisted || '';
                        if (document.getElementById('priceMemory')) document.getElementById('priceMemory').value = p.memory || '';
                        if (document.getElementById('priceSkilled')) document.getElementById('priceSkilled').value = p.skilled || '';
                        if (document.getElementById('priceNotes')) document.getElementById('priceNotes').value = p.notes || '';
                    }
                });
            }
        });
        
        pricingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var successEl = document.getElementById('pricingSuccess');
            var user = auth.currentUser;
            if (!user) return;
            
            var data = {
                base: parseInt(document.getElementById('priceBase').value) || 0,
                assisted: parseInt(document.getElementById('priceAssisted').value) || 0,
                memory: parseInt(document.getElementById('priceMemory').value) || 0,
                skilled: parseInt(document.getElementById('priceSkilled').value) || 0,
                notes: document.getElementById('priceNotes').value.trim(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            db.collection('providerPricing').doc(user.uid).set(data, { merge: true }).then(function() {
                // Also update linked facility pricing
                var prices = [data.base, data.assisted, data.memory, data.skilled].filter(function(p) { return p > 0; });
                var priceMin = prices.length ? Math.min.apply(null, prices) : 0;
                var priceMax = prices.length ? Math.max.apply(null, prices) : 0;
                return FirebaseServices.facilities.getByProvider(user.uid).then(function(facSnap) {
                    if (!facSnap.empty) {
                        return FirebaseServices.facilities.update(facSnap.docs[0].id, {
                            pricingFrom: priceMin,
                            pricingTo: priceMax
                        });
                    }
                });
            }).then(function() {
                successEl.textContent = 'Pricing saved!';
                successEl.style.display = 'block';
                setTimeout(function() { successEl.style.display = 'none'; }, 3000);
            }).catch(function(err) {
                successEl.textContent = 'Error: ' + err.message;
                successEl.style.display = 'block';
                successEl.style.background = '#FEF2F2';
                successEl.style.color = '#DC2626';
            });
        });
    }
    
    // ==========================================
    // PROVIDER PORTAL - PHOTOS
    // ==========================================
    
    var photoUploadArea = document.getElementById('photoUploadArea');
    var photoFileInput = document.getElementById('photoFileInput');
    var photoFileName = document.getElementById('photoFileName');
    var photoUploadBtn = document.getElementById('photoUploadBtn');
    
    if (photoUploadArea && photoFileInput) {
        photoUploadArea.addEventListener('click', function() {
            photoFileInput.click();
        });
        
        photoFileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                var names = Array.from(this.files).map(function(f) { return f.name; }).join(', ');
                photoFileName.textContent = this.files.length + ' file(s): ' + names;
                photoFileName.style.display = 'block';
                photoUploadBtn.style.display = 'inline-block';
            }
        });
        
        if (photoUploadBtn) {
            photoUploadBtn.addEventListener('click', function() {
                if (!photoFileInput.files.length || !auth.currentUser) return;
                
                var user = auth.currentUser;
                var category = document.getElementById('photoCategory').value;
                var files = photoFileInput.files;
                var uploaded = 0;
                
                photoUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                photoUploadBtn.disabled = true;
                
                Array.from(files).forEach(function(file) {
                    var storageRef = storage.ref('facility-photos/' + user.uid + '/' + Date.now() + '_' + file.name);
                    storageRef.put(file).then(function() {
                        return storageRef.getDownloadURL();
                    }).then(function(url) {
                        return db.collection('facilityPhotos').add({
                            userId: user.uid,
                            fileName: file.name,
                            fileUrl: url,
                            category: category,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }).then(function() {
                        uploaded++;
                        if (uploaded === files.length) {
                            photoFileName.textContent = 'All photos uploaded!';
                            photoUploadBtn.innerHTML = '<i class="fas fa-check"></i> Done';
                            photoUploadBtn.style.background = '#2F7D4A';
                            photoFileInput.value = '';
                            loadProviderPhotos(user.uid);
                            setTimeout(function() {
                                photoUploadBtn.style.display = 'none';
                                photoFileName.style.display = 'none';
                                photoUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
                                photoUploadBtn.style.background = '';
                                photoUploadBtn.disabled = false;
                            }, 2000);
                        }
                    }).catch(function(err) {
                        photoFileName.textContent = 'Upload failed: ' + err.message;
                        photoFileName.style.color = '#DC2626';
                        photoUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
                        photoUploadBtn.disabled = false;
                    });
                });
            });
        }
    }
    
    function loadProviderPhotos(userId) {
        var grid = document.getElementById('providerPhotosGrid');
        if (!grid) return;
        
        db.collection('facilityPhotos').where('userId', '==', userId).orderBy('createdAt', 'desc').get().then(function(snap) {
            if (snap.empty) {
                grid.innerHTML = '<div style="text-align:center; padding:40px; color:#6B7280; grid-column: 1/-1;">No photos uploaded yet.</div>';
                return;
            }
            
            grid.innerHTML = '';
            snap.forEach(function(doc) {
                var p = doc.data();
                grid.innerHTML += '\
                    <div style="position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 4/3;">\
                        <img src="' + p.fileUrl + '" alt="' + escapeHtml(p.fileName) + '" style="width: 100%; height: 100%; object-fit: cover;">\
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 8px 12px;">\
                            <span style="color: white; font-size: 12px;">' + escapeHtml(p.category) + '</span>\
                        </div>\
                        <button class="prov-photo-delete" data-id="' + doc.id + '" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.5); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 12px;"><i class="fas fa-times"></i></button>\
                    </div>\
                ';
            });
            
            document.querySelectorAll('.prov-photo-delete').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    if (!confirm('Delete this photo?')) return;
                    var photoId = this.getAttribute('data-id');
                    db.collection('facilityPhotos').doc(photoId).delete().then(function() {
                        loadProviderPhotos(userId);
                    });
                });
            });
        });
    }
    
    // ==========================================
    // PROVIDER PORTAL - SETTINGS
    // ==========================================
    
    function loadProviderSettings(userId) {
        db.collection('users').doc(userId).get().then(function(doc) {
            if (!doc.exists) return;
            var u = doc.data();
            
            var setIf = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
            setIf('provFacilityName', u.facilityName);
            setIf('provContactName', u.name);
            setIf('provEmail', u.email);
            setIf('provPhone', u.phone);
            setIf('provAddress', u.address);
            setIf('provCity', u.city);
            setIf('provState', u.state);
            setIf('provDescription', u.description);
        });
        
        // Also read from linked facility doc for additional fields
        FirebaseServices.facilities.getByProvider(userId).then(function(snap) {
            if (!snap.empty) {
                var f = snap.docs[0].data();
                var setIf = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
                setIf('provAddress', f.address || f.city ? (f.address || '') : '');
                setIf('provCity', f.city);
                setIf('provState', f.state);
                setIf('provDescription', f.description);
            }
        }).catch(function() {});
    }
    
    var provSettingsForm = document.getElementById('providerSettingsForm');
    if (provSettingsForm) {
        provSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var successEl = document.getElementById('providerSettingsSuccess');
            var user = auth.currentUser;
            if (!user) return;
            
            var facilityName = document.getElementById('provFacilityName').value.trim();
            
            db.collection('users').doc(user.uid).update({
                facilityName: facilityName,
                name: document.getElementById('provContactName').value.trim(),
                phone: document.getElementById('provPhone').value.trim(),
                address: document.getElementById('provAddress').value.trim(),
                city: document.getElementById('provCity').value.trim(),
                state: document.getElementById('provState').value.trim(),
                description: document.getElementById('provDescription').value.trim()
            }).then(function() {
                // Also update linked facility doc
                return FirebaseServices.facilities.getByProvider(user.uid).then(function(snap) {
                    if (!snap.empty) {
                        return FirebaseServices.facilities.update(snap.docs[0].id, {
                            facilityName: facilityName,
                            address: document.getElementById('provAddress').value.trim(),
                            city: document.getElementById('provCity').value.trim(),
                            state: document.getElementById('provState').value.trim(),
                            description: document.getElementById('provDescription').value.trim()
                        });
                    } else if (facilityName) {
                        // Create facility doc if none exists
                        return FirebaseServices.facilities.create({
                            facilityName: facilityName,
                            providerId: user.uid,
                            providerName: document.getElementById('provContactName').value.trim(),
                            city: document.getElementById('provCity').value.trim(),
                            state: document.getElementById('provState').value.trim(),
                            status: 'active'
                        });
                    }
                });
            }).then(function() {
                successEl.textContent = 'Facility profile updated!';
                successEl.style.display = 'block';
                var nameEl = document.getElementById('providerName');
                if (nameEl && facilityName) nameEl.textContent = facilityName;
                setTimeout(function() { successEl.style.display = 'none'; }, 3000);
            }).catch(function(err) {
                successEl.textContent = 'Error: ' + err.message;
                successEl.style.display = 'block';
                successEl.style.background = '#FEF2F2';
                successEl.style.color = '#DC2626';
            });
        });
    }
    
    // ==========================================
    // CAREGIVER PORTAL LOADER
    // ==========================================
    function loadCaregiverDashboard(userId) {
        var caregiverId = userId;
        
        var nameEl = document.getElementById('caregiverUserName');
        
        // Upcoming shifts
        FirebaseServices.shifts.getUpcoming(caregiverId).then(function(snap) {
            var el = document.getElementById('cgUpcomingShifts');
            if (el) el.textContent = snap.size;
            
            var tbody = document.getElementById('cgUpcomingTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No upcoming shifts.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var s = doc.data();
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(s.clientName) + '</strong></td>\
                        <td>' + FirebaseServices.formatDate(s.date) + '</td>\
                        <td>' + escapeHtml(s.startTime) + ' - ' + escapeHtml(s.endTime) + '</td>\
                        <td>' + escapeHtml(s.type) + '</td>\
                        <td>' + escapeHtml(s.rate) + '</td>\
                    </tr>\
                ';
            });
        }).catch(function() { setFallback('cgUpcomingShifts'); });
        
        // Available shifts
        FirebaseServices.shifts.getAvailable().then(function(snap) {
            var el = document.getElementById('cgAvailableShifts');
            if (el) el.textContent = snap.size;
            
            var tbody = document.getElementById('cgAvailableTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No available shifts at this time.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var s = doc.data();
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(s.clientName) + '</strong></td>\
                        <td>' + FirebaseServices.formatDate(s.date) + '</td>\
                        <td>' + escapeHtml(s.startTime) + ' - ' + escapeHtml(s.endTime) + '</td>\
                        <td>' + escapeHtml(s.type) + '</td>\
                        <td><button class="btn btn-gold accept-shift-btn" data-shift-id="' + doc.id + '" style="padding: 8px 16px; font-size: 13px;">Accept</button></td>\
                    </tr>\
                ';
            });
            
            // Attach accept handlers
            document.querySelectorAll('.accept-shift-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var shiftId = this.getAttribute('data-shift-id');
                    FirebaseServices.shifts.accept(shiftId, caregiverId).then(function() {
                        showNotification('Shift accepted successfully!', 'success');
                        loadCaregiverDashboard(caregiverId);
                    }).catch(function(err) {
                        showNotification('Error accepting shift.', 'error');
                        console.error(err);
                    });
                });
            });
        }).catch(function() { setFallback('cgAvailableShifts'); });
        
        // Credentials
        FirebaseServices.credentials.getByCaregiver(caregiverId).then(function(snap) {
            var tbody = document.getElementById('cgCredentialsTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#6B7280;">No credentials on file.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var c = doc.data();
                var statusClass = c.status === 'active' || c.status === 'cleared' ? 'active' : 'pending';
                
                tbody.innerHTML += '\
                    <tr>\
                        <td>' + escapeHtml(c.type) + '</td>\
                        <td><span class="status-badge ' + statusClass + '">' + (c.status.charAt(0).toUpperCase() + c.status.slice(1)) + '</span></td>\
                        <td>' + escapeHtml(c.expiry || '--') + '</td>\
                        <td><a href="' + (c.documentUrl || '#') + '" style="color: #081B3A; font-weight: 700;">View</a></td>\
                    </tr>\
                ';
            });
        }).catch(function(err) {
            console.error('Error loading credentials:', err);
        });
        
        // Hours calculation
        var hoursEl = document.getElementById('cgHoursMonth');
        if (hoursEl) hoursEl.textContent = '0';
        
        // Messages
        var msgEl = document.getElementById('cgUnreadMsgs');
        if (msgEl) msgEl.textContent = '0';
    }
    
    // ==========================================
    // UTILITY
    // ==========================================
    function setFallback(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value || '0';
    }
    
    // ==========================================
    // LOAD WEBSITE CONTENT FROM FIRESTORE
    // ==========================================
    loadWebsiteContent();
    
});
