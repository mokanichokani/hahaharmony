const path = require('path');
const http = require('http');
const express = require('express');
const socketio  = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin , getCurrentuser, getRoomUsers , userLeave} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


app.use(express.static(path.join(__dirname, `public`)));

const admin = 'admin';
io.on('connection',socket => {
    // console.log('new WS connection .....');
    socket.on('joinRoom', ({username , room})=>{
        
        const user = userJoin(socket.id,username,room);

        socket.join(user.room);
        
    socket.emit('message',formatMessage(admin,'Welcome to ChatCord!'));

    
    socket.broadcast.to(user.room).emit('message',formatMessage(admin, `${user.username} has joined the chat`));
    io.to(user.room).emit('roomUsers', {
        room : user.room,
        users : getRoomUsers(user.room)
    });

    }); 
    
    socket.on('chatMessage',msg =>{
        const user = getCurrentuser(socket.id);
        io.emit('message',formatMessage(user.username,msg)); 
    });

    socket.on('disconnect',()=>{
        const user =  userLeave(socket.id);

        if(user){
            io.to(user.room).emit("message", formatMessage(admin, `${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers', {
                room : user.room,
                users : getRoomUsers(user.room)
            });
        }
        
        
    });

});

const PORT = 3000 ||process.env.PORT ; 
//app.listen(PORT , ()=> console.log(`server running on port ${PORT}`)); 
//http.listen(PORT , ()=> console.log(`server running on port ${PORT}`)); 
server.listen(PORT , ()=> console.log(`server running on port ${PORT}`)); 

