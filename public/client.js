(function($){
  var socket = io.connect('http://localhost:3000')

  /**
  * Connexion à l'application
  **/

  $('#loginform').submit(function(event){
    event.preventDefault()
    socket.emit('login', {
      username: $('#username').val()
    })
  })

  socket.on('username_used', function(user){
    alert(user.username + " is already used")
  })

  socket.on('newusr', function(user){
    $('#users').append('<strong id="' + user.id + '">' + user.username + '</strong>')
    $('#area-general').append('<strong class="notif">' + user.username + ' has connected</strong>')
  })

  socket.on('logged', function(user){
    $('#divLogin').fadeOut()
    $('.sidebar').show()
    $('.content').show()
    $('#tokken').attr('class', user.id)
  })

  socket.on('logged2', function(){
    $('#room-general').attr('class', 'room-active')
  })

  /**
  * Fin Connexion à l'application
  **/

  /**
  * Déconnexion à l'application
  **/

  socket.on('deluser', function(user){
    $('#' + user.id).remove()
    $('#area-general').append('<strong class="notif2">' + user.username + ' has disconnected</strong>')
  })

  $('#logout').click(function(){
    socket.emit('logout')
    $('#divLogin').show()
  })

  socket.on('loggedout', function(){
    $('#area-general').empty()
    $('#channels').empty()
  })

  /**
  * Fin Déconnexion à l'application
  **/

  /**
  * Affichage Sidebar
  **/

  $('.head').click(function(){
    var target = event.target
    var lastActive = $('.active').attr('id')
    if(target.nodeName == 'P' && $(target).attr('class') == 'non-active'){
      $(target).attr('class', 'active')
      $('#' + lastActive).attr('class', 'non-active')
      lastActive = $('.active').attr('id')
      if($(target).attr('id') == 'side-users'){
        $('#users').show()
        $('#channels').hide()
      }else {
        $('#users').hide()
        $('#channels').show()
      }
    }
  })

  socket.on('rooms', function(room){
    $('#channels').append('<strong class="room" id="room-' + room.toLowerCase() + '">' + room + '</strong>')
  })

  $('#channels').click(function(event){
    var target = event.target
    var lastActive = $('.room-active').attr('id')
    var lastActiveView = $('.messages').attr('id')
    if(target.nodeName == 'STRONG' && $(target).attr('class') == 'room'){
      $(target).attr('class', 'room-active')
      $('#' + lastActive).attr('class', 'room')
      lastActive = $('.room-active').attr('id')
      var one = lastActive.replace('room-', '')
      var two = lastActiveView.replace('area-', '')
      if( one != two){
        $('#area-' + one).attr('class', 'messages')
        $('#area-' + two).attr('class', 'messages-hide')
      }
    }
  })

  /**
  * Fin Affichage Sidebar
  **/

  /**
  * Envoie de message
  **/

  $('#textentry').submit(function(event){
    event.preventDefault()
    $('#textbox').keyup(function(event){
      var commands = ['/commands', '/nick', '/list', '/create', '/delete', '/join', '/part', '/users', '/msg']
      var stt = $(this).val()
      var words = stt.split(' ')

      // Commande /commands
      if(commands.includes(words[0]) == true && words[0] == "/commands" && event.keyCode === 13){
        socket.emit('commands')
        $('#textbox').val('')
      }

      // Commande /nick
      if(commands.includes(words[0]) == true && words[0] == "/nick" && event.keyCode === 13){
        $('#textbox').val('')
      }

      if(commands.includes(words[0]) == true && words[0] == "/nick" && words.includes(words[1]) == true && words[1] != "" && event.keyCode === 13){
        socket.emit('nick', {
          nick: words[1]
        })
        $('#textbox').val('')
      }

      // Commande /list
      if(commands.includes(words[0]) == true && words[0] == "/list" && event.keyCode === 13){
        if(words.includes(words[1]) == false){
          socket.emit('list', {
            list: ''
          })
          $('#textbox').val('')
        }else {
          socket.emit('list', {
            list: words[1]
          })
          $('#textbox').val('')
        }
      }

      // Commande /create
      if(commands.includes(words[0]) == true && words[0] == "/create" && event.keyCode === 13){
        $('#textbox').val('')
      }

      if(commands.includes(words[0]) == true && words[0] == "/create" && words.includes(words[1]) == true && words[1] != "" && event.keyCode === 13){
        words[1] = words[1].substr(0,1).toUpperCase() + words[1].substr(1)
        socket.emit('create', {
          create: words[1].substr(0,1).toUpperCase() + words[1].substr(1),
          author: 'author-' + $('#tokken').attr('class')
        })
        $('#textbox').val('')
      }

      // Commande /delete
      if(commands.includes(words[0]) == true && words[0] == "/delete" && event.keyCode === 13){
        $('#textbox').val('')
      }

      if(commands.includes(words[0]) == true && words[0] == "/delete" && words.includes(words[1]) == true && words[1] != "" && event.keyCode === 13){
        var id = $('#tokken').attr('class')
        if($('.administrator').attr('id') == id){
          words[1] = words[1].substr(0,1).toUpperCase() + words[1].substr(1)
          socket.emit('delete', {
            delete: words[1].substr(0,1).toUpperCase() + words[1].substr(1)
          })
          $('#textbox').val('')
        }
      }

      // Commande /join
      if(commands.includes(words[0]) == true && words[0] == "/join" && event.keyCode === 13){
        $('#textbox').val('')
      }

      if(commands.includes(words[0]) == true && words[0] == "/join" && words.includes(words[1]) == true && words[1] != "" && event.keyCode === 13){
        words[1] = words[1].substr(0,1).toUpperCase() + words[1].substr(1)
        socket.emit('join', {
          join: words[1].substr(0,1).toUpperCase() + words[1].substr(1)
        })
        $('#textbox').val('')
      }

      // Commande /part
      if(commands.includes(words[0]) == true && words[0] == "/part" && event.keyCode === 13){
        $('#textbox').val('')
      }

      if(commands.includes(words[0]) == true && words[0] == "/part" && words.includes(words[1]) == true && words[1] != "" && event.keyCode === 13){
        words[1] = words[1].substr(0,1).toUpperCase() + words[1].substr(1)
        socket.emit('part', {
          part: words[1].substr(0,1).toUpperCase() + words[1].substr(1)
        })
        $('#textbox').val('')
      }

      // Commande /users
      if(commands.includes(words[0]) == true && words[0] == "/users" && event.keyCode === 13){
        var lastActive = $('.room-active').text()
        socket.emit('users', {
          users: lastActive
        })
        $('#textbox').val('')
      }

      // Commande /msg
      if(commands.includes(words[0]) == true && words[0] == "/msg" && event.keyCode === 13){
        $('#textbox').val('')
      }

      if(commands.includes(words[0]) == true && words[0] == "/msg" && words.includes(words[1]) == true && words[1] != "" && event.keyCode === 13){
        socket.emit('msg', {
          msg: words[1]
        })
        $('#textbox').val('')
      }

      // Envoie de msg simple
      if(commands.includes(words[0]) == false && event.keyCode === 13){
        var lastActive = $('.room-active').attr('id').replace('room-', '')
        socket.emit('newmsg', {
          message: $('#textbox').val(),
          author: $('#tokken').attr('class'),
          lastActive: lastActive
        })
        $('#textbox').val('')
      }
    })
  })

  /**
  * Fin Envoie de message
  **/

  /**
  * Effets des commandes
  **/

  // effet d'envoie d'un simple messages
  socket.on('msgoff', function(msg){
    $('#area-' + msg.lastActive).append('<div class="message"><strong class="' + msg.lastActive + '" id="' + msg.id + '">' + msg.username + '</strong><small> ' + msg.heure + ':' + msg.minutes + '</small><p>' + msg.message + '</p></div>')
    $('#area-' + msg.lastActive).animate({scrollTop : $('#area-' + msg.lastActive).prop('scrollHeight')}, 50)
  })

  // effet /commands
  socket.on('allcommands', function(commands){
    var lastActive = $('.room-active').attr('id').replace('room-', '')
    $('#list-all').attr('id', 'off')
    $('#area-' + lastActive).append('<p id="list-all" class="notif"><strong>LIST OF COMMANDS:</strong><br></p>')
    var commands = commands.commands
    for(var k in commands){
      $('#area-' + lastActive).children('#list-all').append(commands[k] + ('<br>'))
    }
  })

  // effet /nick
  socket.on('newusername', function(user){
    $('#' + user.id).empty()
    $('#' + user.id).text(user.username)
    $('#area-general').append('<strong class="notif">' + user.lastusername + "'s new pseudo is " + user.username + '</strong>')
  })

  // effet /list
  socket.on('allchannels', function(channels){
    var lastActive = $('.room-active').attr('id').replace('room-', '')
    $('#list-all').attr('id', 'off')
    $('#area-' + lastActive).append('<p id="list-all" class="notif"><strong>LIST OF CHANNEL(S)</strong><br></p>')
    for(var k in channels){
      $('#area-' + lastActive).children('#list-all').append(channels[k] + ('<br>'))
    }
  })

  socket.on('channels', function(channels){
    var lastActive = $('.room-active').attr('id').replace('room-', '')
    $('#list-all').attr('id', 'off')
    $('#area-' + lastActive).append('<p id="list-all" class="notif"><strong>LIST OF CHANNEL(S) BASED ON: ' + channels.filter  + '</strong><br></p>')
    var rooms = channels.rooms
    var filter = new RegExp(channels.filter, 'g')
    for(var k in rooms){
      if(rooms[k].match(filter)){
        $('#area-' + lastActive).children('#list-all').append(rooms[k] + ('<br>'))
      }
    }
  })

  // effet /create
  socket.on('newchannel', function(channel){
    for(var k in channel.rooms){
      $('#area-' + channel.rooms[k].toLowerCase()).append('<strong class="notif">' + channel.author + ' created the channel: ' + channel.channel + '</strong>')
    }
  })

  socket.on('update', function(channel){
    $('#channels').append('<strong class="room" id="room-' + channel.channel.toLowerCase() + '">' + channel.channel + '</strong>')
    $('#area-general').after('<div id="area-' + channel.channel.toLowerCase() + '" class="messages-hide"><strong class="administrator" id="' + channel.id + '">You are the administrator</strong></div>')
  })

  // effet /delete
  socket.on('delchannel', function(channel){
    $('#room-' + channel.channel.toLowerCase()).remove()
    $('#area-' + channel.channel.toLowerCase()).remove()
    for(var k in channel.rooms){
      $('#area-' + channel.rooms[k].toLowerCase()).append('<strong class="notif2">' + channel.author + ' deleted the channel: ' + channel.channel + '</strong>')
    }
    $('#area-general').attr('class', 'messages')
    $('#room-general').attr('class', 'room-active')
  })

  // effet /join
  socket.on('addchannel', function(channel){
    $('#channels').append('<strong class="room" id="room-' + channel.channel.toLowerCase() + '">' + channel.channel + '</strong>')
    $('#area-general').after('<div id="area-' + channel.channel.toLowerCase() + '" class="messages-hide"></div>')
  })

  socket.on('update2', function(channel){
    $('#area-' + channel.channel.toLowerCase()).append('<strong class="notif">' + channel.joiner + ' joined the channel</strong>')
  })

  // effet /part
  socket.on('leavechannel', function(channel){
    $('#area-' + channel.channel.toLowerCase()).remove()
    $('#room-' + channel.channel.toLowerCase()).remove()
    $('#area-general').attr('class', 'messages')
    $('#room-general').attr('class', 'room-active')
  })

  // effet /users
  socket.on('allusers', function(channel){
    $('#list-all').attr('id', 'off')
    $('#area-' + channel.channel.toLowerCase()).append('<p id="list-all" class="notif"><strong>LIST OF USER(S)</strong><br></p>')
    for(var k in channel.connects){
      $('#area-' + channel.channel.toLowerCase()).children('#list-all').append(channel.connects[k]['username'] + ('<br>'))
    }
  })

  // effet /msg
  socket.on('private', function(user){
    if($('#tokken').attr('class') == user.fromID){
      $('#channels').append('<strong class="room" id="room-' + user.from + '-' + user.to + '">' + user.from + ' & ' + user.to + '</strong>')
      $('#area-general').after('<div id="area-' + user.from + '-' + user.to + '" class="messages-hide"></div>')
    }
    if($('#tokken').attr('class') == user.toID){
      $('#channels').append('<strong class="room" id="room-' + user.from + '-' + user.to + '">' + user.to + ' & ' + user.from + '</strong>')
      $('#area-general').after('<div id="area-' + user.from + '-' + user.to + '" class="messages-hide"></div>')
    }
  })

  /**
  * Fin Effets des commandes
  **/

})(jQuery)
