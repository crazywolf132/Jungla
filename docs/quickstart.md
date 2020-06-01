# Getting Started

Jungla comes in the form of an NPM package to be easily installed into either a frontend or backend application.
Jungla has no pre-requirements of your project and allows you to use both the Jungla Stack & Jungla Language independently

## Jungla Stack & Jungla Language

Jungla Stack contains both the Language and a Rest Server. This allows you to have a full Jungla API up and running in just minutes.
Jungla Stack also contains many features to clip onto your pre-existing API.

Jungla Language is the scripting language required to access and manipulate your data.

### Installing Jungla Stack

Install using yarn

```bash
    yarn add jungla-stack
```

or with NPM

```bash
    npm add jungla-stack
```

### Installing Jungla Language

Install using yarn

```bash
    yarn add jungla
```

or with NPM

```bash
    npm add jungla
```

## Server Side

Server side, we have 2 options... Jungla Stack or Jungla.

Here are 3 different scenarios and which one to use.

```
I already have an API with a MONGO database. I am using REST endpoints to communicate from my app to my backend.
```

In this example, it would be advised that you use Jungla Language. Inside the routes that you want to enable Jungla in, simply wrap the JSON response with the Jungla parser. It is also highly recommended to use the Jungla Middleware on the routes that have this. It will avoid any problems.

More information can be found [here](server/language)

```
I am looking to build a backend with Jungla, and open up endpoints for my application to communicate.
```

In this example, it would be advised that you use Jungla-Stack to create the endpoints from scratch. Jungla-Stack opens up an express server for you to use with your own routes. It will automatically have middleware to check that all requests coming in have the correct body message.

For more information, checkout [Jungla-Stack](server/stack)

```
I am using a micro-service (Service A) to communicate with another offsite API (Service B). I don't have access to change their code, but I want to use JUNGLA with it.
```

In this example, it would be advised that you install Jungla-Stack on Service A. Then use the `mimic` functionalities to create another endpoint to hit Service B.

The `mimic` function is better explained [here](server/mimic)

## Client Side

To use Jungla on a client device, you will either need to have a server using Jungla... or you use jungla clientside.

When you use Jungla client-side, this means the client is doing the intensive work of converting the data to meet the structure you have requested. It will always be recommended to the language processing on the server side. Though this might not always be possible. More information can be found [here](language/client-side)

The alternative is to send a formatted Jungla message to a server. In which case we will actually only use a small part of the Jungla library. We will be using the `validator` sub-library. More information can be found [here](language/validator)

!> It is never going to be recommended to use Jungla-Stack on a client. Though there might be cases where you want to use the mimic function, in which case... you will need to import the Jungla-Stack library
