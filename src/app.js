const express=require("express")
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {errorHandler}=require("./middlewares/error.middleware")
const app=express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

 // import routes
 const userRouter=require("./routes/user.routes.js");
 const videoRouter=require("./routes/video.routes.js");
 const tweetRouter=require("./routes/tweet.routes.js");
 const subscriptionRouter=require("./routes/subscriptio.routes.js")
 const playlistRouter=require("./routes/playlist.routes.js")
 const commentRouter=require("./routes/comment.routes.js")
 const likeRouter = require("./routes/liks.routes.js");

app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/playlists",playlistRouter)
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter)
app.use(errorHandler); 

module.exports=app;
 
 