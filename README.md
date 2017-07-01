# REST In Peace 
REST In Peace is a dead simple composable API for testing purposes.

## Motivation

Sometimes, you need an API on a flick of the fingers. There are many reasons for it, like when you want to learn something new, share an idea, work with collaborators and so on. Public APIs are fine but they are often constrained to a set of rules that doesn't exactly fit your needs.

### RIP for the rescue! 

RIP is an experimental tool to help you test apps that depends on an API. It let you easily share RESTful APIs and take advantage of prebuilt resources made by the community!

Want a Todo CRUD? No problem! Maybe some users too? Sure thing! Want to connect'em both? Why not!? RIP can help you achieve these tasks pretty easily.

## Installation

You can install RIP using NPM or Yarn, it's totally up to you.

These examples will install RIP globally.

```
npm install --global rip-server
```

Or

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

By default, RIP creates CRUD graves for each value defined inside the `graves` directive.

## Graves

RIP uses the concept o Graves to address endpoints. In fact, each Grave corresponds to an endpoint in the API.

If you have a `todos` Grave configured, you can access it's endpoints over `http://localhost:30001/todos`.

### Grave types

A Grave has basically three types:

#### CRUD

That's the default behavior when all you configure is the grave name. RIP will turn each grave into several CRUD endpoints.

```json
{
  "graves": [
    "posts"
  ]
}
```

Or, you can write the full syntax for a grave

```json
{
  "graves": [{
    "grave": "posts"
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

#### NPM package

Sometimes you want to take advantage of pre-built Graves created by the community.

Grave packages have the prefix `rip-grave-`, so, if you want to add the [Todos Grave](http://github.com/vvinhas/rip-grave-todos) into your project, you can install  `rip-grave-todos` and reference it in your `.riprc` file through the `source` directive, omiting the `rip-grave-` portion, like so:

```json
{
  "graves": [{
    "grave": "tasks",
    "source": "todos"
  }]
}
```

RIP will look through your `node_modules` folder, trying to find the `rip-grave-todos` package. If no package is found, RIP will throw an error.

#### Custom

We encourage you to create your own graves and share with everyone or create a particular grave for your project only. It's totally up to you!

If you know [Express](http://expressjs.com/) and [ImmutableJS](https://facebook.github.io/immutable-js), you can create your very own Grave with your predefined endpoints, middlewares and validations.

To create a custom Grave, you must create a script that export two functions: `init` and `make`.

`init` will be called once when the Grave is about to be appended. It has only one parameter called `options`, that corresponds to the options defined for the Grave inside `.riprc`. It should return the initial state of your Grave store.

```js
const init = options => ({})
```

`make` will receive an Express `Router`, an instance of the Grave `Store` and an object with the options defined in `.riprc` for your Grave. It must return a `Router` instance.

```js
const make = (router, store, options) => router
```

Inside this function, you can apply middlewares and define endpoints using the `Router` instance. Check Express docs for more information about the `Router` object.

Now, you must tell RIP how to reach your script, like so:

```json
{
  "graves": [{
    "grave": "my-grave",
    "source": "./your_grave_path.js"
  }]
}
```

You can check more information about the `Store` function in the section "The Store".

## Faking Data

RIP can generate fake data using the awesome [Faker.js](https://github.com/marak/Faker.js/) library to do so.

if you're using a Grave package or a custom Grave that implemented the `init` function, RIP generates fake data into the store before the API starts to run.

```json
{
  "graves": [{
    "grave": "tasks",
    "source": "todos",
    "fake": 10
  }]
}
```

That will instruct RIP to fake 10 records on the Todo Grave.

CRUD Graves can generate fake data too, but you must define a `shape` first.

`shape` is a simple object composed by keys and data type instructions, following Faker.js methods convention.

Let's create a simple `restaurants` Grave.

```json
{
  "graves": [{
    "grave": "restaurants",
    "fake": 10,
    "shape": {
      "name": "company.companyName",
      "stars": "random.number,5",
      "address": {
        "street": "address.streetName",
        "number": "random.number,999",
        "city": "address.city",
        "country": "address.country"
      },
      "tags": [
        "lorem.slug",
        "lorem.slug",
        "lorem.slug"
      ]
    }
  }]
}
```

This will instruct RIP to create 10 fake records following the shape structure.

For more information about available methods, check [Faker.js](https://github.com/marak/Faker.js/) Github page.

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

If you're using a Grave package, remember to check the grave repository for details about it's Store shape.

## The Store

Each Grave have it's own `Store`. This information is helpful only if you're creating your own Grave.

A `Store` have only three functions: `setState`, `getState` and `output`.

| Function | Params | Description |
|---|---|---|
| `getState` | _none_ | Get the current state of your Grave. Returns an ImmutableJS `Map` object.
| `setState` | `Map` | Set's the current state for your Grave. It **MUST BE** an ImmutableJS `Map` object.
| `output` | _none_ | Similar to `getState` but translate relationships that a Grave may have. This is the function you will use when outputing data to the browser.

The state of your Graves are not persisted. If you terminate the process all your data will die (RIP).

## Community Graves

- [Todos](https://github.com/vvinhas/rip-grave-todos)
- [Users](https://github.com/vvinhas/rip-grave-users)

## License

MIT