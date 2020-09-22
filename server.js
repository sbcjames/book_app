'use strict';

const express = require('express');
const app = express();
require('ejs');
const superagent = require('superagent');
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => {
  console.log(error);
});

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.get('/', renderHome);
app.get('/searchform', renderSearchForm);
app.post('/searches', collectFormInformation);

function renderHome(req, res){
  console.log('inside render home')
  const sql = 'SELECT * FROM booktable;';
  return client.query(sql)
    .then(results => {
      console.log(results.rows);
      let allbooks = results.rows;
      res.status(200).render('pages/index', {renderedContent: allbooks});
    })
    .catch(error =>{
      console.log(error)
      res.render('pages/error');
    })
}

function renderSearchForm (req, res) {
  res.render('pages/searches/new.ejs');

}

function collectFormInformation(request, response){
  // console.log(request.body);
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if(searchType === 'title'){ url += `+intitle:${searchQuery}`}
  if(searchType === 'author'){ url += `+inauthor:${searchQuery}`}

  superagent.get(url)
    .then(data => {
      console.log(data.body.items[2])
      const bookArray = data.body.items;
      const finalBookArray = bookArray.map(book => new Book(book.volumeInfo));
      response.render('pages/searches/show', {renderedContent: finalBookArray});
    })
    .catch(error =>{
      response.render('pages/error');
    })
}

function Book(book){
  this.title = book.title;
  this.description = book.description;
  this.authors = book.authors;
  this.image = book.imageLinks ? book.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is ALIVE and listening on port ${PORT}`);
    });
  })

