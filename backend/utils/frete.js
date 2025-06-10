// backend/utils/frete.js
const { calcularPrecoPrazo } = require('correios-brasil');  // ← alterado

/**
 * Calcula o frete usando a API dos Correios.
 * @param {string|number} cepDestino CEP de destino (aceita vários formatos)
 * @returns {Promise<number>} Valor do frete em R$
 */
async function calcularFrete(cepDestino) {
  // 1) Normaliza e formata o CEP de destino
  let cep = String(cepDestino).replace(/\D/g, '');
  if (cep.length === 8) {
    cep = cep.slice(0, 5) + '-' + cep.slice(5);
  }

  const params = {
    sCepOrigem: '13566-545',    // ajuste para o CEP da sua loja
    sCepDestino: cep,
    nVlPeso: '0.300',
    nCdFormato: 1,
    nVlComprimento: '20',
    nVlAltura: '10',
    nVlLargura: '15',
    nVlDiametro: '0',
    nCdServico: ['04014'],      // SEDEX
  };

  try {
    // ← aqui usamos o nome correto da função exportada
    const resposta = await calcularPrecoPrazo(params);
    // resposta é um array de objetos; pegamos o primeiro
    const resultado = resposta[0];
    return parseFloat(resultado.Valor.replace(',', '.'));
  } catch (err) {
    console.error('[calcularFrete] Erro na API dos Correios:', err);
    throw new Error('Não foi possível calcular o frete. Tente novamente.');
  }
}

module.exports = calcularFrete;
