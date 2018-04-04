const fs = require('fs');

module.exports.getTalents = function getTalents(callback){
    console.log("h");
    fs.readFile(`./talents.json`, 'utf8', function (err, data) {
        if (err) throw err;
        var obj = JSON.parse(data)
        callback(obj);
    });
}