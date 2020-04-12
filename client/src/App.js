import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

let socket = null;
let git = true; //offline use


async function sendPostRequest(request, data) {

  const postData = {
    title: 'Checkout post',
    body: data,
    userId: 2
  };
  const postOptions = {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const response = await fetch(request, postOptions);
  if (response.status !== 200) {
    throw Error(response.status);
  }
  const body = await response.json();
  return body;
}

async function sendGetRequestLogin(request, data) {

  try {
    const userInfo = btoa(`${data.user}:${data.password}`);
    const response = await fetch(request, {
      headers: new Headers({
        "Authorization": 'Basic ' + userInfo,
        "Content-Type": 'application/json'
      })
    })
    if (response.status !== 200) {
      throw Error
    }
    const body = await response.json();
    return(body);
  }
  catch(err) {
    throw Error;
  }
}

async function sendGetRequest(request, data) {
  const response = await fetch(request + (data !== '' ? '?name=' + data : ''));
  if (response.status !== 200) {
    throw Error
  }
  const body = await response.json();
  return body;
}

function getRandomMessage() {
  let cannedMessages = ['I love you!', 
                        'Hello.', 
                        'Why do you say that?', 
                        'Me too.',
                        'Ok.',
                        'I hate you!',
                        'That\'s not funny.',
                        'I can\'t help you.',
                        'Goodbye.',
                        'It\'s yellow.',
                        'You don\'t mean that.',
                        'I disagree.',
                        'Isn\'t it frustrating talking to a computer?',
                        'I will byte you!',
                        'You suck.',
                        'What are you wearing?',
                        'How old are you?',
                        'I like potatoes.',
                        'That\'s a nasty question.',
                        'I usually don\'t hang out in these chat rooms.'
                      ];
  let index = Math.floor(Math.random() * 20);
  return cannedMessages[index];
}

class App extends Component {
  constructor(props) {
    super(props);
    this.textArea = React.createRef();

    this.state = {
      data: null,
      currentTime: 'date',
      messages: [],
      sendMessage: '',
      userName: '',
      password: '',
      showLoginDialog: false,
      showLogoutDialog: false,
      showRegisterDialog: false,
      loginFailed: false,
      loggedIn: false,
      loginButtonText: 'Login'
    };

    this.onChangeMessage = this.onChangeMessage.bind(this);
    this.onSend = this.onSend.bind(this);
    this.openSocket = this.openSocket.bind(this);

    this.onOpenLogin = this.onOpenLogin.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onCancelLogin = this.onCancelLogin.bind(this);

    this.onOpenRegister = this.onOpenRegister.bind(this);
    this.onRegister = this.onRegister.bind(this);
    this.onCancelRegister = this.onCancelRegister.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  componentDidMount() {
    setInterval(() => {
      let date = new Date();
      this.setState({currentTime: date.toDateString() + ' ' + date.toLocaleTimeString('en-US')})
    }, 1000);

      // Call our fetch function below once the component mounts
    // this.callBackendAPI()
    //   .then(res => this.setState({ data: res.express }))
    //   .catch(err => console.log(err));

    this.openSocket();

    window.addEventListener('beforeunload', this.onUnmount.bind(this), false);
  }

  onUnmount() {
    console.log('unmount');
    window.removeEventListener('beforeunload', this.onUnmount, false);
    socket.close();
    this.onLogout();
  }

  scrollToBottom() {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  // callBackendAPI = async () => {
  //   const response = await fetch('/express_backend');
  //   const body = await response.json();

  //   if (response.status !== 200) {
  //     throw Error(body.message) 
  //   }
  //   return body;
  // };

  onChangeMessage(e) {
    this.setState({sendMessage: e.target.value});
  }

  onSend() {

    if (git) { 
      let msg = {timeStamp: this.state.currentTime,
        userName: this.state.userName,
        message: this.state.sendMessage};
      
      let newMessages = this.state.messages.concat(msg);
      this.setState({messages: newMessages, sendMessage: ''});
      
      setTimeout(() => { //make sure scrollToBottom happens after the render triggered by setState above
        this.scrollToBottom();
      }, 0);

      setTimeout(() => {
        let msg = {timeStamp: this.state.currentTime,
          userName: 'Robota',
          message: getRandomMessage()};
        
        let newMessages = this.state.messages.concat(msg);
        this.setState({messages: newMessages});
        this.scrollToBottom();

      }, 2000);
    }
    else {
      if (socket) {
        if (this.state.sendMessage !== '') {
          socket.send(JSON.stringify({timeStamp: this.state.currentTime,
                      userName: this.state.userName,
                      message: this.state.sendMessage}));
          this.setState({sendMessage: ''});
        }
      }
    }
  }

  openSocket() {
    socket = new WebSocket('ws://localhost:5000/');
    socket.onopen = function() {
      // socket.send('hi server!');          
    }
    socket.onmessage = (event) => {
      let newMessages = this.state.messages.concat(JSON.parse(event.data));
      this.setState({messages: newMessages});
      this.scrollToBottom();
    }
  }
  
  onOpenLogin() {
    if (this.state.loggedIn) {
      this.setState({showLogoutDialog: true});
    }
    else {
      this.setState({showLoginDialog: true});
    }
  }

  onLogin(user, password) {
    if (git) {
      this.setState({userName: user, showLoginDialog: false, loggedIn: true, loginFailed: false, loginButtonText: 'Logout'});
    }
    else {
      sendGetRequestLogin('/login', {user: user, password: password})
        .then(res => {
            if (res === true) {
              this.setState({ data: res.response, userName: user, showLoginDialog: false, loggedIn: true, loginFailed: false, loginButtonText: 'Logout'});
            }
            else {
              this.setState({ loginFailed: true, user: ''});
            }
          })
        .catch(err => console.log(err));
    }
  } 
  
  onLogout() {
    if (git) {
      this.setState({userName: '', showLogoutDialog: false, loggedIn: false, loginFailed: false, loginButtonText: 'Login' });
    }
    else {
      sendGetRequest('/logout', this.state.userName)
        .then(res => this.setState({ data: res.response, userName: '', showLogoutDialog: false, loggedIn: false, loginFailed: false, loginButtonText: 'Login' }))
        .catch(err => console.log(err));
    }
  }

  onCancelLogin() {
    this.setState({showLoginDialog: false});
  }
  
  onOpenRegister() { 
    this.setState({showRegisterDialog: true});
  }

  onRegister(name, email, password) {
    if (git) {
      return;
    }
    sendPostRequest('/register', {name: name, email: email, password: password})
      .then(res => this.setState({ showRegisterDialog: false}))
      .catch(err => console.log(err));
  }

  onCancelRegister() {
    this.setState({showRegisterDialog: false});
  }

  render() {
    return (
      <div id="mainAppDiv">
        <header id="headerDiv">
          <div id='headerDiv1'>
            <div id='userDateDiv'>
              <div id='dateDiv'>
                {this.state.currentTime}
              </div>
              <div id='userDiv'>
                {this.state.userName !== '' ? 'Welcome, ' + this.state.userName : ''}
              </div>
            </div>
            <div id='loginDiv'>
              <button id='loginButton' onClick={this.onOpenLogin}>{this.state.loginButtonText}</button>
            </div>
          </div>

          <div id='headerDiv2'>
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Winnetka Chat</h1>
            <img src={logo} className="App-logo" alt="logo" />
          </div>

          <div id='headerDiv3'>
            <h5 className="App-title">A place to chat about all things Winnetka! {git ? ' - with \'Robota\'' : ''}</h5>
          </div>
        </header>

        <div id='mainDiv'>
          <ul id='messageUL'>
            {
              this.state.messages.map((item, index) => {
                return(
                  <li key={index}>
                    <div id='messageDiv'>
                      <div id='messageTimeNameDiv'>
                        {item.timeStamp + ' - \'' + item.userName + '\' said:'}
                      </div>
                      <textarea id='messageTextDiv' className={(item.userName === this.state.userName ? 'itsMe' : 'itsYou')} value={'\'' + item.message + '\''} readOnly></textarea>
                    </div>
                  </li>
                )
              })
            }
            <div ref={this.textArea}></div>
            <div ref={(el) => { this.messagesEnd = el; }}></div>
          </ul>

          <div id='sendDiv'>
            <textarea id='textAreaSend' ref={this.textArea} onChange={this.onChangeMessage} value={this.state.sendMessage}></textarea>
            <button id='sendButton' onClick={this.onSend} disabled={!this.state.loggedIn}>Send</button>
          </div>
        </div>

        <div id='footerDiv'>
            Winnetka Chat Works Copyright 2020
        </div>

        <DialogContainer show={this.state.showLoginDialog} onCancel={this.onCancelLogin} dialogContent={<LogInDialog
                                                                                                         onLogin={this.onLogin}
                                                                                                         onCancel={this.onCancelLogin}
                                                                                                         openRegister={this.onOpenRegister}
                                                                                                         onLogout={this.onLogout}
                                                                                                         user={this.state.user}
                                                                                                         registerTitle={'Register'}
                                                                                                         loginFailed={this.state.loginFailed}/>}
          width='600px' height='240px' title={'Login'} user={this.state.user}></DialogContainer>

        <DialogContainer show={this.state.showLogoutDialog} onCancel={this.onCancelLogout} dialogContent={<LogOutDialog
                                                                                                            onLogout={this.onLogout}
                                                                                                            onCancel={this.onCancelLogout}
                                                                                                            user={this.state.userName}/>}
          width='400px' height='150px' title={'Logout'} user={this.state.user}></DialogContainer>


        <DialogContainer show={this.state.showRegisterDialog} onCancel={this.onCancelRegister} onRegister={this.onRegister} dialogContent={<RegisterDialog
                                                                                                                                            onRegister={this.onRegister}
                                                                                                                                            onCancelRegister={this.onCancelRegister}/>}
          width='600px' height='200px' title={'Register'}></DialogContainer>

      </div>
    );
  }
}

class LogInDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {userName: '', password: ''};
    this.handleUserNameChange = this.handleUserNameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.openRegister = this.openRegister.bind(this);
  }

  handleUserNameChange(event) {
    this.setState({userName: event.target.value});
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }

  onLogin() {
    this.props.onLogin(this.state.userName, this.state.password);
  }

  onCancel() {
    this.props.onCancel();
  }

  openRegister() {
    this.props.openRegister();
  }

  render() {
    return (
      <>
        <div id='dialogMain'>
          <div className="block">
            <label>User name:</label>
            <div className="divider"/>
            <input type="text" value={this.state.userName} onChange={this.handleUserNameChange} />
          </div>
          <div className="block">
            <label>Password:</label>
            <div className="divider"/>
            <input type="text" value={this.state.password} onChange={this.handlePasswordChange} />
          </div>
        </div>
        <div>
          <div id='loginFailedDiv'>
            <p>{this.props.loginFailed ? 'Login failed. Please try again.' : ''}</p>
          </div>
          <div id='registerDiv'>
            <p id='register' onClick={this.openRegister}>{this.props.registerTitle}</p>
          </div>
        </div>

        <div id='dialogButtons'>
          <button id='mainButtons' onClick={this.onLogin}>Login</button>
          <div className="divider"/>
          <button id='mainButtons' onClick={this.onCancel}>Cancel</button>
        </div>
      </>
    )
  }
}

class LogOutDialog extends React.Component {
  constructor(props) {
    super(props);
    this.onLogout = this.onLogout.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onLogout() {
    this.props.onLogout();
  }

  onCancel() {
    this.props.onCancel();
  }

  render() {
    let greeting = this.props.user + ', are you sure you want to log out?';

    return(
      <>
        <div id='dialogMain'>
          <p style={{textAlign: 'center'}}>{greeting}</p>
        </div>
        <div id='dialogButtons'>
          <button id='mainButtons' onClick={this.onLogout}>Yes</button>
          <div className="divider"/>
          <button id='mainButtons' onClick={this.onCancel}>Cancel</button>
        </div>
      </>
    )
  }
}

class RegisterDialog extends React.Component {
  constructor(props) {
    super(props);
    this.onRegister = this.onRegister.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      regName: '',
      regEmail: '',
      regPassword: ''
    }
  }

  onRegister() {
    this.props.onRegister(this.state.regName, this.state.regEmail, this.state.regPassword);
  }

  onCancel() {
    this.props.onCancelRegister();
  }

  onChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  render() {
    return(
      <>
        <div id='billingDiv'>
          <div id='billingLabelDiv'>
            <div className='labelDiv'>Name:</div>
            <div className='labelDiv'>Email:</div>
            <div className='labelDiv'>Password:</div>
          </div>
          <div id='billingInputDiv'>
            <div className='inputDiv'>
              <input onChange={this.onChange} name={'regName'} value={this.state.regName}></input>
            </div>
            <div className='inputDiv'>
              <input onChange={this.onChange} name={'regEmail'} value={this.state.regEmail}></input>
            </div>
            <div className='inputDiv'>
              <input onChange={this.onChange} name={'regPassword'} value={this.state.regPassword}></input>
            </div>
          </div>
        </div>
        <div id='dialogButtons'>
          <button id='mainButtons' onClick={this.onRegister}>Register</button>
          <div className="divider"/>
          <button id='mainButtons' onClick={this.onCancel}>Cancel</button>
        </div>
      </>
    )
  }
}

class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.props.onCancel();
  }

  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    let loggedInUser = ' ';
    if (this.props.user !== '') {
      loggedInUser += `${this.props.user}`;
    }

    return (
      <React.Fragment>
        <div id='containerBackground'>
          <div id='containerContent' style={{width: this.props.width, height: this.props.height}}>
            <div id='containerContentTitle'>
              <span id='title'>{this.props.title}</span>
              <span>  </span>
              {/* <span id='titleUser'>{loggedInUser}</span> */}
              <div id='cancelX'>
                <button onClick={this.onCancel}>X</button>
              </div>
            </div>
            <div id='containerContentCustom'>
              {this.props.dialogContent}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
