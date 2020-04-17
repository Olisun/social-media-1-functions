const { database } = require('../util/admin');
const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData } = require('../util/validators');

// signup route function. 
exports.signup = (request, response) => {
  // extracting data from the signup form and creating a nwe user in firebase auth.
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle,
  };


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
}

// login route function. 
exports.login = (request, response) => {
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
}