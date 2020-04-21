const { admin, database } = require('../util/admin');
const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');

// signup route function. 
exports.signup = (request, response) => {
  // extracting data from the signup form and creating a nwe user in firebase auth.
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) {
    return response.status(400).json(errors);
  }

  // Emoji placeholder for image.
  const noImg = 'no-img.png';

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
        imgUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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

  const { valid, errors } = validateLoginData(user);

  if (!valid) {
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

// Adding user details. 
exports.addUserDetails = (request, response) => {
  let userDetails = reduceUserDetails(request.body);

  return database
    .doc(`/users/${request.user.handle}`)
    .update(userDetails)
    .then(() => {
      return response.json({ message: 'Details added successfully' });
    })
    .catch(error => {
      console.error(error);
      return response.status(500).json({ error: error.code });
    })
}

// Upload image route function. 
exports.uploadImage = (request, response) => {
  // importing packages (BusBoy installed.  Others default.)
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: request.headers });

  // Declaring variables. 
  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname);
    console.log(filename);
    console.log(mimetype);
    // Restricting image upload types to png and jpeg only. 
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return response.status(400).json({ error: 'Wrong file type submitted' });
    }
    // Extracting the filename (.png for example).
    // The array part gives us the index of the last item. 
    const imageExtention = filename.split('.')[filename.split('.').length - 1];
    // Creating a random file name.  example output (555555.png)
    imageFileName = `${Math.round(Math.random() * 100000)}.${imageExtention}`;
    // Getting the file path. 
    const filepath = path.join(os.tmpdir(), imageFileName);
    // Creating image to be uploaded. 
    imageToBeUploaded = { filepath, mimetype };
    // Using fs lib to create the file.
    return file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    // From firebase SDK docs per tut.  
    return admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      // Adding the image URL to the user. 
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        // Accessing the database and getting the user with their handle.  Then updating their profile with the image.  
        return database
          .doc(`/users/${request.user.handle}`)
          .update({ imageUrl });
      })
      .then(() => {
        return response.json({ message: 'Image uploaded successfully' });
      })
      .catch(error => {
        console.error(error);
        return response.status(500).json({ error: error.code });
      })
  })
  busboy.end(request.rawBody);
}

