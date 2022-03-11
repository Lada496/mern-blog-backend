# mern-blog-backend

## Data Schema

- Session
- User: includes array of Session and array of Post Id
- Post: inclues one unique User Id and array of Comment Id
- Comment: includes Post Id
  <img width="772" alt="Screen Shot 2022-03-11 at 9 40 30" src="https://user-images.githubusercontent.com/67321065/157935599-631459c0-b5c8-4c8d-b8cf-56ba94f808f1.png">


## APIs

### User

#### signup

`POST backendUrl/api/users/signup` <br />
body example

```
{
  "name":"Test",
  "username":"requirement@email.address",
  "password":"atleast6letters"
}
```

#### login

`POST backendUrl/api/users/login` <br />
body example
```
{
  "username":"requirement@email.address",
  "password":"atleast6letters"
}
```

#### refresh token

`POST backendUrl/api/users/refreshtoken`

#### get my data (requires auth wiht Bearer Token)

`GET backendUrl/api/users/me`

#### logout (requires auth wiht Bearer Token)

`GET backendUrl/api/users/logout`

### Post

#### get all posts

`GET backendUrl/api/posts`

#### get post by id

`GET backendUrl/:pid`

#### get posts by user id (requires auth wiht Bearer Token)

`GET backendUrl/api/myposts/posts`

#### post a post

`POST backendUrl/api/posts`<br />
body example

```
{
  "title":"Test",
  "body":"At least 5 letters required",
  "image":"imageUrl",
  "date":"2022-02-18",
}
```

#### edit a post
`POST backendUrl/api/posts/:pid` <br />
body example
```
{
  "title":"Test",
  "body":"At least 5 letters required",
  "image":"imageUrl",
  "date":"2022-02-18",
}
```

#### delete a post

`DELETE backendUrl/api/posts/:pid`

#### update likes
`PATCH backendUrl/api/posts/likes/:pid` <br />
body example
```
 {
  "userId":"StringUserId"
 }
```


### Comment

#### get comment by postId

`GET backendUrl/api/comments/:pid`

#### post a comment (requires auth wiht Bearer Token)

`POST backendUrl/api/comments/:pid` <br />
body example

```
{
  "comment":"your comment",
  "date":"2022-02-18"
}
```

## Dependencies

- body-parser
- cookie-parser
- cors
- dotenv
- express
- express-validator
- jsonwebtoken
- mongoose-unique-validator
- passport
- passport-jwt
- passport-local
- passport-local-mongoose
