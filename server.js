const express = require('express');
const axios = require('axios');
const cors = require("cors");
const gerarNotaPdf = require('./gerarNotaPdf');

const app = express();

app.use(cors());

app.get('/nota', async (req, res) => {
  try {
    const job = (await axios.get('http://localhost:25555/api/job')).data;

    const vehicle = (await axios.get('http://localhost:25555/api/vehicle')).data;

    const telemetry = (await axios.get('http://localhost:25555/api/telemetry')).data;

    const dadosNota = {
      emitenteNome: job.sourceCompany || '',
      emitenteEndereco: `${job.sourceCity} - ${job.sourceCompany}`,

      marca: vehicle.make || '',
      placa: vehicle.licensePlate || 'SEM-PLACA',
      motorista: telemetry.truck.driverName || '',

      localManifesto: job.sourceCity,
      dataManifesto: new Date().toLocaleDateString('pt-BR'),

      valor_frete: job.income,
      empresa_remetente: job.sourceCompany,
      empresa_destinataria: job.destinationCompany,
    };

    const pdfBuffer = await gerarNotaPdf(dadosNota);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=manifesto.pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Erro ao buscar dados do ETS2:', error.message);
    res.status(500).json({ erro: 'Falha ao gerar nota de carga.' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

module.exports = app;