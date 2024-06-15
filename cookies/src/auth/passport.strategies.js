import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";

import config from "../config.js";
import {UserManager} from "../dao/user.manager.js";
import {isValidPassword} from "../utils.js";

const localStrategy = local.Strategy;
const manager = new UserManager();

const initAuthStrategies = () => {
    passport.use("login", new localStrategy(
        {passReqToCallback: true, usernameField: "email"},
        async (req, username, password, done) => {
            try {
                const savedUser = await manager.findUserByEmail(username);
                if(savedUser && isValidPassword(password, savedUser.password)){
                    const { password, ...filteredSavedUser } = savedUser;
                    return done(null, filteredSavedUser);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        }

    ));

    passport.use('ghlogin', new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Si passport llega hasta acá, es porque la autenticación en Github
                // ha sido correcta, tendremos un profile disponible
                const email = profile._json?.email || null;
                
                // Necesitamos que en el profile haya un email
                if (email) {
                    // Tratamos de ubicar en NUESTRA base de datos un usuario
                    // con ese email, si no está lo creamos y lo devolvemos,
                    // si ya existe retornamos directamente esos datos
                    const foundUser = await manager.findUserByEmail(email);

                    if (!foundUser) {
                        const user = {
                            firstName: profile._json.name.split(' ')[0],
                            lastName: profile._json.name.split(' ')[1],
                            email: email,
                            age: 25,
                            password: 'none'
                        }

                        const process = await manager.addUser(user);

                        return done(null, process);
                    } else {
                        return done(null, foundUser);
                    }
                } else {
                    return done(new Error('Faltan datos de perfil'), null);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

//     passport.use("ghlogin", new GitHubStrategy(
//         {
//             clientID: config.GITHUB_CLIENT_ID,
//             clientSecret: config.GITHUB_CLIENT_SECRET,
//             callbackURL: config.GITHUB_CALLBACK_URL
//         },

//         async (req, accessToken, refreshToken, profile, done) => {
//             try{
//                 const email = profile._json?.email || null;
//                 console.log(email);
//                 if(email){
//                     const savedUser = await manager.findUserByEmail( email); //({email: email})
//                     console.log("es el saveduser", savedUser);

//                     if(!savedUser) {
//                         const user = {
//                             firstName: profile._json.name.split(" ")[0],
//                             lastName: profile._json.name.split(" ")[1],
//                             age: 26,
//                             email: email,
//                             password: "none"
//                         }

//                         const  process = await manager.addUser(user);

//                         return done(null, process);
//                     } else {
//                         console.log("Ya existe usuario con este email");
//                         return done(null, savedUser);
//                     }
//                 } else {
//                     return done( new Error ("Faltan datos del perfil"), null);
//                 }
//             } catch(err){
//                 return (done( err, false),
//             console.log("error estrategia"));
//             }
//         }
// ))

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    })
};

export default initAuthStrategies;