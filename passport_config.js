const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const model = require('./mongodata');




function Auth(passport){
        // const user=getEmail(email);
        const check=(email,password,done)=>{
            model.findOne({ email:email }).
                then(async (user)=>{
                if (user==null) return done(null, false, { message: "Account not found" })
                // console.log(user._id);
                try {
                    if(await bcrypt.compare(password, user.password))return done(null,user);
                    else return done(null,false,{message:"Password incorrect"});
                }
                catch (e) {
                    return done(e);
                }
                // console.log(user.email,user.password);
            }).catch(err=>done(err));
        }
        passport.use(new localStrategy({usernameField:'email'},check));
        passport.serializeUser((user,done)=>{
            // console.log(user);
            done(null,user._id)
        });
        passport.deserializeUser((id,done)=>model.findById(id).then(user=>{
            // console.log(user)
            done(null,user)
        }));
}

module.exports = Auth;