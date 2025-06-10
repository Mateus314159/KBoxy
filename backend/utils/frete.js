// src/utils/frete.js
const { calcPrecoPrazo } = require('correios-brasil');

async function calcularFrete(cepDestino) {
  const params = {
    sCepOrigem: '13566-545',      // CEP de origem da sua loja
    sCepDestino: cepDestino,      // CEP informado pelo cliente
    nVlPeso: '0.300',             // peso em kg (ajuste conforme média do produto)
    nCdFormato: 1,                // formato: 1 = caixa/pacote
    nVlComprimento: '20',         // comprimento em cm
    nVlAltura: '10',              // altura em cm
    nVlLargura: '15',             // largura em cm
    nVlDiametro: '0',             // diâmetro em cm
    nCdServico: ['04014'],        // array de códigos de serviço (04014 = SEDEX)
  };
  const [resultado] = await calcPrecoPrazo(params);
  return parseFloat(resultado.Valor.replace(',', '.'));
}

module.exports = calcularFrete;
