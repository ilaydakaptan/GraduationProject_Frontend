const express = require('express');
const { Pool } = require('pg');
const ejs = require('ejs');

const app = express();
const port = 3001;

app.use(express.json()); // Parse JSON requests

app.set('view engine', 'ejs');

const connectionString = 'postgressql://postgres:200101023@localhost:5432/BitirmeProjesi';

const pool = new Pool({
  connectionString: connectionString
});

let textInput = "";

app.post('/submit-text', (req, res) => {
  const postTextInput = req.body.textInput;

  pool.query('INSERT INTO yorumlar (comment) VALUES ($1) RETURNING *', [postTextInput], (err, result) => {
    if (err) {
      console.error('PostgreSQL insertion error:', err);
      res.status(500).json({ error: 'An error occurred while inserting the text.' });
    } else {
      const insertedRow = result.rows[0];
      textInput = postTextInput; // Güncelleme burada yapılıyor
      res.status(200).json({ insertedRow });
    }
  });
});

app.get('/', (req, res) => {
  const getTextInput = textInput; // Değer kullanımı burada yapılıyor

  pool.query("SELECT prediction FROM makine WHERE comment = ($1) LIMIT 4", [getTextInput], (err, result) => {
    if (err) {
      console.error('PostgreSQL query error:', err);
      res.render('index', { errorMessage: 'Hata oluştu', htmlResult: '' });
    } else {
      const rows = result.rows;
      const htmlResult = rows.map(row => row.prediction).join('');
      res.render('index', { htmlResult });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
