const HumanizeDuration = require('humanize-duration');
const fs = require('fs');
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
const tickrate =0;
const io = require('socket.io')(ioport);
const shipslogic = require('./static/scripts/shipslogic');

const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
// const { exception } = require('console');


var env,lv_state=[],lv_action,lv_reward,lv_score=0,lv_init='X',f=0,speed=1;
try {
  let rawdata = fs.readFileSync('QTable.json');
  Q_table = JSON.parse(rawdata);
  // console.log(Q_table)
  
} catch (error) {
  console.log('Creating QTable.json')
  Q_table = {}
}

gamma = 1;// Future discount
alpha = 0.7;//Learning rate 0.1


randprob = 0.1;
tryharddiscount = 1;

s = [];

// actionset = 2 means you get 0 or 1
actionSet = 2;



function saveQTable(){
    // convert JSON object to string
  clonetable = Q_table;
  data = JSON.stringify(clonetable, null, 4);

  // write JSON string to a file
  fs.writeFile('QTable.json', data, (err) => {
      if (err) {
          throw err;
      }
      console.log('Saved')
      lastsave = Date.now()
  });

}


function getQ(s, a){
  var config = [];
  let i = 0
  for (i=0;i<s.length;i++){
    config.push(s[i])
  }
  config.push(a)
  // console.log(config)
  if (!(config in Q_table)) {
     // If there's no entry in the given Q-table for the given state-action
     // pair, return a default reward score as 0
     return 0;
  }
  return Q_table[config];
}
function setQ(s, a, r){
  var config = [ s[0], s[1], a];
      if (!(config in Q_table)) {
        Q_table[config] = 0;
      }
      Q_table[config] += r;
}
function logreturn(a){
  console.log(a)
  return a
}
function getAction(state){
  if(Math.random()<= randprob){
    return Math.floor(Math.random()*actionSet)
  }
  var rewardForStay = getQ(state, 0);
  var rewardForJump = getQ(state, 1);

  if (rewardForStay > rewardForJump) {
    // If reward for Stay is higher, command the flappy bird to stay
    return 0;
  } else if (rewardForStay < rewardForJump) {
    // If reward for Jump is higher, command the flappy bird to jump
    return 1;
  } else {
      return 1; 
  }
}
function bestQ(state){
  // console.log(state)
  return bestset(state)[1]
}
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

function implementreward(s, a,tag){
    var rewardForState=0;
    var futureState = getState(tag);
    
  
  //What is the reward for this step
  rewardForState = calculatereward(tag)
  
  var optimalFutureValue = Math.max(getQ(futureState, 0), 
  getQ(futureState, 1));
var updateValue = alpha*(rewardForState + gamma * optimalFutureValue - getQ(s, a));

setQ(s, a, updateValue);
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

const modelFitConfig = {              // Exactly the same idea here by using tfjs's model's
    epochs: 1,                        // fit config.
    stepsPerEpoch: 16
};

function getState(tag){
    let AIship = ships[tag];
    let distance = Math.hypot(
        Math.abs(AIship.position.x-1000),
        Math.abs(AIship.position.y-1000))
    let ShipToPlanetAngle = Math.atan2(
        Math.abs(AIship.position.x-1000),
        Math.abs(AIship.position.y-1000))
    let shipangle = AIship.angle % (2*Math.PI)
    // let angledifference = ShipToPlanetAngle - shipangle;

    distance = Math.round(distance/20)*20;
    ShipToPlanetAngle = Math.round(ShipToPlanetAngle*30)/30
      
    
    return [distance,ShipToPlanetAngle]
    // console.log('state')
    // return logreturn(Math.floor(Math.random() * (actionSet)))
}
function implementAction(action){
  
  //actions = ships[z].input;
  // left = actions[0];
  // right=actions[1];
  // up=actions[2];
  // down=actions[3];
  // shoot=actions[4];
  switch(action){
    case 0:
      ships['AI'].input = [false,true,true,false,false]
      break;
    case 1:
      ships['AI'].input = [true,false,true,false,false]
      break;
  
    case 2:
      ships['AI'].input = [false,false,true,false,false]
      break;
    case 3:
      ships['AI'].input = [true,false,false,false,false]
      break;
    case 4:
      ships['AI'].input = [false,true,false,false,false]
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
      handleNew(socket.id,'spectator');
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




actionhistory = {}


function actioncount(action){
  if(!actionhistory[action]){
    actionhistory[action]=1
  }else{
    actionhistory[action]+=1
  }
}

starttime = Date.now();
lastsave = Date.now();
nowtag='AI'
lv_state   = getState(nowtag);
lv_action = getAction(lv_state,nowtag); // s is an array of length 3
setInterval(intervalloop, tickrate);
setInterval(saveQTable, 600000);
// setInterval(saveQTable, 600);



function intervalloop(){
  
  console.clear();
  console.log("Uptime: "+ HumanizeDuration(Date.now()-starttime) + " Last save "+HumanizeDuration(Date.now()-lastsave)+" ago "+ lv_action + " || "+actionhistory[0] + '  '+actionhistory[1] + "    " +steps)
  shipslogic.updateGameArea()
  Engine.update(engine,tickrate)
  io.emit('states',parsedships(),structures);
  io.emit('planets',parsedplanets());

  implementreward(lv_state,lv_action,nowtag);
  lv_state   = getState(nowtag);
  lv_action = getAction(lv_state);

  actioncount(lv_action)
  implementAction(lv_action)
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
  
  structures[id]=structure;
  console.log(username,' joined');
  // username = truncate(username,40);
  ships[id] = Bodies.rectangle(400, 200, 80, 80,{'frictionAir':0, 'colour':id,'username':username,'input':[false,false,false,false,false]});
  if (!structure || Object.keys(structure).length == 0){
    structure = {"0":{"0":'bullet'}};
  }
  if(username != 'spectator'){
    
    World.add(engine.world, [ships[id]]);

  }
  
}


