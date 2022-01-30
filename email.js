require("dotenv").config();
const nodemailer = require('nodemailer');
const { verifyProdudos } = require("./notion")

let textPage = async () => {
  let data = await verifyProdudos()

  if(data.length < 1) return 0;

  let produtos = data.map(item => {
    return(`
      O ${item.name} está acabando...
      Mais informações:
      ID: ${item.id}.
      DEPARTAMENTO: ${item.depart}.\n
    `)
  })

 return produtos.reduce((c, n) => c + n);
}

const user = process.env.EMAIL_AUTH;
const pass = process.env.PASS_AUTH;

const transporter = nodemailer.createTransport({
  host: process.env.HOST_EMAIL,
  port: process.env.PORT_EMAIL,
  auth: { user, pass },
  service: 'one',
  tls : { rejectUnauthorized: false }
})

const sendEmail = async () => {
  textPage().then(res => {
    if(res === 0) { console.log("Estoque ok.") }
    else {
      transporter.sendMail({
        from: user,
        to: process.env.SEND_TO,
        subject: "Testando skyler",
        text: res
      })
      .then(() => {
        console.log('Email enviado')
      })
      .catch(err => {
        console.log(err.message)
      })
    }
  })
}

module.exports = {
  sendEmail
}