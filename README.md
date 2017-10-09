# CPULoadService

### API:

 * `locahost:1337/start/1000` would start the server which calculates system load for every 1000ms. We can differen time interval, the load calculations would be based on that interval parameter,the default value it is 1000ms
 * `localhost:1337/getInfo` woud get the system load at that point of time
 * `localhost:1337/stop` would stop the system load time calculation
 

### Follow these steps to start the server:

1) clone the CPULoadService locally
2) run `npm install`
3) run `node server.js`

Once the server is started please go to [CPULoadReactApp](https://github.com/agrandhi18/CPULoadReactApp.git) and start the server from dashboard to view system load.