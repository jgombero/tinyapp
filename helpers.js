const getUserByEmail = function(database, userEmail) {
  let foundUser = '';
  for (const user in database) {
    if (database[user].email === userEmail) {
      foundUser = database[user];
    }
  }
  return foundUser;
};

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const urlsForUser = function(database, id) {
  const filteredDatabase = {};

  for (const url in database) {

    if (database[url].userID === id) {

      const matchURL = { longURL: database[url].longURL, userID: id };
      filteredDatabase[url] = matchURL;
    }
  }
  return filteredDatabase;
};

module.exports = { 
  getUserByEmail,
  generateRandomString,
  urlsForUser
};