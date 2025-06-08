# User API Spec

## Register User

Endpoint : POST /api/users

Request Body :

```json
{
  "username": "Vino",
  "password": "Ganteng",
  "name": "Vino Ganteng"
}
```

Response Body (Success) : 

```json
{
  "data": {
    "username": "Vino",
    "name": "Vino Ganteng"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username already registered"
}
```

## Login User

Endpoint : POST /api/users/login

Request Body :

```json
{
  "username": "Vino",
  "password": "Ganteng",
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "Vino",
    "name": "Vino Ganteng",
    "token": "session_id_generated"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username or password is wrong"
}
```

## Get User

Endpoint : GET /api/users/current

Headers :
- authorization: token 

Response Body (Success) :

```json
{
  "data": {
    "username": "Vino",
    "name": "Vino Ganteng",
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Unauthorized"
}
```

## Update User

Endpoint : PATCH /api/users/current

Headers :
- Authorization: token

Request Body :

```json
{
  "password": "Ganteng", //optional, if want to change password
  "name": "Vino Ganteng" //optional, if want to change name
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "Vino",
    "name": "Vino Ganteng"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username already registered"
}
```

## Logout User

Endpoint : DELETE /api/users/current

Headers :
- Authorization: token

Response Body (Success) :

```json
{
  "data": true
}
```
