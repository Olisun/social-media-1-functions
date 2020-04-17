const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');

// initializing express and calling it on the same line..
const app = require('express')();

// importing the posts handler functions. 
const { getAllPosts } = require('./handlers/posts');
const { signup, login } = require('./handlers/users');

// initializing auth library by passing in the firebase config.
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);


// Routes for posts using handler functions. 
app.get('/posts', getAllPosts);
app.post('/posts', FBAuth, createPost);

// Routes for users with the help of handler functions. 
app.post('/signup', signup);
app.post('/login', login);



// passing the app into the function so it turns into multiple routes.
exports.api = functions.https.onRequest(app);

