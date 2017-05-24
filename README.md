# REST In Peace 
REST In Peace is a dead simple composable API for testing purposes

## Motivation

How many times you needed an API for testing simple apps or maybe just to learn something new and your had to Google for some public APIs to fetch some random stuff you don't actually need.

Maybe worst! You wanted to share your project with coleagues or collaborators but you need an API to make it work! You either develop a simple backend to run while your running the app or setup a Firebase account, maybe Deployd, configure SDKs, setup endpoints; damn (language!), you just wanted them to see it working...

### RIP for the rescue! 

RIP is an experimental tool to help you test apps that depend on an API. It let you easily share RESTful APIs and take advantage of prebuilt resources made by the community!

Want a Todo's CRUD? No problem! Maybe some Users to go along? sure thing! Want to connect'em both? Why not!? RIP can help you achieve these tasks pretty easily.

## Installation

You can install RIP globally or on a local project, however, I do recommend that you install it globally to be able to use it in any project.

```
npm install --global rip-server
```

If you prefer, you can also use Yarn

```
yarn global add rip-server
```

To check if everything is working fine, run the command `rip` on your terminal. You should see a status message telling you that RIP is running and an URL (`http://localhost:3001` by default).

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

Sweet! Now for the good stuff :) Using a tool to interact with our API (i like [Postman]()), head to `http://localhost:3001/todos/all`.

You see the `[]` result over there? Cool, heh? That's it! 

_JK! Gosh...I can be a prick sometimes..._

**Grave** is just a silly name for our **Resources**. Each grave corresponds to a resource endpoint in our API and RIP can compose, extend and relate these resources!

We'll see that in a moment!

**Let's keep moving /o/**

Now it's a good time to checkout the [rip-grave-todos]() repository. Each grave has a detailed README file explaining it's endpoints and what they can do.

You can add a todos by making a `POST` request to `/todos` sending the data `{ author: 'vvinhas', text: 'Buy eggs' }`. Do that using the tool of your choice and head back to `GET /todos/all`.

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

RIP allows you to relate some data with other graves and that unleashes a very powerful feature. Since graves are created by the community, it's essential that they can communicate. The way this takes place, is by setting relationship across properties.

_continue..._

## Creating Graves

We encourage you to create your own graves and share with everyone or create a particular grave for your project only. It's totally up to you!

### Basic Structure
### Options