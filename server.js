'use strict';

const express = require('express');
const app = express();
require('ejs');

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.get('/', renderHome);

function renderHome(req, res){
  res.render('pages/index');
}

app.listen(PORT, () => {
  console.log(`Server is ALIVE and listening on port ${PORT}`);
});
