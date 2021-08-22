const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/pritam',{useNewUrlParser:true,useUnifiedTopology:true});
const db=mongoose.connection;
db.on('error',console.error.bind(console, 'connection error:'));
db.once('open',()=>console.log(`Connected`));

const Schema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const model=mongoose.model('items',Schema);

module.exports=model;