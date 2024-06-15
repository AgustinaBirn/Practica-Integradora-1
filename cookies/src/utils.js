import bcrypt from "bcrypt";
import config from "./config.js";

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (enteredPassword, savedPassword) => bcrypt.compareSync(enteredPassword, savedPassword);

export const verifyRequiredBody = (requiredFields) => {
    return ( req, res, next ) => {
        const allOk = requiredFields.every(field =>
            req.body.hasOwnProperty(field) && req.body[field] !== "" && req.body[field] !== null && req.body[field] !== undefined
        );

        if (!allOk) return res.status(400).send({ status:1, payload: "faltan propiedades", requiredFields}),
    console.log("requiredfields:", requiredFields, allOk);

        next();
    };
};