// express_server.js

//setup
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//URL database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Users database object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Returns user object by Id
const getUserById = function(id) {
  for (const user in users) {
    if (user === id) {
      return users[user];
    }
  }
  return null;
};

//Returns user object by email
const getUserByEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

//Generates random string
const generateRandomStrings = function() {
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    if (Math.random() > 0.7) {
      randomString += Math.floor(Math.random() * 10);
    } else {
      let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      randomString += alphabet.charAt(Math.floor(Math.random() * 52));
    }
  }
  return randomString;
};

//Get Root Page Redirect
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//Get URLs Home Page
app.get("/urls", (req, res) => {
  const templateVars = {urlDatabase , user : getUserById(req.cookies["user_id"])};
  res.render("urls_index", templateVars);
});

//Get new URL form
app.get("/urls/new", (req, res) => {
  const templateVars = {user : getUserById(req.cookies["user_id"])};
  res.render("urls_new", templateVars);
});

//Post new URL to URL database
app.post("/urls", (req, res) => {
  const id = generateRandomStrings();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`); // Redirect to new tinyURL
});

//Get tiny URL page
app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], user : getUserById(req.cookies["user_id"])};
  res.render("urls_show", templateVars);
});

//Get redirect to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Post update to URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.update;
  res.redirect('/urls');
});

//Post delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//Get login page
app.get("/login", (req, res) => {
  const templateVars = {user : getUserById(req.cookies["user_id"])};
  res.render("urls_login", templateVars);
});

//Post login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (user) {
    if (user.password === req.body.password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send("Incorrect email or password.");
});

//Post logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

//Get register page
app.get("/register", (req, res) => {
  const templateVars = {user : getUserById(req.cookies["user_id"])};
  res.render("urls_register", templateVars);
});

//Post register
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Missing email or password.");
  } else if (getUserByEmail(req.body.email) !== null) {
    res.status(400).send("Email is already registered.");
  } else {
    const id = generateRandomStrings();
    users[id] = {};
    users[id].id = id;
    users[id].email = req.body.email;
    users[id].password = req.body.password;
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
