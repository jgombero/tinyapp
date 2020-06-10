const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

// helper function
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// renders urls page on GET request
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

// renders new page on GET request
app.get('/urls/new', (req, res) => {
  templateVars = { user: users[req.cookies.user_id] };
  res.render('urls_new', templateVars);
 });

  // renders registration page on GET request
app.get('/register', (req, res) => {
  res.render('user_registration');
 });

 // redirects to actual website from shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
 });

 // renders edit page for current shortURL
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render('urls_show', templateVars);
});
 
 // handles post request by url/new form, 
 //  generates shortURL updates database with long and short URLs
app.post('/urls', (req, res) => {
  console.log(req.body);  //Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
 });

 // pushes user info to users obj, creates cookie with new user ID
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const newUser = {
    id : userID,
    email : userEmail,
    password: userPass
  };
  users[userID] = newUser;

  res.cookie('user_id', userID);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.username); 
  // req.cookies = { username: 'jgombero' }
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// updates new longURL with our shortURL
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

// deletes a URL
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});