
// const { render } = require("nunjucks");

port = ipadress + ":1569";
const socket = io(port)
touchcontrols = false;
touching = false;
ships = {};

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
    if (gamearea.keys && gamearea.keys[80]){
        if (lastpresstime(80)){
            staticbackground=!staticbackground;
        }
        heldlastmanage(80,true);
    }else{heldlastmanage(80,false);}
    // console.log(gamearea.keys)
    inputs = [left,right,up,down,shoot];
    socket.emit('staterequest',inputs);
}

heldlast = {};
function heldlastmanage(button,newbool){
    if (!heldlast[button]){
        heldlast[button]=false;
    }
    heldlast[button] = newbool;
}
function lastpresstime(button){
    if (heldlast[button]==false){
        return true;
    }
    return false;
}
socket.on('states', (shipsstate) => {
    ships = shipsstate;
    try {
        if(ships[clientname].username=='spectator'){
            clientname='AI'
        }
    } catch (error) {
        
    }
    
})
socket.on('planets', (newplanets) => {
    planets = newplanets;
    // console.log('gotem')
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
    var x = (planet.x-clientshipx)/(scale/100)+centerx;
    var y = (planet.y-clientshipy)/(scale/100)+centery;
    var radius = planet.r / (scale/100);
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
        scale *= 1.5;
    }else{
        scale /= 1.5;
    }
    if (scale<=0){
        scale=10;
    }else{
        if (scale>1000000000){
            scale=1000000000;
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
    st = ships[key].structure;
    ship = ships[key];
    height = 80
    width = 80
    for (var x in st) {
        if (st.hasOwnProperty(x)) {  
            for (var y in st[x]) {
                if (st[x].hasOwnProperty(y)) {  
                    if (typeof st[0][0] !== 'undefined' && st[x][y]!='none'){
                        ans = rotate(ship.x,ship.y,ship.x + x * width,ship.y - y * height,-ship.angle)
                        partx = ans[0];
                        party = ans[1];
                        shipimage = document.getElementById(st[x][y]);
                        scaledraw(partx,party,width,height,ship.angle,shipimage);
                        // scaledraw(partx,party,ship.width,ship.height,ship.angle,shipimage);
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
    ctx.setTransform(1, 0, 0, 1, (x-clientshipx)/(scale/100)+centerx, (y-clientshipy)/(scale/100)+centery); // sets scale && origin
    ctx.rotate(angle);
    ctx.drawImage(img, width/(scale/100) / -2, height/(scale/100) / -2, width/(scale/100), height/(scale/100));
}

function wiper() {
    
    var ctx = gamearea.context;
    height = 0;
    width = 0;
    var shipimg = document.getElementById('client');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // sets scale && origin
    ctx.drawImage(shipimg, width / -2, height / -2, width, height);
    
}

function clearrect(){
    var ctx = gamearea.context;
    canvas = gamearea.canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

staticbackground=false;
function background() {
    var ctx = gamearea.context;
    var shipimg = document.getElementById('background');
    canvasWidth = gamearea.canvas.width;
    canvasHeight = gamearea.canvas.height;
    scrollImg = shipimg;
    imgHeight = shipimg.height
    imgWidth = shipimg.width

    // Horizontal scrolling
    if (clientshipx > 0){
        sidescroll= canvasWidth - (Math.abs(clientshipx/(scale/100)) % canvasWidth); 
    }else{
        sidescroll= (Math.abs(clientshipx/(scale/100)) % canvasWidth); 
    }


    // Vertical scrolling
    if (clientshipy > 0){
        vertscroll= canvasHeight - (Math.abs(clientshipy/(scale/100)) % canvasHeight); 
    }else{
        vertscroll= (Math.abs(clientshipy/(scale/100)) % canvasHeight); 
    }
            
    if(staticbackground){
        vertscroll=0;
        sidescroll=0;
    }
    
    // Top left
    ctx.drawImage(scrollImg,sidescroll - canvasWidth,vertscroll - canvasWidth,canvasWidth, canvasWidth);
    // Top right
    ctx.drawImage(scrollImg,sidescroll , vertscroll - canvasWidth,canvasWidth, canvasWidth);
    // Bottom left
    ctx.drawImage(scrollImg,sidescroll - canvasWidth,vertscroll ,canvasWidth, canvasWidth);
    // Bottom right
    ctx.drawImage(scrollImg,sidescroll,vertscroll,canvasWidth, canvasWidth);

    
    // ctx.drawImage(scrollImg,canvasWidth - sidescroll,canvasHeight-vertscroll,imgWidth, imgHeight);
    
}
function momentumarrow(){
    arrowangle =  Math.atan2(ships[clientname].mY, ships[clientname].mX);
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
function directionarrow(){
    movex= Math.sin(ships[clientname].angle)*0.01;
    movey = Math.cos(ships[clientname].angle)*0.01;
    arrowangle =  Math.atan2(-movey, movex)+ 1.5708;
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
    wiper();
    clearrect();
    clientshipx=ships[clientname].x;
    clientshipy=ships[clientname].y;
    gamearea.clear();
    background();
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
    wiper();
    for (i=0;i<planets.length;i++){
        planetdraw(planets[i]);
    }
    
    momentumarrow();
    directionarrow();
    
    
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
            if(document.getElementsByClassName("x"+i+" y"+j)[0].value!='none'){
                structure[i][j]=document.getElementsByClassName("x"+i+" y"+j)[0].value;
                console.log(structure[i][j]);
            }
            
        }
        if(Object.getOwnPropertyNames(structure[i]).length == 0){
            delete structure[i]
        }
    }
    // structure
    socket.emit('new-user',[username,structure]);
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
        ctx.fillRect(0,0, this.canvas.width*5, this.canvas.height*5);

    }
}



function drawhealthname(z){
    ctx = gamearea.context;
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.rotate(-ships[z].angle);
    // ctx.fillText(ships[z].username+': '+ships[z].health+'hp',ships[z].x*(scale/100),ships[z].y*(scale/100)-100);
    if(ships[clientname].health<=0){
        ctx.fillStyle = "black";
        ctx.fillText('You died',0,-50/(scale/100));
    }else{
        ctx.fillText(ships[z].username,0,-50/(scale/100));
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
