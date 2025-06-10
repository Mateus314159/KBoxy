// backend/utils/frete.js
const { calcularPrecoPrazo } = require('correios-brasil');

/**
 * Calcula o frete usando a API dos Correios com um sistema de timeout.
 * @param {string|number} cepDestino CEP de destino
 * @returns {Promise<number>} Valor do frete em R$
 */
async function calcularFrete(cepDestino) {
  // 1) Normaliza e formata o CEP de destino
  let cep = String(cepDestino).replace(/\D/g, '');
  if (cep.length === 8) {
    cep = cep.slice(0, 5) + '-' + cep.slice(5);
  }

  const params = {
    sCepOrigem: '13566-545',
    sCepDestino: cep,
    nVlPeso: '0.300',
    nCdFormato: 1,
    nVlComprimento: '20',
    nVlAltura: '10',
    nVlLargura: '15',
    nVlDiametro: '0',
    nCdServico: ['04014'], // SEDEX
  };

  try {
    // --- INÍCIO DA ALTERAÇÃO ---
    // Adiciona um timeout de 10 segundos para a chamada da API.
    // Promise.race resolve ou rejeita assim que a primeira promise da lista o fizer.
    // Se a API dos Correios demorar mais de 10s, a promise de timeout vai rejeitar primeiro.

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('A consulta aos Correios demorou muito para responder (timeout).'));
      }, 10000); // 10 segundos
    });

    // Disputa entre a chamada da API e o nosso timeout
    const resposta = await Promise.race([
      calcularPrecoPrazo(params),
      timeoutPromise
    ]);
    // --- FIM DA ALTERAÇÃO ---

    // Se chegamos aqui, a API dos Correios respondeu a tempo.
    // A lógica para extrair o valor continua a mesma.
    const resultado = resposta[0];

    // Validação extra: verifica se o resultado tem um valor válido
    if (resultado && resultado.Valor && resultado.Valor.includes(',')) {
      return parseFloat(resultado.Valor.replace(',', '.'));
    } else {
      // Caso a API retorne um erro estruturado (ex: CEP inválido)
      console.error('[calcularFrete] Resposta inválida dos Correios:', resultado.MsgErro);
      throw new Error(resultado.MsgErro || 'Os Correios retornaram uma resposta inválida.');
    }

  } catch (err) {
    // Agora o catch vai pegar tanto erros da API quanto o nosso erro de timeout
    console.error('[calcularFrete] Erro na API dos Correios ou timeout:', err.message);
    throw new Error('Não foi possível calcular o frete. Verifique o CEP ou tente novamente mais tarde.');
  }
}

module.exports = calcularFrete;