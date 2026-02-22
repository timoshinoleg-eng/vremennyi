/**
 * ChatBot24 Studio v3.0 - Main JavaScript
 * UTM tracking, AOS, Form validation, Analytics
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 100,
            disable: function() { return window.innerWidth < 768; }
        });
    }

    // UTM Parameters tracking
    function getUTMParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source') || '',
            utm_medium: urlParams.get('utm_medium') || '',
            utm_campaign: urlParams.get('utm_campaign') || '',
            utm_content: urlParams.get('utm_content') || '',
            utm_term: urlParams.get('utm_term') || ''
        };
    }

    const utmParams = getUTMParams();

    // ========================================
    // HEADER SCROLL
    // ========================================
    const header = document.getElementById('header');
    function handleScroll() {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', throttle(handleScroll, 100), { passive: true });

    // ========================================
    // MOBILE MENU
    // ========================================
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    function toggleMobileMenu() {
        const isActive = burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileMenu.setAttribute('aria-hidden', !isActive);
        burger.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    if (burger) {
        burger.addEventListener('click', toggleMobileMenu);
    }

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        });
    });

    // ========================================
    // MODAL FORM
    // ========================================
    const modal = document.getElementById('formModal');
    const modalTriggers = document.querySelectorAll('[data-modal="form"]');
    const modalCloseBtns = document.querySelectorAll('[data-modal-close]');
    const formContainer = document.getElementById('formContainer');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    function openModal() {
        resetForm();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.focus();
        }, 100);
        sendAnalytics('cta_click');
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    modalTriggers.forEach(trigger => trigger.addEventListener('click', openModal));
    modalCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }

    // ========================================
    // PHONE MASK
    // ========================================
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') {
                    value = value.substring(1);
                }
                let formatted = '+7';
                if (value.length > 0) formatted += ' (' + value.substring(0, 3);
                if (value.length >= 3) formatted += ') ' + value.substring(3, 6);
                if (value.length >= 6) formatted += '-' + value.substring(6, 8);
                if (value.length >= 8) formatted += '-' + value.substring(8, 10);
                e.target.value = formatted;
            }
        });
    }

    // ========================================
    // FORM VALIDATION & SUBMIT
    // ========================================
    const leadForm = document.getElementById('leadForm');
    const submitBtn = document.getElementById('submitBtn');
    const retryBtn = document.getElementById('retryBtn');

    function showError(id, message) {
        const el = document.getElementById(id);
        if (el) el.textContent = message;
    }

    function hideError(id) {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    }

    function validateName(value) { return value.trim().length >= 2; }
    function validatePhone(value) { return value.replace(/\D/g, '').length >= 11; }
    function validateTelegram(value) { return !value || /^@?[a-zA-Z0-9_]{5,32}$/.test(value); }

    // Real-time validation
    const nameInput = document.getElementById('name');
    const telegramInput = document.getElementById('telegram');
    const consentInput = document.getElementById('consent');

    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (this.value && !validateName(this.value)) {
                showError('nameError', 'Введите имя (минимум 2 символа)');
            }
        });
        nameInput.addEventListener('input', function() {
            this.classList.remove('error');
            hideError('nameError');
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                showError('phoneError', 'Введите корректный номер телефона');
            }
        });
        phoneInput.addEventListener('input', function() {
            this.classList.remove('error');
            hideError('phoneError');
        });
    }

    if (telegramInput) {
        telegramInput.addEventListener('blur', function() {
            if (this.value && !validateTelegram(this.value)) {
                showError('telegramError', 'Формат: @username');
            }
        });
        telegramInput.addEventListener('input', function() {
            this.classList.remove('error');
            hideError('telegramError');
        });
    }

    if (consentInput) {
        consentInput.addEventListener('change', () => hideError('consentError'));
    }

    // Form submission
    if (leadForm) {
        leadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            let isValid = true;
            let firstErrorField = null;

            if (!validateName(nameInput.value)) {
                showError('nameError', 'Введите имя');
                nameInput.classList.add('error');
                isValid = false;
                if (!firstErrorField) firstErrorField = nameInput;
            }

            if (!validatePhone(phoneInput.value)) {
                showError('phoneError', 'Введите телефон');
                phoneInput.classList.add('error');
                isValid = false;
                if (!firstErrorField) firstErrorField = phoneInput;
            }

            if (telegramInput && telegramInput.value && !validateTelegram(telegramInput.value)) {
                showError('telegramError', 'Некорректный формат');
                telegramInput.classList.add('error');
                isValid = false;
                if (!firstErrorField) firstErrorField = telegramInput;
            }

            if (!consentInput.checked) {
                showError('consentError', 'Необходимо согласие на обработку персональных данных');
                isValid = false;
            }

            if (!isValid) {
                if (firstErrorField) firstErrorField.focus();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.querySelector('.submit-text').hidden = true;
            submitBtn.querySelector('.submit-loader').hidden = false;

            const formData = {
                name: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                telegram: telegramInput ? telegramInput.value.trim() || '—' : '—',
                businessType: document.getElementById('businessType')?.value || '—',
                timestamp: new Date().toLocaleString('ru-RU'),
                url: window.location.href,
                ...utmParams
            };

            try {
                const response = await fetch('/api/send-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    formContainer.hidden = true;
                    successMessage.hidden = false;
                    sendAnalytics('form_submit');
                    setTimeout(() => {
                        if (!successMessage.hidden) closeModal();
                    }, 5000);
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error('Form error:', error);
                formContainer.hidden = true;
                errorMessage.hidden = false;
            } finally {
                submitBtn.disabled = false;
                submitBtn.querySelector('.submit-text').hidden = false;
                submitBtn.querySelector('.submit-loader').hidden = true;
            }
        });
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            errorMessage.hidden = true;
            formContainer.hidden = false;
        });
    }

    function resetForm() {
        if (leadForm) {
            leadForm.reset();
            leadForm.querySelectorAll('.form-input').forEach(input => {
                input.classList.remove('error');
            });
            leadForm.querySelectorAll('.form-error').forEach(error => {
                error.textContent = '';
            });
        }
        formContainer.hidden = false;
        successMessage.hidden = true;
        errorMessage.hidden = true;
    }

    // ========================================
    // FAQ ACCORDION
    // ========================================
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.faq-question').forEach(q => {
                q.setAttribute('aria-expanded', 'false');
            });
            question.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) sendAnalytics('faq_open');
        });
    });

    // ========================================
    // ANIMATED COUNTERS
    // ========================================
    const counters = document.querySelectorAll('.counter[data-target]');
    
    function animateCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeOut);
            counter.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        }
        requestAnimationFrame(update);
    }

    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => observer.observe(counter));
    }

    // ========================================
    // ANALYTICS
    // ========================================
    function sendAnalytics(eventName) {
        if (typeof ym !== 'undefined' && YANDEX_METRICA_ID !== 'YANDEX_METRICA_ID') {
            ym(YANDEX_METRICA_ID, 'reachGoal', eventName);
        }
        console.log('Analytics:', eventName);
    }

    // Telegram widget click
    const telegramWidget = document.getElementById('telegramWidget');
    if (telegramWidget) {
        telegramWidget.addEventListener('click', () => {
            sendAnalytics('telegram_widget_click');
        });
    }

    // Scroll tracking
    let scroll50Tracked = false;
    let caseViewTracked = false;

    window.addEventListener('scroll', throttle(() => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > 50 && !scroll50Tracked) {
            sendAnalytics('scroll_50');
            scroll50Tracked = true;
        }

        const casesSection = document.getElementById('cases');
        if (casesSection && !caseViewTracked) {
            const rect = casesSection.getBoundingClientRect();
            const sectionMiddle = rect.top + rect.height / 2;
            if (sectionMiddle < window.innerHeight && sectionMiddle > 0) {
                sendAnalytics('case_view');
                caseViewTracked = true;
            }
        }
    }, 200), { passive: true });

    // ========================================
    // UTILITIES
    // ========================================
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    console.log('ChatBot24 Studio v3.0 - Initialized');
});
/* ChatBot24 Studio v3.1 - Main JS with testimonials carousel */

// Testimonials Carousel
function initTestimonialsCarousel() {
    const slider = document.querySelector('.testimonials-slider');
    if (!slider) return;
    
    const track = slider.querySelector('.testimonials-track');
    const prevBtn = slider.querySelector('.slider-btn-prev');
    const nextBtn = slider.querySelector('.slider-btn-next');
    const dotsContainer = slider.querySelector('.slider-dots');
    const cards = slider.querySelectorAll('.testimonial-card');
    
    if (!track || cards.length === 0) return;
    
    let currentIndex = 0;
    const totalCards = cards.length;
    let autoPlayInterval;
    
    // Create dots
    cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Перейти к отзыву ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
    
    const dots = slider.querySelectorAll('.slider-dot');
    
    function getVisibleCount() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }
    
    function updateSlider() {
        const visibleCount = getVisibleCount();
        const cardWidth = cards[0].offsetWidth + 24; // including gap
        const offset = -currentIndex * cardWidth;
        track.style.transform = `translateX(${offset}px)`;
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    function goToSlide(index) {
        const visibleCount = getVisibleCount();
        const maxIndex = totalCards - visibleCount;
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        updateSlider();
        resetAutoPlay();
    }
    
    function nextSlide() {
        const visibleCount = getVisibleCount();
        const maxIndex = totalCards - visibleCount;
        if (currentIndex < maxIndex) {
            goToSlide(currentIndex + 1);
        } else {
            goToSlide(0);
        }
    }
    
    function prevSlide() {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        }
    }
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }
    
    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }
    
    // Event listeners
    prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
    nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
    
    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });
    
    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    slider.addEventListener('mouseleave', startAutoPlay);
    
    // Update on resize
    window.addEventListener('resize', throttle(updateSlider, 200));
    
    // Init
    updateSlider();
    startAutoPlay();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTestimonialsCarousel);

// Utility functions
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
