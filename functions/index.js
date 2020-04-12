const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();


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

app.post('/posts', (request, response) => {
  // cors(request, response, () => {
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
  // });
});

// passing the app into the function so it turns into multiple routes.
exports.api = functions.https.onRequest(app);