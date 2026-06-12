import dotenv from "dotenv"
dotenv.config()
import express from "express"
import reviewRouter from "./routes/review"


const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json())

app.use("/api",reviewRouter)

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})