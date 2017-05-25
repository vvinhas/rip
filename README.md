# REST In Peace 
REST In Peace is a dead simple composable API for testing purposes

## Motivation

How many times you needed an API for testing simple apps or maybe just to learn something new and you had to Google for some public APIs to fetch some random stuff that doesn't actually help.

Or maybe you just want to share your project with coleagues or collaborators but you need an API to make it work! You either develop a simple backend to run along with your app or setup a Firebase account, maybe Deployd, configure SDKs, setup endpoints; damn _(language!)_, you just want them to see it working...

### RIP for the rescue! 

RIP is an experimental tool to help you test apps that depend on an API. It let you easily share RESTful APIs and take advantage of prebuilt resources made by the community!

Want a Todo CRUD? No problem! Maybe some Users to go along? sure thing! Want to connect'em both? Why not!? RIP can help you achieve these tasks pretty easily.

## Installation

You can install RIP globally or on a local project, however, I do recommend that you install it globally to be able to use it in any project.

```
npm install --global rip-server
```

If you prefer, you can also use Yarn

```
yarn global add rip-server
```

Now, run the command `rip` on your terminal. You should see a status message telling you that RIP is running and an URL (`http://localhost:3001` by default). Paste the URL in your browser to check if everything is working fine.

## Usage

To help you understand how RIP works, [I made this video](http://youtube.com/vplusplus) showing some of it's features but I also wrote a very straight forward tutorial for you to quickly tag along.

### Let's dig in!

After having installed `rip` globally, open your terminal and create a folder called `todos` wherever you want, `cd` onto it and then run:

```
npm init
```

It'll ask you a lot of questions, just press `ENTER` until it's finished.

Now you should have a `package.json` file in your project folder. Great!

What kind of person would I be if we were to create anything other than a Todo API?

Luckly, I have a `grave` _(we'll get there in a second)_ that can help us with that!

To install a Todo grave, just run:

```
yarn add rip-grave-todos
```

Now we must tell RIP that we want to use that grave! To do so, create a file named `.riprc` in our project root and put this code into it:

```json
{
    "graves": [
        "todos"
    ]
}
```

Save it and the run:

```
rip
```

Sweet! Now for the good stuff :) Using a tool to interact with our API (like [Postman]()), head to `http://localhost:3001/todos/all`.

You see the `[]` result over there? Cool, heh? That's it! 

_JK! Gosh...I can be a prick sometimes..._

**Grave** is just a silly name for our **Resources**. Each grave corresponds to a resource endpoint in our API and RIP can compose, extend and relate these resources!

We'll see that in a moment!

**Let's keep moving /o/**

Now it's a good time to checkout the [rip-grave-todos]() repository. Each grave has a detailed README file explaining it's endpoints and what they can do.

You can add a todo by making a `POST` request to `/todos` sending the data `{ author: 'admin@localhost', text: 'Buy eggs' }`. Do that using the tool of your choice and head back to `GET /todos/all`.

_Tcharam!_

But remember, since RIP is for testing only, all data is erased after you kill the `rip` service running.

In future versions, I might add some persistance plugins but for now, it's just a plan.

## Faking Data

RIP allows you to fake some data before the API starts to run. 

So far, we wrote the simple grave notation. We have an array of graves and each string corresponds to a grave beign defined using the default settings. However, if you want to change the default behavior, we must write the full grave notation. Change our `.riprc` file, like so:

```json
{
    "graves": [
        { "name": "todos", "fake": 10 }
    ]
}
```

That will instruct RIP to fake 10 records on the todo grave, before it starts to run.

Save the file and head to `GET /todos/all` and you should see a list with 10 todos.

## Relations

RIP allows you to relate some data with other graves and that unleashes a very powerful feature. Since graves are created by the community, it's essential that they can communicate. The way this takes place is by setting relationship across properties.

Let's add the `users` grave:

```
yarn add rip-grave-users
```

Now, let's instruct RIP to use it

```json
{
    "graves": [
        "users",
        { "name": "todos", "fake": 10 }
    ]
}
```

As you can see, we can mix and match grave notations. RIP is smart enough to identify which one you're using.

Each Todo object provides a prop called `author` that we want to associate with a user from the `users` grave.

Let's setup this relationship now:

```json
{
    "graves": [
        { "name": "users", "fake": 5 },
        {
            "name": "todos",
            "relations": [
                { "collection": "data", "prop": "author", "mapsTo": "users.data", "field": "_id" }
            ]
        }
    ]
}
```

_Hmm... That sounds complicated..._

It's not. Trust me!

It works like a lookup table. You can read the statement like this:

> In my Todo grave, go to the `data` collection and map each `author` prop to the collection `users.data`, field `_id`

Now make a request to `GET /users/all` and copy one of the users `_id`. Create a new todo the way we did before and set the `author` prop to the User ID you've copied. head to `GET /todos/all` and _Voilà!_

For more details, see the table bellow.

| Field | Description |
| --- | --- |
| `collection` | A path that corresponds to a valid _Collection_ from the grave you're in. Remember to check the grave repository to see the shape of it's _Store_ |
| `prop` | Name of the property to lookup in the `collection` |
| `mapsTo` | A path to _RIP Store_ that corresponds to a valid _Collection_. In this section, you have access to the whole _RIP Store_. Usually, the first node of the path is the name of the grave you want to reference, followed by a valid path to it's _Store_. In the example above, we use the `users.data` collection. |
| `field` | Name of the property in the `mapsTo` _Collection_ that reference to the `collection.prop` |

You can create multiple relations for each property in a grave collection.

Always remember to check the grave repository for details about it's Store shape.

## Creating Graves

We encourage you to create your own graves and share with everyone or create a particular grave for your project only. It's totally up to you!

### Basic Structure

_soon..._

### The Store

_soon..._

### Options

_soon..._