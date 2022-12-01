// express_server.js

//setup
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['bNVTX9q6']
}));
app.use(express.urlencoded({ extended: true }));

//URL database object
const urlDatabase = {};

//Users database object
const users = {};

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

//Return specific user's URLs
const urlsForUser = function(id) {
  const userUrlDatabase = {};

  //Build user specific URL database
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlDatabase[url] = urlDatabase[url];
    }
  }
  return userUrlDatabase;
};

//Get Root Page Redirect
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//Get URLs Home Page
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    //if not logged in
    res.send("Register to Login and view URLs.");
  } else {
    const templateVars = {urlDatabase : urlsForUser(req.session.user_id) , user : getUserById(req.session.user_id)};
    res.render("urls_index", templateVars);
  }
});

//Get new URL form
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    //Redirect if not logged in
    res.redirect('/login');
  } else {
    const templateVars = {user : getUserById(req.session.user_id)};
    res.render("urls_new", templateVars);
  }
});

//Post new URL to URL database
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    //if not logged in
    res.send("Login required to shorten URLs.");
  } else {
    const id = generateRandomStrings();
    urlDatabase[id] = {};
    urlDatabase[id].longURL = req.body.longURL;
    urlDatabase[id].userID = req.session.user_id;
    res.redirect(`/urls/${id}`); // Redirect to new tinyURL
  }
  
});

//Get tiny URL page
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    //if url id does not exist
    res.send("URL does not exist.");
  } else if (!req.session.user_id) {
    //if not logged in
    res.send("Login required to view/edit URL info.");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    //if url does not belong to user
    res.send("URL does not belong to user.");
  } else {
    const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user : getUserById(req.session.user_id)};
    res.render("urls_show", templateVars);
  } 
});

//Get redirect to longURL
app.get("/u/:id", (req, res) => {
  //checl if shortened URL is missing from URL database
  if (!urlDatabase[req.params.id]) {
    res.send(`Shortend URL '${req.params.id}' not found.`)
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
});

//Post update to URL
app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    //if url id does not exist
    res.send("URL does not exist.");
  } else if (!req.session.user_id) {
    //if not logged in
    res.send("Login required to view/edit URL info.");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    //if url does not belong to user
    res.send("URL does not belong to user.");
  } else {
    urlDatabase[req.params.id].longURL = req.body.update;
    res.redirect('/urls');
  }
});

//Post delete URL
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    //if url id does not exist
    res.send("URL does not exist.");
  } else if (!req.session.user_id) {
    //if not logged in
    res.send("Login required to view/edit URL info.");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    //if url does not belong to user
    res.send("URL does not belong to user.");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

//Get login page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    //Redirect if logged in
    res.redirect('/urls');
  } else {
    const templateVars = {user : getUserById(req.session.user_id)};
    res.render("urls_login", templateVars);
  }
  
});

//Post login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (user) {
    //compare hashed passwords
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
      return;
    } else {
      res.status(403).send("Incorrect password.");
    }
  } else {
    res.status(403).send("Incorrect email.");
  }
});

//Post logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//Get register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    //Redirect if logged in
    res.redirect('/urls');
  } else {
    const templateVars = {user : getUserById(req.session.user_id)};
    res.render("urls_register", templateVars);
  }
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
    users[id].password = bcrypt.hashSync(req.body.password, 10); //hash password
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
