const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const url = require('url');

var win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 600 })

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
}

exports.handleAddTalent = function handleAddTalent(name, number, firstAttr, secondAttr, thirdAttr, callback) {
    var raw = {
        talents: []
    }
    parseInt()
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
    console.log(probe);

    fs.readFile(`/mnt/78961e33-530d-4c7c-b9b1-d5601ab627be/Projects/DSA_Probe_Checker/DSA Helden/${hero}.json`, 'utf8', function (err, data) {
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
            console.log("1 attr: " + firstAttrValue);
            var secondAttrValue = attributes[secondAttr][1] + attributes[secondAttr][2]
            console.log("2 attr: " + secondAttrValue);
            var thirdAttrValue = attributes[thirdAttr][1] + attributes[thirdAttr][2]
            console.log("3 attr: " + thirdAttrValue);

            var firstCalc = firstAttrValue - first
            console.log("1 calc: " + firstCalc);
            var secondCalc = secondAttrValue - second
            console.log("2 calc: " + secondCalc);
            var thirdCalc = thirdAttrValue - third
            console.log("3 calc: " + thirdCalc);
            console.log(talent);

            var compensation;
            if(obj['talents'][talent] != undefined){
                compensation = obj['talents'][talent]
            }else{
                compensation = 0
            }
            
            
            console.log(compensation);


            if (firstCalc < 0) {
                console.log(`over value!(${firstCalc})`);
                compensation += firstCalc
            }
            if (secondCalc < 0) {
                console.log(`over value!(${secondCalc})`);
                compensation += secondCalc
            }
            if (thirdCalc < 0) {
                console.log(`over value!(${thirdCalc})`);
                compensation += thirdCalc
            }

            callback(compensation);
        });
    });
};

app.on('ready', function () {
    createWindow();

})