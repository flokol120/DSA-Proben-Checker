const { remote, ipcRenderer } = require('electron');
const { handleForm, handleAddTalent } = remote.require('./main');
const fs = require('fs');
const $ = require('jquery')
const currentWindow = remote.getCurrentWindow();

const submitFormButton = document.querySelector("#checkProbe");

$('#randomFirst').click(function () {
    document.getElementById("first").value = generateRandomInteger(1, 20)
})

$('#randomSecond').click(function () {
    document.getElementById("second").value = generateRandomInteger(1, 20)
})

$('#randomThird').click(function () {
    document.getElementById("third").value = generateRandomInteger(1, 20)
})


submitFormButton.addEventListener("submit", function (event) {
    event.preventDefault();   // stop the form from submitting
    let first = document.getElementById("first").value;
    let second = document.getElementById("second").value;
    let third = document.getElementById("third").value;
    let type = document.getElementById("probe").value;
    let hero = document.getElementById("hero").value;
    let relief = parseInt(document.getElementById("relief").value);
    let restriction = parseInt(document.getElementById("restriction").value);
    if (first != "" && second != "" && third != "") {
        handleForm(currentWindow, first, second, third, type, hero, relief, restriction, function (compensation) {
            var response = document.getElementById("response")
            if (compensation >= 0) {
                var qs;
                if (compensation > 15) {
                    qs = 6
                } else if (compensation > 12) {
                    qs = 5
                } else if (compensation > 9) {
                    qs = 4
                } else if (compensation > 6) {
                    qs = 3
                } else if (compensation > 3) {
                    qs = 2
                } else {
                    qs = 1
                }
                response.style.color = "Green";
                response.innerHTML = `passed probe!(${compensation}, QS: ${qs})`
            } else {
                response.style.color = "Red";
                response.innerHTML = `did not pass probe!(${compensation})`
            }
        });
    }else{
        response.style.color = "Red";
        response.innerHTML = `Please enter all rolled numbers or click on a dice to generate a random number`
    }
});

ipcRenderer.on('form-received', function (event, args) {
    responseParagraph.innerHTML = args
    /*
        you could choose to submit the form here after the main process completes
        and use this as a processing step
    */
});

const addTalent = document.querySelector("#addTalent");


addTalent.addEventListener("submit", function (event) {
    event.preventDefault();   // stop the form from submitting
    let name = document.getElementById("name").value;
    let number = "TAL_" + document.getElementById("number").value;
    let firstAttr = parseInt(document.getElementById("firstAttr").value);
    let secondAttr = parseInt(document.getElementById("secondAttr").value);
    let thirdAttr = parseInt(document.getElementById("thirdAttr").value);
    handleAddTalent(name, number, firstAttr, secondAttr, thirdAttr, function () {
        document.getElementById("response").innerHTML = "saved!"
        document.getElementById("name").value = ""
        document.getElementById("number").value = parseInt(document.getElementById("number").value) + 1
        populateProbes(document);
    });
});


function generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min))
}