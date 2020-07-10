gamearea = {};
gamearea['canvas']={};
gamewidth = 10000;
gameheight= 10000;
gamearea.canvas.width = gamewidth;
gamearea.canvas.height = gameheight;
const frictioncollision=false;
const maxradian = 360 * Math.PI/180;
function shipshoot(z) {
    if (Date.now() - ships[z].lastshoot >= ships[z].firerate){
        append = new bullet(ships[z].bulletwidth,ships[z].bulletheight,ships[z].x,ships[z].y,ships[z].angle,ships[z].bulletspeed,ships[z].colour);
        bullets[z].push(append);
        ships[z].lastshoot=Date.now();
    }
}
function shipcorners(z){
    return findcorners(ships[z].x,ships[z].y,ships[z].totalangle,ships[z].width,ships[z].height);
}
function bulletcorners(z,c){
    return findcorners(bullets[z][c].x,bullets[z][c].y,bullets[z][c].angle,bullets[z][c].width,bullets[z][c].height);
}
function shipothercorners(p){
    let othercorners = [];
    for (var i in ships) {
        // check if the property/key is defined in the object itself, not in parent
        if (ships.hasOwnProperty(i)) {   
            // console.log(ships);
            // console.log(i)
            if ((p != i) && (ships[i].health > 0)){
                let append = shipcorners(i);
                append.push(i)
                othercorners.push(append);
            }
        }
    }
    return othercorners;
}

    
function bulletnewPos(z,c,othercorners) {
    bullets[z][c].x +=  bullets[z][c].speed * Math.sin(bullets[z][c].angle);
    bullets[z][c].y -=  bullets[z][c].speed * Math.cos(bullets[z][c].angle);
    var ourcorners = bulletcorners(z,c);
    var othercorners = othercorners;
    var i;
    var nexti;
    for (i = 0; i < ourcorners.length; i++) {
        var j;
        for (j=0;j<othercorners.length;j++){
            var k;
            for (k=0;k<othercorners[j].length-1;k++){
                if (k==3){
                    nextk = 0;
                }else{
                    nextk=k+1;
                }
                if (i==3){
                    nexti=0;
                }else{
                    nexti=i+1;
                }
                if (doIntersect(ourcorners[i],ourcorners[nexti],othercorners[j][k],othercorners[j][nextk])){
                    for (var p in ships) {
                        // check if the property/key is defined in the object itself, not in parent
                        if (ships.hasOwnProperty(p)) {           
                            if (ships[p].colour == othercorners[j][4]){
                                console.log('hit')
                                ships[p].health += -0.5;
                            }
                        }
                    }
                    bullets[z][c].x = -9999999999;
                    bullets[z][c].y = -9999999999;
                    bullets[z][c].angle = 0;                  
                }
            }
        }
    }      
}


function shipnewPos(z) {
    if (ships[z].health <= 0){
        ships[z].x = -99999999;
        ships[z].y = -99999999;
        return 'ded';
    }
    actions = ships[z].input;
    left = actions[0];
    right=actions[1];
    up=actions[2];
    down=actions[3];
    shoot=actions[4];
    slowdown = false;

    if (up){
        ships[z].mX += Math.sin(ships[z].totalangle)*0.01;
	    ships[z].mY += Math.cos(ships[z].totalangle)*0.01;
    }
    if (left){
        ships[z].totalangle -= ships[z].moveanglemult * Math.PI / 180;
    }else if(right){
        ships[z].totalangle += ships[z].moveanglemult * Math.PI / 180;
    }
    
    let slowdownspeed = 0.0006;
    if(ships[z].mX<0){
        ships[z].mX+= slowdownspeed;
        if (ships[z].mX > 0){
            ships[z].mX = 0;
        }
    }
    if(ships[z].mX>0){
        ships[z].mX+= -slowdownspeed;
        if (ships[z].mX < 0){
            ships[z].mX = 0;
        }
    }
    if(ships[z].mY<0){
        ships[z].mY+= slowdownspeed;
        if (ships[z].mY > 0){
            ships[z].mY = 0;
        }
    }
    if(ships[z].mY>0){
        ships[z].mY+= -slowdownspeed;
        if (ships[z].mY < 0){
            ships[z].mY = 0;
        }
    }
    

    // if(ships[z].totalspeed > ships[z].terminalvelocity){
    //     ships[z].totalspeed = ships[z].terminalvelocity;
    // }else{
    //     if(ships[z].totalspeed < -ships[z].terminalvelocity){
    //         ships[z].totalspeed= -ships[z].terminalvelocity;
    //     }
    // }




    ships[z].x += ships[z].speedmult * ships[z].mX;
    ships[z].y -= ships[z].speedmult * ships[z].mY;
    var ourcorners = shipcorners(z);
    var othercorners = shipothercorners(z);
    var i;
    var nexti;
    /* z for loop checks collision with other ships*/
    
    /* for each diagonal on our ship...   */
    for (i = 0; i < ourcorners.length; i++) {
        var j;
        /* for each other ship  */
        for (j=0;j<othercorners.length;j++){
            var k;
            /* for each side on their ship */
            for (k=0;k<othercorners[j].length-1;k++){
                if (k==3){
                    nextk = 0;
                }else{
                    nextk=k+1;
                }
                if (i==3){
                    nexti=0;
                }else{
                    nexti=i+1;
                }
                if (doIntersect(ourcorners[i],ourcorners[nexti],othercorners[j][k],othercorners[j][nextk])){
                    if (frictioncollision){
                        ships[z].angle -= ships[z].moveAngle * Math.PI / 180;
                        ships[z].x -= ships[z].speedmult * ships[z].speed * Math.sin(ships[z].angle);
                        ships[z].y += ships[z].speedmult * ships[z].speed * Math.cos(ships[z].angle);
                    }else{
                        timeoutmax = 2 * ships[z].totalspeed;
                        if (ships[z].totalspeed==0){
                        }else{
                            if (ships[z].totalspeed<0){
                                ships[z].totalspeed = -1;
                            }else{
                                ships[z].totalspeed=1;
                            }
                        }
                        colliding = true;
                        xmove = ships[z].totalspeed * Math.sin(ships[z].angle);
                        ymove = ships[z].speed * Math.cos(ships[z].angle);
                        timeout = 0;
                        while (colliding){
                            ourcorners = shipcorners(z);
                            othercorners =shipothercorners(z);
                            ships[z].x -= xmove;
                            ships[z].y += ymove;
                            colliding = doIntersect(ourcorners[i],ourcorners[nexti],othercorners[j][k],othercorners[j][nextk]);
                            timeout++;
                            if (timeout>100){
                                colliding = false;
                            }
                        }
                    }
                    
                }
            }
        }
    }      
    /*
    Collision with walls at edge of map
    */
    var i;
    // ships[z].y -= 100;
    for (i = 0; i < ourcorners.length; i++) {
        if (ourcorners[i].x > gamearea.canvas.width){
            ships[z].x = gamearea.canvas.width-(ourcorners[i].x-ships[z].x);
            ships[z].mX=0;
        
        }
        if (ourcorners[i].x < 0) {
            ships[z].x = ships[z].x-ourcorners[i].x;
            ships[z].mX=0;
        }
        if (ourcorners[i].y > gamearea.canvas.height){
            ships[z].y = gamearea.canvas.height-(ourcorners[i].y-ships[z].y);
            ships[z].mY=0;
        }
        if (ourcorners[i].y < 0) {
            ships[z].y = ships[z].y-ourcorners[i].y;
            ships[z].mY=0;
        }
    
    }
    
    
}

exports.updateGameArea = function() {
    for (var i in ships) {
        if (ships.hasOwnProperty(i)) {  
            updateshipsbullets(i,ships[i].maxbullets)
            shipnewPos(i);
        }
    }
}
// exports.updateone = function(i){
//     // check if the property/key is defined in the object itself, not in parent
    

// }
exports.makeship = function(x, y, colour,username,structure) {
    this.username = username;
    this.lastshoot = Date.now();
    this.input = [false,false,false,false,false];
    // [false,false,false,false,false]
    this.colour = colour;
    this.structure = structure;
    bullets[colour]=[];
    this.height=50;
    this.width=50;
    this.health=4;
    this.totalangle = 0;
    this.terminalvelocity = 5;
    this.x = x;
    this.y = y;
    this.mX = 0;
    this.mY = 0;
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