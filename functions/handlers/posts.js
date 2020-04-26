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
};

// Route for creating a post. 
exports.createPost = (request, response) => {
  // cors(request, response, () => {
  const newPost = {
    body: request.body.body,
    userHandle: request.user.handle,
    userImage: request.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };
  return database
    .collection('posts')
    .add(newPost)
    .then(doc => {
      // Returning the post ID in the response. 
      const responsePost = newPost;
      responsePost.postId = doc.id;
      return response.json(responsePost);
    })
    .catch(error => {
      response.status(500).json({ error: 'Oops - something went wrong!' });
      console.log(error);
    });
  // });
};

// Route for getting one post. 
exports.getPost = (request, response) => {
  let postData = {};

  return database
    .doc(`/posts/${request.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({ error: 'Post not found!' })
      } else {
        postData = doc.data();
        postData.postId = doc.id;
      }
      // Fetching comments for this post. 
      return database
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('postId', '==', request.params.postId)
        .get()
    })
    .then(data => {
      postData.comments = [];
      data.forEach(doc => {
        postData.comments.push(doc.data())
      });
      return response.json(postData);
    })
    .catch(error => {
      response.status(500).json({ error: error.code });
      console.log(error);
    });
};

exports.commentOnPost = (request, response) => {
  //Validation for empty comments. 
  if (request.body.body.trim() === '') {
    return response.status(400).json({ error: 'Comment must not be empty' });
  }

  const newComment = {
    body: request.body.body,
    createdAt: new Date().toISOString(),
    postId: request.params.postId,
    userHandle: request.user.handle,
    userImage: request.user.imageUrl
  };
  console.log(newComment);

  return database
    .doc(`/posts/${request.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return response.status(404).json({ error: 'Post not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return database
        .collection('comments')
        .add(newComment);
    })
    .then(doc => {
      response.json({ message: `document ${doc.id} created successfully` });
      return response.json(newComment);
    })
    .catch(error => {
      response.status(500).json({ error: 'Debugging Time' });
      console.log(error);
    });
}

// Like a post. 
exports.likePost = (request, response) => {
  const likeDocument = database
    .collection('likes')
    .where('userHandle', '==', request.user.handle)
    .where('postId', '==', request.params.postId)
    .limit(1);

  const postDocument = database.doc(`/posts/${request.params.postId}`);

  let postData

  // Checking to make sure post exists. 
  return postDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return response.status(404).json({ error: 'Post not found' });
      }
    })
    .then(data => {
      if (data.empty) {
        return database
          .add({
            postId: request.params.postId,
            userHandle: request.user.handle
          })
          .then(() => {
            postData.likeCount++
            return postDocument.update({ likeCount: postData.likeCount })
          })
          .then(() => {
            return response.json(postData)
          })
      } else {
        return response.status(400).json({ error: 'You already liked this' });
      }
    })
    .catch(error => {
      console.error(error);
      response.status(500).json({ error: error.code })
    })
}

exports.unlikePost = (request, response) => {

}