// js/minha-conta.js
document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'http://localhost:5000/api'; // CONFIRME SUA URL DA API
    const token = localStorage.getItem('authToken');

    // Elementos da UI
    const userAvatarImg = document.getElementById('user-avatar-img');
    const avatarUploadInput = document.getElementById('avatar-upload-input');
    const userAccountName = document.getElementById('user-account-name');
    const userAccountEmail = document.getElementById('user-account-email');
    const profileInputName = document.getElementById('profile-input-name');
    const profileInputEmail = document.getElementById('profile-input-email');
    const profileUpdateForm = document.getElementById('profile-update-form');

    const profileInputStreet = document.getElementById('profile-input-street');
    const profileInputComplement = document.getElementById('profile-input-complement');
    const profileInputNeighborhood = document.getElementById('profile-input-neighborhood');
    const profileInputCity = document.getElementById('profile-input-city');
    const profileInputState = document.getElementById('profile-input-state');
    const profileInputZipcode = document.getElementById('profile-input-zipcode');

    const addressDisplayLoading = document.getElementById('address-display-loading');
    const addressDisplayArea = document.getElementById('address-display-area');
    const noAddressSavedMessage = document.getElementById('no-address-saved-message');


    const subscriptionInfoLoading = document.getElementById('subscription-info-loading');
    const activeSubscriptionDetailsDiv = document.getElementById('active-subscription-details');
    const noActiveSubscriptionDiv = document.getElementById('no-active-subscription');

    const ordersListContainer = document.getElementById('orders-list-container');
    const noOrdersMessage = document.getElementById('no-orders-message');

    const changePasswordFormAccount = document.getElementById('change-password-form-account');
    const accountPageLogoutBtn = document.getElementById('account-page-logout');

    // Abas de Navegação
    const navLinks = document.querySelectorAll('.account-navigation a[data-section]');
    const contentSections = document.querySelectorAll('.account-tab-content');

    document.body.addEventListener('click', function(event) {
        if (event.target.matches('.account-nav-link-inline')) {
            event.preventDefault();
            const sectionId = event.target.dataset.section;
            if (sectionId) {
                window.location.hash = sectionId;
            }
        }
    });

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'index.html';
        return;
    }

    function setActiveTab(sectionId) {
        navLinks.forEach(link => {
            link.classList.toggle('active-account-tab', link.dataset.section === sectionId);
        });
        contentSections.forEach(section => {
            section.classList.toggle('active-content', section.id === sectionId);
        });

        if (sectionId === 'assinatura') fetchSubscriptionInfo();
        if (sectionId === 'pedidos') fetchUserOrders();
        // A aba de endereços é populada pelo fetchUserProfile, que é chamado na inicialização
        // e quando o perfil é atualizado. Se precisar de atualização dinâmica ao clicar na aba, adicione aqui.
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            window.location.hash = sectionId;
        });
    });

    if(accountPageLogoutBtn) {
        accountPageLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.handleLogout === 'function') {
                window.handleLogout();
                window.location.href = 'index.html';
            } else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userAvatarUrl');
                alert('Você foi desconectado.');
                window.location.href = 'index.html';
            }
        });
    }

    async function fetchUserProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { 'Authorization': token }
            });
            if (!response.ok) throw new Error('Não foi possível carregar os dados do perfil.');
            const userData = await response.json();

            if (userAccountName) userAccountName.textContent = userData.name || 'K-Popper';
            if (userAccountEmail) userAccountEmail.textContent = userData.email;
            if (profileInputName) profileInputName.value = userData.name || '';
            if (profileInputEmail) profileInputEmail.value = userData.email;
            if (userAvatarImg && userData.avatarUrl) {
                userAvatarImg.src = userData.avatarUrl;
            } else if (userAvatarImg) {
                userAvatarImg.src = 'https://placehold.co/100x100/f8bbd0/1A1A1A?text=K&font=Poppins';
            }

            if (userData.address) {
                if (profileInputStreet) profileInputStreet.value = userData.address.street || '';
                if (profileInputComplement) profileInputComplement.value = userData.address.complement || '';
                if (profileInputNeighborhood) profileInputNeighborhood.value = userData.address.neighborhood || '';
                if (profileInputCity) profileInputCity.value = userData.address.city || '';
                if (profileInputState) profileInputState.value = userData.address.state || '';
                if (profileInputZipcode) profileInputZipcode.value = userData.address.zipcode || '';
            } else {
                if (profileInputStreet) profileInputStreet.value = '';
                if (profileInputComplement) profileInputComplement.value = '';
                if (profileInputNeighborhood) profileInputNeighborhood.value = '';
                if (profileInputCity) profileInputCity.value = '';
                if (profileInputState) profileInputState.value = '';
                if (profileInputZipcode) profileInputZipcode.value = '';
            }
            displaySavedAddress(userData.address);
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            if(userAccountName) userAccountName.textContent = "Erro ao carregar";
        }
    }

    if (profileUpdateForm) {
        profileUpdateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = profileInputName.value;
            const address = {
                street: profileInputStreet.value.trim(),
                complement: profileInputComplement.value.trim(),
                neighborhood: profileInputNeighborhood.value.trim(),
                city: profileInputCity.value.trim(),
                state: profileInputState.value.trim().toUpperCase(),
                zipcode: profileInputZipcode.value.trim()
            };

            try {
                // ***** INÍCIO DA CORREÇÃO DE SINTAXE *****
                const response = await fetch(`${API_BASE_URL}/users/me`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({ name, address })
                }); // Ponto e vírgula ou fechamento do parêntese do fetch aqui

                if (!response.ok) { // O 'if' vem DEPOIS do objeto de opções do fetch
                    const errData = await response.json().catch(() => ({ message: "Erro ao ler resposta do servidor." })); // Trata caso o corpo do erro não seja JSON
                    throw new Error(errData.message || "Erro ao atualizar perfil.");
                }
                // ***** FIM DA CORREÇÃO DE SINTAXE *****
                alert('Perfil atualizado com sucesso!');
                fetchUserProfile();
            } catch (error) {
                console.error("Erro ao atualizar perfil:", error);
                alert(error.message);
            }
        });
    }

    function displaySavedAddress(addressData) {
        if (addressDisplayLoading) addressDisplayLoading.style.display = 'none';

        if (addressData && (addressData.street || addressData.city || addressData.zipcode)) {
            if (addressDisplayArea) {
                // ***** INÍCIO DA CORREÇÃO DO TEMPLATE STRING *****
                addressDisplayArea.innerHTML = `
                    <div class="saved-address-card">
                        <h4>Seu Endereço Principal <i class="fas fa-map-pin"></i></h4>
                        <p>${addressData.street || 'Não informado'}</p>
                        ${addressData.complement ? `<p>${addressData.complement}</p>` : ''}
                        <p>${addressData.neighborhood || 'Bairro não informado'} - ${addressData.city || 'Cidade não informada'}/${addressData.state || 'UF'}</p>
                        <p>CEP: ${addressData.zipcode || 'Não informado'}</p>
                        <button class="btn btn-secondary btn-small" id="edit-address-from-display">Editar na Aba Perfil</button>
                    </div>
                `;
                // ***** FIM DA CORREÇÃO DO TEMPLATE STRING *****
                const editBtn = document.getElementById('edit-address-from-display');
                if(editBtn) {
                    editBtn.addEventListener('click', () => {
                        window.location.hash = 'perfil';
                        // setActiveTab('perfil'); // Pode chamar diretamente também se quiser evitar a mudança de hash momentânea
                    });
                }
                addressDisplayArea.style.display = 'block';
            }
            if (noAddressSavedMessage) noAddressSavedMessage.style.display = 'none';
        } else {
            if (addressDisplayArea) {
                addressDisplayArea.innerHTML = '';
                addressDisplayArea.style.display = 'none';
            }
            if (noAddressSavedMessage) noAddressSavedMessage.style.display = 'block';
        }
    }

    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
                    method: 'POST',
                    headers: { 'Authorization': token },
                    body: formData
                });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({ message: "Erro ao ler resposta do servidor." }));
                    throw new Error(errData.message || "Erro ao enviar foto.");
                }
                const result = await response.json();
                if (userAvatarImg) userAvatarImg.src = result.avatarUrl;
                localStorage.setItem('userAvatarUrl', result.avatarUrl);
                if (typeof window.updateUIAfterLogin === 'function') {
                    window.updateUIAfterLogin();
                }
                alert('Foto de perfil atualizada!');
            } catch (error) {
                console.error("Erro ao enviar foto:", error);
                alert(error.message);
            }
        });
    }

    async function fetchSubscriptionInfo() {
        if(subscriptionInfoLoading) subscriptionInfoLoading.style.display = 'block';
        if(activeSubscriptionDetailsDiv) activeSubscriptionDetailsDiv.style.display = 'none';
        if(noActiveSubscriptionDiv) noActiveSubscriptionDiv.style.display = 'none';

        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/me`, {
                headers: { 'Authorization': token }
            });

            if (response.status === 404) {
                if(noActiveSubscriptionDiv) noActiveSubscriptionDiv.style.display = 'block';
                return;
            }
            if (!response.ok) throw new Error('Não foi possível carregar os dados da assinatura.');

            const subData = await response.json();

            if(activeSubscriptionDetailsDiv) {
                activeSubscriptionDetailsDiv.innerHTML = `
                    <p><strong>Plano:</strong> <span id="sub-plan-name">${subData.planName || "N/A"}</span></p>
                    <p><strong>Status:</strong> <span id="sub-status" class="status-${subData.status || 'unknown'}">${subData.status === 'active' ? 'Ativa' : 'Inativa/Expirada'}</span></p>
                    <p><strong>Válida até:</strong> <span id="sub-expiry-date">${subData.expiryDate ? new Date(subData.expiryDate).toLocaleDateString('pt-BR') : "N/A"}</span></p>
                `;
                if(subData.benefits && subData.benefits.length > 0) {
                    let benefitsHTML = '<div class="subscription-benefits"><h4>Benefícios Exclusivos do seu Plano:</h4><ul>';
                    subData.benefits.forEach(benefit => {
                        benefitsHTML += `<li><i class="fas fa-check-circle"></i> ${benefit}</li>`;
                    });
                    benefitsHTML += '</ul></div>';
                    activeSubscriptionDetailsDiv.insertAdjacentHTML('beforeend', benefitsHTML);
                }
                activeSubscriptionDetailsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error("Erro ao carregar assinatura:", error);
            if(activeSubscriptionDetailsDiv) activeSubscriptionDetailsDiv.innerHTML = `<p>Ocorreu um erro ao buscar sua assinatura.</p>`;
            if(activeSubscriptionDetailsDiv) activeSubscriptionDetailsDiv.style.display = 'block';
        } finally {
            if(subscriptionInfoLoading) subscriptionInfoLoading.style.display = 'none';
        }
    }

    async function fetchUserOrders() {
        if(ordersListContainer) ordersListContainer.innerHTML = 'Carregando seus pedidos...';
        if(noOrdersMessage) noOrdersMessage.style.display = 'none';

        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: { 'Authorization': token }
            });
            if (!response.ok) throw new Error('Não foi possível carregar seus pedidos.');
            const orders = await response.json();

            if(ordersListContainer) ordersListContainer.innerHTML = '';

            if (orders.length === 0) {
                if(noOrdersMessage) noOrdersMessage.style.display = 'block';
                return;
            }

            orders.forEach(order => {
                const orderHtml = `
                    <div class="order-card">
                        <h4>Pedido #${order.id || 'N/A'} <span class="order-status">${order.status || 'Processando'}</span></h4>
                        <p><strong>Data:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Itens:</strong> ${order.itemsDescription || `${order.boxType || ''} - ${order.planType || ''}`}</p>
                        <p><strong>Total:</strong> R$ ${parseFloat(order.totalAmount || 0).toFixed(2).replace('.', ',')}</p>
                        ${order.trackingCode ? `<p><strong>Rastreio:</strong> ${order.trackingCode}</p>` : ''}
                        <button class="btn btn-small btn-secondary" onclick="viewOrderDetails('${order.id}')">Ver Detalhes</button>
                    </div>
                `;
                if(ordersListContainer) ordersListContainer.insertAdjacentHTML('beforeend', orderHtml);
            });
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            if(ordersListContainer) ordersListContainer.innerHTML = `<p>Ocorreu um erro ao buscar seus pedidos.</p>`;
        }
    }

    window.viewOrderDetails = function(orderId) {
        alert(`Detalhes do pedido ${orderId} - Funcionalidade a ser implementada.`);
    }

    if (changePasswordFormAccount) {
        changePasswordFormAccount.addEventListener('submit', async function(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password-page').value;
            const newPassword = document.getElementById('new-password-page').value;
            const confirmNewPassword = document.getElementById('confirm-new-password-page').value;

            if (newPassword !== confirmNewPassword) {
                alert("As novas senhas não coincidem."); return;
            }
            if (newPassword.length < 6) {
                alert("A nova senha deve ter no mínimo 6 caracteres."); return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Erro ao alterar senha.");
                alert(result.message || "Senha alterada com sucesso!");
                changePasswordFormAccount.reset();
            } catch (error) {
                console.error("Erro ao alterar senha:", error);
                alert(error.message);
            }
        });
    }

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const defaultSection = 'perfil';
        const sectionToLoad = hash || defaultSection;
        // Verifica se a seção existe antes de tentar ativá-la
        const sectionExists = Array.from(contentSections).some(section => section.id === sectionToLoad);
        if (sectionExists) {
            setActiveTab(sectionToLoad);
        } else {
            setActiveTab(defaultSection); // Vai para a default se o hash for inválido
            if (hash) window.location.hash = defaultSection; // Corrige o hash na URL
        }
    }

    window.addEventListener('hashchange', handleHashChange);

    fetchUserProfile();
    handleHashChange();
});