const { remote, ipcRenderer } = require('electron');
const { handleForm, handleAddTalent, handleCreateRoom, getUser, assignHero, handleRequestProbe } = remote.require('./main');

const { populateUsers } = require('./misc');

const fs = require('fs');
const $ = require('jquery')
const currentWindow = remote.getCurrentWindow();

const submitFormButton = document.querySelector("#checkProbe");
const createRoomButton = document.querySelector("#createRoom");

const refreshButton = document.getElementById('refresh');

const user = document.getElementById('user');

let currentRoom = undefined;

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
    console.log(first);
    console.log(second);
    console.log(third);

    if (first > 20 || first < 1 || second > 20 || second < 1 || third > 20 || third < 1) {
        response.style.color = "Red";
        response.innerHTML = `Only values between 1 and 20 are allowed!`
    } else {
        let type = document.getElementById("probe").value;
        let hero = document.getElementById("heroDice").value;
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
        } else {
            response.style.color = "Red";
            response.innerHTML = `Please enter all rolled numbers or click on a dice to generate a random number`
        }
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

createRoomButton.addEventListener("submit", (event) => {
    event.preventDefault();
    currentRoom = document.getElementById('gameMasterName').value;
    handleCreateRoom(currentRoom, (success) => {
        if (success) {
            document.getElementById("response").innerHTML = `room '${currentRoom}' was created!`;
        } else {
            document.getElementById("response").innerHTML = `An error occurred!'`;
        }
    })
});

const refresh = () => {
    if (currentRoom === undefined) {
        currentRoom = document.getElementById('gameMasterName').value;
        if (currentRoom === '') {
            currentRoom === undefined;
        }
    }
    if (currentRoom !== undefined) {
        console.log(currentRoom);
        getUser(currentRoom, (user) => {
            populateUsers(document, user);
        });
    }
};

const assignHeroClick = () => {
    let nickname = undefined;
    for (const option of user.options) {
        if (option.selected === true) {
            nickname = option.innerHTML
        }
    }
    const heros = document.getElementById('heroRoom');
    let heroName = undefined;
    for (const option of heros.options) {
        if (option.selected === true) {
            heroName = option.innerHTML
        }
    }
    assignHero(currentRoom, nickname, heroName, () => {

    });
};

const requestProbe = () => {
    let nickname = undefined;
    for (const option of user.options) {
        if (option.selected === true) {
            nickname = option.innerHTML
        }
    }
    let typeSpinner = document.getElementById('probe');
    let hero = document.getElementById("heroRoom").value;
    let type = typeSpinner.value;
    let name = undefined;
    for (const option of typeSpinner.options) {
        if (option.selected === true) {
            name = option.innerHTML
        }
    }
    let relief = parseInt(document.getElementById("relief").value);
    let restriction = parseInt(document.getElementById("restriction").value);
    handleRequestProbe(nickname, type, relief, restriction, name, hero, () => {

    });
    console.log('HI!');
}

refreshButton.addEventListener("onclick", (event) => {
    event.preventDefault();
});