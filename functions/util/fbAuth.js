const { admin, database } = require('./admin');

// Middleware helper function to intercept the post route and checks for auth token.  This also links the post to the user who created it.  
module.exports = (request, response, next) => {
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
      request.user.imageUrl = data.docs[0].data().imageUrl;
      // next() will allow the request to proceed. 
      return next();
    })
    .catch(error => {
      console.error('Error while verifying token ', error);
      return response.status(400).json(error);
    })
}