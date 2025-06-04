// js/minha-conta.js

document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'http://localhost:5000/api'; // ajuste se necessário
    const token = localStorage.getItem('authToken');

    // ------------------------------
    // 1) Elementos da interface
    // ------------------------------
    const userAvatarImg      = document.getElementById('user-avatar-img');
    const avatarUploadInput  = document.getElementById('avatar-upload-input');
    const userAccountName    = document.getElementById('user-account-name');
    const userAccountEmail   = document.getElementById('user-account-email');

    const profileInputName    = document.getElementById('profile-input-name');
    const profileInputEmail   = document.getElementById('profile-input-email');
    const profileInputStreet  = document.getElementById('profile-input-street');
    const profileInputComplement = document.getElementById('profile-input-complement');
    const profileInputNeighborhood = document.getElementById('profile-input-neighborhood');
    const profileInputCity    = document.getElementById('profile-input-city');
    const profileInputState   = document.getElementById('profile-input-state');
    const profileInputZipcode = document.getElementById('profile-input-zipcode');
    const profileUpdateForm   = document.getElementById('profile-update-form');

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

            // Preenche formulário “Meu Perfil”
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
                // A rota do backend expõe as imagens em /uploads/avatars/...
                userAvatarImg.src = `${API_BASE_URL.replace('/api', '')}${userData.avatarUrl}`;
            }

            // EXIBIR o endereço na aba “Endereços”
            displayUserAddress(userData.address);

            // EXIBIR os pedidos na aba “Meus Pedidos”
            fetchUserOrders();

            // EXIBIR mensagem de “não ativo” na aba “Sua Assinatura”
            displayUserSubscription(); 
            // (atualmente sempre mostra “não é assinante”, pois esse backend não possui rota de assinatura)

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
                // Atualiza visualização em “Endereços” automaticamente
                displayUserAddress(respData.address);
            } catch (err) {
                console.error('Erro ao atualizar perfil:', err);
                alert(err.message);
            }
        });
    }

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
      userAvatarImg.src = `${API_BASE_URL.replace('/api', '')}${data.avatarUrl}`;

      // ==== ADICIONE ESSES DOIS TRECHOS ABAIXO ====
      localStorage.setItem('userAvatarUrl', `${API_BASE_URL.replace('/api', '')}${data.avatarUrl}`);
      if (window.updateUIAfterLogin) {
        window.updateUIAfterLogin();
      }
      // ===========================================

      alert('Foto de perfil atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao enviar foto de perfil:', err);
      alert(err.message);
    }
  });
}

    // ------------------------------
    // 5) Função para exibir “Sua Assinatura”
    //    (aqui, exibe sempre “não ativo”)
    // ------------------------------
    function displayUserSubscription() {
        // como não há rota de subscription no back-end, simulamos sempre sem assinatura
        subscriptionLoadingDiv.style.display = 'none';
        activeSubscriptionDetailsDiv.style.display = 'none';
        noActiveSubscriptionDiv.style.display = 'block';
    }

    // ------------------------------
    // 6) Função para buscar “Meus Pedidos”
    //    Rota: GET /api/orders/my
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
                // Para cada pedido, criamos um card simples
                orders.forEach(order => {
                    const divCard = document.createElement('div');
                    divCard.classList.add('order-card');
                    divCard.style.border = '1px solid #ddd';
                    divCard.style.padding = '12px';
                    divCard.style.marginBottom = '10px';
                    divCard.style.borderRadius = '6px';

                    // Ex.: ordem de exemplo: { _id, userId, boxType, planType, createdAt, ... }
                    const createdAt = new Date(order.createdAt).toLocaleDateString('pt-BR');
                    divCard.innerHTML = `
                        <p><strong>ID Pedido:</strong> ${order._id}</p>
                        <p><strong>Tipo de Box:</strong> ${order.boxType}</p>
                        <p><strong>Plano:</strong> ${order.planType}</p>
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
            // monta a exibição do endereço formatado
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
            // Caso não haja endereço salvo
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
        // exibe/oculta seções
        contentSections.forEach(sec => {
            sec.classList.toggle('active-content', sec.id === sectionId);
        });
        // atualiza estilo do link ativo
        navLinks.forEach(link => {
            const target = link.getAttribute('data-section');
            // A classe CSS esperada para link ativo é “active-account-tab” (estilo no CSS)
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
