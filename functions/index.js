const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');

// initializing express and calling it on the same line..
const app = require('express')();

// importing the posts handler functions. 
const { getAllPosts } = require('./handlers/posts');

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


// Routes for posts using handler functions. 
app.get('/posts', getAllPosts);
app.post('/posts', FBAuth, createPost);

// Middleware helper function to intercept the post route and checks for auth token.  This also links the post to the user who created it.  
const FBAuth = (request, response, next) => {
  let idToken;
  if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
    // using .split() to split 'Bearer ' and the auth token. .split() returns the split in an array.  Bearer is position 0 and the token is 1. 
    idToken = request.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return response.status(403).json({ error: 'Unauthorized' });
  }
  // Verifying the token is a token issued by this app and then adding that data to the request. 
  return admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      request.user = decodedToken;
      console.log(decodedToken);
      return database
        .collection('users')
        .where('userId', '==', request.user.uid)
        .limit(1)
        .get();
    })
    // getting the user data from the database doc to send along with the request. 
    .then(data => {
      request.user.handle = data.docs[0].data().handle;
      // next() will allow the request to proceed. 
      return next();
    })
    .catch(error => {
      console.error('Error while verifying token ', error);
      return response.status(400).json(error);
    })
}

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
  };
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
  return database
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
      return database
        .doc(`/users/${newUser.handle}`)
        .set(userCredentials);
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

// Route for Logging in. 
app.post('/login', (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password
  };
  // login validations.  Same methods as signup validations. 
  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = 'Please enter your email'
  }

  if (isEmpty(user.password)) {
    errors.password = 'Please enter your password'
  }

  if (Object.keys(errors).length > 0) {
    return response.status(400).json(errors);
  }
  return firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return response.json({ token })
    })
    .catch(error => {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        return response.status(403).json({ general: 'Wrong password' });
      } else {
        return response.status(500).json({ error: error.code })
      }
    });
});

// passing the app into the function so it turns into multiple routes.
exports.api = functions.https.onRequest(app);

