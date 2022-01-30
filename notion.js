require("dotenv").config();
const { Client } = require("@notionhq/client");
const { addCompras } = require("./sheets");

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseIdCompras = process.env.NOTION_DATABASE_ID_COMPRAS;

const updateData = async (pageID) => {
  const pageId = pageID;
  await notion.pages.update({
      page_id: pageId,
      properties: {
        "sheets": {
          checkbox: true,
        },
      },
    })
    .then(() => {
      console.log("Success");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

const fetchCompras = async () => {
  const response = await notion.databases.query({
    database_id: databaseIdCompras,
    filter: {
      property: "sheets",
      checkbox: {
        equals: false,
      },
    },
  });

  if(response.results.length < 1) return 0;

  let compras = response.results.map((row) => {
    let endEntrega;
    try {
      endEntrega = row.properties['Endereço de entrega'].rich_text[0].plain_text;
    } catch {
      endEntrega = '';
    }

    updateData(row.id)
  
    return ({
      "Endereço de entrega": endEntrega,
      "ID da compra": row.properties['ID da compra'].title[0].plain_text,
      "Data da compra": row.properties['Data da compra'].date.start,
      "Data estimada de entrega": row.properties['Data estimada de entrega'].formula.date.start,
      "Data do envio": row.properties['Data do envio'].date.start,
    })
  });

  return compras;
};

const fetchProdutos = async () => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID_PRODUTOS
  });
  
  let produtos = response.results.filter(row => {
    const icons = row.properties.Status.formula.string;
    return icons === "🔆🔆🔆" || icons === "⭕️⭕️⭕️";
  })

  produtos = produtos.map(row => {
    return ({
      id: row.properties.ID.rich_text[0].plain_text,
      name: row.properties.Name.title[0].plain_text,
      depart: row.properties.Departamento.select.name,
      color: row.properties.Departamento.select.color
    })
  })

  return produtos;
}

const verifyData = async (func) => {
  let data;
  try {
    data = await func();
  } catch {
    data = []
  }
  return data;
};

const sendToSheet = async () => {
  const data = await verifyData(fetchCompras)
  if (data === 0) return 0;
  await addCompras(data)
};

const verifyProdudos = async () => {
  const data = await verifyData(fetchProdutos)
  if (data.length < 1) return 0;
  return(data)
};

module.exports = {
  sendToSheet,
  verifyProdudos
};
