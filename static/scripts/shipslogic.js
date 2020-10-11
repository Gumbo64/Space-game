gamearea = {};
const { engine } = require('@tensorflow/tfjs');
const Matter = require('matter-js');

function shipnewPos(z) {
    actions = ships[z].input;
    left = actions[0];
    right=actions[1];
    up=actions[2];
    down=actions[3];
    shoot=actions[4];

    speed = 15
    anglespeed = 10
    fastspeed =100
    if (up){
        Matter.Body.setVelocity( ships[z], {x: ships[z].velocity.x+Math.sin(ships[z].angle)*speed/100, y: ships[z].velocity.y-Math.cos(ships[z].angle)*speed/100});
        // console.log(ships[z])
        
    }else if(down){
        Matter.Body.setVelocity( ships[z], {x: ships[z].velocity.x-Math.sin(ships[z].angle)*speed/100, y: ships[z].velocity.y+Math.cos(ships[z].angle)*speed/100});
    }  
    if (left){
        Matter.Body.setAngularVelocity(ships[z],ships[z].angularVelocity-anglespeed/100 * Math.PI / 180)
    }else if(right){
        Matter.Body.setAngularVelocity(ships[z],ships[z].angularVelocity+anglespeed/100 * Math.PI / 180)
    }
    if (shoot){
        Matter.Body.setPosition(ships[z],{x:1000,y:460})
        Matter.Body.setVelocity(ships[z],{x:0,y:0})
        Matter.Body.setAngularVelocity(ships[z],0)
        Matter.Body.setAngle(ships[z],0)
    }
    maxangular = 0.3;
    if(ships[z].angularVelocity>maxangular){
        Matter.Body.setAngularVelocity(ships[z],maxangular)

    }
    if(ships[z].angularVelocity<-maxangular){
        Matter.Body.setAngularVelocity(ships[z],-maxangular)

    }
    // console.log(ships[z].angularVelocity)
    
    
    
    
    
    
}
function gravity(body){
    for (i=0;i<engineplanets.length;i++){
        let direction = Math.atan2(engineplanets[i].position.y-body.position.y,engineplanets[i].position.x-body.position.x) +1.5708;
        let distance = Math.hypot(engineplanets[i].position.x-body.position.x,engineplanets[i].position.y-body.position.y)
        let force = engineplanets[i].m/10 / (distance^2);
        // console.log('d')
        if(isFinite(force) && !isNaN(distance) && !isNaN(direction) && (engineplanets[i].position.x != body.position.x && engineplanets[i].position.y != body.position.y)){
            Matter.Body.setVelocity(body, {x: body.velocity.x+Math.sin(direction)*force, y: body.velocity.y-Math.cos(direction)*force});
            
        }else{
            // console.log(engineplanets[i].m)
            // console.log([isFinite(force),!isNaN(distance), !isNaN(direction) , engineplanets[i].position.x != body.position.x , engineplanets[i].position.y != body.position.y])
        }
        
    }
}

exports.updateGameArea = function() {
    // console.log(ships['AI'].angularVelocity)
    for (var i in ships) {
        if (ships.hasOwnProperty(i)) {  
            // updateshipsbullets(i,ships[i].maxbullets)
            shipnewPos(i);
        }
    }
    for (i=0;i<engineplanets.length;i++){
        gravity(engineplanets[i])
        // console.log(engineplanets[i])
    }
    for (var i in ships) {
        if (ships.hasOwnProperty(i)) {  
            // updateshipsbullets(i,ships[i].maxbullets)
            
            gravity(ships[i])
            // console.log(ships)
        }
    }
}