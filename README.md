# mern-blog-backend
## Data Schema
- Session
- User: includes array of Session and array of Post Id
- Post: inclues one unique User Id and array of Comment Id
- Comment: includes Post Id

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
#### delete a post
`DELETE backendUrl/api/posts/:pid`
### Comment
#### get comment by postId 
`GET backendUrl/api/comments/:pid`
#### post a comment (requires auth wiht Bearer Token)
`POST backendUrl/api/comments/:pid` <br />
```
{
  "comment":"your comment",
  "date":"2022-02-18"
}
```




