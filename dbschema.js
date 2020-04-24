let db = {
  users: [
    {
      userId: 'dh23ggj5h32g543j5gf43',
      email: 'user@mac.com',
      handle: 'user',
      createdAt: '2019-03-15T10:59:52.798Z',
      imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
      bio: 'This is my bio.',
      website: 'https://user.com',
      location: 'San Francisco, CA'
    }
  ],
  posts: [
    {
      userHandle: 'user',
      body: 'The text of the post',
      createdAt: '2020-04-12T04:00:52.557Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      usetHandle: 'user',
      postId: 'kdjsfgdksuufhgkdsufky',
      body: 'comment comment commenting',
      createdAt: '2019-03-15T10:59:52.798Z'
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: {
    userId: 'N43KJ5H43KJHREW4J5H3JWMERHB',
    email: 'user@mac.com',
    handle: 'user',
    createdAt: '2019-03-15T10:59:52.798Z',
    imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
    bio: 'This is my bio.',
    website: 'https://user.com',
    location: 'San Francisco, CA'
  },
  likes: [
    {
      userHandle: 'user',
      postId: 'hh7O5oWfWucVzGbHH2pa'
    },
    {
      useHandle: 'user',
      postId: '3IOnFoQexRcofs5OhBXO'
    }
  ]
}