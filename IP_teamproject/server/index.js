var sqlite3 = require("sqlite3").verbose(); // sqlite3 모듈 불러와서 변수에 담기
const express = require("express");
var cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

app.get("/univ", (req, res) => {
  const { continent, toefl, is_english, order_by } = req.query;

  console.log(req.query);

  let db = new sqlite3.Database("bd_univ.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
      console.error(dbPath);
    } else {
      console.log("Connected to the database.");
    }
  }); // db sqlite3 db에 연결하는 코드!!

  let query,
    englishQuery = "";

  if (is_english === "y") {
    englishQuery = `AND Language1 = '영어 English'`;
  } else if (is_english === "n") {
    englishQuery = `AND Language1 != '영어 English'`;
  }

  if (order_by === "ranking") {
    query = `SELECT * FROM bd_univ WHERE Continent='${continent}' AND ToeflIBT > ${toefl} ${englishQuery} ORDER BY Ranking ASC`;
  } else if (order_by === "toefl") {
    query = `SELECT * FROM bd_univ WHERE Continent='${continent}' AND ToeflIBT > ${toefl} ${englishQuery} ORDER BY ToeflIBT ASC`;
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  }); // db 닫는 코드!!
});

app.post("/basic", (req, res) => {
  let db = new sqlite3.Database(
    "BasicInfo.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error(err.message);
        console.error(dbPath);
      } else {
        console.log("Connected to the database.");
      }
    }
  ); // db sqlite3 db에 연결하는 코드!!

  let query = `SELECT * FROM BasicInfo`;

  db.all(query, [], (err, basicRows) => {
    if (err) {
      throw err;
    }
    res.json(basicRows);
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  }); // db 닫는 코드!!
});

app.post("/corona", (req, res) => {
  let db = new sqlite3.Database("corona.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
      console.error(dbPath);
    } else {
      console.log("Connected to the database.");
    }
  }); // db sqlite3 db에 연결하는 코드!!

  let query = `SELECT * FROM Corona`;

  db.all(query, [], (err, coronaRows) => {
    if (err) {
      throw err;
    }
    res.json(coronaRows);
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  }); // db 닫는 코드!!
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
