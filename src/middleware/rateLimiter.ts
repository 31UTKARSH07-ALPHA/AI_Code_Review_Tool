import {rateLimit} from "express-rate-limit";
import { error } from "node:console";

export const globalLimiter = rateLimit({
    windowMs:15*60*1000,
    limit:100,
    standardHeaders:'draft-8',
    legacyHeaders:false,
})

export const localLimiter = rateLimit({
    windowMs:15*60*1000,
    limit:10,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{
        error:"Too many review requests, please try again after 15 minutes"
    }
})