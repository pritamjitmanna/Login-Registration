const express=require('express');
const path=require('path')
const bcrypt=require('bcrypt');
const passport=require('passport');
// const mongoose=require('mongoose');
const flash=require('express-flash');
const session=require('express-session');


const app=express();
const PORT=3000;
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view-engine','pug');
app.set('views',path.join(__dirname,'views'));
app.use('/static',express.static('static'));

const model = require('./mongodata');

const Auth=require('./passport_config');
Auth(passport);

app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());



app.use((rec,res,next)=>{
    res.locals.success=rec.flash('success');
    res.locals.failure=rec.flash('failure');
    res.locals.login=rec.isAuthenticated();
    res.locals.logout=rec.flash('logout');
    next();
})




// Routing
app.get('/',(req,res)=>{
    if(res.locals.login)user=req.user.name;
    else user="User"
    // console.log(login);
    res.render('index.pug',{user:user});
})
app.get('/login',(req,res)=>{
    res.render('login.pug');
})
app.get('/register',(req,res)=>{
    res.render('register.pug');
})

app.get('/profile',checkAuth,(req,res)=>{
    res.render('profile.pug');
})
app.post('/profile',checkAuth,(req,res)=>{
    req.logOut();
    req.flash('logout',"Succ");
    res.redirect('/');
})

app.post('/logout',(req,res)=>{
    req.logOut();
    req.flash('logout',"Succ");
    res.redirect('/');
})

app.post('/register',(req,res)=>{
    model.exists({ email:req.body.email }, async (err,user)=>{
        if(err)return res.redirect('/register');
        if (user){
            req.flash('failure','Email already Exists');
            return res.redirect('/register');
        }
        try {
            const hassPass = await bcrypt.hash(req.body.password, 10);
            const info = new model({
                name: req.body.name,
                email: req.body.email,
                password: hassPass
            });
            // console.log(hassPass);
            info.save((err, info) => {
                if (err){
                    req.flash('failure','Missing Credentials or Internal Error')
                    res.redirect('/register');
                    return;
                    // throw err;
                }
                else{
                    // console.log(info);
                    req.flash('success','Successfully registered');
                    res.redirect('/login');
                }
            });
    
        }
        catch (e) {
            return res.redirect('/register');
        }

    });
});

app.post('/login',(req,res)=>{
    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/login',
        failureFlash:true,
    })(req,res);
    res.locals.logout=false;
})

function checkAuth(req,res,next){
    if(req.isAuthenticated())return next()
    res.redirect('/');
}



app.listen(PORT,()=>console.log(`Server started at ${PORT}`));