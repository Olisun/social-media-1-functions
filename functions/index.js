const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');

// initializing express and calling it on the same line..
const app = require('express')();

// importing FBAuth helper.
const FBAuth = require('./util/fbAuth');

// importing the posts handler functions. 
const { getAllPosts, createPost } = require('./handlers/posts');
const { signup, login } = require('./handlers/users');

// Routes for posts using handler functions. 
app.get('/posts', getAllPosts);
app.post('/posts', FBAuth, createPost);

// Routes for users with the help of handler functions. 
app.post('/signup', signup);
app.post('/login', login);


// passing the app into the function so it turns into multiple routes.
exports.api = functions.https.onRequest(app);

