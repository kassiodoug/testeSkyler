require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");

const doc = new GoogleSpreadsheet(process.env.SPREADSHET_ID);

const addCompras = async (params) => {
  console.log(params)
  await doc.useServiceAccountAuth({
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  await sheet.addRows(params);
}

module.exports = {
  addCompras
}