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
 const userRoutes=require("./routes/user.routes.js");
 const videoRoutes=require("./routes/video.routes.js");
 const tweetRoutes=require("./routes/tweet.routes.js");
 const subscriptionRoutes=require("./routes/subscriptio.routes.js")
 const playlistRoutes=require("./routes/playlist.routes.js")
 const commentRoutes=require("./routes/comment.routes.js")

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/videos",videoRoutes)
app.use("/api/v1/tweets",tweetRoutes)
app.use("/api/v1/subscriptions",subscriptionRoutes)
app.use("/api/v1/playlists",playlistRoutes)
app.use("/api/v1/comments",commentRoutes);

app.use(errorHandler); 

module.exports=app;
 
 