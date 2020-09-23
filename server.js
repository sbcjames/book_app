'use strict';

// dotenv configuration
require('dotenv').config();

const express = require('express');
const app = express();
require('ejs');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => {
  console.log(error);
});

const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.get('/', renderHome);
app.get('/searchform', renderSearchForm);
app.post('/searches', collectFormInformation);
app.post('/books', addBookToDatabase);
app.get('/books/:book_id', getOneBook);
app.put('/update/:book_id', updateOneBook);
app.delete('/update/:book_id', deleteBook);
app.get('*', handleError);


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

function updateOneBook(request, response){
  const id = request.params.book_id;
  const {authors, title, isbn, image, description} = request.body;
  let sql = 'UPDATE booktable SET author=$1, title=$2, isbn=$3, image_url=$4, description=$5 WHERE id=$6;';
  let safeValues = [authors, title, isbn, image, description, id];
  client.query(sql, safeValues);
  response.status(200).redirect(`/books/${id}`);
}

function deleteBook(request, response) {
  const id = request.params.book_id;
  let sql = 'DELETE FROM booktable WHERE id=$1;';
  let safeValues = [id];
  client.query(sql, safeValues);
  response.status(200).redirect('/');
}

function getOneBook(request, response) {
  const id = request.params.book_id;
  console.log('in the get one book', id);
  // now that I have the id, I can use it to look up the task in the database using the id, pull it out and display it to the user
  const sql = 'SELECT * FROM booktable WHERE id=$1;';
  const safeValues = [id];
  client.query(sql, safeValues)
    .then((results) => {
      console.log(results);
      // results.rows will look like this: [{my task}]
      const myChosenBook = results.rows[0];
      response.render('pages/books/detail', { value: myChosenBook });
    });
}

function renderSearchForm (req, res) {
  res.render('pages/searches/new.ejs');
}

function addBookToDatabase (req,res){
  const {authors,title, isbn, image, description} = req.body;
  const sql = 'INSERT INTO booktable (author, title, isbn, image_url, description) VALUES ($1,$2,$3,$4,$5) RETURNING id;';
  const safeValues = [authors, title, isbn, image, description];
  client.query(sql, safeValues)
    .then((idFromSQL) => {
      console.log(idFromSQL);
      res.redirect(`books/${idFromSQL.rows[0].id}`)
    }).catch((error) => {
      console.log(error);
      res.render('pages/error');
    });
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
      console.log(error)
      response.render('pages/error');
    })
}

function Book(book){
  this.title = book.title ? book.title : 'no title found';
  this.description = book.description ? book.description : 'no description found';
  this.authors = book.authors ? book.authors : 'no author found';
  this.isbn = book.industryIdentifiers ? book.industryIdentifiers[0].identifier : 'No ISBN available ';
  this.image = book.imageLinks ? book.imageLinks.thumbnail.replace(/^http:\/\//i, 'https://'): `https://i.imgur.com/J5LVHEL.jpg`;
}

function handleError(req,res){
  res.status(404).render('pages/error');
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is ALIVE and listening on port ${PORT}`);
    });
  })

