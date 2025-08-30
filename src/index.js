import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js"

dotenv.config();
connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(` *️⃣  Server is running at ${process.env.PORT} in http://localhost:${process.env.PORT}`)
    } )
} )
.catch( (error) =>{
    console.log("Mongodb connection failed!!",error);
} )