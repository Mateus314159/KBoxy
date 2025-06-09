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

    // --- Carrossel Swiper ---
    const boxCarouselMobile = document.querySelector('.box-carousel-mobile');
    
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

    window.updateUIAfterLogin = function() {
        const currentLoginActionButton = document.getElementById('login-action-button');
        const currentUserDropdownMenu = document.getElementById('user-dropdown');
        const token = localStorage.getItem('authToken');
        if (token) {
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
                    logoutLink.addEventListener('click', function(e) { e.preventDefault(); handleLogout(); });
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
            if (currentLoginActionButton) {
                currentLoginActionButton.innerHTML = '<i class="fas fa-user-circle"></i>';
            }
            if (currentUserDropdownMenu) {
                currentUserDropdownMenu.innerHTML = `
                    <a href="#" id="dropdown-login-link">Login</a>
                    <a href="#" id="dropdown-register-link">Cadastrar</a>
                `;
                document.getElementById('dropdown-login-link')?.addEventListener('click', function(e) { e.preventDefault(); currentUserDropdownMenu.classList.remove('active'); openLoginModal(); });
                document.getElementById('dropdown-register-link')?.addEventListener('click', function(e) { e.preventDefault(); currentUserDropdownMenu.classList.remove('active'); openRegisterModal(); });
            }
        }
    };

    window.handleLogout = function(event) {
        if (event) event.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userAvatarUrl');
        alert('Você foi desconectado.');
        updateUIAfterLogin();
        document.getElementById('user-dropdown')?.classList.remove('active');
        if (window.location.pathname.includes('minha-conta.html')) {
            window.location.href = 'index.html';
        }
    };

    // =========================================================================
    // LÓGICA DOS MODAIS
    // =========================================================================

    function openLoginModal() {
        if (registerModalOverlay?.classList.contains('active')) closeRegisterModal();
        if (subscriptionPlansModal?.classList.contains('active')) closeSubscriptionPlansModal();
        if (loginModalOverlay) {
            loginModalOverlay.style.display = 'flex';
            setTimeout(() => { loginModalOverlay.classList.add('active'); body.classList.add('no-scroll-modal'); }, 10);
        }
    }
    function closeLoginModal() {
        if (loginModalOverlay) {
            loginModalOverlay.classList.remove('active');
            body.classList.remove('no-scroll-modal');
            setTimeout(() => { if (!loginModalOverlay.classList.contains('active')) loginModalOverlay.style.display = 'none'; }, 300);
        }
    }

    function openRegisterModal() {
        if (loginModalOverlay?.classList.contains('active')) closeLoginModal();
        if (subscriptionPlansModal?.classList.contains('active')) closeSubscriptionPlansModal();
        if (registerModalOverlay) {
            registerModalOverlay.style.display = 'flex';
            setTimeout(() => { registerModalOverlay.classList.add('active'); body.classList.add('no-scroll-modal'); }, 10);
        }
    }
    function closeRegisterModal() {
        if (registerModalOverlay) {
            registerModalOverlay.classList.remove('active');
            body.classList.remove('no-scroll-modal');
            setTimeout(() => { if (!registerModalOverlay.classList.contains('active')) registerModalOverlay.style.display = 'none'; }, 300);
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
                if (details.contents?.length > 0) {
                    descriptionHtml += `<h4>O que pode vir na box:</h4><ul>`;
                    details.contents.forEach(item => { descriptionHtml += `<li>${item}</li>`; });
                    descriptionHtml += `</ul>`;
                }
                modalBoxDescriptionFull.innerHTML = descriptionHtml;
            }
            boxDetailsModal.style.display = "flex";
            body.classList.add('no-scroll-modal');
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
        if (!boxData || !subscriptionPlansModal) return;
        if (subscriptionBoxNameModalTitleElem) subscriptionBoxNameModalTitleElem.textContent = boxData.displayName;
        if (subscriptionPlansListElem) {
            subscriptionPlansListElem.innerHTML = '';
            boxData.plans.forEach(plan => {
                const planElement = document.createElement('div');
                planElement.classList.add('plan-item');
                planElement.dataset.planId = plan.id;
                planElement.dataset.planType = plan.type;
                planElement.dataset.boxType = boxId;
                planElement.innerHTML = `
                    <h4>${plan.name}</h4>
                    <p class="plan-price">${plan.price}</p>
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
        setTimeout(() => { subscriptionPlansModal.classList.add('active'); body.classList.add('no-scroll-modal'); }, 10);
    }
    function closeSubscriptionPlansModal() {
        if (subscriptionPlansModal) {
            subscriptionPlansModal.classList.remove('active');
            body.classList.remove('no-scroll-modal');
            setTimeout(() => { if (!subscriptionPlansModal.classList.contains('active')) subscriptionPlansModal.style.display = 'none'; }, 300);
        }
    }

    // =========================================================================
    // LÓGICA DE EVENTOS E MANIPULAÇÃO DO DOM
    // =========================================================================

    loginForm?.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = loginEmailInput?.value.trim() || '';
        const password = loginPasswordInput?.value.trim() || '';
        if (!email || !password) { alert('Por favor, preencha email e senha.'); return; }
        fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
         if (status === 200 && body.token) {
    localStorage.setItem('authToken', body.token);
    localStorage.setItem('userId', body.userId);

    // CORRIGIDO: Salva a URL do avatar que veio do servidor. Se não vier nenhuma,
    // salva uma string vazia. Isso limpa qualquer valor antigo que estivesse salvo.
    localStorage.setItem('userAvatarUrl', body.avatarUrl || '');
    
    alert('Login realizado com sucesso!');
    closeLoginModal();
    updateUIAfterLogin();
} else {
                alert(body.message || 'Erro ao fazer login.');
            }
        }).catch(error => { console.error('Erro na requisição de login:', error); alert('Ocorreu um erro ao tentar fazer login.'); });
    });

    toggleLoginPasswordBtn?.addEventListener('click', function() {
        const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPasswordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye'); this.classList.toggle('fa-eye-slash');
    });
    
    closeLoginModalBtnElem?.addEventListener('click', closeLoginModal);

    registerForm?.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = registerEmailInput?.value.trim() || '';
        const password = registerPasswordInput?.value.trim() || '';
        const confirmPassword = registerConfirmPasswordInput?.value.trim() || '';
        if (!email || !password || !confirmPassword) { alert('Por favor, preencha todos os campos.'); return; }
        if (password.length < 6) { alert('A senha deve ter no mínimo 6 caracteres.'); return; }
        if (password !== confirmPassword) { alert('As senhas não coincidem!'); return; }
        fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: password }),
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status === 201) {
                alert(body.message || 'Usuário criado com sucesso! Por favor, faça o login.');
                closeRegisterModal();
                openLoginModal();
            } else {
                alert(body.message || 'Erro ao criar usuário.');
            }
        }).catch(error => { console.error('Erro na requisição de cadastro:', error); alert('Ocorreu um erro ao tentar cadastrar.'); });
    });

    toggleRegisterPasswordBtn?.addEventListener('click', function() {
        const type = registerPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        registerPasswordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye'); this.classList.toggle('fa-eye-slash');
    });

    toggleRegisterConfirmPasswordBtn?.addEventListener('click', function() {
        const type = registerConfirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        registerConfirmPasswordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye'); this.classList.toggle('fa-eye-slash');
    });

    closeRegisterModalBtnElem?.addEventListener('click', closeRegisterModal);

    switchToRegisterBtnFromLogin?.addEventListener('click', function(e) { e.preventDefault(); closeLoginModal(); openRegisterModal(); });
    switchToLoginBtnFromRegister?.addEventListener('click', function(e) { e.preventDefault(); closeRegisterModal(); openLoginModal(); });

  // =============================================================
    // ***** INÍCIO DA CORREÇÃO PRINCIPAL *****
    // =============================================================
    function createOrder(boxType, planIdForBackend) {
        const token = localStorage.getItem('authToken');

        // 1. Verifica se o usuário está logado
        if (!token) {
            // Se não estiver logado, exibe um alerta e abre o modal de login.
            alert('Você precisa estar logado para selecionar um plano.');
            openLoginModal();
            return; // Interrompe a função aqui.
        }

        // 2. Se o usuário estiver logado, redireciona para a página de checkout
        // A função passa o tipo da box e o ID do plano como parâmetros na URL.
        console.log(`Usuário logado. Redirecionando para checkout com Box: ${boxType}, Plano: ${planIdForBackend}`);
        window.location.href = `checkout.html?boxType=${boxType}&planId=${planIdForBackend}`;
    }
    // =============================================================
    // ***** FIM DA CORREÇÃO PRINCIPAL *****
    // =============================================================

    document.querySelectorAll('.box-card .btn-ver-mais').forEach(button => {
        button.addEventListener('click', function() {
            const boxCard = this.closest('.box-card');
            if (boxCard) {
                const boxId = boxCard.dataset.boxid;
                // Exceção para o botão da Mini K-BOXY que já tem um onclick para o checkout
                if (boxId && boxId !== 'miniKBoxyPromo') {
                    openSubscriptionPlansModal(boxId);
                }
            }
        });
    });

    closeSubscriptionPlansModalBtn?.addEventListener('click', closeSubscriptionPlansModal);
    closeBoxDetailsModalBtn?.addEventListener('click', closeBoxDetailsModal);

    // =========================================================================
    // LÓGICA DE UI ORIGINAL
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
        if (header) { window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled'); }
    }

    if (introVideo && document.getElementById('home')) {
        document.getElementById('home').style.backgroundImage = 'none';
        introVideo.play().then(() => {
            console.log("Vídeo de introdução tocando.");
            if (typeof AOS !== 'undefined') AOS.refreshHard();
        }).catch(error => {
            console.warn("Autoplay do vídeo foi impedido:", error);
            introVideo.style.display = 'none';
        });
    }

    if (menuToggle && navMenu) {
        let openIcon = menuToggle.querySelector('.fa-bars');
        let closeIcon = menuToggle.querySelector('.fa-times');
        if (!openIcon) { openIcon = document.createElement('i'); openIcon.className = 'fas fa-bars'; menuToggle.prepend(openIcon); }
        if (!closeIcon) { closeIcon = document.createElement('i'); closeIcon.className = 'fas fa-times'; closeIcon.style.display = 'none'; menuToggle.appendChild(closeIcon); }
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            body.classList.toggle('no-scroll');
            openIcon.style.display = navMenu.classList.contains('active') ? 'none' : 'block';
            closeIcon.style.display = navMenu.classList.contains('active') ? 'block' : 'none';
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    body.classList.remove('no-scroll');
                    openIcon.style.display = 'block';
                    closeIcon.style.display = 'none';
                }
            });
        });
    }

    window.scrollToSection = function(selector) {
        document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    };
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                scrollToSection(href);
                if (navMenu?.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle?.classList.remove('active');
                    body.classList.remove('no-scroll');
                    menuToggle.querySelector('.fa-bars').style.display = 'block';
                    menuToggle.querySelector('.fa-times').style.display = 'none';
                }
            }
        });
    });

    if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: false, offset: 50, easing: 'ease-in-out-quad', mirror: true }); }
    
    // INÍCIO DA ALTERAÇÃO
    // Inicializa o Swiper para o carrossel de boxes, agora para todas as telas.
    if (boxCarouselMobile) {
        new Swiper('.box-carousel-mobile', {
            // Configurações base
            loop: false,
            grabCursor: true,
            
            // Paginação e Navegação
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            
            // Breakpoints para um carrossel responsivo
            breakpoints: {
                // Em telas com largura >= 320px
                320: {
                    slidesPerView: 1.1,
                    spaceBetween: 15
                },
                // Em telas com largura >= 768px (tablets)
                768: {
                    slidesPerView: 2,
                    spaceBetween: 20
                },
                // Em telas com largura >= 1024px (desktops)
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                }
            },
            on: { init: () => { if (typeof AOS !== 'undefined') AOS.refreshHard(); } }
        });
    }
    // FIM DA ALTERAÇÃO

    // =============================================================
    // ***** INÍCIO DA LÓGICA ATUALIZADA *****
    // =============================================================
    document.getElementById('login-action-button')?.addEventListener('click', function(event) {
        event.stopPropagation();

        const menuToggle = document.getElementById('menu-toggle');
        const isMobile = menuToggle && window.getComputedStyle(menuToggle).display !== 'none';

        if (isMobile) {
            const token = localStorage.getItem('authToken');
            if (token) {
                window.location.href = 'minha-conta.html';
            } else {
                openLoginModal();
            }
        } else {
            document.getElementById('user-dropdown')?.classList.toggle('active');
            if (loginModalOverlay?.classList.contains('active')) closeLoginModal();
            if (registerModalOverlay?.classList.contains('active')) closeRegisterModal();
            if (subscriptionPlansModal?.classList.contains('active')) closeSubscriptionPlansModal();
        }
    });
    // =============================================================
    // ***** FIM DA LÓGICA ATUALIZADA *****
    // =============================================================

    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('user-dropdown');
        const actionButton = document.getElementById('login-action-button');
        if (dropdown?.classList.contains('active') && !dropdown.contains(event.target) && !actionButton?.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === boxDetailsModal) closeBoxDetailsModal();
        if (event.target === loginModalOverlay) closeLoginModal();
        if (event.target === registerModalOverlay) closeRegisterModal();
        if (event.target === subscriptionPlansModal) closeSubscriptionPlansModal();
    });

    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.getElementById('user-dropdown')?.classList.remove('active');
            if (boxDetailsModal?.style.display === 'flex') closeBoxDetailsModal();
            if (loginModalOverlay?.classList.contains('active')) closeLoginModal();
            if (registerModalOverlay?.classList.contains('active')) closeRegisterModal();
            if (subscriptionPlansModal?.classList.contains('active')) closeSubscriptionPlansModal();
        }
    });

   function handleBackToTopButton() {
    // CORRIGIDO: Removido o erro de digitação 'backToToTopBtn'
    if (backToTopBtn) {
        window.scrollY > 300 ? backToTopBtn.classList.add('show') : backToTopBtn.classList.remove('show');
    }
}
    
    backToTopBtn?.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    window.addEventListener('scroll', () => { handleScrollHeader(); handleBackToTopButton(); });
    
    handleScrollHeader();
    handleBackToTopButton();
    updateUIAfterLogin();
});