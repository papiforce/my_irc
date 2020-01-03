const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.render('index')
})

server = app.listen(3000)
console.log('server port: 3000')

const io = require('socket.io')(server)
var users = {}
var rooms = []
rooms[0] = 'General'
var rooms2 = []
rooms2[0] = 'General'
var connects = []

io.sockets.on('connection', (socket) => {
  var me = false

  /**
  * Connexion à l'application
  **/

  for(var k in users){
    socket.emit('newusr', users[k])
  }

  socket.on('login', function(user){
    me = user
    for(var k in users){
      if(users[k]['username'] == me.username){
        socket.emit('username_used', me)
        return false
      }
    }
    me.id = Math.floor(Math.random() * Math.floor(999999999))
    socket.emit('logged', me)
    users[me.id] = me
    connects['General'] = users
    for(var k in rooms){
      socket.emit('rooms', rooms[k])
    }
    socket.emit('logged2')
    io.sockets.emit('newusr', me)
  })

  /**
  * Fin Connexion à l'application
  **/

  /**
  * Déconnexion à l'application
  **/

  socket.on('disconnect', function(){
    if(!me){
      return false
    }
    delete users[me.id]
    io.sockets.emit('deluser', me)
  })

  socket.on('logout', function(){
    delete users[me.id]
    io.sockets.emit('deluser', me)
    socket.emit('loggedout')
  })

  /**
  * Fin Déconnexion à l'application
  **/

  /**
  * Message reçu
  **/

  socket.on('newmsg', function(msg){
    var d = new Date()
    msg.heure = d.getHours()
    msg.minutes = d.getMinutes()
    if(msg.message !== ''){
      socket.emit('msgoff', {
        message: msg.message,
        id: me.id,
        username: me.username,
        heure: msg.heure,
        minutes: msg.minutes,
        lastActive: msg.lastActive
      })
      socket.broadcast.emit('msgoff', {
        message: msg.message,
        id: me.id,
        username: me.username,
        heure: msg.heure,
        minutes: msg.minutes,
        lastActive: msg.lastActive
      })
    }
  })

  /**
  * Fin Message reçu
  **/

  /**
  * Toutes les commandes
  **/

  socket.on('commands', function(){
    var commands = ['/nick', '/list', '/create', '/delete', '/join', '/part', '/users', '/msg']
    socket.emit('allcommands', {
      commands: commands
    })
  })

  socket.on('nick', function(command){
    var last = me.username
    if(last != command.nick){
      me.username = command.nick
      io.sockets.emit('newusername', {
        lastusername: last,
        username: me.username,
        id: me.id
      })
    }
  })

  socket.on('list', function(command){
    if(command.list == ''){
      socket.emit('allchannels', rooms2)
    }else {
      socket.emit('channels', {
        rooms: rooms2,
        filter: command.list
      })
    }
  })

  socket.on('create', function(command){
    if(rooms2.includes(command.create) == false){
      rooms2.push(command.create)
      connects[command.create] = []
      connects[command.create][0] = me
      io.sockets.emit('newchannel', {
        author: me.username,
        channel: command.create,
        rooms: rooms2
      })
      socket.emit('update', {
        channel: command.create,
        id: me.id,
        username: me.username
      })
    }
  })

  socket.on('delete', function(command){
    if(rooms2.includes(command.delete)){
      for(var k = 0; k < rooms.length; k++){
        if(rooms[k] == command.delete){
          rooms2.splice(k, 1)
        }
      }
      for(var k = 0; k < connects.length; k++){
        if(connects[k] == command.delete){
          connects.splice(k, 1)
        }
      }
      io.sockets.emit('delchannel', {
        author: me.username,
        channel: command.delete,
        rooms: rooms2
      })
    }
  })

  socket.on('join', function(command){
    if(connects[command.join].includes(me) == false){
      connects[command.join].push(me)
      socket.emit('addchannel', {
        channel: command.join
      })
      socket.broadcast.emit('update2', {
        channel: command.join,
        joiner: me.username
      })
    }
  })

  socket.on('part', function(command){
    if(connects[command.part].includes(me) == true && connects[command.part][0] != me){
      socket.emit('leavechannel', {
        channel: command.part
      })
      var findThis = (element) => element == me
      var index = connects[command.part].findIndex(findThis)
      connects[command.part].splice(index, 1)
    }
  })

  socket.on('users', function(command){
    socket.emit('allusers', {
      channel: command.users,
      connects: connects[command.users]
    })
  })

  socket.on('msg', function(command){
    for(var k in users){
      if(users[k]['username'] == command.msg && command.msg != me.username){
        var idTo = users[k]['id']
        io.sockets.emit('private', {
          users: users,
          to: command.msg,
          toID: idTo,
          from: me.username,
          fromID: me.id
        })
      }
    }
    // if(command.msg != me.username){
    //   socket.emit('private', {
    //     users: users,
    //     to: command.msg,
    //     toID: idTo,
    //     from: me.username,
    //     fromID: me.id
    //   })
    // }
  })
})
