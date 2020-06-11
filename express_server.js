// <---------------------------------- Constants -------------------------------------->
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
};

const users = {};

// <---------------------------------- Middleware -------------------------------------->

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// <------------------------------- Helper Functions ----------------------------------->

// returns string of 6 random characters
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// returns user object if emails match *(try filter instead of for loop)*
const emailLookup = function(database, userEmail) {
  let foundUser = '';
  for (const user in database) {
    if (database[user].email === userEmail) {
      foundUser = database[user];
    }
  }
  return foundUser;
};

// <-------------------------------- GET requests -------------------------------------->

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
  if (users[req.cookies.user_id]) {
    let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
    res.render("urls_index", templateVars);
  }

  return res.redirect('/login');
});

// renders new page on GET request
app.get('/urls/new', (req, res) => {
  //if user isn't logged in:
  if (!req.cookies.user_id) {
    return res.redirect('/login');
  }

  let templateVars = { user: users[req.cookies.user_id] };
  return res.render('urls_new', templateVars);
});

// renders registration page on GET request
app.get('/register', (req, res) => {
  if (!users[req.cookies.user_id]) {
    let templateVars = { user: users[req.cookies.user_id] };
    return res.render('user_registration', templateVars);
  }

  return res.redirect('/urls');
});

// renders login page on GET request
app.get('/login', (req, res) => {
  if (!users[req.cookies.user_id]) {
    let templateVars = { user: users[req.cookies.user_id] };
    return res.render('user_login', templateVars);
  }

  return res.redirect('/urls');
});

// redirects to actual website from shortURL *** Add error page
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
  }
  
});

// renders edit page for current shortURL *** Add error page
app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] && users[req.cookies.user_id]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies.user_id] };
  return res.render('urls_show', templateVars);
  }
  
});


// <------------------------------- POST requests -------------------------------------->
 
// handles post request by url/new form,
//  generates shortURL updates database with long and short URLs
app.post('/urls', (req, res) => {
  if (users[req.cookies.user_id]) {
    console.log(req.body);  //Log the POST request body to the console
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id};
    return res.redirect(`/urls/${shortURL}`);
  }

  return res.redirect('/login');
});

// pushes user info to users obj, creates cookie with new user ID
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if (!userID || !userPass) {
    return res.status(400).send('Error 400: Email and/or Password Invalid');
  }

  if (emailLookup(users, userEmail)) {
    return res.status(400).send('Error 400: Email already exists');
  }

  const newUser = {
    id : userID,
    email : userEmail,
    password: userPass
  };
  users[userID] = newUser;

  res.cookie('user_id', userID);
  return res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const user = emailLookup(users, userEmail);

  if (!user) {
    return res.status(403).send('Error 403: Email cannot be found');
  }

  if (user.password === userPass) {
    res.cookie('user_id', user.id);
    return res.redirect('/urls');
  }

  return res.status(403).send('Email and/or Password does not match');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('/urls');
});

// updates new longURL with our shortURL *** Add error page
app.post('/urls/:id', (req, res) => {
  if (users[req.cookies.user_id]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect('/urls');
  }

  return res.redirect('/login');
});

// deletes a URL
app.post('/urls/:shortURL/delete', (req, res) => {
  if (users[req.cookies.user_id]) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }

  return res.redirect('/login');
});

// <-------------------------------- Server Listen -------------------------------------->

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});