const express = require("express");
const { GoogleSpreadsheet } = require('google-spreadsheet');

require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use(express.urlencoded({extended: true}));


app.get("/", function(req, res) {
  res.end("Welcome to LA PAIX. If you're here, you might be lost.");
});

app.get("/portfolio", function(req, res) {
  const sheetInd = req.query.sheet;
  //console.log(process.env);
  const doc = new GoogleSpreadsheet(process.env.G_SHEET);
  getData()
    .then(() => {
      console.log("success");
    })
    .catch((error) => {
      console.error(error,'Promise error');
    });

  async function getData(){
    try {
      await doc.useServiceAccountAuth({
          client_email: process.env.G_SHEET_EMAIL,
          private_key: process.env.G_SHEET_KEY
      });
      await doc.loadInfo();
      const sheet = await doc.sheetsByIndex[sheetInd];
      await sheet.loadHeaderRow();
      const cols = sheet.headerValues;
      const rows = await sheet.getRows();
      const data = [];
      for (let r in rows){
          let row = rows[r];
          let rowObj = {};
          for (let c in cols){
              let col = cols[c];
              let rowValue = row[col];
              if(rowValue !== "undefined" && rowValue !== undefined && rowValue !== ""){
                  rowObj[col] = rowValue;
              }
          }
          data.push( rowObj );
      }
      const sheetData = { title: sheet.title, columns: cols, rows: data };
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ sheetData }));
    } catch (err) {
      res.send("There's been an error querying the data. Please try again later.");
    }
  }
});

app.listen(PORT);
console.log(`API is listening on: ${PORT}`);