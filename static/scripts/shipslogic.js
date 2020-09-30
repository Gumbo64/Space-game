gamearea = {};
const Matter = require('matter-js');

function shipnewPos(z) {
    actions = ships[z].input;
    left = actions[0];
    right=actions[1];
    up=actions[2];
    down=actions[3];
    shoot=actions[4];

    speed = 10
    if (up){
        Matter.Body.setVelocity( ships[z], {x: ships[z].velocity.x+Math.sin(ships[z].angle)*speed/100, y: ships[z].velocity.y-Math.cos(ships[z].angle)*speed/100});
        // console.log(ships[z])
        
    }
    anglespeed = 10
    if (left){
        Matter.Body.rotate(ships[z],-anglespeed * Math.PI / 180)
    }else if(right){
        Matter.Body.rotate(ships[z],anglespeed * Math.PI / 180)
    }
    if (shoot){
        ships[z].position.x = 0;
        ships[z].position.y = 0;
        ships[z].velocity.x = 0;
        ships[z].velocity.y = 0;
    }

    for (i=0;i<planets.length;i++){
        let direction = Math.atan2(planets[i].y-ships[z].position.y,planets[i].x-ships[z].position.x) +1.5708;
        let distance = Math.hypot(planets[i].x-ships[z].position.x,planets[i].y-ships[z].position.y)
        let force = planets[i].m / (distance^2);
        if(isFinite(force) && !isNaN(distance) && !isNaN(direction)){
            Matter.Body.setVelocity(ships[z], {x: ships[z].velocity.x+Math.sin(direction)*force, y: ships[z].velocity.y-Math.cos(direction)*force});
        }
        
    }
    
    
    
}

exports.updateGameArea = function() {
    for (var i in ships) {
        if (ships.hasOwnProperty(i)) {  
            // updateshipsbullets(i,ships[i].maxbullets)
            shipnewPos(i);
        }
    }
}
// exports.updateone = function(i){
//     // check if the property/key is defined in the object itself, not in parent
    

// }
exports.makeship = function(x, y, colour,username) {
    this.username = username;
    this.lastshoot = Date.now();
    this.input = [false,false,false,false,false];
    // [false,false,false,false,false]
    this.colour = colour;
    // bullets[colour]=[];
    this.height=50;
    this.width=50;
    this.health=4;
    this.angle = 0;
    this.terminalvelocity = 5;
    this.x = x;
    this.y = y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.speedmult = 3;
    this.bulletspeed = 5;
    this.moveanglemult = 4;
    this.maxbullets = 10;
    this.firerate = 200;
    this.bulletheight=40;
    this.bulletwidth=60;
    
}


function bullet(width, height, x, y, angle, speed, colour) {
    this.width = width;
    this.height = height;
    this.colour=colour;
    this.x=x;
    this.y=y;
    this.angle=angle;
    this.speed=speed;
    this.x += this.height/2 * Math.sin(this.angle);
    this.y -= this.height/2 * Math.cos(this.angle);
}

function Point(x,y){ 
    this.x = x;
    this.y = y;
}

function onSegment(p, q, r){
    if (( (q.x <= Math.max(p.x, r.x)) && (q.x >= Math.min(p.x, r.x)) && (q.y <= Math.max(p.y, r.y)) && (q.y >= Math.min(p.y, r.y)))){
        return true;
    }
    return false;
}
function orientation(p, q, r){
    val = ((q.y - p.y) * (r.x - q.x)) - ((q.x - p.x) * (r.y - q.y));
    if (val > 0){
        return 1
    }else if (val < 0){
        return 2
    }else{
        return 0
    }
}
function doIntersect(p1,q1,p2,q2){
    o1 = orientation(p1, q1, p2);
    o2 = orientation(p1, q1, q2);
    o3 = orientation(p2, q2, p1);
    o4 = orientation(p2, q2, q1);
    if (((o1 != o2) && (o3 != o4))){
        return true
    } 
    if (((o1 == 0) && onSegment(p1, p2, q1))){
        return true
    }

    if (((o2 == 0) && onSegment(p1, q2, q1))){
        return true
    } 
    if (((o3 == 0) && onSegment(p2, p1, q2))){
        return true
    } 
    if (((o4 == 0) && onSegment(p2, q1, q2))){
        return true
    }
    return false
}
function GetPointRotated(X, Y, W, H, R, Xos, Yos){
    var rotatedX = X + (Xos  * Math.cos(R)) - (Yos * Math.sin(R));
    var rotatedY = Y + (Xos  * Math.sin(R)) + (Yos * Math.cos(R));
    coords = new Point(rotatedX,rotatedY);
    return coords;
}
function findcorners(xpos, ypos, angle, width, height) {
    corner1 = GetPointRotated(xpos, ypos, width, height, angle, width/2, height/2);
    corner2 = GetPointRotated(xpos, ypos, width, height, angle, -width/2, height/2);
    corner3 = GetPointRotated(xpos, ypos, width, height, angle, width/2, -height/2);
    corner4 = GetPointRotated(xpos, ypos, width, height, angle, -width/2, -height/2);
    return [corner1,corner2,corner4,corner3];
}
function updateshipsbullets(colour,maxbullets) {
    let shipothercornerso = shipothercorners(colour);
    for (i=0;i<bullets[colour].length;i++){
        bulletnewPos(colour,i,shipothercornerso);
    }
    bullets[colour].splice(0, bullets[colour].length-maxbullets);
}