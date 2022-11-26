const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomStrings() {
  let tinyURL = "";

  for (let i = 0; i < 6; i++) {
    if (Math.random() > 0.7) {
      tinyURL += Math.floor(Math.random() * 10);
    } else {
      let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      tinyURL += alphabet.charAt(Math.floor(Math.random() * 52));
    }
  }

  return tinyURL;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {username: req.cookies["username"], urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomStrings();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`); // Redirect to new tinyURL
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { username: req.cookies["username"], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.update;
  res.redirect('/urls');
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
