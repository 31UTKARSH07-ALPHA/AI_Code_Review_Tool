import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({adapter});

export default prisma;


//This creates one single Prisma instance your whole app shares —
// we'll use this to save and fetch reviews from the database.


// download postgresadapter from --> npm i @prisma/adapter-pg