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

function getUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    } 
  };
  return null;
}

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
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = {urlDatabase};
  for (const user in users) {
    if (user === req.cookies["user_id"]) {
      templateVars.user = users[user];
    } else {
      templateVars.user = {};
    }
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {};
  for (const user in users) {
    if (user === req.cookies["user_id"]) {
      templateVars.user = users[user];
    } else {
      templateVars.user = {};
    }
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomStrings();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`); // Redirect to new tinyURL
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  for (const user in users) {
    if (user === req.cookies["user_id"]) {
      templateVars.user = users[user];
    } else {
      templateVars.user = {};
    }
  };
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
  for (const user in users) {
    if (user.email === req.body.username) {
      res.cookie('user_id', user.id);
    }
  };
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get("/register", (req, res) => {
  const templateVars = {};
  for (const user in users) {
    if (user === req.cookies["user_id"]) {
      templateVars.user = users[user];
    } else {
      templateVars.user = {};
    }
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    res.send("Missing email or password. Status Code 400");
  } else if (getUserByEmail(req.body.email) !== null) {
    res.statusCode = 400;
    res.send("Email is already registered. Status Code 400");
  } else {
    const id = generateRandomStrings();
    users[id] = {};
    users[id].id = id;
    users[id].email = req.body.email;
    users[id].password = req.body.password;
    res.cookie('user_id', id);
    res.redirect('/register');
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
