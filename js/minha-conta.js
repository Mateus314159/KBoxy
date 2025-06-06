// public/js/minha-conta.js

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
            profileInputName.value  = userData.name  || '';

            // Preenche formulário “Meu Perfil” com endereço, se existir
            if (userData.address) {
                profileInputStreet.value       = userData.address.street       || '';
                profileInputComplement.value   = userData.address.complement   || '';
                profileInputNeighborhood.value = userData.address.neighborhood || '';
                profileInputCity.value         = userData.address.city         || '';
                profileInputState.value        = userData.address.state        || '';
                profileInputZipcode.value      = userData.address.zipcode      || '';
            }

            // Exibe assinatura na aba “Sua Assinatura”
            displayUserSubscription();

        } catch (err) {
            console.error('Erro ao buscar perfil:', err);
        }
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
            subscriptionLoadingDiv.style.display = 'none';
            if (!response.ok) throw new Error('Falha ao carregar assinatura.');

            const { planType, boxType, startDate, nextPaymentDate, repetitionsLeft } = await response.json();

            // 5.2) Sem assinatura ativa?
            if (!planType) {
                noActiveSubscriptionDiv.style.display = 'block';
                return;
            }

            // 5.3) Formata datas para pt-BR
            const formattedStart    = new Date(startDate).toLocaleDateString('pt-BR');
            const formattedNext     = new Date(nextPaymentDate).toLocaleDateString('pt-BR');

            // 5.4) Textos amigáveis
            const planTextMap = {
                one_time:  'Compra Única',
                mensal:    'Plano Mensal',
                semiannual:'Plano Semestral',
                annual:    'Plano Anual'
            };
            const boxTextMap = {
                firstLove: 'First Love',
                idolBox:   'Lover',
                legendBox: 'True Love'
            };

            // 5.5) Monta o card
            activeSubscriptionDetailsDiv.innerHTML = `
                <div class="subscription-card">
                    <p><strong>Box:</strong> ${boxTextMap[boxType]   || boxType}</p>
                    <p><strong>Plano:</strong> ${planTextMap[planType] || planType}</p>
                    <p><strong>Início da Assinatura:</strong> ${formattedStart}</p>
                    <p><strong>Próxima Cobrança:</strong> ${formattedNext}</p>
                    <p><strong>Parcelas Restantes:</strong> ${repetitionsLeft}</p>
                    <button id="cancel-subscription-btn" class="btn btn-secondary btn-small">
                      Cancelar Assinatura
                    </button>
                </div>
            `;
            activeSubscriptionDetailsDiv.style.display = 'block';

            // 5.6) Cancelamento
            document.getElementById('cancel-subscription-btn')
                .addEventListener('click', async () => {
                    if (!confirm('Deseja realmente cancelar sua assinatura?')) return;
                    const cancelResp = await fetch(`${API_BASE_URL}/subscription`, {
                        method: 'DELETE',
                        headers: { 'Authorization': token }
                    });
                    if (!cancelResp.ok) throw new Error('Falha ao cancelar assinatura.');
                    alert('Assinatura cancelada com sucesso.');
                    displayUserSubscription();
                });

        } catch (err) {
            console.error('Erro em displayUserSubscription:', err);
            noActiveSubscriptionDiv.style.display = 'block';
        }
    }

    // ------------------------------
    // 3) Outras funções e handlers já existentes
    // ------------------------------
    // (fetch de pedidos, endereços, avatar, troca de senha, navegação de abas...)

    // ------------------------------
    // 10) Inicialização
    // ------------------------------
    fetchUserProfile();
});
