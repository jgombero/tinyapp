// <---------------------------------- Constants -------------------------------------->
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const users = {};

// Sample urlDatabase
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
};

// Helper Functions
const { generateRandomString, getUserByEmail, urlsForUser} = require('./helpers.js');

// <---------------------------------- Middleware -------------------------------------->

app.use(cookieSession({
  name: 'session',
  keys: ['onesmartfellowhefeltsmart']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

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
  if (users[req.session.user_id]) {

    const filteredDatabase = urlsForUser(urlDatabase, req.session.user_id);
   
    let templateVars = { urls: filteredDatabase, user: users[req.session.user_id] };
    return res.render("urls_index", templateVars);
  }

  return res.redirect('/login');
});

// renders new page on GET request
app.get('/urls/new', (req, res) => {
  //if user isn't logged in:
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  let templateVars = { user: users[req.session.user_id] };
  return res.render('urls_new', templateVars);
});

// renders registration page on GET request
app.get('/register', (req, res) => {
  if (!users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id], error: null };
    return res.render('user_registration', templateVars);
  }

  return res.redirect('/urls');
});

// renders login page on GET request *** Not using yet
app.get('/login', (req, res) => {
  if (!users[req.session.user_id]) {
    let templateVars = { user: users[req.session.user_id], error: null };
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

// renders edit page for current shortURL
app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] && users[req.session.user_id]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
    return res.render('urls_show', templateVars);
  }
  return res.redirect('/login');
});

// <------------------------------- POST requests -------------------------------------->
 
// handles post request by url/new form,
//  generates shortURL updates database with long and short URLs
app.post('/urls', (req, res) => {
  if (users[req.session.user_id]) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id};
    return res.redirect(`/urls/${shortURL}`);
  }

  return res.redirect('/login');
});

// pushes user info to users obj, creates cookie with new user ID
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPass, saltRounds);

  if (!userID || !hashedPassword) {
    // this is kind of redundant since i've added "require" to the inputs
    return res.status(403).render('user_registration', { error: "Email and/or Password Invalid", user: null });
  }

  if (getUserByEmail(users, userEmail)) {
    return res.status(403).render('user_registration', { error: "Email already exists", user: null });
  }

  const newUser = {
    id : userID,
    email : userEmail,
    password: hashedPassword
  };
  users[userID] = newUser;

  req.session.user_id = userID;
  return res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const user = getUserByEmail(users, userEmail);

  if (!user) {
    return res.status(403).render('user_login', { error: 'Email address cannot be found. Please register', user: null });
  }

  const passwordMatch = bcrypt.compareSync(userPass, user.password);

  if (passwordMatch) {
    req.session.user_id = user.id;
    return res.redirect('/urls');
  }

  return res.status(403).render('user_login', { error: 'Email and/or Password does not match', user: null });
});

app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/login');
});

// updates new longURL with our shortURL *** Add error page
app.post('/urls/:id', (req, res) => {
  if (users[req.session.user_id] && req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect('/urls');
  }

  return res.redirect('/login');
});

// deletes a URL
app.post('/urls/:shortURL/delete', (req, res) => {
  if (users[req.session.user_id] && req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }

  return res.redirect('/login');
});

// <-------------------------------- Server Listen -------------------------------------->

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});