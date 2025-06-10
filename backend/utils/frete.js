// backend/utils/frete.js
const axios = require('axios');
axios.defaults.timeout = 15000;  // até 15s de espera

const { calcPrecoPrazo } = require('correios-brasil');  // <— aqui

const delay = ms => new Promise(res => setTimeout(res, ms));

async function calcularFrete(cepDestino) {
  // normaliza e formata o CEP
  let cep = String(cepDestino).replace(/\D/g, '');
  if (cep.length === 8) cep = cep.slice(0,5) + '-' + cep.slice(5);

  const params = {
    sCepOrigem:    '13566-545',  // <— seu CEP de origem, com hífen
    sCepDestino:   cep,
    nVlPeso:       '0.300',
    nCdFormato:    1,
    nVlComprimento:'20',
    nVlAltura:     '10',
    nVlLargura:    '15',
    nVlDiametro:   '0',
    nCdServico:    '04014'       // SEDEX
  };

  // função que chama de fato a API
  const attempt = async () => {
    const resposta = await calcPrecoPrazo(params);
    if (!Array.isArray(resposta) || !resposta[0] || !resposta[0].Valor) {
      throw new Error('Resposta inválida dos Correios: ' + JSON.stringify(resposta));
    }
    return parseFloat(resposta[0].Valor.replace(',', '.'));
  };

  try {
    return await attempt();
  } catch (err) {
    console.warn('[calcularFrete] 1ª tentativa falhou:', err.message);
    await delay(1000);
    try {
      return await attempt();
    } catch (err2) {
      console.error('[calcularFrete] 2ª tentativa falhou:', err2.message);
      throw new Error('Não foi possível calcular o frete. Verifique o CEP ou tente novamente mais tarde.');
    }
  }
}

module.exports = calcularFrete;
