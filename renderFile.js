const { remote, ipcRenderer } = require('electron');
const { handleForm, handleAddTalent} = remote.require('./main');
const fs = require('fs');
const currentWindow = remote.getCurrentWindow();

const submitFormButton = document.querySelector("#checkProbe");
const responseParagraph = document.getElementById('response')

submitFormButton.addEventListener("submit", function(event){
        event.preventDefault();   // stop the form from submitting
        let first = document.getElementById("first").value;
        let second = document.getElementById("second").value;
        let third = document.getElementById("third").value;
        let type = document.getElementById("probe").value;
        let hero = document.getElementById("hero").value;
        handleForm(currentWindow, first, second, third, type, hero, function(compensation){
            var response = document.getElementById("response")
            if(compensation >= 0){
                var qs;
                if(compensation > 15){
                    qs = 6
                }else if(compensation > 12){
                    qs = 5
                }else if(compensation > 9){
                    qs = 4
                }else if(compensation > 6){
                    qs = 3
                }else if(compensation > 3){
                    qs = 2
                }else{
                    qs = 1
                }
                response.innerHTML = `passed probe!(${compensation}, QS: ${qs})`
            }else{
                response.innerHTML = `didnt passed probe!(${compensation})`
            }
        });
});

ipcRenderer.on('form-received', function(event, args){
    responseParagraph.innerHTML = args
    /*
        you could choose to submit the form here after the main process completes
        and use this as a processing step
    */
});

const addTalent = document.querySelector("#addTalent");


addTalent.addEventListener("submit", function(event){
    event.preventDefault();   // stop the form from submitting
    let name = document.getElementById("name").value;
    let number = "TAL_" + document.getElementById("number").value;
    let firstAttr = parseInt(document.getElementById("firstAttr").value);
    let secondAttr = parseInt(document.getElementById("secondAttr").value);
    let thirdAttr = parseInt(document.getElementById("thirdAttr").value);
    handleAddTalent(name, number, firstAttr, secondAttr, thirdAttr, function(){
        document.getElementById("response").innerHTML = "saved!"
        document.getElementById("name").value = ""
        document.getElementById("number").value = parseInt(document.getElementById("number").value) + 1
        populateProbes(document);
    });
});



 function populateProbes(document){
    console.log("I'm here!");
    var select = document.getElementById("probe")
    console.log("I'm here!(got select)");
    getTalents(function(obj){
        for(var i = 0; i < obj.length; i++){
            var opt = document.createElement("option")
            opt.value = obj[i]['number']
            opt.textContent = obj[i]['name']
            select.appendChild(opt)
        }
    });
}

module.exports.getTalents = function getTalents(callback){
    fs.readFile(`./talents.json`, 'utf8', function (err, data) {
        if (err) throw err;
        var obj = JSON.parse(data)
        callback(obj);
    });
}
