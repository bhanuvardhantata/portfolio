document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. DYNAMIC COPYRIGHT YEAR
    // ==========================================
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================
    // THEME TOGGLE (LIGHT / DARK MODE)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');

    // Retrieve saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggleIcon) {
            themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
        }
    }

    if (themeToggleBtn && themeToggleIcon) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            if (isLight) {
                localStorage.setItem('theme', 'light');
                themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                localStorage.setItem('theme', 'dark');
                themeToggleIcon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }

    // ==========================================
    // 2. MOBILE NAVIGATION DRAWER
    // ==========================================
    const mobileNavBtn = document.getElementById('mobile-nav-btn');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileNavBtn && mainNav) {
        mobileNavBtn.addEventListener('click', () => {
            const expanded = mobileNavBtn.getAttribute('aria-expanded') === 'true';
            mobileNavBtn.setAttribute('aria-expanded', !expanded);
            mainNav.classList.toggle('active');
            
            // Toggle hamburger icon between bars and times (close)
            const icon = mobileNavBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        // Close drawer when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavBtn.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('active');
                const icon = mobileNavBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
        });
    }

    // ==========================================
    // 3. SCROLL PROGRESS & SHRINKING HEADER
    // ==========================================
    const header = document.getElementById('main-header');
    const progressBar = document.getElementById('scroll-progress-bar');
    const scrollDistanceThreshold = 50;

    const handleScrollEffects = () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Update Scroll Progress Bar
        if (progressBar && docHeight > 0) {
            const scrollPercent = (scrollY / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        }

        // Shrinking header class toggle
        if (header) {
            if (scrollY > scrollDistanceThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };

    window.addEventListener('scroll', handleScrollEffects, { passive: true });
    // Initial run to capture correct state on load
    handleScrollEffects();

    // ==========================================
    // 4. INTERACTIVE BACKGROUND (CANVAS PARTICLES)
    // ==========================================
    const canvas = document.getElementById('bg-canvas');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const mouse = {
            x: null,
            y: null,
            radius: 120
        };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        }, { passive: true });

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }, { passive: true });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2.5 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = Math.random() * 20 + 2;
                
                // Color gradient (Salesforce blue vs Agentforce violet)
                const isSfBlue = Math.random() > 0.35;
                this.color = isSfBlue ? 'rgba(1, 118, 211, 0.25)' : 'rgba(124, 58, 237, 0.18)';
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // If mouse position is defined, interact
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;

                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = forceDirectionX * force * this.density * 0.7;
                        let directionY = forceDirectionY * force * this.density * 0.7;
                        
                        // Push away from mouse
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        // Slowly return to base coordinate
                        if (this.x !== this.baseX) {
                            let dxBase = this.x - this.baseX;
                            this.x -= dxBase / 15;
                        }
                        if (this.y !== this.baseY) {
                            let dyBase = this.y - this.baseY;
                            this.y -= dyBase / 15;
                        }
                    }
                } else {
                    // Slowly drift back to base coordinate
                    if (this.x !== this.baseX) {
                        let dxBase = this.x - this.baseX;
                        this.x -= dxBase / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dyBase = this.y - this.baseY;
                        this.y -= dyBase / 20;
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            const count = Math.min(60, Math.floor((width * height) / 25000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Render connections if close
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        const alpha = (100 - dist) / 100 * 0.08;
                        ctx.strokeStyle = `rgba(1, 118, 211, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            animationFrameId = requestAnimationFrame(animateParticles);
        };

        // Initialize and animate
        initParticles();
        animateParticles();

        // Optimized execution: stop loop when tab is hidden to save resources
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animateParticles();
            }
        });
    }

    // ==========================================
    // 5. SCROLL ENTRANCE INTERSECTION OBSERVER
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-in-up');
    
    // Observer for fade-in animations
    const entryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entryObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => entryObserver.observe(el));

    // ==========================================
    // 6. CERTIFICATIONS LIVE GRID FILTERING
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const certCards = document.querySelectorAll('.cert-card');
    const certsGrid = document.getElementById('certs-grid');

    if (filterButtons.length && certCards.length) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button classes
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // Apply opacity and transform before hiding/showing for nice visuals
                certCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'flex';
                        // Small timeout to allow browser layout calculation before opacity transition
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(15px) scale(0.95)';
                        // Wait for transition to finish before display: none
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ==========================================
    // 7. SECURE INTERACTIVE CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('portfolio-contact-form');
    const formStatus = document.getElementById('form-feedback-status');
    const submitBtn = document.getElementById('form-submit-btn');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Check form validity using HTML5 API
            if (!contactForm.checkValidity()) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please make sure all fields are correctly filled.';
                
                // Trigger native browser invalid alerts visually
                contactForm.reportValidity();
                return;
            }

            // Disable submit button and show loading sequence
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending Message... <i class="fa-solid fa-circle-notch fa-spin"></i>';
            formStatus.style.display = 'none';

            // Extract inputs safely (resilient to simple injection)
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            // Simulate server POST with delay
            setTimeout(() => {
                // Mock successful delivery
                formStatus.className = 'form-status success';
                formStatus.textContent = `Thank you, ${name}! Your message has been successfully received. Bhanu will review your request and get back to you at ${email} shortly.`;
                
                // Clear the form
                contactForm.reset();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                
                // Scroll slightly to let the status be fully visible
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1800);
        });
    }

    // ==========================================
    // 8. ANIMATED HERO STATS (COUNTER ANIMATION)
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-number[data-count-target]');

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-count-target'), 10);
        const suffix = el.getAttribute('data-count-suffix') || '';
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const current = Math.round(easedProgress * target);

            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ==========================================
    // 9. ANIMATED SKILL BARS
    // ==========================================
    const skillBarFills = document.querySelectorAll('.skill-bar-fill');
    const skillBarPercents = document.querySelectorAll('.skill-bar-percent[data-target]');

    const animateSkillPercent = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1500;
        const startTime = performance.now();

        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const updatePercent = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const current = Math.round(easedProgress * target);

            el.textContent = current + '%';

            // Also update the aria-valuenow on the track
            const track = el.closest('.skill-bar-item')?.querySelector('.skill-bar-track');
            if (track) {
                track.setAttribute('aria-valuenow', current);
            }

            if (progress < 1) {
                requestAnimationFrame(updatePercent);
            }
        };

        requestAnimationFrame(updatePercent);
    };

    const skillBarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate the fill bar
                entry.target.classList.add('animate');

                // Find and animate the corresponding percentage text
                const item = entry.target.closest('.skill-bar-item');
                if (item) {
                    const percentEl = item.querySelector('.skill-bar-percent[data-target]');
                    if (percentEl) {
                        animateSkillPercent(percentEl);
                    }
                }

                skillBarObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -30px 0px'
    });

    skillBarFills.forEach(el => skillBarObserver.observe(el));

    // ==========================================
    // 10. AI CHATBOT WIDGET (Mock Responses)
    // ==========================================
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatbotPanel = document.getElementById('chatbot-panel');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Knowledge base for the AI assistant
    const knowledgeBase = {
        experience: "Bhanu Vardhan has 9+ years of professional experience in Salesforce development and architecture. He currently works as a Senior Specialist at AT&T India (Jan 2025 - Present). Previously, he was a Specialist Development Lead at AT&T (Oct 2023 - Dec 2024), Consultant at Deloitte (June 2022 - Oct 2023), Business Technology Analyst at Deloitte (Nov 2020 - May 2022), and System Engineer at Infosys (Apr 2018 - Nov 2020). He started his career as an Intern at Siemens Building Technologies (June 2017 - Jan 2018).",
        certifications: "Bhanu holds 13 Salesforce certifications: Application Architect, Platform Data Architect, Platform Sharing and Visibility Architect, Platform Identity and Access Management Architect, Platform Integration Architect, Platform Foundations, Platform App Builder, JavaScript Developer, Platform Developer II, Platform Developer (PDI), OmniStudio Developer, Agentforce Specialist, and OmniStudio Consultant.",
        skills: "Bhanu's key skills include: AI & Automation (Agentforce, Einstein Bots, CRM Analytics), Salesforce Architecture (Application Architecture, Data Architecture, Integration Design & Governance), OmniStudio & Vlocity (OmniScripts, FlexCards, Communications Cloud, DataRaptors, Integration Procedures), and Core Development (Apex Programming, Lightning Web Components, JavaScript, Aura Frameworks).",
        achievements: "Bhanu is an Agentblazer Legend (highest tier of the Agentblazer community program) and a Double Star Ranger on Salesforce Trailhead, representing extensive learning across hundreds of modules, projects, and superbadges.",
        projects: "Key projects include: 1) AT&T Agentforce Intelligent Automation — Designed autonomous AI agents using Agentforce for customer service workflows. 2) AT&T Communications Cloud Migration — Led migration of legacy telecom workflows to Salesforce Communications Cloud. 3) Verizon Quote-to-Order CPQ Platform — Built a full CPQ management system using Vlocity and Communities. 4) M1 Mobile Self-Service Subscription Portal — Developed an end-to-end web platform for mobile subscription management using Vlocity, Heroku, and MuleSoft.",
        contact: "You can reach Bhanu via email at bhanu0957@gmail.com, on LinkedIn at linkedin.com/in/bhanu-vardhan-ba04b8a9, on Salesforce Trailblazer at salesforce.com/trailblazer/bvardhan, or chat directly via WhatsApp at +91 95333 94003. He is based in Hyderabad, India."
    };

    const addMessage = (text, isUser = false) => {
        const msgEl = document.createElement('div');
        msgEl.classList.add('chat-message', isUser ? 'user' : 'bot');
        msgEl.textContent = text;
        chatbotMessages.appendChild(msgEl);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const showTyping = () => {
        const typingEl = document.createElement('div');
        typingEl.classList.add('chat-typing');
        typingEl.id = 'chat-typing-indicator';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        chatbotMessages.appendChild(typingEl);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const removeTyping = () => {
        const typingEl = document.getElementById('chat-typing-indicator');
        if (typingEl) typingEl.remove();
    };

    const handleQuickOptionClick = (btn) => {
        const topic = btn.getAttribute('data-topic');
        if (!topic) return;

        const questionText = btn.textContent.trim();
        addMessage(questionText, true);

        // Disable options during typing to prevent double clicks
        const buttons = document.querySelectorAll('.quick-opt-btn:not(.whatsapp-opt-btn)');
        buttons.forEach(b => b.disabled = true);

        showTyping();

        // Simulate AI thinking delay
        const delay = 500 + Math.random() * 400;
        setTimeout(() => {
            removeTyping();
            let response = knowledgeBase[topic] || "I don't have information on that topic.";
            addMessage(response);
            
            // Re-enable options
            buttons.forEach(b => b.disabled = false);
        }, delay);
    };

    if (chatbotFab && chatbotPanel) {
        chatbotFab.addEventListener('click', () => {
            const isOpen = chatbotPanel.classList.toggle('open');
            chatbotFab.innerHTML = isOpen 
                ? '<i class="fa-solid fa-xmark"></i>' 
                : '<i class="fa-solid fa-comments"></i>';
        });

        chatbotClose.addEventListener('click', () => {
            chatbotPanel.classList.remove('open');
            chatbotFab.innerHTML = '<i class="fa-solid fa-comments"></i>';
        });

        // Add event listeners to quick action buttons
        const quickOptionBtns = document.querySelectorAll('.quick-opt-btn:not(.whatsapp-opt-btn)');
        quickOptionBtns.forEach(btn => {
            btn.addEventListener('click', () => handleQuickOptionClick(btn));
        });
    }
});
