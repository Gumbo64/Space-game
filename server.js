const HumanizeDuration = require('humanize-duration');
const fs = require('fs');
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
const tickrate =0;
const io = require('socket.io')(ioport);
const shipslogic = require('./static/scripts/shipslogic');

const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
// const { exception } = require('console');



mindistance = 455;
steps=0;
function calculatereward(tag){
  
  let AIship = ships[tag];
  // console.log(AIship.input)
  let distance = Math.hypot(
        Math.abs(AIship.position.x-1000),
        Math.abs(AIship.position.y-1000))
  let reward = ((distance) ** 2)/1000;
  let movement = Math.hypot(
    Math.abs(AIship.position.x-AIship.positionPrev.x),
    Math.abs(AIship.position.y-AIship.positionPrev.y))


  reward = 1
  if(mindistance<4500){
    mindistance += 0.1
  }
  steps +=1
  
  if(distance > 5000 || distance < mindistance || movement<0.1){
    Matter.Body.setPosition(AIship,{x:1000,y:460})
    Matter.Body.setVelocity(AIship,{x:0,y:0})
    Matter.Body.setAngularVelocity(AIship,0)
    Matter.Body.setAngle(AIship,0)
    // punish too
    reward = -10000;
    mindistance=455
    steps=0
  }

  

  // reward = 100
  // if(lv_action != lv_state){
  //   reward = -99999999999999999999
  // }
  // console.log(reward)
  return reward
  
}


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



app.set('view engine', 'nunjucks')
app.use('/static', express.static('static'))
function truncate(str, n){
  return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
};


io.on('connection', socket => {

  socket.on('new-user', (botharray) => {
    socket.emit('identifier',socket.id);
    handleNew(socket.id,botharray);
  })
  socket.on('staterequest', (inputis) => {
    try {
      ships[socket.id].input=inputis; 
    } catch (error) {
      console.log('someone joined')
      socket.emit('identifier',socket.id);
      handleNew(socket.id,['spectator',{}]);
    }
    
  })
  socket.on('disconnect', () => {
    //delete workers[socket.id];
    try{
      if (!ships[socket.id].username){
        ships[socket.id].username='unnamed';
      }
      console.log(ships[socket.id].username,' disconnected')
      delete ships[socket.id];
      
    
    }catch(err){
      console.log('already deleted ')
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
  
  // console.clear();
  // console.log("Uptime: "+ HumanizeDuration(Date.now()-starttime) + " Last save "+HumanizeDuration(Date.now()-lastsave)+" ago "+ lv_action + " || "+actionhistory[0] + '  '+actionhistory[1] + "    " +steps)
  shipslogic.updateGameArea()
  Engine.update(engine,tickrate)
  io.emit('states',parsedships());
  io.emit('planets',parsedplanets());

}

function parsedships(){
  let newships = {};
  for (var id in ships) {
    if (ships.hasOwnProperty(id)) {
      let oldship = ships[id];
      newships[id]={'input':oldship.input,'x':oldship.position.x, 'y': oldship.position.y, 'angle':oldship.angle, 'mX':oldship.velocity.x,'mY':oldship.velocity.y, 'mA':oldship.angularSpeed,'username':oldship.username,'colour':oldship.colour,'structure':oldship.structure}
      // console.log(oldship)
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

function handleNew(id,botharray){
  // ships[id] = new shipslogic.makeship(Math.round(Math.random()*gamewidth),Math.round(Math.random()*gameheight),id,username);
  username = botharray[0]
  structure = botharray[1]
  console.log(username,' joined');
  // username = truncate(username,40);
  
  if (!structure || Object.keys(structure).length == 0){
    structure = {"0":{"0":'bullet'}};
  }
  ships[id] = Bodies.rectangle(400, 200, 80, 80,{'frictionAir':0,'structure':structure, 'colour':id,'username':username,'input':[false,false,false,false,false]});
  if(username != 'spectator'){
    
    World.add(engine.world, [ships[id]]);

  }
  // console.log(ships)
  
}


