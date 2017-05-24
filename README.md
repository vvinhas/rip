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

To help you understand how RIP works, [I made this video](http://youtube.com/vplusplus) showing some of it's features but I also wrote a short tutorial that goes straight to the point.

### Let's dig in!

After having installed `rip` globally, open your terminal and create a folder called `todos` wherever you want, `cd` onto it and then run:

```
npm init
```

It'll ask a lot of questions, just press `ENTER` until it's finished.

Now you should have a `package.json` file in your project folder. Great!

What kind of person would I be if we were to create anything different than a Todo API?

Luckly, I have a `grave` _(we'll talk about that in a second)_ that can help us with that!

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