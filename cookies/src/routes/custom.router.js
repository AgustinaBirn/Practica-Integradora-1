import { Router } from "express";
import config from "../config.js";

export default class CustomRouter {
    constructor() {
        this.router = Router();
        this.init();
    }

    init() {}

    getRouter() {
        return this.router;
    };

    applyCallBacks(callBacks) {
        return callBacks.map(callBack => async (...params) => {
            try {
                await callBack.apply(this, params);
            } catch(err) {
                console.log(err);

                params[1].status(500).send({origin: config.SERVER, payload: null, error: err.message});
            }
        });
    };

    // handlePolicies (policies)  {
    //     return async (req, res, next) => {
    //         if(policies[0] === "PUBLIC") return next();

    //         const authHeaders = req.headers.authorization;

    //         if(!authHeaders) return res.status(401).send({origin: config.SERVER, payload: "No autorizado"});

    //         const token = authHeaders.split(" ")[1];
    //         let user = jwt.verify(token, config.SECRET);

    //         if(!policies.includes(user.role.toUpperCase())) return res.status(403).send({origin: config.SERVER, payload: "No coincide con ningún rol"});

    //         req.user = user;

    //         next();
    //     }
    // };

    generateCustomResponses(req, res, next) {
        res.sendSuccess = payload => res.status(200).send({origin: config.SERVER, payload: payload});
        res.sendUserError = err => res.status(400).send({origin: config.SERVER, payload: null, error: err.message});
        res.sendServerError = err => res.status(500).send({origin: config.SERVER, payload: null, error: err.message});

        next();
    }

    get(path, ...callBacks) {
        this.router.get(path, this.generateCustomResponses, this.applyCallBacks(callBacks));
    }

    post(path, ...callBacks) {
        this.router.post(path, this.generateCustomResponses, this.applyCallBacks(callBacks));
    }

    put(path, ...callBacks) {
        this.router.put(path, this.generateCustomResponses, this.applyCallBacks(callBacks));
    }

    delete(path, ...callBacks) {
        this.router.delete(path, this.generateCustomResponses, this.applyCallBacks(callBacks));
    }
};