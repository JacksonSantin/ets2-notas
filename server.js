const express = require('express');
const axios = require('axios');
const cors = require("cors");
const path = require('path');
const gerarNotaPdf = require('./gerarNotaPdf');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/nota', async (req, res) => {
  try {
    const hostname = req.hostname; // IP ou nome do host que fez a requisição
    const telemetryUrl = `http://${hostname}:25555/api/ets2/telemetry`;

    console.log('🔍 Buscando dados do ETS2 em:', telemetryUrl);

    const telemetry = (await axios.get(telemetryUrl)).data;

    const job = telemetry.job;
    const vehicle = telemetry.truck;

    const dadosNota = {
      emitenteNome: job?.sourceCompany || '',
      emitenteEndereco: `${job?.sourceCity || ''} - ${job?.sourceCompany || ''}`,
      marca: vehicle?.make || '',
      placa: vehicle?.licensePlate || 'SEM-PLACA',
      motorista: telemetry?.truck?.driverName || '',
      localManifesto: job?.sourceCity,
      dataManifesto: new Date().toLocaleDateString('pt-BR'),
      valor_frete: job?.income,
      empresa_remetente: job?.sourceCompany,
      empresa_destinataria: job?.destinationCompany,
    };

    const pdfBuffer = await gerarNotaPdf(dadosNota);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=manifesto.pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Erro ao buscar dados do ETS2:', error.message);
    console.error(error); // log completo
    res.status(500).json({
      erro: 'Falha ao gerar nota de carga.',
      detalhe: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
