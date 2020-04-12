const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// initializing express and calling it on the same line..
const app = require('express')();

// firebase config for authentication.
const firebaseConfig = {
  apiKey: "AIzaSyD1eLFpyIA55kILq-Gieac0wFYe16f366A",
  authDomain: "social-media-1-8a263.firebaseapp.com",
  databaseURL: "https://social-media-1-8a263.firebaseio.com",
  projectId: "social-media-1-8a263",
  storageBucket: "social-media-1-8a263.appspot.com",
  messagingSenderId: "665970684711",
  appId: "1:665970684711:web:e207a3f2f48e03f6112f02",
  measurementId: "G-EH6CH793SJ"
};

// initializing auth library by passing in the firebase config.
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

// route for getting all posts.
app.get('/posts', (request, response) => {
  // cors(request, response, () => {
  admin
    .firestore()
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return response.json(posts);
    })
    .catch(error => console.error(error));
  // });
})

// route for submitting a post.
app.post('/posts', (request, response) => {
  // cors(request, response, () => {
  const newPost = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: new Date().toISOString()
  };
  admin
    .firestore()
    .collection('posts')
    .add(newPost)
    .then(doc => {
      response.json({
        message: `document ${doc.id} created successfully`
      });
      return response.json(newPost);
    })
    .catch(error => {
      response.status(500).json({
        error: 'Oops - something went wrong!'
      });
      console.log(error);
    })
  // });
});

// route for signing up. 
app.post('/signup', (request, response) => {
  // extracting data from the signup form. 
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle,
  }
  // TODO: validate user data
  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return response.status(201).json({
        message: `user ${data.user.uid} sdignerd up successfully`
      });
    })
    .catch(error => {
      console.error(error);
      return response.status(500).json({
        error: error.code
      });
    });
});

// passing the app into the function so it turns into multiple routes.
exports.api = functions.https.onRequest(app);