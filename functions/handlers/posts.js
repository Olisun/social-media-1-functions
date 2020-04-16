const { database } = require('../util/admin');

// route for getting all posts. 
exports.getAllPosts = (request, response) => {
  // cors(request, response, () => {
  return database
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
    .catch(error => {
      console.error(error);
      response.status(500).json({ error: error.code });
    });
  // });
}

// route for creating a post. 
exports.createPost = (request, response) => {
  // cors(request, response, () => {
  const newPost = {
    body: request.body.body,
    userHandle: request.user.handle,
    createdAt: new Date().toISOString()
  };
  return database
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
}