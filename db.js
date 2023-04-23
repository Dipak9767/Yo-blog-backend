const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://dipakfirake9767:dipak123@cluster0.uwhrw.mongodb.net/Blog')
.then(()=> console.log('DB is Connected'))
.catch((e)=> console.log(e))