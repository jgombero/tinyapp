const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "rJ49tP"}
};

describe('getUserByEmail', () => {

  it('should return a user with valid email', () => {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });

  it('should return undefined when passed an invalid email', () =>{
    const user = getUserByEmail(testUsers, "user3@example.com");
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  });
});

describe('generateRandomString', () =>{

  it('should return unique strings', () => {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    assert.notEqual(string1, string2);
  });
});

describe('urlsForUser', () => {

  it('should return all urls that matches the userID', () => {
    const url = urlsForUser(testUrlDatabase, "aJ48lW");
    const expectedOutput = { "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" }};
    assert.deepEqual(url, expectedOutput);
  });

  it('should return undefined when no url matches userID', () => {
    const url = urlsForUser(testUrlDatabase, "afe8l5");
    const expectedOutput = undefined;
    assert.equal(url.longURL, expectedOutput);
  });
});