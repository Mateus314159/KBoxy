// js/minha-conta.js

document.addEventListener('DOMContentLoaded', function () {
    // 1) Base URL relativa: em produção, /api já aponta para https://seusite.com/api
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('authToken');

    // ------------------------------
    // 1) Elementos da interface
    // ------------------------------
    const userAvatarImg      = document.getElementById('user-avatar-img');
    const avatarUploadInput  = document.getElementById('avatar-upload-input');
    const userAccountName    = document.getElementById('user-account-name');
    const userAccountEmail   = document.getElementById('user-account-email');

    const profileInputName       = document.getElementById('profile-input-name');
    const profileInputEmail      = document.getElementById('profile-input-email');
    const profileInputStreet     = document.getElementById('profile-input-street');
    const profileInputComplement = document.getElementById('profile-input-complement');
    const profileInputNeighborhood = document.getElementById('profile-input-neighborhood');
    const profileInputCity       = document.getElementById('profile-input-city');
    const profileInputState      = document.getElementById('profile-input-state');
    const profileInputZipcode    = document.getElementById('profile-input-zipcode');
    const profileUpdateForm      = document.getElementById('profile-update-form');

    // Aba “Sua Assinatura”
    const subscriptionLoadingDiv       = document.getElementById('subscription-info-loading');
    const activeSubscriptionDetailsDiv = document.getElementById('active-subscription-details');
    const noActiveSubscriptionDiv      = document.getElementById('no-active-subscription');

    // Aba “Meus Pedidos”
    const ordersListContainer  = document.getElementById('orders-list-container');
    const noOrdersMessageDiv   = document.getElementById('no-orders-message');

    // Aba “Endereços”
    const addressLoadingDiv     = document.getElementById('address-display-loading');
    const addressDisplayAreaDiv = document.getElementById('address-display-area');
    const noAddressMessageDiv   = document.getElementById('no-address-saved-message');

    // Aba “Segurança” (alterar senha)
    const changePasswordFormAccount = document.getElementById('change-password-form-account');

    // Elementos de navegação de abas
    const contentSections = document.querySelectorAll('.account-tab-content');
    const navLinks        = document.querySelectorAll('.account-navigation a');

    // ------------------------------
    // 2) Função para buscar perfil
    // ------------------------------
    async function fetchUserProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { 'Authorization': token }
            });
            if (!response.ok) throw new Error('Não foi possível carregar dados do perfil.');

            const userData = await response.json();

            // Exibe nome e email no topo
            userAccountName.textContent  = userData.name || '';
            userAccountEmail.textContent = userData.email || '';
            profileInputEmail.value = userData.email || '';
            profileInputName.value  = userData.name || '';

            // Preenche formulário “Meu Perfil” com endereço, se existir
            if (userData.address) {
                profileInputStreet.value       = userData.address.street       || '';
                profileInputComplement.value   = userData.address.complement   || '';
                profileInputNeighborhood.value = userData.address.neighborhood || '';
                profileInputCity.value         = userData.address.city         || '';
                profileInputState.value        = userData.address.state        || '';
                profileInputZipcode.value      = userData.address.zipcode      || '';
            }

            // Carrega foto de avatar (se existir)
            if (userData.avatarUrl) {
                userAvatarImg.src = userData.avatarUrl;
            }

            // Exibe o endereço na aba “Endereços”
            displayUserAddress(userData.address);

            // Exibe pedidos na aba “Meus Pedidos”
            fetchUserOrders();

            // Exibe assinatura na aba “Sua Assinatura”
            displayUserSubscription();
        } catch (err) {
            console.error('Erro ao buscar perfil:', err);
        }
    }

    // ------------------------------
    // 3) Enviar atualização de perfil
    // ------------------------------
    if (profileUpdateForm) {
        profileUpdateForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const updatedData = {
                name: profileInputName.value,
                address: {
                    street: profileInputStreet.value,
                    complement: profileInputComplement.value,
                    neighborhood: profileInputNeighborhood.value,
                    city: profileInputCity.value,
                    state: profileInputState.value,
                    zipcode: profileInputZipcode.value
                }
            };

            try {
                const response = await fetch(`${API_BASE_URL}/users/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify(updatedData)
                });
                if (!response.ok) {
                    const errJson = await response.json().catch(() => ({}));
                    throw new Error(errJson.message || 'Erro ao atualizar perfil.');
                }
                const respData = await response.json();
                alert('Perfil atualizado com sucesso!');
                userAccountName.textContent = respData.name || '';
                displayUserAddress(respData.address);
            } catch (err) {
                console.error('Erro ao atualizar perfil:', err);
                alert(err.message);
            }
        });
    }

    // ------------------------------
    // 4) Upload de avatar
    // ------------------------------
    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', async function (e) {
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
                    const errJson = await response.json().catch(() => ({}));
                    throw new Error(errJson.message || 'Erro ao enviar foto.');
                }
                const data = await response.json();

                // Atualiza <img> do avatar nesta página
                userAvatarImg.src = data.avatarUrl;

                // Atualiza localStorage e canto do header, se houver
                localStorage.setItem('userAvatarUrl', data.avatarUrl);
                if (window.updateUIAfterLogin) {
                    window.updateUIAfterLogin();
                }

                alert('Foto de perfil atualizada com sucesso!');
            } catch (err) {
                console.error('Erro ao enviar foto de perfil:', err);
                alert(err.message);
            }
        });
    }

    // -----------------------------------------------------------
    // 5) Função para exibir “Sua Assinatura” (busca no back-end)
    // -----------------------------------------------------------
    async function displayUserSubscription() {
        // 5.1) Mostrar o “Carregando…” e esconder ambos os blocos
        subscriptionLoadingDiv.style.display = 'block';
        activeSubscriptionDetailsDiv.style.display = 'none';
        noActiveSubscriptionDiv.style.display = 'none';

        try {
            const response = await fetch(`${API_BASE_URL}/subscription`, {
                headers: { 'Authorization': token }
            });

            if (!response.ok) {
                throw new Error('Não foi possível carregar os dados da assinatura.');
            }

            const subsData = await response.json();
            // Esconde o loading
            subscriptionLoadingDiv.style.display = 'none';

            // Se não há assinatura ativa (planType é null ou undefined)
            if (!subsData || !subsData.planType) {
                noActiveSubscriptionDiv.style.display = 'block';
                return;
            }

            // Caso haja assinatura ativa, extraímos dados
            const { planType, boxType, startDate, nextPaymentDate, repetitionsLeft } = subsData;

            // Formata datas para DD/MM/AAAA
            const dtStart = new Date(startDate);
            const dtNext  = new Date(nextPaymentDate);
            const formattedStart = dtStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const formattedNext  = dtNext.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

            // Mapas para texto amigável
            const planTextMap = {
                'one_time': 'Compra Única',
                'mensal': 'Plano Mensal',
                'semiannual': 'Plano Semestral',
                'annual': 'Plano Anual'
            };
            const boxTextMap = {
                'firstLove': 'K-BOXY First Love',
                'idolBox': 'K-BOXY Lover',
                'legendBox': 'K-BOXY True Love'
            };

            const planText = planTextMap[planType] || planType;
            const boxText  = boxTextMap[boxType]   || boxType;

            // Monta o HTML do card de assinatura
            activeSubscriptionDetailsDiv.innerHTML = `
                <div class="subscription-card">
                    <p><strong>Box:</strong> ${boxText}</p>
                    <p><strong>Plano:</strong> ${planText}</p>
                    <p><strong>Início da Assinatura:</strong> ${formattedStart}</p>
                    <p><strong>Próxima Cobrança:</strong> ${formattedNext}</p>
                    <p><strong>Parcelas Restantes:</strong> ${repetitionsLeft}</p>
                    <button id="cancel-subscription-btn" class="btn btn-secondary btn-small">Cancelar Assinatura</button>
                </div>
            `;
            activeSubscriptionDetailsDiv.style.display = 'block';

            // Botão de cancelar assinatura
            const cancelBtn = document.getElementById('cancel-subscription-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', async () => {
                    if (!confirm('Deseja realmente cancelar sua assinatura?')) return;
                    try {
                        const cancelResp = await fetch(`${API_BASE_URL}/subscription`, {
                            method: 'DELETE',
                            headers: { 'Authorization': token }
                        });
                        if (!cancelResp.ok) throw new Error('Falha ao cancelar assinatura.');
                        alert('Assinatura cancelada com sucesso.');
                        // Recarrega a seção
                        displayUserSubscription();
                    } catch (err) {
                        console.error('Erro ao cancelar assinatura:', err);
                        alert(err.message);
                    }
                });
            }
        } catch (err) {
            console.error('Erro ao buscar assinatura:', err);
            subscriptionLoadingDiv.style.display = 'none';
            noActiveSubscriptionDiv.style.display = 'block';
        }
    }

    // ------------------------------
    // 6) Função para buscar “Meus Pedidos”
    // ------------------------------
    async function fetchUserOrders() {
        ordersListContainer.innerHTML = '';
        noOrdersMessageDiv.style.display = 'none';
        try {
            const response = await fetch(`${API_BASE_URL}/orders/my`, {
                headers: { 'Authorization': token }
            });
            if (!response.ok) throw new Error('Erro ao buscar pedidos.');
            const orders = await response.json();

            if (Array.isArray(orders) && orders.length > 0) {
                orders.forEach(order => {
                    const divCard = document.createElement('div');
                    divCard.classList.add('order-card');
                    divCard.style.border = '1px solid #ddd';
                    divCard.style.padding = '12px';
                    divCard.style.marginBottom = '10px';
                    divCard.style.borderRadius = '6px';

                    const createdAt = new Date(order.createdAt).toLocaleDateString('pt-BR');
                    divCard.innerHTML = `
                        <p><strong>ID Pedido:</strong> ${order._id}</p>
                        <p><strong>Tipo de Box:</strong> ${order.boxType}</p>
                        <p><strong>Plano (meses):</strong> ${order.planType}</p>
                        <p><strong>Criado em:</strong> ${createdAt}</p>
                    `;
                    ordersListContainer.appendChild(divCard);
                });
            } else {
                noOrdersMessageDiv.style.display = 'block';
            }
        } catch (err) {
            console.error('Erro ao buscar pedidos:', err);
            noOrdersMessageDiv.style.display = 'block';
        }
    }

    // ------------------------------
    // 7) Função para exibir “Endereços”
    // ------------------------------
    function displayUserAddress(addressObj) {
        addressDisplayAreaDiv.innerHTML = '';
        addressLoadingDiv.style.display = 'none';
        noAddressMessageDiv.style.display = 'none';

        if (
            addressObj &&
            (addressObj.street || addressObj.city || addressObj.zipcode)
        ) {
            const pStreet = document.createElement('p');
            pStreet.textContent = `Endereço: ${addressObj.street || '-'}`;

            const pComplement = document.createElement('p');
            pComplement.textContent = `Complemento: ${addressObj.complement || '-'}`;

            const pNeighborhood = document.createElement('p');
            pNeighborhood.textContent = `Bairro: ${addressObj.neighborhood || '-'}`;

            const pCity = document.createElement('p');
            pCity.textContent = `Cidade: ${addressObj.city || '-'} - ${addressObj.state || '-'} (CEP: ${addressObj.zipcode || '-'})`;

            addressDisplayAreaDiv.appendChild(pStreet);
            addressDisplayAreaDiv.appendChild(pComplement);
            addressDisplayAreaDiv.appendChild(pNeighborhood);
            addressDisplayAreaDiv.appendChild(pCity);
            addressDisplayAreaDiv.style.padding = '15px';
        } else {
            noAddressMessageDiv.style.display = 'block';
        }
    }

    // ------------------------------
    // 8) Alterar senha (aba “Segurança”)
    // ------------------------------
    if (changePasswordFormAccount) {
        changePasswordFormAccount.addEventListener('submit', async function (e) {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password-page').value;
            const newPassword     = document.getElementById('new-password-page').value;
            try {
                const response = await fetch(`${API_BASE_URL}/users/me/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Erro ao alterar senha.');
                alert(result.message || 'Senha alterada com sucesso!');
                changePasswordFormAccount.reset();
            } catch (err) {
                console.error('Erro ao alterar senha:', err);
                alert(err.message);
            }
        });
    }

    // ------------------------------
    // 9) Navegação entre abas (hashchange)
    // ------------------------------
    function setActiveTab(sectionId) {
        contentSections.forEach(sec => {
            sec.classList.toggle('active-content', sec.id === sectionId);
        });
        navLinks.forEach(link => {
            const target = link.getAttribute('data-section');
            link.classList.toggle('active-account-tab', target === sectionId);
        });
    }

    function handleHashChange() {
        const hash = window.location.hash.replace('#', '');
        const defaultSection = 'perfil';
        const sectionToLoad = hash || defaultSection;
        const exists = Array.from(contentSections).some(sec => sec.id === sectionToLoad);
        if (exists) {
            setActiveTab(sectionToLoad);
        } else {
            setActiveTab(defaultSection);
            window.location.hash = defaultSection;
        }
    }
    window.addEventListener('hashchange', handleHashChange);

    // ------------------------------
    // 10) Carrega tudo
    // ------------------------------
    fetchUserProfile();
    handleHashChange();
});
