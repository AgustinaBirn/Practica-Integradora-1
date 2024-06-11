import { Router } from "express";
import { UserManager } from "../dao/user.manager.js";

import config from "../config.js";

const router = Router();

const manager = new UserManager("../dao/models/user.model.js");

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

router.post("/login", async (req, res) => {
    console.log(req.body);

    try {
        const { email, password } = req.body;
    
        const savedUser = await manager.findUserByEmail(email);
        const savedEmail = savedUser.email;
        const savedPassword = savedUser.password;
        // console.log("este es el savedUser", savedUser);

        if(email !== savedEmail || password !== savedPassword){
            return res.status(401).send({status: 1, payload: `Email o contraseña no válidos`});
            } 
    
        req.session.user = savedUser;
    
        res.redirect("/products");
        // res.status(200).send({ status: 1, payload: `Bienvenido ${req.session.user.firstName}` });
        } catch (err) {
        res.status(500).send({ status: 1, payload: null, error: err.message });
        }
});

router.post("/register", async (req, res) => {
    try{

        const {firstName, lastName, email, password, age} = req.body;

        const savedUser = await manager.findUserByEmail(email);
        
        if(savedUser) return res.status(500).send({status: 1, payload: "ya existe un usuario con este email"})
            
        req.session.user = await manager.addUser(req.body);

        res.redirect("/login");

        // res.status(200).send({status: 1, payload: `Bienvenido ${req.session.user.firstName}`});
    } catch(err){
        res.status(500).send({status: 1, payload: null, error: err.message})
    }
});

router.get("/private", async (req, res) => {
    console.log(req.session.user);
    try{
        if( !req.session.user || !req.session.user.role === "admin"){
            res.status(401).send({status: 1, payload: `Acceso denegado`});
            } else{
            res.status(200).send({status: 1, payload: `Eres admin ${req.session.user.name}`});
        }
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

export default router;