
// const { render } = require("nunjucks");
(function(){

    function init(){
        var canvas = document.getElementsByTagName('canvas')[0];
        var c = canvas.getContext('2d');

        var img = document.getElementById('background')
        var velocity = 1000; //400pixels/second
        var distance =0;
        var lastFrameRepaintTime =0;

        function calcOffset(time){
            var frameGapTime = time - lastFrameRepaintTime;
            lastFrameRepaintTime = time;
            var translateX = velocity*(frameGapTime/1000);
            return translateX;
        }
        function draw(time){
            clientshipx=ships[clientname].x;
            clientshipy=ships[clientname].y;
            distance =distance % img.width
            // if(distance > img.width){distance =distance % img.width ;}
            widthmodulo =Math.abs((clientshipx) % canvas.width);
            heightmodulo = Math.abs((clientshipy) % canvas.height);
            c.clearRect(0,0,canvas.width,canvas.height);
            c.save();
            c.translate(widthmodulo,0);
            c.drawImage(img,0,0);
            c.drawImage(img,-img.width+1,0);

            requestAnimationFrame(draw);


            c.restore();
        }
        function start(){
            lastFrameRepaintTime = window.performance.now();
            requestAnimationFrame(draw);
        }

        start();


    }

//invoke function init once document is fully loaded
    // window.addEventListener('load',init,false);

}()); //self invoking function

port = ipadress + ":1569";
const socket = io(port)
touchcontrols = false;
touching = false;
ships = {};
structures = {};
// bullets = {};
scale = 70;
range = 3
    var array = ["none","bullet","wall","fuel"];
    var table = document.getElementById('buildtable');   

    // get the reference for the body
    var body = document.getElementById('settings');

    // creates a <table> element and a <tbody> element
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");

    // creating all cells
    for (var i = -range; i < range+1; i++) {
        // creates a table row
        var row = document.createElement("tr");

        for (var j = -range; j < range+1; j++) {
        // Create a <td> element and a text node, make the text
        // node the contents of the <td>, and put the <td> at
        // the end of the table row
            var cell = document.createElement("td");
            var selectList = document.createElement("select");
            selectList.setAttribute("class", "x"+j + " y"+-i);
            // selectList.setAttribute("id", "mySelect");
            for (var k = 0; k < array.length; k++) {
                var option = document.createElement("option");
                option.setAttribute("value", array[k]);
                option.text = array[k];
                selectList.appendChild(option);
            }

            cell.appendChild(selectList);
            row.appendChild(cell);
        }

        // add the row to the end of the table body
        tblBody.appendChild(row);
    }

    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
    // appends <table> into <body>
    body.appendChild(tbl);
    // sets the border attribute of tbl to 2;
    tbl.setAttribute("border", "2");
    tbl.setAttribute("id", "buildtable");
    


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
socket.on('states', (shipsstate,newstructures) => {
    ships = shipsstate;
    structures = newstructures;
})
socket.on('planets', (newplanets) => {
    planets = newplanets;
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
    scaledraw(bullet.x,bullet.y,bullet.width,bullet.height,bulletimg)
 
    
}


function planetdraw(planet){
    var context = gamearea.context;
    var x = (planet.x-clientshipx)*(scale/100)+centerx;
    var y = (planet.y-clientshipy)*(scale/100)+centery;
    var radius = planet.r * scale/100;
    // context.rotate(ships[clientname].totalangle);
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
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
function rotate(cx, cy, x, y, angle) {
    var radians = angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function shipdraw(key){
    st = structures[key];
    ship = ships[key];
    for (var x in st) {
        if (st.hasOwnProperty(x)) {  
            for (var y in st[x]) {
                if (st[x].hasOwnProperty(y)) {  
                    if (typeof st[0][0] !== 'undefined' && st[x][y]!='none'){
                        ans = rotate(ship.x,ship.y,ship.x + x * ship.width,ship.y - y * ship.height,-ship.totalangle)
                        partx = ans[0];
                        party = ans[1];
                        shipimage = document.getElementById(structures[ship.colour][x][y]);
                        scaledraw(partx,party,ship.width,ship.height,ship.totalangle,shipimage);
                    }
                }
            }   
        }
    }
}

function scaledraw(x,y,width,height,angle,img){
    var ctx = gamearea.context;
    img.width=width;
    img.height=height;
    ctx.setTransform(1, 0, 0, 1, (x-clientshipx)*(scale/100)+centerx, (y-clientshipy)*(scale/100)+centery); // sets scale && origin
    ctx.rotate(angle);
    ctx.drawImage(img, width*(scale/100) / -2, height*(scale/100) / -2, width*(scale/100), height*(scale/100));
}

function wiper() {
    var ctx = gamearea.context;
    height = 0;
    width = 0;
    var shipimg = document.getElementById('client');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // sets scale && origin
    ctx.drawImage(shipimg, width / -2, height / -2, width, height);
}

function oldbackground() {
    var ctx = gamearea.context;
    height = (10000);
    width = (10000);
    var shipimg = document.getElementById('background');
    let w = Math.ceil(width/(shipimg.width*(scale/100)));
    let h = Math.ceil(height/(shipimg.height*(scale/100)));
    for (i=-w;i<w;i++){
        for (j=-h;j<h;j++){
            ctx.setTransform(1, 0, 0, 1, (scale/100)*(i*shipimg.width-clientshipx), (scale/100)*(j*shipimg.height-clientshipy)); // sets scale && origin
            ctx.drawImage(shipimg,0, 0, shipimg.width*(scale/100),shipimg.height*(scale/100));
        }
    }
}
function background() {
    var ctx = gamearea.context;
    var shipimg = document.getElementById('background');
    static = true;
    if (static){
        height = centerx*5;
        width = centerx*5;
        // height = 10000;
        // width = 10000;
        widthmodulo = 0;
        heightmodulo = 0;
        for (i=0;i<Math.ceil(width/(shipimg.width*(scale/100)))+1;i++){
            for (j=0;j<Math.ceil(height/(shipimg.height*(scale/100))+1);j++){
                ctx.setTransform(1, 0, 0, 1, (scale/100)*shipimg.width, (scale/100)*shipimg.height); // sets scale && origin
                ctx.drawImage(shipimg,0, 0, shipimg.width*(scale/100),shipimg.height*(scale/100));
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
function momentumarrow(){
    arrowangle =  Math.atan2(-ships[clientname].mY, ships[clientname].mX);
    arrowangle = arrowangle + 1.5708;
    // console.log(arrowangle);
    arrowx = centerx;
    arrowy = centery;
    var ctx = gamearea.context;
    img = document.getElementById('uparrow')
    // console.log(arrowx)
    arrowx += 100 * Math.sin(arrowangle);
    arrowy -= 100 * Math.cos(arrowangle);
    // console.log(arrowx)
    ctx.setTransform(1, 0, 0, 1, arrowx, arrowy); // sets scale && origin
    ctx.rotate(arrowangle);
    width = 80;
    height = 100;
    ctx.drawImage(img, width / -2,height / -2, width,height);

}
function rendergamearea(){
    clientshipx=ships[clientname].x;
    clientshipy=ships[clientname].y;
    // gamearea.clear();
    var ctx = gamearea.context;
    canvas = gamearea.canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // background();
    // oldbackground();
    for (var key in ships) {
        // check if the property/key is defined in the object itself, not in parent
        if (ships.hasOwnProperty(key)) {    
            if(key != clientname){
                shipdraw(key);
                drawhealthname(key);
            }
            // rendershipsbullets(key);
            
            
        }
        
    }
    shipdraw(clientname);
    drawhealthname(clientname);
    // wiper();
    for (i=0;i<planets.length;i++){
        planetdraw(planets[i]);
    }

    momentumarrow();
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
    username = document.getElementById('usernamebox').value;
    if (!username){
        username = 'unnamed';
    }
    username = truncate(username,40)

    structure = {};
    for (i=-range;i<range+1;i++){
        structure[i] = {};
        for (j=-range;j<range+1;j++){
            structure[i][j]=document.getElementsByClassName("x"+i+" y"+j)[0].value;
            console.log(structure[i][j]);
        }
    }
    // structure
    socket.emit('new-user',username,structure);
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
        document.getElementById('settings').hidden = true;
        this.canvas.hidden = false;
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

