# Winnetka Chat with 'Robota'

## This is a serverless version of Winnetka Chat.

No need to register, but you must login with a name, and it can be anything. 'Robota' will respond to your messages. She's not too smart though. 

Issues:  
1. Message container does not resize for longer messages
2. Messages are not saved on the server - just passed along to all clients as they are received. 

Client: create-react-app  
Server: express, express-ws
