const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const bodyParser = require('body-parser');
const fs = require('fs');
const url = require('url');
var ws = require('express-ws')(app);
var aWss = ws.getWss('/');

const registerFile = './data/registeredUsers.json'; //cmd
//const registerFile = './react/winnetkachat/data/registeredUsers.json'; //vc debugger

let loggedInUsers = [];

app.use(bodyParser.json());

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.ws('/', (s, req) => {
  s.on('message', function(msg) { 
    aWss.clients.forEach(function(client) {
      client.send(msg);
    });  
  }); //websocket message received from client 
  // console.log('websocket connection');
  // for (var t = 0; t < 3; t++) {
  //   setTimeout(() => s.send('message from server', ()=>{}), 5000*t);
  // }
});


app.get('/login', (req, res) => {
  //TODO: check if user has previously registered by looking in registeredUsers.json file
//  let file = './data/registeredUsers.json';
//  let file = './create-react-app-express/data/registeredUsers.json';
  fs.readFile(registerFile, 'utf8', function(err, contents) {
    if (err) {
      console.log(err);
    }
    else {
      let authentication = req.headers.authorization.replace(/^Basic/, '');
      authentication = (new Buffer(authentication, 'base64')).toString('utf8');
      let loginInfo = authentication.split(':');

      let users = JSON.parse(contents);

      let obj = users.find(user => {
//        return ((user.name === req.query.name) && (user.password === req.query.password))
        return ((user.name === loginInfo[0]) && (user.password === loginInfo[1]))
      });
      if ((obj != null) && (!loggedInUsers.includes(obj.name))) {
        console.log('Login succeeded!');
        loggedInUsers.push(obj.name);
        res.send('true');
      }
      else {
        console.log('Login failed!');      
        res.send('false');
      }  
    }
  });
  // res.send({ response: 'Server received login request'});
});

app.get('/logout', (req, res) => {
  let index = loggedInUsers.indexOf(req.query.name);
  if (index !== -1) {  
    loggedInUsers.splice(index, 1);
  }
  res.send({ response: 'Server received logout request'});
});

app.post('/register', (req, res) => {
  let registeredUsers = [];
  console.log('Server /register');
  
  let user = {
    name: req.body.body.name,
    email: req.body.body.email,
    password: req.body.body.password
  }

  // let user = {
  //   name: req.query.name,
  //   email: req.query.email,
  //   password: req.query.password
  // }

  fs.stat(registerFile, function(err, fileStat) {
    if (err) {
      if (err.code == 'ENOENT') {
        //file does not exist
        registeredUsers.push(user);
        fs.writeFileSync(registerFile, JSON.stringify(registeredUsers));
      }
    } else {
      if (fileStat.isFile() && (fileStat.size > 0)) {
        fs.readFile(registerFile, 'utf8', function(err, contents) {
          if (err) {
            console.log(err);
          }
          else {
            registeredUsers = JSON.parse(contents);
            registeredUsers.push(user);
            fs.writeFileSync(registerFile, JSON.stringify(registeredUsers));
          }
        });
      }
    }
    res.send('true');
  });
});

