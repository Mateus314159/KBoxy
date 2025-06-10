// backend/utils/frete.js
const axios = require('axios');
axios.defaults.timeout = 10000;  // aguarda até 10s por resposta

const { calcularPrecoPrazo } = require('correios-brasil');

/**
 * Aguarda um dado número de milissegundos.
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Calcula o frete usando a API dos Correios, com retry em caso de timeout.
 * @param {string|number} cepDestino  
 * @returns {Promise<number>} valor do frete em R$
 */
async function calcularFrete(cepDestino) {
  // 1) Normaliza e formata o CEP de destino
  let cep = String(cepDestino).replace(/\D/g, '');
  if (cep.length === 8) {
    cep = cep.slice(0,5) + '-' + cep.slice(5);
  }

  const params = {
    sCepOrigem:   '13566-545',   // ajuste para o CEP da sua loja
    sCepDestino:  cep,
    nVlPeso:      '0.300',
    nCdFormato:   1,
    nVlComprimento: '20',
    nVlAltura:      '10',
    nVlLargura:     '15',
    nVlDiametro:    '0',
    nCdServico:   ['04510'],     // SEDEX; para PAC use '04510'
  };

  // Função interna que chama de fato a API
  const attempt = async () => {
    const respArray = await calcularPrecoPrazo(params);
    const resultado  = respArray[0];
    return parseFloat(resultado.Valor.replace(',', '.'));
  };

  try {
    // primeira tentativa
    return await attempt();
  } catch (err) {
    console.warn('[calcularFrete] primeira tentativa falhou:', err.message);
    // aguarda um segundo e tenta de novo
    await delay(1000);
    try {
      return await attempt();
    } catch (err2) {
      console.error('[calcularFrete] segunda tentativa falhou:', err2.message);
      throw new Error('Não foi possível calcular o frete. Verifique o CEP ou tente novamente mais tarde.');
    }
  }
}

module.exports = calcularFrete;
