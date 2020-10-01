const os = require('os');
const express = require('express')
const app = express()
const path = require('path');
const nunjucks = require('nunjucks');
const publicIp = require('public-ip');
const Matter = require('matter-js');
// const { Worker, isMainThread, parentPort } = require('worker_threads');
// (async () => {
//   ipadress = await publicIp.v4();
//   //=> '46.5.21.123'
// })();
const ioport = 1569;
const port = 80;
const tickrate =10;
const io = require('socket.io')(ioport);
const shipslogic = require('./static/scripts/shipslogic');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
// const { exception } = require('console');


var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();
engine.world.gravity.y = 0;

nunjucks.configure( '.', {
    autoescape: true,
    express: app
});

inputs = {};
ships = {};
structures = {};
manualplanets = [{'x':1000,'y':1000,'r':500},{'x':2000,'y':1000,'r':100}];
engineplanets = [];
for (i=0;i<manualplanets.length;i++){
  let oldplanet = manualplanets[i]
  engineplanets.push(Matter.Bodies.circle(oldplanet.x,oldplanet.y,oldplanet.r,{'frictionAir':0}))
  // Matter.Body.setStatic(engineplanets[i], true)
  World.add(engine.world, engineplanets[i]);
}

app.set('view engine', 'nunjucks')
app.use('/static', express.static('static'))
function truncate(str, n){
  return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
};


io.on('connection', socket => {

  socket.on('new-user', (username,structure) => {
    socket.emit('identifier',socket.id);
    handleNew(socket.id,username,structure);
  })
  socket.on('staterequest', (inputis) => {
    try {
      ships[socket.id].input=inputis; 
    } catch (error) {
      socket.emit('identifier',socket.id);
      handleNew(socket.id,'unnamed');
    }
    
  })
  socket.on('disconnect', () => {
    //delete workers[socket.id];
    try{
      if (!ships[socket.id].username){
        ships[socket.id].username='unnamed';
      }
      delete ships[socket.id];
      delete bullets[socket.id];
      delete structures[socket.id];
      console.log(ships[socket.id].username,' disconnected')
    
    }catch(err){
      console.log('error')
    }
  })
})

app.get('/', function(req, res){
  res.render(`${__dirname}/templates/multiplayerships.html`);
})

app.listen(port, function(){
  console.log(`Running at http://localhost:${port}`)
})

setInterval(intervalloop, tickrate);
function intervalloop(){
  shipslogic.updateGameArea()
  Engine.update(engine,tickrate)
  io.emit('states',parsedships(),structures);
  io.emit('planets',parsedplanets());
}

function parsedships(){
  let newships = {};
  for (var id in ships) {
    if (ships.hasOwnProperty(id)) {
      let oldship = ships[id];
      newships[id]={'input':oldship.input,'x':oldship.position.x, 'y': oldship.position.y, 'angle':oldship.angle, 'mX':oldship.velocity.x,'mY':oldship.velocity.y,'username':oldship.username,'colour':oldship.colour}
    }
  }
  return newships;
}
function parsedplanets(){
  let newplanets = [];
  for (i=0;i<engineplanets.length;i++) {
    let oldplanet = engineplanets[i];
    newplanets.push({'x':oldplanet.position.x, 'y': oldplanet.position.y,'m':oldplanet.m,'r':oldplanet.circleRadius})

  }
  return newplanets;
}

function handleNew(id,username,structure){
  // ships[id] = new shipslogic.makeship(Math.round(Math.random()*gamewidth),Math.round(Math.random()*gameheight),id,username);
  username = truncate(username,40);
  ships[id] = Bodies.rectangle(400, 200, 80, 80,{'frictionAir':0, 'colour':id,'username':username,'input':[false,false,false,false,false]});
  structures[id]=structure;
  console.log(username,' joined');
  World.add(engine.world, [ships[id]]);

}


