'use strict';

const express = require('express');
const app = express();
require('ejs');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.get('/', renderHome);
app.get('/searchform', renderSearchForm);
app.post('/searches', collectFormInformation);

function renderHome(req, res){
  res.render('pages/index');
}

function renderSearchForm (req, res) {
  res.render('pages/searches/new.ejs');

}

function collectFormInformation(request, response){
  console.log(request.body);
  const searchQuery = request.body.search[0];
  const searchType = request.body.search[1];

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if(searchType === 'title'){ url += `+intitle:${searchQuery}`}
  if(searchType === 'author'){ url += `+inauthor:${searchQuery}`}

  superagent.get(url)
    .then(data => {
      // console.log(data.body.items[1])
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

app.listen(PORT, () => {
  console.log(`Server is ALIVE and listening on port ${PORT}`);
});
