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

//Helper functions
const { getUserByEmail, getUserById, generateRandomStrings, urlsForUser } = require("./helpers");

//Get Root Page Redirect
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    //Redirect if not logged in
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

//Get URLs Index Page
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    //if not logged in
    res.send("Register to Login and view URLs.");
  } else {
    const templateVars = {urlDatabase : urlsForUser(req.session.user_id, urlDatabase) , user : getUserById(req.session.user_id, users)};
    res.render("urls_index", templateVars);
  }
});

//Get new URL form
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    //Redirect if not logged in
    res.redirect('/login');
  } else {
    const templateVars = {user : getUserById(req.session.user_id, users)};
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
    const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user : getUserById(req.session.user_id, users)};
    res.render("urls_show", templateVars);
  }
});

//Get redirect to longURL
app.get("/u/:id", (req, res) => {
  //check if shortened URL is missing from URL database
  if (!urlDatabase[req.params.id]) {
    res.send(`Shortend URL '${req.params.id}' not found.`);
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
    //update the URL in the urlDatabase
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
    //delete URL from urlDatabase
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
    const templateVars = {user : getUserById(req.session.user_id, users)};
    res.render("urls_login", templateVars);
  }
});

//Post login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    //compare hashed passwords
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id; //set cookie
      res.redirect('/urls');
      return;
    } else {
      res.status(403).send("Incorrect password.");
    }
  } else {
    res.status(403).send("Email not found.");
  }
});

//Post logout
app.post("/logout", (req, res) => {
  req.session = null; //delete cookie
  res.redirect('/login');
});

//Get register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    //Redirect if logged in
    res.redirect('/urls');
  } else {
    const templateVars = {user : getUserById(req.session.user_id, users)};
    res.render("urls_register", templateVars);
  }
});

//Post register
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Missing email or password.");
  } else if (getUserByEmail(req.body.email, users) !== null) {
    res.status(400).send("Email is already registered.");
  } else {
    //create a new user
    const id = generateRandomStrings();
    users[id] = {};
    users[id].id = id;
    users[id].email = req.body.email;
    users[id].password = bcrypt.hashSync(req.body.password, 10); //hash password
    req.session.user_id = id; //set cookie
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
