var clicked = "move";
var grid = [];
var row = [];
var ready = true;
var dom = document.getElementById('html')
for (let i = 0; i < 52; i++){
    row = [];
    for (let i = 0; i < 52; i++){
        row.push(new element(0, 0, false, false, dom, false, false, 0));
    }
    grid.push(row);
}

var updateStack = [];

var nextUpdateStack = [];

var powerState = false;

var wireStack = [];

var checkedStack = [];

var bridgeStack = [];

var notStack = [];

var nextNotStack = [];

var dscX = 0;
var dscY = 0;
var gridX;
var gridY;

var wire;
var bridge;
var not;
var cover;
var id;
var switchh;

var types = ['empty', 'wire', 'bridge', 'switch', 'not'];

var dirAdd = [[1, 0],[0,1],[0,-1],[-1,0]];

var directions = [ "right", "bottom", "top", "left" ];

var direct = [ "right", "down", "up", "left" ];

function switchUpdate(gX,gY) {
    for(let i = 0; i < 4; i++){
        updateThis(i, gX + dirAdd[i][0], gY + dirAdd[i][1]);
    }
}

function updateThis(i, cX, cY){
    switch(grid[cX][cY].type){
        case 1:
            nextUpdateStack.push([-1,cX,cY]);
            break;
        case 2:
            nextUpdateStack.push([i,cX,cY]);
            break;
        case 4:
            if(grid[cX][cY].facing == i){
                nextNotStack.push([cX,cY]);
            }
    }
}

function traceTest (i, cX, cY){
    if(grid[cX][cY].type == 1){
        if(!grid[cX][cY].updated1){
            wireTrace(-1,cX,cY);
        }
    } else if (grid[cX][cY].type == 2){
        if(i == 0 || i == 3){
            if(!grid[cX][cY].updated1){
                grid[cX][cY].updated1 = true;
                wireTrace(i,cX,cY);
            }
        } else{
            if(!grid[cX][cY].updated2){
                grid[cX][cY].updated2 = true;
                wireTrace(i,cX,cY);
            }
        }
    } else if(grid[cX][cY].type == 4){
        if(grid[cX][cY].facing == i){
            notStack.push([cX,cY]);
        } else if(grid[cX][cY].facing + i == 3 && grid[cX][cY].on1){
            powerState = true;
        }
    } else if(grid[cX][cY].type == 3 && grid[cX][cY].on1){
        powerState = true;
    }
}

function wireDom(state){
    if (state) {
        return "wire on";
    } else {
        return "wire off";
    }
}

function bridgeDomBottom(state){
    if (state) {
        return "center lr bon";
    } else {
        return "center lr boff";
    }
}

function bridgeDomTop(state){
    if (state) {
        return "center tb bon";
    } else {
        return "center tb boff";
    }
}

function updatedTest(dir, gX, gY){
    if(dir == 1 || dir == 2){
        if(!grid[gX][gY].updated2){
            return true;
        } else {
            return false;
        }
    } else{
        if(!grid[gX][gY].updated1){
            return true;
        } else {
            return false;
        }
    }
}

function wireTrace (dir, gX, gY) {
    if(dir == -1){
        grid[gX][gY].updated1 = true;
        wireStack.push([-1,gX,gY]);
        for(let i = 0; i < 4; i++){
            traceTest(i, gX + dirAdd[i][0],  gY + dirAdd[i][1])
        }
    } else{
        wireStack.push([dir,gX,gY]);
        traceTest(dir, gX + dirAdd[dir][0],  gY + dirAdd[dir][1])
    }
    return true;
}

function callWireUpdate(dir,gX,gY){
    if(updatedTest(dir,gX,gY) && wireTrace(dir,gX,gY)){
        if(dir != -1){
            let cX = gX + dirAdd[Math.abs(dir-3)][0];
            let cY = gY + dirAdd[Math.abs(dir-3)][1];
            if(grid[cX][cY].type == 3){
                powerState = grid[cX][cY].on1 || powerState;
            } else if(grid[cX][cY].type == 4 && grid[cX][cY].facing == dir){
                powerState = grid[cX][cY].on1 || powerState;
            }
        }
        brideTopClass = bridgeDomTop(powerState);
        brideBottomClass = bridgeDomBottom(powerState);
        wireClass = wireDom(powerState);
        let len = wireStack.length;
        for(let i = 0; i < len; i++){
            if(wireStack[i][0] == -1){
                if(grid[wireStack[i][1]][wireStack[i][2]].on1 != powerState){
                    grid[wireStack[i][1]][wireStack[i][2]].on1 = powerState;
                    grid[wireStack[i][1]][wireStack[i][2]].dom.className = wireClass;
                }
            } else{
                if(wireStack[i][0] == 0 || wireStack[i][0] == 3){
                    if(grid[wireStack[i][1]][wireStack[i][2]].on2 != powerState){
                        grid[wireStack[i][1]][wireStack[i][2]].on2 = powerState;
                        grid[wireStack[i][1]][wireStack[i][2]].dom.firstChild.className = brideBottomClass;
                    }
                } else{
                    if(grid[wireStack[i][1]][wireStack[i][2]].on1 != powerState){
                        grid[wireStack[i][1]][wireStack[i][2]].on1 = powerState;
                        grid[wireStack[i][1]][wireStack[i][2]].dom.lastChild.className = brideTopClass;
                    }
                }
            }
        }
        powerState = false;
    }
}

function processUpdates(){
    let dir;
    let len = nextUpdateStack.length;
    for(let i = 0; i < len; i++){
        updateStack.push(nextUpdateStack[i]);
    }
    nextUpdateStack = [];
    len = updateStack.length;
    for(let i = 0; i < len; i++){
        callWireUpdate(updateStack[i][0],updateStack[i][1],updateStack[i][2]);
        checkedStack.push(wireStack);
        wireStack = [];
    }
    updateStack = [];
    len = nextNotStack.length;
    for(let i = 0; i < len; i++){
        notStack.push(nextNotStack[i]);
    }
    nextNotStack = [];
    len = notStack.length;
    for(let i = 0; i < len; i++){
        if(notPowered(notStack[i][0],notStack[i][1]) == grid[notStack[i][0]][notStack[i][1]].on1){
            grid[notStack[i][0]][notStack[i][1]].on1 = !grid[notStack[i][0]][notStack[i][1]].on1;
            if(grid[notStack[i][0]][notStack[i][1]].on1){
                grid[notStack[i][0]][notStack[i][1]].dom.className = "not " + direct[grid[notStack[i][0]][notStack[i][1]].facing] + " on";
            } else {
                grid[notStack[i][0]][notStack[i][1]].dom.className = "not " + direct[grid[notStack[i][0]][notStack[i][1]].facing] + " off";
            }
            dir = grid[notStack[i][0]][notStack[i][1]].facing;
            cX = notStack[i][0] + dirAdd[dir][0];
            cY = notStack[i][1] + dirAdd[dir][1];
            switch (grid[cX][cY].type){
                case 1:
                    updateStack.push([-1, cX, cY]);
                    break;
                case 2:
                    updateStack.push([dir, cX, cY]);
                    break;
                case 4:
                    if(dir == grid[cX][cY].facing){
                        nextNotStack.push([cX,cY]);
                    }
            }
        }
    }
    notStack = [];
    len = checkedStack.length;
    for(let i = 0; i < len; i++){
        for(let j = 0; j < checkedStack[i].length; j++){
            grid[checkedStack[i][j][1]][checkedStack[i][j][2]].updated1 = false;
            grid[checkedStack[i][j][1]][checkedStack[i][j][2]].updated2 = false;
        }
    }
    checkedStack = [];
    ready = true;
}

function notPowered(gX, gY) {
    dir = Math.abs(grid[gX][gY].facing - 3);
    let cX = gX + dirAdd[dir][0];
    let cY = gY + dirAdd[dir][1];
    switch(grid[cX][cY].type){
        case 0:
            return false;
        case 3:
        case 1:
            return grid[cX][cY].on1;
        case 2:
            if(dir == 0 || dir == 3){
                return grid[cX][cY].on2;
            } else{
                return grid[cX][cY].on1;
            }
        case 4:
            if(dir + grid[cX][cY].facing == 3){
                return grid[cX][cY].on1;
            }
            else {
                return false;
            }
    }
}

function wireLooksUpdate(X,Y) {
    let gX = X + 1;
    let gY = Y + 1;
    id = X + "X" + Y + "Y";
    let elem = document.getElementById(id);
    if (grid[gX][gY].on1) {
        elem.className = "wire on";
    } else {
        elem.className = "wire off";
    }
    elem.childNodes[1].className = "right hide";
    elem.childNodes[2].className = "bottom hide";
    elem.childNodes[3].className = "top hide";
    elem.childNodes[4].className = "left hide";
    if(Boolean(!isConnected(3, gX - 1, gY) && !isConnected(0, gX + 1, gY)) && Boolean(isConnected(1, gX, gY + 1) || isConnected(2, gX, gY - 1))){
            elem.childNodes[0].className = "center tb";
    } else if(Boolean(!isConnected(1, gX, gY + 1) && !isConnected(2, gX, gY - 1)) && Boolean(isConnected(0, gX + 1, gY) || isConnected(3, gX - 1, gY))){
        elem.childNodes[0].className = "center lr";
    } else {
        elem.childNodes[0].className = "center";
        for(let i = 0; i < 4; i++){
            if(isConnected(i, gX + dirAdd[i][0], gY + dirAdd[i][1])) {
                elem.childNodes[i + 1].className = directions[i] + " show";
            }
        }
    }
}

function aroundLooksUpdate(X,Y) {
    for(let i = 0; i < 4; i++){
        if(grid[X + dirAdd[i][0]][Y + dirAdd[i][1]].type == 1){
            wireLooksUpdate(X + dirAdd[i][0] - 1, Y + dirAdd[i][1] - 1);
        }
    }
}


function domConstructor(list, X, Y, first) {
    let elem = document.createElement('div');
    let child = document.createElement('div');
    elem.className = list[0];
    if (first) {
        elem.id = X + "X" + Y + "Y";
        gX = X + 1;
        gY = Y + 1;
        elem.style = "grid-column: " + gX + ";" + " grid-row: " + gY + ";";
    }
    for(let i = 1; i < list.length; i++){
        if (typeof(list[i]) == "string"){
            child = document.createElement('div');
            child.className = list[i];
            elem.appendChild(child);
        } else {
            child = domConstructor(list[i], 0, 0, false);
            elem.appendChild(child);
        }
    }
    return elem;
}

function isConnected(direction,gridX2,gridY2) {
    switch (grid[gridX2][gridY2].type) {
        case 4:
            if (grid[gridX2][gridY2].facing + direction == 3 || grid[gridX2][gridY2].facing == direction){
                return true;
            }
        case 0:
            return false;
        case 1:
        case 2:
        case 3:
            return true;
    }
}

function g (A) {
    return A + 1;
}

function clear(X,Y) {
    grid[g(X)][g(Y)].type = 0;
    grid[g(X)][g(Y)].on1 = false;
    grid[g(X)][g(Y)].on2 = false;
    let id = X + "X" + Y + "Y";
    while(true){
        try {
            document.getElementById(id).remove();
        } catch (err) {
            break;
        }
    }
}

function element(elementType, elementFacing, elementOn1, elementOn2, elementDom, elementUpdated1, elementUpdated2){
    this.type = elementType;
    this.facing = elementFacing;
    this.on1 = elementOn1;
    this.on2 = elementOn2;
    this.dom = elementDom;
    this.updated1 = elementUpdated1;
    this.updated2 = elementUpdated2;
}

function selected(id) {
    document.getElementById(clicked).style.borderColor = "transparent";
    document.getElementById(id).style.borderColor = "white";
    clicked = id;
}

function mainLoop(){
    if(ready){
        ready = false;
        processUpdates();
    }
}

function save(){
    let str = "";
    let str2 = "";
    let saveData = "{\"circuit\":";
    let array = [];
    for(let i = 0; i < circuit.childNodes.length; i++){
        array.push(circuit.childNodes[i].outerHTML);
    }
    saveData += JSON.stringify(array);
    saveData += ",\"grid\":" + JSON.stringify(grid) + "}";
    getUrl(function(saveId){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", saveId);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(saveData);
        if(saveId == "/"){
            console.log("here");
            xmlhttp.onreadystatechange = function(){
                if(xmlhttp.readyState === XMLHttpRequest.DONE) {
                    if((xmlhttp.status === 0 || (xmlhttp.status >= 200 && xmlhttp.status < 400))){
                        window.location.href += xmlhttp.responseText;
                        console.log("here", xmlhttp.responseText);
                    }
                }

            }
        }
    });
    //convert grid to savable format
    //send to server
    //on load server gets data ascociated with url
    //sends html and json data which gets parsed and loaded into grid and onto page
}

function idToXY(id){
    let X = "", Y = "", isX = true;
    let len = id.length;
    for(let i = 0; i < len - 1; i++){
        if(isX && id[i] != "X"){
            X += id[i];
        } else {
            if (id[i] == "X"){
                i++;
                isX = false;
            }
            Y += id[i];
        }
    }
    return [parseInt(X),parseInt(Y)];
}

function getUrl(callBack){
    let url = window.location.href;
    let saveId = [];
    for(let i = url.length-1; i > 0; i--){
        saveId.unshift(url[i]);
        if(url[i] == "/"){
            break;
        }
    }
    callBack(saveId.join(""));
}
var dpr = window.devicePixelRatio;
var ratio = 2/dpr;
var cellSize = 36*ratio;
var fontSize = ratio + "px";
document.getElementById("html").style.fontSize = fontSize;

document.addEventListener("DOMContentLoaded", function(event){

    var space = document.getElementById("html");

    selected("move");
    var allText;
    var data;
    var circuit = document.createElement('div');
    circuit.id = "circuit";
    space.appendChild(circuit);
    getUrl(function(saveId){
        space.scrollTop = cellSize*20;
        space.scrollLeft = cellSize*20;
    
        let pos = { top: 0, left: 0, x: 0, y: 0 };
    
        const mouseDownHandler = function(e) {
            if (e.clientY > cellSize && e.clientY > cellSize/2){
                dscX = Math.floor((space.scrollLeft + e.clientX)/cellSize);
                dscY = Math.floor((space.scrollTop + e.clientY-cellSize)/cellSize);
                gridX = dscX + 1;
                gridY = dscY + 1;
                miniX = (55 - gridX)*3;
                miniY = (55 - gridY)*3;
                switch(clicked){
                    case "move":
                        let w = document.documentElement.clientWidth;
                        let h = document.documentElement.clientHeight;
                        pos = {
                            // The current scroll 
                            left: space.scrollLeft,
                            top: space.scrollTop,
                            // Get the current mouse position
                            x: e.clientX,
                            y: e.clientY,
                        }; 
                        if(!!(pos.x > w - 164*ratio && pos.x < w - 15*ratio) && !!(pos.y > h - 164*ratio && pos.y < h - 15*ratio)){
                            let scale  = (pos.x + 164*ratio - w)/(165*ratio);
                            console.log("scale1", scale, w, h, document.body.clientWidth, scale*document.body.clientHeight);
                            space.scrollLeft = scale*document.body.clientWidth;
                            scale  = (pos.y + 164*ratio - h)/(165*ratio);
                            console.log("scale2", scale);
                            space.scrollTop = scale*1800*ratio;
                        } else{
                            circuit.style.cursor = 'grabbing';
                            circuit.style.userSelect = 'none';
                            document.addEventListener('mousemove', mouseMoveHandler);
                            document.addEventListener('mouseup', mouseUpHandler);
                        }
                        break;
                    case "wire":
                        if (grid[gridX][gridY].type != 1){
                            clear(dscX,dscY);
                            grid[gridX][gridY].type = 1;
                            wire = domConstructor(["wire off", "center", "right show", "top show", "bottom show", "left show", "mini"], dscX, dscY, true);
                            wire.lastChild.style = "right: " + miniX + "em; bottom: " + miniY + "em;";
                            circuit.appendChild(wire);
                            grid[gridX][gridY].dom = wire;
                            wireLooksUpdate(dscX, dscY);
                            aroundLooksUpdate(gridX, gridY);
                            nextUpdateStack.push([-1,gridX,gridY]);
                            circuit.appendChild(wire);
                        }
                        break;
                    case "bridge":
                        if (grid[gridX][gridY].type != 2){
                            clear(dscX,dscY);
                            grid[gridX][gridY].type = 2;
                            bridge = domConstructor(["bridge", ["center lr boff", "mini"], ["center tb shadow boff", "mini"]], dscX, dscY, true);
                            bridge.firstChild.firstChild.style = "right: " + miniX + "em; bottom: " + miniY + "em;";
                            bridge.lastChild.firstChild.style = "right: " + miniX + "em; bottom: " + miniY + "em; opacity: .5;";
                            circuit.appendChild(bridge);
                            grid[gridX][gridY].dom = bridge;
                            aroundLooksUpdate(gridX, gridY);
                            for(let i = 0; i < 4; i++){
                                    nextUpdateStack.push([i,gridX,gridY]);
                            }
                        }
                        break;
                    case "not":
                         let vals = [gridX - (space.scrollLeft + e.clientX)/cellSize, (space.scrollLeft + e.clientX)/cellSize - dscX, gridY - (space.scrollTop + e.clientY-cellSize)/cellSize, (space.scrollTop + e.clientY-cellSize)/cellSize - dscY];
                        let closest = Math.min(vals[0], vals[1], vals[2], vals[3]);
                        let facing = 0;
                        let notDirected;
                        switch (closest){
                            case vals[0]:
                                facing = 0;
                                notDirected = "not right on";
                                break;
                            case vals[1]:
                                facing = 3;
                                notDirected = "not left on";
                                break;
                            case vals[2]:
                                facing = 1;
                                notDirected = "not down on";
                                break;
                            case vals[3]:
                                facing = 2;
                                notDirected = "not up on";
                                break;
                        }
                        if (grid[gridX][gridY].type != 4 || (grid[gridX][gridY].type == 4 && facing != grid[gridX][gridY].facing)){
                            clear(dscX,dscY);
                            grid[gridX][gridY].type = 4;
                            grid[gridX][gridY].on1 = true;
                            grid[gridX][gridY].facing = facing;
                            not = domConstructor([notDirected, "notExterior", "notInterior", "mini"], dscX, dscY, true);
                            not.lastChild.style = "right: " + miniX + "em; bottom: " + miniY + "em;";
                            circuit.appendChild(not);
                            grid[gridX][gridY].dom = not;
                            aroundLooksUpdate(gridX, gridY);
                            nextNotStack.push([gridX,gridY]);
                            switchUpdate(gridX, gridY);
                        }
                        break;
                    case "switch":
                        if (grid[gridX][gridY].type != 3){
                            clear(dscX,dscY);
                            grid[gridX][gridY].type = 3;
                            switchh = domConstructor(["switch off", "block", "circle", "arrow", "one", ["zero", "innerZero"], "mini"], dscX, dscY, true);
                            switchh.lastChild.style = "right: " + miniX + "em; bottom: " + miniY + "em;";
                            circuit.appendChild(switchh);
                            grid[gridX][gridY].dom = switchh;
                            aroundLooksUpdate(gridX, gridY);
                            switchUpdate(gridX, gridY);
                        } else {
                            grid[gridX][gridY].on1 = !grid[gridX][gridY].on1;
                            let id = dscX + "X" + dscY + "Y";
                            switchh = document.getElementById(id);
                            if(grid[gridX][gridY].on1){
                                switchh.className = "switch on";
                            } else {
                                switchh.className = "switch off";
                            }
                            switchUpdate(gridX, gridY);
                        }
                        break;
                    case "cover":
                        cover = domConstructor(["cover"], dscX, dscY, true);
                        mini = domConstructor(["mini"], dscX, dscY, true);
                        mini.style = "right: " + miniX + "em; bottom: " + miniY + "em;";
                        circuit.appendChild(cover);
                        circuit.appendChild(mini);
                        break;
                    case "clear":
                        clear(dscX,dscY);
                        aroundLooksUpdate(gridX, gridY);
                        switchUpdate(gridX, gridY);
                }
            }
        };
    
        const mouseMoveHandler = function(e) {
            // How far the mouse has been moved
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;
            // Scroll the element
            space.scrollTop = pos.top - dy;
            space.scrollLeft = pos.left - dx;
        };
    
        const mouseUpHandler = function() {
            circuit.style.cursor = 'grab';
            circuit.style.removeProperty('user-select');
    
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        let url = "";
        
        if (saveId[saveId.length-1] == "/") {

            document.addEventListener('mousedown', mouseDownHandler);

            window.setInterval(mainLoop, 100);

        } else {
            url = saveId + "/test";
            console.log(url);
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", url);
            rawFile.onreadystatechange = function ()
            {
                if(rawFile.readyState === 4)
                {
                    if(rawFile.status === 200 || rawFile.status == 0)
                    {
                        allText = rawFile.response;
                        try{
                            data = JSON.parse(allText);
                            console.log(data);
                            let elem;
                            grid = data.grid;
                            for(let i = 0; i < data.circuit.length; i++){
                                elem = document.createElement('div')
                                circuit.appendChild(elem);
                                elem.outerHTML = data.circuit[i];
                                if(!(circuit.childNodes[i].className == "cover" || circuit.childNodes[i].className == "mini")){
                                    let XY = idToXY(circuit.childNodes[i].id);
                                    grid[XY[0]+1][XY[1]+1].dom = circuit.childNodes[i];
                                    console.log(grid[XY[0]+1][XY[1]+1]);
                                    console.log(XY);
                                }
                            }
                        } catch (err){
                        }
                        
                        document.addEventListener('mousedown', mouseDownHandler);
    
                        window.setInterval(mainLoop, 100);
                    }
                }
            }
            rawFile.send(null);
        }
    });
});

