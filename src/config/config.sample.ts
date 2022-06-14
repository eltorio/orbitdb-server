export const config = {
    API_PORT: 3000,
    API_PORT_TLS:3000, //only one server will run, ie: if (process.env.TLS_KEY !== undefined && process.env.TLS_CERT !== undefined && config.API_PORT_TLS !== undefined) 
    PrivatePeers:[
      //Array of initial peers
    ]
  }