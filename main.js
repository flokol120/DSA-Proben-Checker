const { app, BrowserWindow } = require('electron');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const os = require('os');
const url = require('url');

const io = require('socket.io-client');
const crypto = require('crypto');

let socket = null;

let uid = '';

const api = 'http://127.0.0.1:3000/';
const socketUrl = 'http://127.0.0.1:3001/';

var win;

async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 580 })

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    socket = io(socketUrl);

    socket.on('newUser', (user) => {
        win.webContents.send('newUser', user);
    });

    socket.on('rollingResult', (data) => {
        win.webContents.send('rollingResult', data);
    });

    /*const requestHeaders = new Headers();
    requestHeaders.set("Content-Type", "application/json");*/



    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

exports.handleAddTalent = function handleAddTalent(name, number, firstAttr, secondAttr, thirdAttr, callback) {
    var raw = {
        talents: []
    }
    var obj = {
        name: name,
        number: number,
        firstAttr: firstAttr,
        secondAttr: secondAttr,
        thirdAttr: thirdAttr
    }
    fs.readFile("./talents.json", 'utf8', function (err, data) {
        if (err) throw err;
        exsObj = JSON.parse(data)
        exsObj.talents.push(obj)
        var json = JSON.stringify(exsObj)
        fs.writeFile('talents.json', json, 'utf8', function (err) {
            if (err) throw err;
            callback();
        });
    });
}

exports.handleCreateRoom = async function handleCreateRoom(roomName, callback) {
    const files = await fse.readdir('./DSA Helden');

    const heros = [];

    for (file of files) {
        heros.push(JSON.parse(await fse.readFile(path.join('./DSA Helden', file))));
    }

    if (uid === '' || uid === null || uid === undefined) {
        uid = crypto.createHash('sha512').update(roomName + Date.now().toString()).digest('hex')
    }

    const body = {
        name: roomName,
        id: uid,
        heros
    };

    await socket.emit('createRoom', body);
    callback(true);
}

exports.handleForm = function handleForm(targetWindow, first, second, third, probe, hero, relief, restriction, callback) {
    fs.readFile(`./DSA Helden/${hero}`, 'utf8', function (err, data) {
        if (err) throw err;
        var obj = JSON.parse(data);
        fs.readFile('./talents.json', 'utf8', function (err, dataTal) {
            var objTal = JSON.parse(dataTal)['talents'];
            var firstAttr;
            var secondAttr;
            var thirdAttr;
            var talent;
            for (var i = 0; i < objTal.length; i++) {
                if (objTal[i]['number'] == probe) {
                    var currObj = objTal[i]
                    firstAttr = currObj['firstAttr']
                    secondAttr = currObj['secondAttr']
                    thirdAttr = currObj['thirdAttr']
                    talent = currObj['number']
                }
            }
            var succeded = false;
            var left = 0;
            var attributes = obj['attr']['values'];
            var firstAttrValue = attributes[firstAttr][1] + attributes[firstAttr][2]
            var secondAttrValue = attributes[secondAttr][1] + attributes[secondAttr][2]
            var thirdAttrValue = attributes[thirdAttr][1] + attributes[thirdAttr][2]

            if (relief != 0 && restriction != 0) {
                var firstCalc = ((firstAttrValue - first) + restriction) - relief
                var secondCalc = ((secondAttrValue - second) + restriction) - relief
                var thirdCalc = ((thirdAttrValue - third) + restriction) - relief
            } else {
                if (relief == 0 && restriction == 0) {
                    var firstCalc = firstAttrValue - first
                    var secondCalc = secondAttrValue - second
                    var thirdCalc = thirdAttrValue - third
                } else if (relief != 0) {
                    var firstCalc = ((firstAttrValue - first) + relief)
                    var secondCalc = ((secondAttrValue - second) + relief)
                    var thirdCalc = ((thirdAttrValue - third) + relief)
                } else {
                    var firstCalc = ((firstAttrValue - first) - restriction)
                    var secondCalc = ((secondAttrValue - second) - restriction)
                    var thirdCalc = ((thirdAttrValue - third) - restriction)
                }
            }

            var compensation;
            if (obj['talents'][talent] != undefined) {
                compensation = obj['talents'][talent]
            } else {
                compensation = 0
            }

            if (firstCalc < 0) {
                compensation += firstCalc
            }
            if (secondCalc < 0) {
                compensation += secondCalc
            }
            if (thirdCalc < 0) {
                compensation += thirdCalc
            }

            callback(compensation);
        });
    });
};

exports.handleRequestProbe = async (nickname, probe, relief, restriction, name, heroName, id, callback) => {
    const hero = JSON.parse(await fse.readFile(`./DSA Helden/${heroName}`));
    const talents = JSON.parse(await fse.readFile('./talents.json'))['talents'];
    let firstAttribute;
    let secondAttribute;
    let thirdAttribute;
    let talent;
    for (var i = 0; i < talents.length; i++) {
        if (talents[i]['number'] == probe) {
            const currObj = talents[i];
            firstAttribute = currObj['firstAttr'];
            secondAttribute = currObj['secondAttr'];
            thirdAttribute = currObj['thirdAttr'];
            talent = currObj['number'];
            break;
        }
    }
    var attributes = hero['attr']['values'];
    var firstValue = attributes[firstAttribute][1] + attributes[firstAttribute][2];
    var secondValue = attributes[secondAttribute][1] + attributes[secondAttribute][2];
    var thirdValue = attributes[thirdAttribute][1] + attributes[thirdAttribute][2];

    var compensation;
    if (hero['talents'][talent] !== undefined) {
        compensation = hero['talents'][talent];
    } else {
        compensation = 0
    }

    const body = {
        nickname,
        id,
        name,
        firstValue,
        secondValue,
        thirdValue,
        compensation,
        relief,
        restriction,
        gameMasterId: uid
    };

    await socket.emit('requestProbe', body);
}

exports.getUser = async (roomName, callback) => {
    const response = await fetch(api + 'getUsersOfRoom', {
        method: 'POST', body: JSON.stringify({
            room: roomName
        }), headers: { "Content-Type": "application/json" }
    }).then(r => r.json());
    callback(response.user);
};

exports.assignHero = async (roomName, nickname, heroName, callback) => {
    const body = {
        room: roomName,
        nickname,
        heroName
    };
    await socket.emit('assignHero', body);
    callback(true);
};

app.on('ready', function () {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})