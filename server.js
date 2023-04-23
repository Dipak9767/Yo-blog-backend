const express = require('express');
require('dotenv').config();
const session = require("express-session");
const cors = require('cors')
const mongoDbSession = require("connect-mongodb-session")(session);



const db = require('./db');
const AuthRouter = require('./Controllers/AuthController');
const BlogRouter = require('./Controllers/BlogsController');
const { isAuth } = require('./Middlewares/AuthMiddleware');


const server = express();
const PORT = process.env.PORT;

//middlerwares
server.use(cors())
server.use(express.json())

const store = new mongoDbSession({
    uri: process.env.MONGO_URL,
    collection: "sessions",
  });
  
  server.use(
    session({
      secret: process.env.SECRECT_KEY,
      resave: false,
      saveUninitialized: false,
      store: store,
    })
  );
  

//Routes

server.get('/' , (req , res)=>{
    return res.send({
        status:200,
        messege:"success"
    })
})

// auth Routes
server.use('/auth',AuthRouter)

// blogs Routes
server.use('/blog',BlogRouter)



server.listen(PORT , (req , res)=>{
    console.log("Server is running on ",PORT)
})