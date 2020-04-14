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

const database = admin.firestore();

// route for getting all posts.
app.get('/posts', (request, response) => {
  // cors(request, response, () => {
  database
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
  database
    .firestore()
    .collection('posts')
    .add(newPost)
    .then(doc => {
      response.json({ message: `document ${doc.id} created successfully` });
      return response.json(newPost);
    })
    .catch(error => {
      response.status(500).json({ error: 'Oops - something went wrong!' });
      console.log(error);
    })
  // });
});

// Helper function for determining an empty string. 
const isEmpty = string => {
  if (string.trim() === '') {
    return true;
  } else {
    return false;
  }
}

// Helper function to check if an email is a valid email. 
const isEmail = email => {
  const regEx = RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
  if (email.match(regEx)) {
    return true;
  } else {
    return false;
  }
}

// route for signing up new user.
app.post('/signup', (request, response) => {
  // extracting data from the signup form and creating a nwe user in firebase auth.
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle,
  }
  // Validating email and password. 
  // Creating an errors object to store any validation errors. 
  let errors = {};

  // Applying the isEmpty helper function. 
  if (isEmpty(newUser.email)) {
    errors.email = 'Please enter your email'
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address'
  }

  if (isEmpty(newUser.password)) {
    errors.password = 'Please enter a password'
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = 'Passwords don not match'
  }

  if (isEmpty(newUser.handle)) {
    errors.handle = 'Please enter a handle'
  }

  // Checking to see if there are any errors in the errors object above. 
  if (Object.keys(errors).length > 0) {
    return response.status(400).json(errors);
  }

  // This function checks to see if a new user selects an email already in the DB.  If so, display the error message.  Else, create the new user.
  // Declaring token and userId variables. 
  let token, userId;
  database
    .doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return response.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    // returning the authentication token to the user so the user will later use to request more data. 
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    // creating userCredentials for the document in the firebase DB. 
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId // no need for pair because it was defined above.
      }
      // Creating a new user by sending these credentials into a document in the collection in the firebase DB.  
      return database.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch(error => {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        return response.status(400).json({ email: 'This email is taken' });
      } else {
        return response.status(500).json({ error: error.code });
      }
    })
});

// passing the app into the function so it turns into multiple routes.
exports.api = functions.https.onRequest(app);