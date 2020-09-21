'use strict';

const express = require('express');
const app = express();
require('ejs');

const PORT = process.env.PORT;

app.set('view engine', 'ejs');
app.get('/', renderHome);

function renderHome(req, res){
  res.render('index.ejs');
}

app.listen(PORT, () => {
  console.log(`Server is ALIVE and listening on port ${PORT}`);
});
