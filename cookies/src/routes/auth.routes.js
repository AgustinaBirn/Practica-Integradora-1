import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import { UserManager } from "../dao/user.manager.js";
import { createHash, isValidPassword, verifyRequiredBody, createToken, verifyToken, passportCall } from "../utils.js";
import initAuthStrategies from "../auth/passport.strategies.js";

import config from "../config.js";

const router = Router();

const manager = new UserManager("../dao/models/user.model.js");

initAuthStrategies();

const verifyAdmin = (req, res, next) => {
    if (req.session.user?.role !== "admin") return res.status(403).send({origin: config.SERVER, payload: "Acceso no autorizado, requiere que sea administrador"});
    next();
};

const verifyAuthorization = (role) => {
    return async (req, res, next) => {
        // if(!req.session.user) return res.status(401).send({origin: config.SERVER, payload: "Usuario no autenticado"});

        if(req.user.role !== role) return res.status(403).send({origin: config.SERVER, payload: "Acceso no autorizado: se requiere ser administrador"});
        next();

    }
};

const handlePolicies = policies => {
    return async (req, res, next) => {
        if(policies === "PUBLIC") return next();
        console.log(policies[0]);
        const authHeaders = req.headers.authorization;

        if(!authHeaders) return res.status(401).send({origin: config.SERVER, payload: "No autorizado"});

        const token = authHeaders.split(" ")[1];
        let user = jwt.verify(token, config.SECRET);

        if(!policies.includes(user.role.toUpperCase())) return res.status(403).send({origin: config.SERVER, payload: "ACCESO DENEGADO, requiere otro nivel de rol"});

        req.user = user;

        next();
    }
};

router.get('/hash/:password', async (req, res) => {
    res.status(200).send({ origin: config.SERVER, payload: createHash(req.params.password) });
});

router.get("/counter", async (req, res) => {
    try{
        if(req.session.counter){
            req.session.counter++
        res.status(200).send({status: 1, payload: `Visitas: ${req.session.counter}`});
        } else{
            req.session.counter = 1;
            res.status(200).send({status: 1, payload: `Bienvenido, es tu primer visita`});
        }
    } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

router.post("/login", verifyRequiredBody(["email", "password"]), async (req, res) => {
    console.log(req.body);

    try {
        const { email, password } = req.body;
    
        const savedUser = await manager.findUserByEmail(email);

        // console.log("este es el savedUser", savedUser);

        if(savedUser && isValidPassword(password, savedUser.password)){
            const {password, ...filteredSavedUser} = savedUser;
            
            req.session.user = filteredSavedUser;
            // console.log(req.session.user);

            req.session.save(err => {
                if(err) return res.status(500).send({status: 500, payload: null, error: err.message});

                res.redirect("/products");
            })
        } else{
            return res.status(401).send({status: 1, payload: `Email o contraseña no válidos`});

        };
            
    
        // res.redirect("/profile");
        // res.status(200).send({ status: 1, payload: `Bienvenido ${req.session.user.firstName}` });
        } catch (err) {
        res.status(401).send({ status: 1, payload: null, error: err.message });
        }
});

router.post("/register", verifyRequiredBody(["firstName", "lastName", "email", "password", "age"]), async (req, res) => {
    try{

        const {firstName, lastName, email, password, age} = req.body;

        const savedUser = await manager.findUserByEmail(email);
        
        if(!savedUser) {
            const process = await manager.addUser({firstName, lastName, email, password: createHash(password)});

            res.status(200).send({status: 1, payload: process});
        }
        // req.session.user = await manager.addUser(req.body);
        
        res.status(500).send({status: 1, payload: "ya existe un usuario con este email"})

        // res.redirect("/login");

    } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

router.get("/logout", async (req, res) => {
    console.log("hace el logout");
    try{
            req.session.destroy((err) => {
                if(err) return res.status(500).send({status: 1, payload: "Error al ejecutar destroy", err})
                // res.status(200).send({status: 1, payload: "usuario desconectado"})
                res.redirect("/login");
            })
            // res.status(200).send({status: 1, payload: `cerraste sesion`});
        } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

router.post("/pplogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", {failureRedirect: `login?error=${encodeURI("Usuario o clave no válidos")}`}), async (req, res) => {
    try{
        req.session.user = req.user;
        req.session.save(err => {
            if(err) {
                return res.status(500).send({status: 500, payload: null, error: err.message})
            }

            res.redirect("/products");
            
        });
    } catch (err) {
        res.status(500).send({origin: config.SERVER, payload: null, error: err.message});
    }
});

router.get("/ghlogin", passport.authenticate("ghlogin", {scope: ["user"]}), async (req, res) => {

});

router.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    try {
        req.session.user = req.user
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        
            res.redirect('/products');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.post("/jwtlogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", {failureRedirect: `login?error=${encodeURI("Usuario o clave no válidos")}`}), async (req, res) => {
    try{
        
        const token= createToken(req.user, "1h");

        res.cookie(`${config.APP_NAME}_cookie`, token, {maxAge: 60 * 60 * 1000, httpOnly: true})
        // .send({message: "Logged in"});

        // req.session.save(err => {
        //     if(err) {
        //         return res.status(500).send({status: 500, payload: null, error: err.message})
        //     }

        //     res.status(200).send({origin: config.SERVER, payload: `Usuario autenticado`});
        //     // res.redirect("/products");
            
        // });

        console.log("TOKEN", token);
        res.status(200).send({origin: config.SERVER, payload: `Usuario autenticado`});
        // res.status(200).send({origin: config.SERVER, payload: "Usuario autenticado", token: token});
        
    } catch (err) {
        res.status(500).send({origin: config.SERVER, payload: null, error: err.message});
    }
});

router.post("/jwtlogincookie", verifyRequiredBody(["email", "password"]), passport.authenticate("login", {failureRedirect: `login?error=${encodeURI("Usuario o clave no válidos")}`}), async (req, res) => {
    try{
        req.session.user = req.user;
        
        const token= createToken(req.user, "1h");

        res.cookie("cookieToken", token, {maxAge: 60 * 60 * 1000, httpOnly: true})
        .send({message: "Logged in"});

        res.status(200).send({origin: config.SERVER, payload: "Usuario autenticado"});
        // res.status(200).send({origin: config.SERVER, payload: "Usuario autenticado", token: token});
        
    } catch (err) {
        res.status(500).send({origin: config.SERVER, payload: null, error: err.message});
    }
});
// router.post("/login", async (req, res) => {
//     console.log(req.body);

//     try {
//         const { email, password } = req.body;
    
//         const savedUser = await manager.findUserByEmail(email);
//         const savedEmail = savedUser.email;
//         const savedPassword = savedUser.password;
//         // console.log("este es el savedUser", savedUser);

//         if(email !== savedEmail || password !== savedPassword){
//             return res.status(401).send({status: 1, payload: `Email o contraseña no válidos`});
//             } 
    
//         req.session.user = savedUser;
//         console.log(req.session.user);
    
//         res.redirect("/profile");
//         // res.status(200).send({ status: 1, payload: `Bienvenido ${req.session.user.firstName}` });
//         } catch (err) {
//         res.status(401).send({ status: 1, payload: null, error: err.message });
//         }
// });


// router.get("/hash/:password", (req, res) => {
//     res.status(200).send({status:1, payload: createHash(req.params.password)})
// })

// router.post("/login", async (req, res) => {
//     console.log(req.body);

//     try {
//         const { email, password } = req.body;
    
//         const savedUser = await manager.findUserByEmail(email);
//         const savedEmail = savedUser.email;
//         const savedPassword = savedUser.password;
//         // console.log("este es el savedUser", savedUser);

//         if(savedUser && isValidPassword(password, savedPassword)){
            // delete savedUser.password
//             req.session.user = savedUser;
//             console.log(req.session.user);
        
//             res.redirect("/products");
//         } else{

//             return res.status(401).send({status: 1, payload: `Email o contraseña no válidos`});
//         }
        
//         // res.status(200).send({ status: 1, payload: `Bienvenido ${req.session.user.firstName}` });
//         } catch (err) {
//         res.status(401).send({ status: 1, payload: null, error: err.message });
//         }
// });


router.get("/private", async (req, res) => {
    console.log(req.session.user);
    try{
        if( !req.session.user || !req.session.user.role === "admin"){
            res.status(401).send({status: 1, payload: `Acceso denegado`});
            } else{
            res.status(200).send({status: 1, payload: `Eres admin ${req.session.user.name}`});
        }
    } catch(err){
        res.status(403).send({status: 1, payload: null, error: err.message})
    }
});

// router.get("/admin", verifyAuthorization("admin"), async (req, res) => {
//     console.log(req.session.user);
//     try{
//         res.status(200).send({origin: config.SERVER, payload: "Bienvenido admin"});
//     } catch(err){
//         res.status(403).send({status: config.SERVER, payload: null, error: err.message})
//     }
// });

router.get("/admin", verifyToken, handlePolicies([ "ADMIN", "PREMIUM"]), async (req, res) => {
    console.log(req.session.user);
    try{
        res.status(200).send({origin: config.SERVER, payload: "Bienvenido a control"});
    } catch(err){
        res.status(403).send({status: config.SERVER, payload: null, error: err.message})
    }
});

router.get("/verifytoken", verifyToken, handlePolicies("PUBLIC"), async (req, res) => {
    console.log(req.session.user);
    try{
        res.status(200).send({origin: config.SERVER, payload: "Bienvenido por token"});
    } catch(err){
        res.status(403).send({status: config.SERVER, payload: null, error: err.message})
    }
});

router.get("/verifypassport", passport.authenticate("jwtlogin", {session: false}), async (req, res) => {
    console.log(req.session.user);
    try{
        res.status(200).send({origin: config.SERVER, payload: "Bienvenido por passport"});
    } catch(err){
        res.status(403).send({status: config.SERVER, payload: null, error: err.message})
    }
});

router.get("/verifypassportcall", passportCall("jwtlogin"), async (req, res) => {
    console.log(req.session.user);
    try{
        res.status(200).send({origin: config.SERVER, payload: "Bienvenido por passportCall"});
    } catch(err){
        res.status(403).send({status: config.SERVER, payload: null, error: err.message})
    }
});


export default router;