// helper functions

//Returns user object by email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

//Returns user object by Id
const getUserById = function(id, database) {
  for (const user in database) {
    if (user === id) {
      return database[user];
    }
  }
  return null;
};

//Generates random string
const generateRandomStrings = function() {
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    if (Math.random() > 0.7) { //generate a number 30% of the time
      randomString += Math.floor(Math.random() * 10); //random character 0 to 9
    } else { //generate a letter 70% of the time
      let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      randomString += alphabet.charAt(Math.floor(Math.random() * 52)); //random upper or lowercase letter
    }
  }
  return randomString;
};

//Return specific user's URLs
const urlsForUser = function(id, database) {
  const userUrlDatabase = {};

  //Build and return user specific URL database
  for (const url in database) {
    if (database[url].userID === id) {
      userUrlDatabase[url] = database[url];
    }
  }
  return userUrlDatabase;
};

module.exports = { getUserByEmail, getUserById, generateRandomStrings, urlsForUser };