// const { render } = require("nunjucks");

port = ipadress + ":1569";
const socket = io(port)
touchcontrols = false;
touching = false;
ships = {};
bullets = {};
scale = 70;


var events;

function getstates(){
    left=false;
    right=false;
    up=false;
    down=false;
    shoot=false;
    if (gamearea.keys && gamearea.keys[65]) {left = true; }
    if (gamearea.keys && gamearea.keys[68]) {right = true;}
    if (gamearea.keys && gamearea.keys[87]) {up = true;}
    if (gamearea.keys && gamearea.keys[83]) {down = true; }
    if (gamearea.keys && gamearea.keys[32]){shoot=true;}
    inputs = [left,right,up,down,shoot];
    socket.emit('staterequest',inputs);
}
socket.on('states', (shipsstate,bulletsstate) => {
    ships = shipsstate;
    bullets = bulletsstate;
})
  
socket.on('identifier', (socketid) => {
  clientname = socketid;
})
function rendershipsbullets(colour) {
    for (i=0;i<bullets[colour].length;i++){
        renderonebullet(bullets[colour][i]);
    }
}
function renderonebullet(bullet){
    var bulletimg = document.getElementById('bullet');
    scaledraw(bullet,bulletimg)
 
    
}
function scrollhandle(delta){
    if(delta>0){
        scale += 15;
    }else{
        scale -= 15;
    }
    if (scale<=0){
        scale=10;
    }else{
        if (scale>500){
            scale=500;
        }
    }
}

function scaledraw(item,img){
    var ctx = gamearea.context;
    img.width=item.width;
    img.height=item.height;
    
    ctx.setTransform(1, 0, 0, 1, (item.x-clientshipx)*(scale/100)+centerx, (item.y-clientshipy)*(scale/100)+centery); // sets scale && origin
    ctx.rotate(item.totalangle);
    ctx.drawImage(img, item.width*(scale/100) / -2, item.height*(scale/100) / -2, item.width*(scale/100), item.height*(scale/100));
}
function rendership(ship) {
    if (ship.colour == clientname){
        var shipimg = document.getElementById('client');
        //window.scrollTo(ship.x-ship.width*7,ship.y-ship.height*7);
    }else{
        var shipimg = document.getElementById('ships');
    }
    scaledraw(ship,shipimg);
}
function wiper() {
    var ctx = gamearea.context;
    height = 0;
    width = 0;
    var shipimg = document.getElementById('client');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // sets scale && origin
    ctx.drawImage(shipimg, width / -2, height / -2, width, height);
}
function background() {
    var ctx = gamearea.context;
    var shipimg = document.getElementById('background');
    static = false;
    if (static){
        height = centery*20;
        width = centerx*20;
        // height = 10000;
        // width = 10000;
        widthmodulo = 0;
        heightmodulo = 0;
        for (i=0;i<Math.ceil(width/(shipimg.width*(scale/100)))+1;i++){
            for (j=0;j<Math.ceil(height/(shipimg.height*(scale/100))+1);j++){
                ctx.setTransform(1, 0, 0, 1, (scale/100)*shipimg.width, (scale/100)*shipimg.height); // sets scale && origin
                ctx.drawImage(shipimg,0, 0, shipimg.width*(scale/100)/-1,shipimg.height*(scale/100)/-1);
            }
        }
    }else{
        height = centery*6;
        width = centerx*6;
        // height = 10000;
        // width = 10000;
        if (clientshipx<0){
            widthc = -1;
        }else{
            widthc = 1;
        }
        if (clientshipy<0){
            heightc = -1;
        }else{
            heightc=1;
        }
        widthmodulo =Math.abs((clientshipx) % width);
        heightmodulo = Math.abs((clientshipy) % height);
        for (i=-1;i<Math.abs(width/(shipimg.width*(scale/100)));i++){
            for (j=-1;j<Math.abs(height/(shipimg.height*(scale/100)));j++){
                ctx.setTransform(1, 0, 0, 1, (scale/100)*((i-1)*shipimg.width-widthmodulo*widthc), (scale/100)*((j-1)*shipimg.height-heightmodulo * heightc)); // sets scale && origin
                ctx.drawImage(shipimg,0, 0, shipimg.width*(scale/100)/-1,shipimg.height*(scale/100)/-1);
            }
        }
    }
}
function rendergamearea(){
    clientshipx=ships[clientname].x;
    clientshipy=ships[clientname].y;
    gamearea.clear();
    background();
    for (var key in ships) {
        // check if the property/key is defined in the object itself, not in parent
        if (ships.hasOwnProperty(key)) {    
                
            rendershipsbullets(key);
            rendership(ships[key]);
            drawhealthname(key);  
            
        }
        
    }
    
    wiper();
    
}

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

scores = {};

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
function truncate(str, n){
    return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  };
function startGame() {
    username = prompt('Username?');
    if (!username){
        username = 'unnamed';
    }
    username = truncate(username,40)
    socket.emit('new-user',username);
    backgroundcolour = '#ffffff';
    bullets = {};
    ships = {};
    gamearea.stop();
    gamearea.canvasstart();
    gh = gamearea.canvas.height / 6;
    gw = gamearea.canvas.width / 6;
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
function scrollfunction(e){
    scrollhandle(e.deltaY);   
}
var gamearea = {
    canvas : document.getElementById("gamearea"),
    canvasstart : function() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    start : function() {
        centerx = gamearea.canvas.width/2;
        centery = gamearea.canvas.height/2;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(rendergamearea, 1);
        this.stateinterval = setInterval(getstates, 10);
    },
    listeneron : function(){
        window.addEventListener('wheel', scrollfunction);
        window.addEventListener('keydown', keydown)
        window.addEventListener('keyup', keyup)
        el = gamearea.canvas;
        el.addEventListener("touchstart", touchHandler);
        el.addEventListener("touchmove", touchHandler);
        el.addEventListener('touchcancel', touchstop);
        el.addEventListener('touchend', touchstop);
    },
    listeneroff : function(){
        window.removeEventListener('wheel', scrollfunction);
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



function drawhealthname(z){
    ctx = gamearea.context;
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.rotate(-ships[z].totalangle);
    // ctx.fillText(ships[z].username+': '+ships[z].health+'hp',ships[z].x*(scale/100),ships[z].y*(scale/100)-100);
    if(ships[clientname].health<=0){
        ctx.fillStyle = "black";
        ctx.fillText('You died',0,-50*(scale/100));
    }else{
        ctx.fillText(ships[z].username+': '+ships[z].health+'hp',0,-50*(scale/100));
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

