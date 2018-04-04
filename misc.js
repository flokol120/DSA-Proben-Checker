const fs = require('fs');

function getTalents(callback) {
    fs.readFile(`./talents.json`, 'utf8', function (err, data) {
        if (err) throw err;
        var obj = JSON.parse(data)
        callback(obj);
    });
}

module.exports.populateProbes = function populateProbes(document) {
    var select = document.getElementById("probe")
    getTalents(function (obj) {
        obj = obj['talents']
        for (var i = 0; i < obj.length; i++) {
            var opt = document.createElement("option")
            opt.value = obj[i]['number']
            opt.textContent = obj[i]['name']
            select.appendChild(opt)
        }
    });
}

function getHeroes(callback) {
    fs.readdir("./DSA Helden", function (err, filenames) {
        var data = []
        for (var i = 0; i < filenames.length; i++) {
            var filename = filenames[i]
            var content = fs.readFileSync("./DSA Helden/" + filename, 'utf-8')
            var json = JSON.parse(content)
            data[i] = [json['name'], filename]
        }
        callback(data)
    });
}

module.exports.populateHeroes = function populateHeroes(document) {
    var select = document.getElementById("hero")
    getHeroes(function (data) {
        for (var i = 0; i < data.length; i++) {
            var opt = document.createElement("option")
            opt.value = data[i][1]
            opt.textContent = data[i][0]
            select.appendChild(opt)
        }
    });
}