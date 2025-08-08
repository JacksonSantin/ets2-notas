const PDFDocument = require("pdfkit");
const { Buffer } = require("node:buffer");

function gerarNotaPdf(dados) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc
      .fontSize(14)
      .text("MANIFESTO DE CARGA – MODELO 25", { align: "center" });
    doc.moveDown(0.5);

    // Cabeçalho
    const yStart = doc.y;
    doc.fontSize(10);

    // 1. Emitente
    doc.rect(40, yStart, 160, 60).stroke();
    doc.text(
      `NOME DO EMITENTE\n${
        dados.emitenteNome || "Empresa Exemplo"
      }\nEndereço: ${dados.emitenteEndereco || "Rua X, 123"}`,
      45,
      yStart + 5
    );

    // 2. Veículo
    doc.rect(200, yStart, 200, 60).stroke();
    doc.text(
      `DADOS DO VEÍCULO\nMarca: ${dados.marca || ""}  Placa: ${
        dados.placa || "SEM-PLACA"
      }\nMotorista: ${dados.motorista || ""}`,
      205,
      yStart + 5
    );

    // 3. Manifesto
    doc.rect(400, yStart, 140, 60).stroke();
    doc.text(
      `MANIFESTO DE CARGA\nLocal: ${dados.localManifesto || ""}\nData: ${
        dados.dataManifesto || new Date().toLocaleDateString()
      }`,
      405,
      yStart + 5
    );

    // Tabela principal
    doc.moveDown(4);
    const yTabela = doc.y;

    doc.font("Helvetica-Bold");
    doc.rect(40, yTabela, 500, 20).stroke();
    doc.text("CONHECIMENTO", 45, yTabela + 5);
    doc.text("NOTA FISCAL", 125, yTabela + 5);
    doc.text("VALOR MERCADORIA", 230, yTabela + 5);
    doc.text("REMETENTE", 340, yTabela + 5);
    doc.text("DESTINATÁRIO", 440, yTabela + 5);
    doc.font("Helvetica");

    // Linha de dados da entrega
    doc.rect(40, yTabela + 20, 500, 20).stroke();
    doc.text("0001 / A", 45, yTabela + 25);
    doc.text("1234 / B", 125, yTabela + 25);
    doc.text(`R$ ${dados.valor_frete || 0}`, 230, yTabela + 25);
    doc.text(dados.empresa_remetente || "Remetente", 340, yTabela + 25);
    doc.text(dados.empresa_destinataria || "Destinatário", 440, yTabela + 25);

    // Observações
    const yObs = yTabela + 60;
    doc.rect(40, yObs, 500, 60).stroke(); // aumentou largura de 400 para 500
    doc.fontSize(10);
    doc.text("OBSERVAÇÕES:\nEntrega feita no simulador ETS2.", 45, yObs + 5);

    doc.end();
  });
}

module.exports = gerarNotaPdf;
