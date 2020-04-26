const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');

// initializing express and calling it on the same line..
const app = require('express')();

// importing FBAuth helper.
const FBAuth = require('./util/fbAuth');

// importing the handler functions. 
const {
  getAllPosts,
  createPost,
  getPost,
  commentOnPost,
  likePost,
  unlikePost
} = require('./handlers/posts');

const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require('./handlers/users');

// Posts and updating user details using handler functions. 
app.get('/posts', getAllPosts);
app.post('/posts', FBAuth, createPost);
app.get('/posts/:postId', getPost); // getting details of one post. 
// TODO: delete post
app.get('/posts/:postId/like', FBAuth, likePost);
app.get('/posts/:postId/unlike', FBAuth, unlikePost);
app.post('posts/:postId/comment', FBAuth, commentOnPost);

// Login and Signup routes with the help of handler functions. 
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


// passing the app into the function so it turns into multiple routes.
exports.api = functions.https.onRequest(app);

