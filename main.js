const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const url = require('url');

var win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 500 })

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
  
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

exports.handleForm = function handleForm(targetWindow, first, second, third, probe, hero, callback) {
    fs.readFile(`./DSA Helden/${hero}`, 'utf8', function (err, data) {
        if (err) throw err;
        var obj = JSON.parse(data);
        fs.readFile('./talents.json', 'utf8', function (err, dataTal) {
            var objTal = JSON.parse(dataTal)['talents'];
            var firstAttr;
            var secondAttr;
            var thirdAttr;
            var talent;
            for(var i = 0; i < objTal.length; i++){
                if(objTal[i]['number'] == probe){
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

            var firstCalc = firstAttrValue - first
            var secondCalc = secondAttrValue - second
            var thirdCalc = thirdAttrValue - third

            var compensation;
            if(obj['talents'][talent] != undefined){
                compensation = obj['talents'][talent]
            }else{
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