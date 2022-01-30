require("dotenv").config();
const express = require("express");
const { sendToSheet } = require("./notion");
const { sendEmail } = require("./email");

const port = process.env.PORT || 5000;

const app = express();
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/fetchdata", async (req, res) => {
  await sendToSheet();
  res.redirect('/')
});

app.get("/verifyProdutos", async (req, res) => {
  await sendEmail();
  res.redirect('/');
})

app.listen(port, console.log(`Server in port ${port}`));
