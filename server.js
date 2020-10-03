const os = require('os');
const express = require('express')
const app = express()
const path = require('path');
const nunjucks = require('nunjucks');
const publicIp = require('public-ip');
const Matter = require('matter-js');
const ReImprove = require('reimprovejs')
// const { Worker, isMainThread, parentPort } = require('worker_threads');
// (async () => {
//   ipadress = await publicIp.v4();
//   //=> '46.5.21.123'
// })();
const ioport = 1569;
const port = 80;
const tickrate =10;
const gamespeed = 100;
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

const modelFitConfig = {              // Exactly the same idea here by using tfjs's model's
    epochs: 1,                        // fit config.
    stepsPerEpoch: 16
};

const numActions = 8;                 // The number of actions your agent can choose to do
const inputSize = 4;                // Inputs size (10x10 image for instance)
const temporalWindow = 3;             // The window of data which will be sent yo your agent
                                      // For instance the x previous inputs, and what actions the agent took

function getInputs(){
    let AIship = ships['AI'];
    let distance = Math.hypot(
        Math.abs(AIship.position.x-1000),
        Math.abs(AIship.position.y-1000))
    let ShipToPlanetAngle = Math.atan2(
        Math.abs(-1000),
        Math.abs(AIship.position.y-1000))
    let shipangle = AIship.angle % (2*Math.PI)
    // let angledifference = ShipToPlanetAngle - shipangle;


    
    return [distance,ShipToPlanetAngle,shipangle,AIship.angularVelocity]
}

inputs = {};
ships = {};
structures = {};
manualplanets = [{'x':1000,'y':1000,'r':500}];
// manualplanets = [{'x':1000,'y':1000,'r':500},{'x':2000,'y':1000,'r':100},{'x':4000,'y':1000,'r':100},{'x':5000,'y':1000,'r':100},{'x':6000,'y':1000,'r':100}];
engineplanets = [];
for (i=0;i<manualplanets.length;i++){
  let oldplanet = manualplanets[i]
  engineplanets.push(Matter.Bodies.circle(oldplanet.x,oldplanet.y,oldplanet.r,{'frictionAir':0}))
  engineplanets[i].m = engineplanets[i].mass;
  Matter.Body.setStatic(engineplanets[i], true)
  World.add(engine.world, engineplanets[i]);
}


ships['AI'] = Bodies.rectangle(400, 200, 80, 80,{'frictionAir':0, 'colour':'AI','username':'OrbitAI','input':[false,false,false,false,false]});
structures['AI']={"0":{"0":'bullet'}};
console.log('OrbitAI',' joined');
World.add(engine.world, [ships['AI']]);


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
async function intervalloop(){
  shipslogic.updateGameArea()
  Engine.update(engine,tickrate)
  io.emit('states',parsedships(),structures);
  io.emit('planets',parsedplanets());
  let inputs = getInputs();       // Need to give a number[] of your inputs for one teacher.
  
  //actions = ships[z].input;
  // left = actions[0];
  // right=actions[1];
  // up=actions[2];
  // down=actions[3];
  // shoot=actions[4];
  var action = 3
  switch(action){
    case 0:
      ships['AI'].input = [false,false,false,false,false]
      break;
    case 1:
      ships['AI'].input = [true,false,true,false,false]
      break;
  
    case 2:
      ships['AI'].input = [false,true,true,false,false]
      break;
    case 3:
      ships['AI'].input = [false,false,true,false,false]
      break;
    case 4:
      ships['AI'].input = [true,false,false,false,false]
      break;
  
    case 5:
      ships['AI'].input = [false,true,false,false,false]
      break;
    case 6:
      ships['AI'].input = [true,false,false,true,false]
      break;
  
    case 7:
      ships['AI'].input = [false,true,false,true,false]
      break;
    case 8:
      ships['AI'].input = [false,false,false,true,false]
      break;
  }
  
  // console.log(action)

  let AIship = ships['AI'];
  // console.log(AIship.input)
  let distance = Math.hypot(
        Math.abs(AIship.position.x-1000),
        Math.abs(AIship.position.y-1000))
  let orbitval = Math.abs(distance-1000) ** 2
  if(distance > 5000){
    Matter.Body.setPosition(AIship,{x:1000,y:450})
    Matter.Body.setVelocity(AIship,{x:0,y:0})
    Matter.Body.setAngularVelocity(AIship,0)
    Matter.Body.setAngle(AIship,0)
    // punish too
  }
  // reward(-orbitval)
  // console.log(-orbitval)
  


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
  if (!structure || Object.keys(structure).length == 0){
    structure = {"0":{"0":'bullet'}};
  }
  structures[id]=structure;
  console.log(username,' joined');
  World.add(engine.world, [ships[id]]);

}


