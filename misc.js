const fs = require('fs');
const $ = require('jquery')

var response = document.getElementById("response")

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

exports.populateUsers = function populateUsers(document, users) {
    var select = document.getElementById("user");
    clearOptions(select);
    for (const user of users) {
        const opt = document.createElement('option');
        opt.value = user.id;
        opt.textContent = user.nickname;
        select.appendChild(opt);
    }
}

const clearOptions = (select) => {
    select.innerHTML = '';
    /*for (let i = 0; i < select.options.length; i++) {
        select.options[i] = undefined;
    }*/
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
    var selects = document.getElementsByClassName("hero")
    for (const select of selects) {
        getHeroes(function (data) {
            if (data.length != 0) {
                for (var i = 0; i < data.length; i++) {
                    var opt = document.createElement("option")
                    opt.value = data[i][1]
                    opt.textContent = data[i][0]
                    select.appendChild(opt)
                }
                document.getElementById("submit").disabled = false;
                response.innerHTML = ""
            } else {
                response.style.color = "Red"
                response.innerHTML = "no heroes were found! Be sure to place them into 'DSA Helden/'"
                document.getElementById("submit").disabled = true;
            }
        });
    }
}