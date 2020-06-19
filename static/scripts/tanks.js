touchcontrols = false;
touching = false;
var events;
function drawtouchcontrols(){
    var ctx = gamearea.context;
    var img = document.getElementById('uparrow');
    img.width=gh;
    img.height=gh;
    // up
    ctx.setTransform(1, 0, 0, 1, 0, gh*2.8);
    ctx.drawImage(img, gh, gh, gw, 2*gh);

    // right
    ctx.setTransform(1, 0, 0, 1, gw*5.3+2*gh, gh*3.5);
    ctx.rotate(90 * Math.PI / 180);
    ctx.drawImage(img, gh, gh, gw, 2*gh);

    // shoot button
    var img = document.getElementById('shootimg');
    img.width=gh;
    img.height=gh;
    ctx.setTransform(1, 0, 0, 1, gw*5-gh, gh/2); // sets scale && origin
    ctx.drawImage(img, gh, gh, gh,gh);


}
const modelFitConfig = {              // Exactly the same idea here by using tfjs's model's
    epochs: 1,                    // fit config.
    stepsPerEpoch: 1
};

const numActions = 9;                 // The number of actions your agent can choose to do
const inputSize = 2;                // Inputs size (10x10 image for instance)
const temporalWindow = 1;             // The window of data which will be sent yo your agent
                                      // For instance the x previous inputs, and what actions the agent took

const totalInputSize = inputSize * temporalWindow + numActions * temporalWindow + inputSize;

const network = new ReImprove.NeuralNetwork();
network.InputShape = [totalInputSize];
network.addNeuralNetworkLayers([
    {type: 'dense', units: 32, activation: 'relu'},
    {type: 'dense', units: numActions, activation: 'softmax'}
]);
// Now we initialize our model, and start adding layers
const model = new ReImprove.Model.FromNetwork(network, modelFitConfig);

// Finally compile the model, we also exactly use tfjs's optimizers and loss functions
// (So feel free to choose one among tfjs's)
model.compile({loss: 'meanSquaredError', optimizer: 'adam'})
// Every single field here is optionnal, and has a default value. Be careful, it may not
// fit your needs ...

const teacherConfig = {
    lessonsQuantity: 10000,                   // Number of training lessons before only testing agent
    lessonsLength: 1600,                    // The length of each lesson (in quantity of updates)
    lessonsWithRandom: 100,                  // How many random lessons before updating epsilon's value
    epsilon: 1,                            // Q-Learning values and so on ...
    epsilonDecay: 0.995,                   // (Random factor epsilon, decaying over time)
    epsilonMin: 0.05,
    gamma: 1                        // (Gamma = 1 : agent cares really much about future rewards)
};

const agentConfig = {
    model: model,                          // Our model corresponding to the agent
    agentConfig: {
        memorySize: 20000,                      // The size of the agent's memory (Q-Learning)
        batchSize: 128,                        // How many tensors will be given to the network when fit
        temporalWindow: temporalWindow         // The temporal window giving previous inputs & actions
    }
};

const academy = new ReImprove.Academy();    // First we need an academy to host everything
const teacher = academy.addTeacher(teacherConfig);
const agent = academy.addAgent(agentConfig);

academy.assignTeacherToAgent(agent, teacher);
    holdfire = false;
    lastpresstimes = {};
    heldlast = {};
    function heldlastmanage(button,newbool){
        if (!heldlast[button]){
            heldlast[button]=false;
        }
        heldlast[button] = newbool;
}

function lastpresstime(button, firerate){
    if (!lastpresstimes[button]){
        lastpresstimes[button] = Date.now();
        heldlast[button]=false;
        return true;
    }
    if (Date.now() - lastpresstimes[button]>=firerate && (heldlast[button]==false || holdfire )){
        lastpresstimes[button] = Date.now();
        return true;
    }
    return false;
}
aimode = false;
nosound = false;
timeoutamax=1600;

scores = {};
scores['red'] = 0;
scores['blue'] = 0;
sounds = {};
sounds['explosionsfx'] = [1,50];
sounds['hitmarker'] = [1,200];
sounds['shoot']=[1,200];

function playsound(id){
    if (nosound){
        return 0
    }
    combine = id + sounds[id][0];
    elbyid(id + sounds[id][0]).play();
    sounds[id][0]++;
    if (sounds[id][0] == sounds[id][1]){
        sounds[id][0] = 1;
    }
}
function elbyid(elementid){
    return document.getElementById(elementid)
}

function Point(x,y){ 
    this.x = x;
    this.y = y;
}
function formula(P,Q){
    
    x = Q.y - P.y;
    y = P.x - Q.x; 
    b = x*(P.x) + y*(P.y);
    y = -y;
    b = -b;
    x = x/y;
    b = b/y;
    return [x,b];
    
    
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
function startGame() {
    timeouta = 0;
    backgroundcolour = '#ffffff';
    bullets = {};
    gamearea.stop();
    gamearea.canvasstart();
    gh = gamearea.canvas.height / 6;
    gw = gamearea.canvas.width / 6;
    wiper = new makeship(0,0, "wiper",0);
    redship = new makeship(gw, gh, "red",Math.PI/2);
    blueship= new makeship(5 *gw , 5 *gh, "blue",Math.PI*1.5);
    ships = [redship, blueship, wiper];
    frictioncollision = false;
    symmetrybool = false;
    gamearea.start();
    
}
function keyup(e){
    gamearea.keys[e.keyCode] = (e.type == "keydown");
}
function keydown(e){
    e.preventDefault();
    gamearea.keys = (gamearea.keys || []);
    gamearea.keys[e.keyCode] = (e.type == "keydown");
}
function touchHandler(e) {
    events = e
    touchcontrols = true
    touching = true
    e.preventDefault();
}
function touchstop(e) {
    events = e
    e.preventDefault();
    touching=false
}
var gamearea = {
    canvas : document.getElementById("gamearea"),
    canvasstart : function() {
        this.canvas.style.width ='100%';
        this.canvas.style.height='100%';
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    },
    start : function() {

        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 1);
    },
    listeneron : function(){
        window.addEventListener('keydown', keydown)
        window.addEventListener('keyup', keyup)
        el = gamearea.canvas;
        el.addEventListener("touchstart", touchHandler);
        el.addEventListener("touchmove", touchHandler);
        el.addEventListener('touchcancel', touchstop);
        el.addEventListener('touchend', touchstop);
    },
    listeneroff : function(){
        window.removeEventListener('keydown', keydown)
        window.removeEventListener('keyup',keyup )
        el = gamearea.canvas;
        el.removeEventListener("touchstart", touchHandler);
        el.removeEventListener("touchmove", touchHandler);
        el.rempveEventListener('touchcancel', touchstop);
        el.removeEventListener('touchend', touchstop);
    },
    stop : function() {
        clearInterval(this.interval);
    },    
    clear : function() {
        ctx = this.context;
        ctx.fillStyle = backgroundcolour;
        ctx.fillRect(0,0, this.canvas.width*5, this.canvas.height*5);

    }
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
    this.update = function() {
        var ctx = gamearea.context;
        var bulletimg = document.getElementById(this.colour + 'bullet');
        bulletimg.width=this.width;
        bulletimg.height=this.height;
        ctx.setTransform(1, 0, 0, 1, this.x, this.y); // sets scale && origin
        ctx.rotate(this.angle);
        ctx.drawImage(bulletimg, this.width / -2, this.height / -2, this.width, this.height);
        }
        
    this.corners = function() {
        return findcorners(this.x,this.y,this.angle,this.width,this.height);
    }
        
    this.newPos = function(othercorners) {
        this.x +=  this.speed * Math.sin(this.angle);
        this.y -=  this.speed * Math.cos(this.angle);
        var ourcorners = this.corners();
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
                        for (p=0;p<ships.length-1;p++){
                            if (ships[p].colour == othercorners[j][4]){
                                ships[p].damage();
                                if (ships[p].colour == 'red'){
                                    agentlose = true;
                                }else{
                                    agentwin=true;
                                }
                            }
                        }
                        this.x = -9999999999;
                        this.y = -9999999999;
                        this.angle = 0;
                        playsound('hitmarker');                    
                    }
                }
            }
        }      
    }
}
function getState(){
    angledif = Math.atan2(blueship.y - redship.y, blueship.x - redship.x) * 180 / Math.PI;
    distance = Math.round((Math.hypot(blueship.x-redship.x,blueship.y-redship.y)/10))/gamearea.canvas.width*10;
    angledif = Math.round((blueship.angle*180/Math.PI - angledif))/360;
    s = [angledif,distance];
    return s;
}
function makeship(x, y, colour, angle) {
    this.colour = colour;
    if (this.colour != 'wiper'){
        this.health= elbyid(colour+'health').value;
        this.width = elbyid(colour+'width').value * gh/100;
        this.height = elbyid(colour+'height').value * gh/100;
        this.speedmult = elbyid(colour + 'speedmult').value/100;
        this.bulletspeed = elbyid(colour + 'bulletspeed').value/100;
        this.moveanglemult = elbyid(colour + 'moveanglemult').value/100;
        this.maxbullets = elbyid(colour + 'maxbullets').value;
        this.firerate = elbyid(colour + 'firerate').value;
        this.bulletheight=elbyid(colour + 'bulletheight').value*gh/100;
        this.bulletwidth=elbyid(colour + 'bulletwidth').value*gh/100;
    }else{
        this.health=Infinity;
        this.width=0;
        this.height=0;
    }
    bullets[colour]=[];
    this.speed = 0;
    this.angle = angle;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;
    this.damage = function(){
        this.health = this.health -0.5;
    }
    this.shoot = function() {
        append = new bullet(this.bulletwidth,this.bulletheight,this.x,this.y,this.angle,this.bulletspeed,this.colour);
        bullets[this.colour].push(append);
        playsound('shoot');
    }
    this.corners = function() {
        return findcorners(this.x,this.y,this.angle,this.width,this.height);
    }
    this.update = function() {
        var ctx = gamearea.context;
        if (this.colour == "wiper"){
            var shipimg = document.getElementById('red');
            shipimg.width=this.width;
            shipimg.height=this.height;
            this.height=0;
            this.width=0;
        }else{
            var shipimg = document.getElementById(this.colour);
            shipimg.width=this.width;
            shipimg.height=this.height;
        }
        if (!this.health <= 0){
            ctx.setTransform(1, 0, 0, 1, this.x, this.y); // sets scale && origin
            ctx.rotate(this.angle);
            ctx.drawImage(shipimg, this.width / -2, this.height / -2, this.width, this.height);
        }
    } 
    this.othercorners = function(){
        /*  List structure for othercorners
            othercorners
                *the other ship besides this one*
                    Corner 1 [These 4 as Point() objects]
                    Corner 2
                    Corner 3
                    Corner 4 
                    colour of ship
                *this layer would have the other ships if i added any*
        */
        shipslength = ships.length;
        var i;
        var othercorners = [];
        for (i = 0; i < shipslength; i++) {
            if (this.colour != ships[i].colour && ships[i].colour != "wiper" && ships[i].health >0){
                append = ships[i].corners();
                append.push(ships[i].colour)
                othercorners.push(append);
            }
        }
        return othercorners;
    }
    this.updatebullets = function() {
        for (i=0;i<bullets[this.colour].length;i++){
            bullets[this.colour][i].newPos(this.othercorners());
            bullets[this.colour][i].update();
        }
        bullets[this.colour].splice(0, bullets[this.colour].length-this.maxbullets);

    }
    this.newPos = function() {
        if (this.health <= 0){
            this.x = -99999999;
            this.y = -99999999;
            return 'ded'
        }
        this.angle += this.moveAngle * this.moveanglemult * Math.PI / 180;
        this.x += this.speedmult * this.speed * Math.sin(this.angle);
        this.y -= this.speedmult * this.speed * Math.cos(this.angle);
        var ourcorners = this.corners();
        var othercorners = this.othercorners();
        var i;
        var nexti;
        /* This for loop checks collision with other ships*/
        
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
                            this.angle -= this.moveAngle * Math.PI / 180;
                            this.x -= this.speedmult * this.speed * Math.sin(this.angle);
                            this.y += this.speedmult * this.speed * Math.cos(this.angle);
                        }else{
                            timeoutmax = 2 * this.speed;
                            if (this.speed==0){
                            }else{
                                if (this.speed<0){
                                    this.speed = -1;
                                }else{
                                    this.speed=1;
                                }
                            }
                            colliding = true;
                            xmove = this.speed * Math.sin(this.angle);
                            ymove = this.speed * Math.cos(this.angle);
                            timeout = 0;
                            while (colliding){
                                ourcorners = this.corners();
                                othercorners = this.othercorners();
                                this.x -= xmove;
                                this.y += ymove;
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
        for (i = 0; i < ourcorners.length; i++) {
            if (ourcorners[i].x > gamearea.canvas.width){
                this.x = gamearea.canvas.width-(ourcorners[i].x-this.x);
            }
            if (ourcorners[i].x < 0) {
                this.x = this.x-ourcorners[i].x;
            }
            if (ourcorners[i].y > gamearea.canvas.height){
                this.y = gamearea.canvas.height-(ourcorners[i].y-this.y);
            }
            if (ourcorners[i].y < 0) {
                this.y = this.y-ourcorners[i].y;
            }
        }
        
        
    }
}
async function updateGameArea() {
    /* main loop */
    gamearea.clear();
    
    redship.moveAngle = 0;
    redship.speed = 0;
    blueship.moveAngle=0;
    blueship.speed=0;
    if (!aimode){
        if (gamearea.keys && gamearea.keys[37]) {blueship.moveAngle = -1; }
        if (gamearea.keys && gamearea.keys[39]) {blueship.moveAngle = 1; }
        if (gamearea.keys && gamearea.keys[38]) {blueship.speed= 1;}
        if (gamearea.keys && gamearea.keys[40]) {blueship.speed= -1; }
        if (gamearea.keys && gamearea.keys[16]){
            if (lastpresstime(16,blueship.firerate)){
                blueship.shoot();
            }
            heldlastmanage(16,true);
        }else{heldlastmanage(16,false);}
    }else{
        s = getState();
        agentwin = false;
        agentlose = false;
        var result = await academy.step([{teacherName: teacher, agentsInput: s}]);
        var action = result.get(agent)
        console.log(action)
        switch(down=up=right=left=!1,action){case 1:left=!0;break;case 2:right=!0;break;case 3:up=left=!0;break;case 4:down=left=!0;break;case 5:up=right=!0;break;case 6:down=right=!0;break;case 7:up=!0;break;case 8:down=!0;break;case 9:break;}
        if (left){
            blueship.moveAngle = -1;
        }
        if (right){
            blueship.moveangle = 1;
        }
        if (down){
            blueship.speed = -1;
        }
        if (up){
            blueship.speed = 1;
        }
        if (lastpresstime(16,blueship.firerate)){
            blueship.shoot();
        }
    }
    
    if(touchcontrols) {
        redshoot=false;
        for (i=0;i<events.touches.length;i++){
            if (events.touches[i].clientX<3*gw && events.touches[i].clientY>4.8*gh){
                redship.speed = -1;
            }else{
                if (events.touches[i].clientX<3*gw && events.touches[i].clientY<4.8*gh){
                    redship.speed = 1;
                }

                
            }
            if (events.touches[i].clientX>3*gw && events.touches[i].clientY>3*gh && events.touches[i].clientX>5.3*gw){
                redship.moveAngle=1;
            }else{
                if (events.touches[i].clientX>3*gw && events.touches[i].clientY>3*gh && events.touches[i].clientX<5.3*gw){
                    redship.moveAngle = -1;
                }
            }
            if (events.touches[i].clientX>3*gw && events.touches[i].clientY<3*gh){
                redshoot = true;
            }
        }
        if (redshoot){
            if (lastpresstime(32,redship.firerate)){
                redship.shoot();
            }
            heldlastmanage(32,true);
        }else{heldlastmanage(32,false)}
        
    }else{

    if (gamearea.keys && gamearea.keys[65]) {redship.moveAngle = -1; }
    if (gamearea.keys && gamearea.keys[68]) {redship.moveAngle = 1; }
    if (gamearea.keys && gamearea.keys[87]) {redship.speed= 1;}
    if (gamearea.keys && gamearea.keys[83]) {redship.speed= -1; }
    if (gamearea.keys && gamearea.keys[32]){
        if (lastpresstime(32,redship.firerate)){
            redship.shoot();
        }
        heldlastmanage(32,true);
    }else{heldlastmanage(32,false)}
    }
    /*console.log(gamearea.keys);*/
    temp = ships.length-1;
    var i;
    for (i = 0; i < temp; i++) {
        ships[i].updatebullets();
        ships[i].newPos();
        ships[i].update();
    }
    
    
    if (aimode){
        /*
        if (agentwin){
            academy.addRewardToAgent(agent, 1.0)  
        }      
        if (agentlose){
            academy.addRewardToAgent(agent, -1.0)  
        }
        */
        timeouta= timeouta + 1;
        if (timeouta >= timeoutamax){                
            scores['red'] = scores['red'] + 1
            startGame();
        }else{
            if (redship.health <=0){
                scores['blue'] = scores['blue'] + 1;
                playsound('explosionsfx');
                startGame()
            }else{
                if (blueship.health <= 0){
                    scores['red'] = scores['red'] + 1;
                    playsound('explosionsfx');
                    startGame()
                }else{
                    distancedifference = Math.round(Math.hypot(blueship.x-redship.x,blueship.y-redship.y)*10 - distance*gamearea.canvas.width*10)/10/gamearea.canvas.width;
                    console.log(distancedifference)
                    academy.addRewardToAgent(agent, distancedifference);

                }
            }
        }
    }else{
        if (blueship.health <=0){
            scores['red']= scores['red'] + 1;
            playsound('explosionsfx');
            startGame()
        }
        if (redship.health <=0){
            scores['blue']=scores['blue'] + 1
            playsound('explosionsfx');
            startGame()
        }
    }
    if (touchcontrols){
        drawtouchcontrols();
    }
    
    ships[temp].update();
    drawhealth();
    
}
function drawhealth(){
    canvas = gamearea.canvas;
    context = gamearea.context;

    context.fillStyle = "blue";
    context.font = "bold 6vh Arial";
    context.fillText(blueship.health+'hp',blueship.x,blueship.y-gh);
    context.fillText(scores['blue'],gw * 4,gh * 5);
    context.fillStyle = "red";
    context.font = "bold 6vh Arial";
    context.fillText(redship.health+'hp',redship.x,redship.y-gh);
    context.fillText(scores['red'],gw * 2,gh * 5);
    
}

function allships(quality,newvalue){
    elbyid('red'+quality).value = newvalue;
    elbyid('blue'+quality).value = newvalue;
}
function symmetry(){
    symmetrybool = !symmetrybool;
    if (symmetrybool){
        elbyid('allships').hidden = true;
        elbyid('redship').hidden=false;
        elbyid('blueship').hidden=false;
    }else{
        elbyid('allships').hidden=false;
        elbyid('redship').hidden=true;
        elbyid('blueship').hidden=true;
    }
}
function fullscreen(){
    var el = document.getElementById('gamearea');
    if(el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    }
    else {
        el.mozRequestFullScreen();
    }            
}

function uploader(inputid,imgid){
    /* dont worry, i barely even know how handlefileselect works */
    function handleFileSelect(e){for(var t,r=e.target.files,a=0;t=r[a];a++){var l=new FileReader;l.onload=function(e){document.getElementById(imgid).src=e.target.result},l.readAsDataURL(t)}}
    document.getElementById(inputid).addEventListener('change', handleFileSelect, false);
}

uploader('redshipinput','red');
uploader('redbulletinput','redbullet');
uploader('blueshipinput','blue');
uploader('bluebulletinput','bluebullet');