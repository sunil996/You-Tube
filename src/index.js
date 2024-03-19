const app =require("./app.js"); 
const connectDB=require("./db/connection.js");


connectDB()
.then(()=>{
 console.log("connected to the database...");
 app.listen(process.env.PORT,()=>console.log(`server is listening on ${process.env.PORT}`));
  
})
.catch((error)=>{
    console.log("mongodb connection failed ",error);
}) 