const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    console.log("Hello");
    response.send("Hello Wiggly");
  })
});

exports.getPosts = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin
      .firestore()
      .collection('posts')
      .get()
      .then(data => {
        let posts = [];
        data.forEach(doc => {
          posts.push(doc.data());
        });
        return response.json(posts);
      })
      .catch(error => console.error(error));
  });
});

exports.createPosts = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const newPost = {
      body: request.body.body,
      userHandle: request.body.userHandle,
      createdAt: admin.firestore.Timestamp.fromDate(new Date())
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
  });
});