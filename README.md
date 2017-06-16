# REST In Peace 
REST In Peace is a dead simple composable API for testing purposes.

## Motivation

How many times you needed an API at hand to test simple apps or maybe just to learn something new and you had to reach for public APIs to fetch some random stuff that doesn't actually help because you don't have access to every REST verb.

Maybe you just want to shape your API or share your project with coleagues or collaborators but you need an API to make it work! You either develop a simple backend to run along with your app or setup a Firebase account, maybe Deployd, configure SDKs, setup endpoints; damn _(language!)_, you just want them to see it working...

### RIP for the rescue! 

RIP is an experimental tool to help you test apps that depends on an API. It let you easily share RESTful APIs and take advantage of prebuilt resources made by the community!

Want a Todo CRUD? No problem! Maybe some users too? Sure thing! Want to connect'em both? Why not!? RIP can help you achieve these tasks pretty easily.

## Installation

You can install RIP globally or on a local project. These examples will install RIP globally.

```
npm install --global rip-server
```

If you prefer, you can also use Yarn

```
yarn global add rip-server
```

Now, run the command `rip` on your terminal. You should see a status message telling you that RIP is running and an URL (`http://localhost:3001` by default). Paste the URL in your browser to check if everything is working fine.

## Usage

Assuming that you installed RIP globally, all you need to do is run the command `rip`.

However, you won't have any Graves configured but we'll get there.

RIP needs some basic configuration to work, as we will see in the section below.

## Configuring RIP

To let RIP knows how to handle your endpoints, you must configure some Graves. The way to setup a grave is by creating a `.riprc` file in the root of your project and specify each grave you want to use.

`.riprc` is a simple JSON file that has only the `graves` directive. It looks a little bit like this:

```json
{
  "graves": [
    "users",
    "todos"
  ]
}
```

In this example, we've setup the `users` and `todos` graves.

RIP will look through your dependencies and will try to find the `rip-grave-users` and `rip-grave-todos` packages. If none of them is installed, RIP will throw an error.

## Graves

RIP uses the concept o Graves to address endpoints. In fact, each Grave corresponds to an endpoint in the API.

If you have a `todos` Grave configured, you can access it's endpoints over `http://localhost:30001/todos`.

### Grave types

A Grave has basically three types:

#### NPM package

This is the most common use case for RIP. You simply install a RIP Grave package and configure it in your project.

Usually, Grave packages have the prefix `rip-grave-*`, so, if you want to install the [Todos Grave](http://github.com/vvinhas/rip-grave-todos), you can install `rip-grave-todos` and reference it in your `.riprc` file.

#### CRUD

You configure a Grave to automatically create CRUD endpoints for an entity.

```json
{
  "graves": [{
    "grave": "posts",
    "crud": true
  }]
}
```

You'll now have access to these endpoints

| Verb | URI |Description |
|---|---|---|---|
| `GET` | `/posts` | Retrieve all data stored in `posts` collection.
| `GET` | `/posts/:id` | Retrieve a single entry from the `posts` collection.
| `POST` | `/posts` | Store all data sent in the request body to `posts` collection as a document. Returns the `_id` field generated for the record.
| `PUT` | `/posts/:id` | Replace the document from `posts` collection where the ID corresponds to the param.
| `DELETE` | `/posts/:id` | Delete the document from `posts` collection where the ID corresponds to the param.

Data posted to these endpoints are not validated, so you can store anything you want.

#### Custom

We encourage you to create your own graves and share with everyone or create a particular grave for your project only. It's totally up to you!

If you know [Express](http://expressjs.com/) and [ImmutableJS](https://facebook.github.io/immutable-js), you can create your very own Grave with your predefined endpoints, middlewares and validations.

To create a custom Grave, you must create a script that export two functions: `init` and `make`.

`init` will be called once when the Grave is about to be appended. It has only one parameter called `fake`, that corresponds to the amount of fake data to generate. It should return the initial state of your Grave store.

```js
const init = (fake) => { data: [] }
```

`make` will receive an Express `Router`, an instance of the Grave `Store` and an object with the settings defined in `.riprc` for your Grave. It must return a `Router` instance.

```js
const make = (router, store, options) => router
```

Inside this function, you can apply middlewares and define endpoints using the `Router` instance. Check Express docs for more information about the `Router` object.

Now, you must tell RIP how to reach your script, like so:

```json
{
  "graves": [{
    "grave": "my-grave",
    "mapsTo": "./your_grave_path.js"
  }]
}
```

You can check more information about the `Store` function in the section bellow.

## The Store

Each Grave have it's own `Store`. This information is helpful only if you're creating your own Grave.

A `Store` have only three functions: `setState`, `getState` and `output`.

| Function | Params | Description |
|---|---|---|
| `getState` | _none_ | Get the current state of your Grave. Returns an ImmutableJS `Map` object.
| `setState` | `Map` | Set's the current state for your Grave. It **MUST BE** an ImmutableJS `Map` object.
| `output` | _none_ | Similar to `getState` but translate relationships that a Grave may have. This is the function you will use when outputing data to the browser.

The state of your Graves are not persisted. If you terminate the process all your data will die (RIP).

## Faking Data

if you're using a Grave package or a custom Grave that implemented the `init` function, RIP can generate some fake data before the API starts to run.

CRUD Graves do not generate fake data, since it doesn't know the shape of the state.

```json
{
  "graves": [{
    "grave": "todos",
    "fake": 10
  }]
}
```

That will instruct RIP to fake 10 records on the Todo Grave before it starts to run.

## Relationships

RIP allows you to create simple data relationships with another Grave.

For now, it has only two relationship types: `belongsTo` and `hasMany`. 

To illustrate, we'll create a scenario where we need three graves: `users`, `posts` and `comments`. The state of each Grave is as follows:

```js
// User grave state
{
  data: [{
    _id: 1,
    name: "Foobar",
    email: "foobar@localhost"
  }]
}

// Posts grave state
{
  data: [{
    _id: 1,
    author: 1,
    title: "Checkout RIP!",
    body: "RIP is awesome!",
    comments: [1, 2]
  }]
}

// Comments grave state
{
  data: [{
    _id: 1,
    author: "Anonymous",
    message: "Sweet!"
  },{
    _id: 2,
    author: "@vinistrings",
    message: "I love it!"
  }]
}
```

To associate each field to it's related data, we can configure RIP like so.

```json
{
  "graves": [
    "users",
    "comments",
    {
      "grave": "posts",
      "relationships": [
        { "field": "data.author", "belongsTo": "users.data._id" },
        { "field": "data.comments", "hasMany": "comments.data._id" },
      ]
    },
  ]
}
```

Both directives have the `field` property. That corresponds to the relative path from your Grave store.

`belongsTo` and `hasMany` are both exact paths. You must start from the Grave name, to a collection and finally, a property from that collection.

Now, if you make the request `GET posts/1` you'll receive the following JSON

```json
{
  "_id": 1,
  "author": {
    "_id": 1,
    "name": "Foobar",
    "email": "foobar@localhost"
  },
  "title": "Checkout RIP!",
  "body": "RIP is awesome!",
  "comments": [{
    "_id": 1,
    "author": "Anonymous",
    "message": "Sweet!"
  },{
    "_id": 2,
    "author": "@vinistrings",
    "message": "I love it!"
  }]
}
```

You can create multiple relationships for each property in a grave collection.

Always remember to check the grave repository for details about it's Store shape.

## Community Graves

- [Todos](https://github.com/vvinhas/rip-grave-todos)
- [Users](https://github.com/vvinhas/rip-grave-users)

## License

MIT