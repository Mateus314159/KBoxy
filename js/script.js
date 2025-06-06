// Defina a URL base da sua API aqui (rota relativa funcionará tanto em dev quanto em produção)
const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const preloader = document.querySelector('.preloader');
    const header = document.querySelector('.header');

    // --- Seletores do Menu Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // --- Setor vídeo banner ---
    const introVideo = document.getElementById('intro-video');
    const bannerContent = document.querySelector('#home .banner-content');

    // --- Seletores do Botão Voltar ao Topo ---
    const backToTopBtn = document.getElementById('back-to-top');

    // --- Seletor do Ano no Rodapé ---
    const currentYearSpan = document.getElementById('currentYear');

    // --- Carrossel Swiper para Boxes Mobile ---
    const boxCarouselMobile = document.querySelector('.box-carousel-mobile');
    const swiperWrapper = boxCarouselMobile ? boxCarouselMobile.querySelector('.swiper-wrapper') : null;
    const desktopBoxCards = document.querySelectorAll('.boxes-grid .box-card');

    // --- Seletores para o Modal de Detalhes da Box ---
    const boxDetailsModal = document.getElementById('boxDetailsModal');
    const closeBoxDetailsModalBtn = boxDetailsModal ? boxDetailsModal.querySelector('.close-modal-btn') : null;
    const modalBoxImage = document.getElementById('modalBoxImage');
    const modalBoxName = document.getElementById('modalBoxName');
    const modalBoxPrice = document.getElementById('modalBoxPrice');
    const modalBoxDescriptionFull = document.getElementById('modalBoxDescriptionFull');

    // --- Seletores para Ações do Usuário (Login/Cadastro Dropdown) ---
    // Serão manipulados dentro das funções específicas

    // --- Seletores para o Modal de Login ---
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const closeLoginModalBtnElem = document.getElementById('close-login-modal-btn');
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const toggleLoginPasswordBtn = document.getElementById('toggle-login-password');
    const switchToRegisterBtnFromLogin = document.getElementById('switch-to-register-btn');

    // --- Seletores para o Modal de Cadastro ---
    const registerModalOverlay = document.getElementById('register-modal-overlay');
    const closeRegisterModalBtnElem = document.getElementById('close-register-modal-btn');
    const registerForm = document.getElementById('register-form');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const toggleRegisterPasswordBtn = document.getElementById('toggle-register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
    const toggleRegisterConfirmPasswordBtn = document.getElementById('toggle-register-confirm-password');
    const switchToLoginBtnFromRegister = document.getElementById('switch-to-login-from-register-btn');

    // --- Seletores para o Modal de Planos de Assinatura ---
    const subscriptionPlansModal = document.getElementById('subscriptionPlansModal');
    const closeSubscriptionPlansModalBtn = document.getElementById('close-subscription-plans-modal-btn');
    const subscriptionBoxNameModalTitleElem = document.getElementById('subscriptionBoxNameModalTitle');
    const subscriptionPlansListElem = document.getElementById('subscriptionPlansList');

    // --- Dados das Boxes (Detalhes) ---
    const boxDetailsData = {
        firstLove: {
            name: "K-BOXY - First Love (Detalhes)",
            price: "R$ 69,90 (Preço base)",
            image: "images/FLcapa.png",
            size: "Tamanho da caixa: 20 x 15 x 10 cm",
            minItems: 5,
            description: "A escolha ideal para quem quer entrar no universo K-pop com estilo! Esta é a descrição detalhada da First Love.",
            contents: [
                "Photocards colecionáveis com arte personalizada K-BOXY",
                "Mini pôsteres ou stickers exclusivos temáticos",
                "Brindes como bottons, chaveiros ou pins personalizados K-BOXY",
                "Itens de papelaria K-pop (canetas, marcadores) com design K-BOXY"
            ]
        },
        idolBox: {
            name: "K-BOXY Lover (Detalhes)",
            price: "R$ 79,90 (Preço base)",
            image: "images/KLcapa.png",
            size: "25 x 20 x 12 cm",
            minItems: 7,
            description: "Para quem já se apaixonou pelo universo K-pop! Descrição detalhada da K-BOXY Lover.",
            contents: [
                "Photocards raros ou especiais (holográficos, etc.)",
                "Pôsteres de alta qualidade",
                "Acessórios temáticos (ex: lightstick keychain)",
                "Itens de papelaria premium e decorativos K-BOXY",
                "Um item surpresa de maior valor"
            ]
        },
        legendBox: {
            name: "K-BOXY True Love (Detalhes)",
            price: "R$ 99,90 (Preço base)",
            image: "images/TLcapa.png",
            size: "30 x 25 x 15 cm",
            minItems: 10,
            description: "Uma caixa especial que celebra o amor verdadeiro! Descrição detalhada da K-BOXY True Love.",
            contents: [
                "Álbum de K-pop ou item de colecionador",
                "Photocards premium e limitados",
                "Itens de vestuário ou acessórios de moda K-pop",
                "Cosméticos coreanos populares",
                "Colecionáveis exclusivos da K-Boxy"
            ]
        }
    };

    // --- Dados dos Planos de Assinatura ---
    const subscriptionPlansData = {
        firstLove: {
            displayName: "K-BOXY First Love",
            plans: [
                { id: "firstLove", name: "Plano Mensal (Compra Única) – R$ 69,90", type: "unique" },
                { id: "fl_semi_annual", name: "Plano Semestral", price: "R$ 54,90/mês", description: "Receba 6 boxes, uma por mês. Cobrança mensal.", type: "subscription_6" },
                { id: "fl_annual", name: "Plano Anual", price: "R$ 49,90/mês", description: "Receba 12 boxes, uma por mês. Cobrança mensal.", type: "subscription_12" }
            ]
        },
        idolBox: {
            displayName: "K-BOXY Lover",
            plans: [
                { id: "idolBox", name: "Plano Mensal (Compra Única) – R$ 79,90", type: "unique" },
                { id: "il_semi_annual", name: "Plano Semestral", price: "R$ 64,90/mês", description: "Receba 6 boxes, uma por mês. Cobrança mensal.", type: "subscription_6" },
                { id: "il_annual", name: "Plano Anual", price: "R$ 59,90/mês", description: "Receba 12 boxes, uma por mês. Cobrança mensal.", type: "subscription_12" }
            ]
        },
        legendBox: {
            displayName: "K-BOXY True Love",
            plans: [
                { id: "legendBox", name: "Plano Mensal (Compra Única) – R$ 99,90", type: "unique" },
                { id: "tl_semi_annual", name: "Plano Semestral", price: "R$ 84,90/mês", description: "Receba 6 boxes, uma por mês. Cobrança mensal.", type: "subscription_6" },
                { id: "tl_annual", name: "Plano Anual", price: "R$ 79,90/mês", description: "Receba 12 boxes, uma por mês. Cobrança mensal.", type: "subscription_12" }
            ]
        }
    };

    // =========================================================================
    // FUNÇÕES DE LOGIN, LOGOUT E ATUALIZAÇÃO DA UI
    // =========================================================================

    // Torna esta função global para uso também em outros contextos
    window.updateUIAfterLogin = function() {
        const currentLoginActionButton = document.getElementById('login-action-button');
        const currentUserDropdownMenu = document.getElementById('user-dropdown');
        const token = localStorage.getItem('authToken');

        if (token) {
            // Usuário está logado
            const userAvatarUrl = localStorage.getItem('userAvatarUrl');
            if (currentLoginActionButton) {
                if (userAvatarUrl && userAvatarUrl !== "null" && userAvatarUrl !== "undefined" && userAvatarUrl.trim() !== "") {
                    currentLoginActionButton.innerHTML = `<img src="${userAvatarUrl}" alt="Avatar" class="header-user-avatar">`;
                } else {
                    currentLoginActionButton.innerHTML = '<i class="fas fa-user-check"></i>';
                }
            }
            if (currentUserDropdownMenu) {
                currentUserDropdownMenu.innerHTML = `
                    <a href="minha-conta.html#pedidos" class="user-dropdown-link">Seus Pedidos</a>
                    <a href="minha-conta.html#perfil" class="user-dropdown-link">Conta</a>
                    <a href="#" id="dropdown-logout-link" class="user-dropdown-link">Sair</a>
                `;
                const logoutLink = document.getElementById('dropdown-logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        handleLogout();
                    });
                }
                const dropdownLinks = currentUserDropdownMenu.querySelectorAll('a.user-dropdown-link');
                dropdownLinks.forEach(link => {
                    if (link.id !== 'dropdown-logout-link') {
                        link.addEventListener('click', function() {
                            if (currentUserDropdownMenu.classList.contains('active')) {
                                currentUserDropdownMenu.classList.remove('active');
                            }
                        });
                    }
                });
            }
        } else {
            // Usuário NÃO está logado
            if (currentLoginActionButton) {
                currentLoginActionButton.innerHTML = '<i class="fas fa-user-circle"></i>';
            }
            if (currentUserDropdownMenu) {
                currentUserDropdownMenu.innerHTML = `
                    <a href="#" id="dropdown-login-link">Login</a>
                    <a href="#" id="dropdown-register-link">Cadastrar</a>
                `;
                const loginLink = document.getElementById('dropdown-login-link');
                if (loginLink) {
                    loginLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (currentUserDropdownMenu) currentUserDropdownMenu.classList.remove('active');
                        openLoginModal();
                    });
                }
                const registerLink = document.getElementById('dropdown-register-link');
                if (registerLink) {
                    registerLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (currentUserDropdownMenu) currentUserDropdownMenu.classList.remove('active');
                        openRegisterModal();
                    });
                }
            }
        }
    };

    // Torna logout global também
    window.handleLogout = function(event) {
        if (event) event.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userAvatarUrl');
        alert('Você foi desconectado.');
        updateUIAfterLogin();
        const currentUserDropdownMenu = document.getElementById('user-dropdown');
        if (currentUserDropdownMenu) currentUserDropdownMenu.classList.remove('active');

        if (window.location.pathname.includes('minha-conta.html')) {
            window.location.href = 'index.html';
        }
    };

    // =========================================================================
    // LÓGICA DOS MODAIS
    // =========================================================================

    function openLoginModal() {
        if (registerModalOverlay && registerModalOverlay.classList.contains('active')) closeRegisterModal();
        if (subscriptionPlansModal && subscriptionPlansModal.classList.contains('active')) closeSubscriptionPlansModal();
        if (loginModalOverlay) {
            loginModalOverlay.style.display = 'flex';
            setTimeout(() => {
                loginModalOverlay.classList.add('active');
                body.classList.add('no-scroll-modal');
            }, 10);
        }
    }
    function closeLoginModal() {
        if (loginModalOverlay) {
            loginModalOverlay.classList.remove('active');
            body.classList.remove('no-scroll-modal');
            setTimeout(() => {
                if (!loginModalOverlay.classList.contains('active')) loginModalOverlay.style.display = 'none';
            }, 300);
        }
    }

    function openRegisterModal() {
        if (loginModalOverlay && loginModalOverlay.classList.contains('active')) closeLoginModal();
        if (subscriptionPlansModal && subscriptionPlansModal.classList.contains('active')) closeSubscriptionPlansModal();
        if (registerModalOverlay) {
            registerModalOverlay.style.display = 'flex';
            setTimeout(() => {
                registerModalOverlay.classList.add('active');
                body.classList.add('no-scroll-modal');
            }, 10);
        }
    }
    function closeRegisterModal() {
        if (registerModalOverlay) {
            registerModalOverlay.classList.remove('active');
            body.classList.remove('no-scroll-modal');
            setTimeout(() => {
                if (!registerModalOverlay.classList.contains('active')) registerModalOverlay.style.display = 'none';
            }, 300);
        }
    }

    function openBoxModal(boxId) {
        const details = boxDetailsData[boxId];
        if (details && boxDetailsModal) {
            if (modalBoxImage) modalBoxImage.src = details.image || 'https://via.placeholder.com/400x300/ccc/000?text=Imagem+Indisponível';
            if (modalBoxName) modalBoxName.textContent = details.name;
            if (modalBoxPrice) modalBoxPrice.textContent = details.price;

            if (modalBoxDescriptionFull) {
                let descriptionHtml = `<p>${details.description}</p>`;
                if (details.size) descriptionHtml += `<p><strong>Tamanho da caixa:</strong> ${details.size}</p>`;
                if (details.minItems) descriptionHtml += `<p><strong>Quantidade mínima de itens:</strong> ${details.minItems}</p>`;
                if (details.contents && details.contents.length > 0) {
                    descriptionHtml += `<h4>O que pode vir na box:</h4><ul>`;
                    details.contents.forEach(item => { descriptionHtml += `<li>${item}</li>`; });
                    descriptionHtml += `</ul>`;
                }
                modalBoxDescriptionFull.innerHTML = descriptionHtml;
            }
            boxDetailsModal.style.display = "flex";
            body.classList.add('no-scroll-modal');
        } else {
            console.error("Detalhes da box não encontrados para o ID:", boxId, "ou o elemento boxDetailsModal não foi encontrado.");
        }
    }
    function closeBoxDetailsModal() {
        if (boxDetailsModal) {
            boxDetailsModal.style.display = "none";
            body.classList.remove('no-scroll-modal');
        }
    }

    function openSubscriptionPlansModal(boxId) {
        const boxData = subscriptionPlansData[boxId];
        if (!boxData || !subscriptionPlansModal) {
            console.error("Dados dos planos ou modal de planos não encontrados para:", boxId);
            return;
        }

        if (subscriptionBoxNameModalTitleElem) {
            subscriptionBoxNameModalTitleElem.textContent = boxData.displayName;
        }
        if (subscriptionPlansListElem) {
            subscriptionPlansListElem.innerHTML = '';
            boxData.plans.forEach(plan => {
                const planElement = document.createElement('div');
                planElement.classList.add('plan-item');
                planElement.dataset.planId = plan.id;
                planElement.dataset.planType = plan.type;
                planElement.dataset.boxType = boxId;

                let planPriceInfo = `<p class="plan-price">${plan.price}</p>`;

                planElement.innerHTML = `
                    <h4>${plan.name}</h4>
                    ${planPriceInfo}
                    <p class="plan-description">${plan.description}</p>
                    <button class="btn btn-secondary btn-small btn-select-plan">Selecionar Plano</button>
                `;

                planElement.querySelector('.btn-select-plan').addEventListener('click', function() {
                    const selectedBoxType = this.closest('.plan-item').dataset.boxType;
                    const selectedPlanId = this.closest('.plan-item').dataset.planId;
                    createOrder(selectedBoxType, selectedPlanId);
                    closeSubscriptionPlansModal();
                });
                subscriptionPlansListElem.appendChild(planElement);
            });
        }

        subscriptionPlansModal.style.display = 'flex';
        setTimeout(() => {
            subscriptionPlansModal.classList.add('active');
            body.classList.add('no-scroll-modal');
        }, 10);
    }
    function closeSubscriptionPlansModal() {
        if (subscriptionPlansModal) {
            subscriptionPlansModal.classList.remove('active');
            body.classList.remove('no-scroll-modal');
            setTimeout(() => {
                if (!subscriptionPlansModal.classList.contains('active')) {
                    subscriptionPlansModal.style.display = 'none';
                }
            }, 300);
        }
    }

    // =========================================================================
    // LÓGICA DE EVENTOS E MANIPULAÇÃO DO DOM
    // =========================================================================

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = loginEmailInput ? loginEmailInput.value.trim() : '';
            const password = loginPasswordInput ? loginPasswordInput.value.trim() : '';

            if (!email || !password) {
                alert('Por favor, preencha email e senha.');
                return;
            }

            fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200 && body.token) {
                    localStorage.setItem('authToken', body.token);
                    localStorage.setItem('userId', body.userId);
                    if (body.avatarUrl) {
                        localStorage.setItem('userAvatarUrl', body.avatarUrl);
                    }
                    alert('Login realizado com sucesso!');
                    closeLoginModal();
                    updateUIAfterLogin();
                } else {
                    alert(body.message || 'Erro ao fazer login. Verifique suas credenciais.');
                }
            })
            .catch(error => {
                console.error('Erro na requisição de login:', error);
                alert('Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.');
            });
        });
    }
    if (toggleLoginPasswordBtn && loginPasswordInput) {
        toggleLoginPasswordBtn.addEventListener('click', function() {
            const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPasswordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    if (closeLoginModalBtnElem) {
        closeLoginModalBtnElem.addEventListener('click', closeLoginModal);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = registerEmailInput ? registerEmailInput.value.trim() : '';
            const password = registerPasswordInput ? registerPasswordInput.value.trim() : '';
            const confirmPassword = registerConfirmPasswordInput ? registerConfirmPasswordInput.value.trim() : '';

            if (!email || !password || !confirmPassword) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            if (password.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }

            fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status === 201) {
                    alert(body.message || 'Usuário criado com sucesso! Por favor, faça o login.');
                    closeRegisterModal();
                    openLoginModal();
                } else {
                    alert(body.message || body.error || 'Erro ao criar usuário. Verifique os dados ou tente novamente.');
                }
            })
            .catch(error => {
                console.error('Erro na requisição de cadastro:', error);
                alert('Ocorreu um erro ao tentar cadastrar. Verifique sua conexão ou tente novamente mais tarde.');
            });
        });
    }
    if (toggleRegisterPasswordBtn && registerPasswordInput) {
        toggleRegisterPasswordBtn.addEventListener('click', function() {
            const type = registerPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            registerPasswordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    if (toggleRegisterConfirmPasswordBtn && registerConfirmPasswordInput) {
        toggleRegisterConfirmPasswordBtn.addEventListener('click', function() {
            const type = registerConfirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            registerConfirmPasswordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    if (closeRegisterModalBtnElem) {
        closeRegisterModalBtnElem.addEventListener('click', closeRegisterModal);
    }

    if (switchToRegisterBtnFromLogin) {
        switchToRegisterBtnFromLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeLoginModal();
            openRegisterModal();
        });
    }
    if (switchToLoginBtnFromRegister) {
        switchToLoginBtnFromRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeRegisterModal();
            openLoginModal();
        });
    }

    function createOrder(boxType, planIdForBackend) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Você precisa estar logado para iniciar o checkout.');
            openLoginModal();
            return;
        }
        window.location.href = `/purchase?plan=${planIdForBackend}`;
    }

    const subscribeButtons = document.querySelectorAll('.box-card .btn-ver-mais');
    if (subscribeButtons) {
        subscribeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const boxCard = this.closest('.box-card');
                if (boxCard) {
                    const boxId = boxCard.dataset.boxid;
                    if (boxId) {
                        openSubscriptionPlansModal(boxId);
                    } else {
                        console.error("data-boxid não encontrado no card.");
                    }
                }
            });
        });
    }
    if (closeSubscriptionPlansModalBtn) {
        closeSubscriptionPlansModalBtn.addEventListener('click', closeSubscriptionPlansModal);
    }
    if (closeBoxDetailsModalBtn) {
        closeBoxDetailsModalBtn.addEventListener('click', closeBoxDetailsModal);
    }

    // =========================================================================
    // LÓGICA DE UI ORIGINAL (Pré-carregamento, Header, Menu, Scroll, Vídeo, AOS, Swiper etc.)
    // =========================================================================

    const bannerTitleForAnimation = document.querySelector('.banner-title');
    if (bannerTitleForAnimation) {
        const originalText = bannerTitleForAnimation.textContent;
        const phraseToModify = "K-Pop Box!";
        let newHtml = '';
        const phraseStartIndex = originalText.indexOf(phraseToModify);
        const phraseEndIndex = (phraseStartIndex !== -1) ? phraseStartIndex + phraseToModify.length : -1;
        originalText.split('').forEach((char, index) => {
            if (phraseStartIndex !== -1 && index === phraseStartIndex && phraseStartIndex !== 0) newHtml += '<br>';
            if (char.trim() === '') newHtml += ' ';
            else {
                let classes = 'animated-letter';
                if (phraseStartIndex !== -1 && index >= phraseStartIndex && index < phraseEndIndex) classes += ' highlight-letter';
                newHtml += `<span class="${classes}">${char}</span>`;
            }
        });
        bannerTitleForAnimation.innerHTML = newHtml;
    }

    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('loaded');
            setTimeout(() => { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 500);
        });
    }

    function handleScrollHeader() {
        if (header) {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    }

    if (introVideo && document.getElementById('home')) {
        const bannerElementForVideo = document.getElementById('home');
        if (bannerElementForVideo) bannerElementForVideo.style.backgroundImage = 'none';
        introVideo.onended = () => console.log("Vídeo de introdução terminou.");
        introVideo.onerror = () => {
            console.error("Erro ao carregar o vídeo de introdução.");
            introVideo.style.display = 'none';
        };
        const playPromise = introVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Vídeo de introdução tocando.");
                if (bannerContent && typeof AOS !== 'undefined' && AOS) AOS.refreshHard();
            }).catch(error => {
                console.warn("Autoplay do vídeo de introdução foi impedido:", error);
                introVideo.style.display = 'none';
            });
        }
    }

    if (menuToggle && navMenu) {
        let openIcon = menuToggle.querySelector('.fa-bars');
        let closeIconElement = menuToggle.querySelector('.fa-times');
        if (!openIcon) {
            openIcon = document.createElement('i');
            openIcon.classList.add('fas', 'fa-bars');
            menuToggle.prepend(openIcon);
        }
        if (!closeIconElement) {
            closeIconElement = document.createElement('i');
            closeIconElement.classList.add('fas', 'fa-times');
            closeIconElement.style.display = 'none';
            menuToggle.appendChild(closeIconElement);
        }

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            body.classList.toggle('no-scroll');
            if (navMenu.classList.contains('active')) {
                openIcon.style.display = 'none';
                closeIconElement.style.display = 'block';
            } else {
                openIcon.style.display = 'block';
                closeIconElement.style.display = 'none';
            }
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    body.classList.remove('no-scroll');
                    openIcon.style.display = 'block';
                    closeIconElement.style.display = 'none';
                }
            });
        });
    }

    window.scrollToSection = function(selector) {
        const element = document.querySelector(selector);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && href.startsWith('#')) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    scrollToSection(href);
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        if (menuToggle) menuToggle.classList.remove('active');
                        body.classList.remove('no-scroll');
                        const openIcon = menuToggle ? menuToggle.querySelector('.fa-bars') : null;
                        const closeIconElement = menuToggle ? menuToggle.querySelector('.fa-times') : null;
                        if (openIcon) openIcon.style.display = 'block';
                        if (closeIconElement) closeIconElement.style.display = 'none';
                    }
                }
            }
        });
    });

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: false, offset: 50, easing: 'ease-in-out-quad', mirror: true });
    }

    if (boxCarouselMobile && swiperWrapper && desktopBoxCards.length > 0) {
        desktopBoxCards.forEach(card => {
            const swiperSlide = document.createElement('div');
            swiperSlide.classList.add('swiper-slide');
            const clonedCard = card.cloneNode(true);
            swiperSlide.appendChild(clonedCard);
            swiperWrapper.appendChild(swiperSlide);
        });
        new Swiper('.box-carousel-mobile', {
            slidesPerView: 1,
            spaceBetween: 15,
            loop: false,
            grabCursor: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: { 480: { slidesPerView: 1.2, spaceBetween: 20 }, 640: { slidesPerView: 1.5, spaceBetween: 20 } },
            on: {
                init: () => {
                    if (typeof AOS !== 'undefined' && AOS) AOS.refreshHard();
                }
            }
        });
    } else {
        // Warnings sobre elementos não encontrados para o carrossel
    }

    const initialLoginActionButton = document.getElementById('login-action-button');

    if (initialLoginActionButton) {
        initialLoginActionButton.addEventListener('click', function(event) {
            event.stopPropagation();
            const currentDropdownMenu = document.getElementById('user-dropdown');
            if (currentDropdownMenu) currentDropdownMenu.classList.toggle('active');

            if (loginModalOverlay && loginModalOverlay.classList.contains('active')) closeLoginModal();
            if (registerModalOverlay && registerModalOverlay.classList.contains('active')) closeRegisterModal();
            if (subscriptionPlansModal && subscriptionPlansModal.classList.contains('active')) closeSubscriptionPlansModal();
        });
    }
    document.addEventListener('click', function(event) {
        const currentDropdownMenu = document.getElementById('user-dropdown');
        const currentLoginActionButton = document.getElementById('login-action-button');
        if (
            currentDropdownMenu && currentDropdownMenu.classList.contains('active') &&
            !currentDropdownMenu.contains(event.target) &&
            currentLoginActionButton && !currentLoginActionButton.contains(event.target)
        ) {
            currentDropdownMenu.classList.remove('active');
        }
    });

    window.addEventListener('click', (event) => {
        if (boxDetailsModal && event.target === boxDetailsModal) closeBoxDetailsModal();
        if (loginModalOverlay && event.target === loginModalOverlay) closeLoginModal();
        if (registerModalOverlay && event.target === registerModalOverlay) closeRegisterModal();
        if (subscriptionPlansModal && event.target === subscriptionPlansModal) closeSubscriptionPlansModal();
    });
    window.addEventListener('keydown', function(event) {
        const currentDropdownMenu = document.getElementById('user-dropdown');
        if (event.key === 'Escape') {
            if (currentDropdownMenu && currentDropdownMenu.classList.contains('active')) currentDropdownMenu.classList.remove('active');
            else if (boxDetailsModal && boxDetailsModal.style.display === 'flex') closeBoxDetailsModal();
            else if (loginModalOverlay && loginModalOverlay.classList.contains('active')) closeLoginModal();
            else if (registerModalOverlay && registerModalOverlay.classList.contains('active')) closeRegisterModal();
            else if (subscriptionPlansModal && subscriptionPlansModal.classList.contains('active')) closeSubscriptionPlansModal();
        }
    });

    function handleBackToTopButton() {
        if (backToTopBtn) {
            if (window.scrollY > 300) backToTopBtn.classList.add('show');
            else backToTopBtn.classList.remove('show');
        }
    }
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    window.addEventListener('scroll', () => {
        if (typeof handleScrollHeader === 'function') handleScrollHeader();
        if (typeof handleBackToTopButton === 'function') handleBackToTopButton();
    });

    if (typeof handleScrollHeader === 'function') handleScrollHeader();
    if (typeof handleBackToTopButton === 'function') handleBackToTopButton();
    updateUIAfterLogin(); // Chamada inicial

}); // Fim do DOMContentLoaded
