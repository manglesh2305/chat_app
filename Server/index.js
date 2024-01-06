const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const messagesRoute = require('./routes/messagesRoute')
require('dotenv').config();
const socket = require('socket.io');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',userRoutes);
app.use('/api/messages',messagesRoute);

mongoose.connect(process.env.MONGO_URL)
  .then(()=>console.log(`MongoDB Connected`))
  .catch((err)=>console.log(err));



const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running at Port http://localhost:${process.env.PORT}`);
} )

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
