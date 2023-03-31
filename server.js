const express = require("express");
const app = express();
const server = require("http").Server(app);
const nodemailer =  require("nodemailer");
const transporter = nodemailer.createTransport({
    port:587,
    host:"smtp.gmail.com",
    auth:{user:"yashbitur@gmail.com",pass:"kkutwyfftkaqskkf"},
    secure:true
})

app.get("/:room",(req,res)=>{
    res.render("index",{roomId:req.params.room})
})

app.post("/send-mail",(req,res)=>{
    const to = req.body.to 
    const url = req.body.url

    const maildata = {
        from:"yashbitur@gmail.com",
        to:to,
        subject:"Join The Video Chat With Us...",
        html:`<p>Hey There Come And Join Me In The Video Chat Here ${url}</p>`
    }
    transporter.sendMail(maildata,(error,info)=>{
        if(error){
            return console.log(error)
        }
        res.status(200).send({message:"invitation send",message_id:info.messageId})
    })


})


app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);