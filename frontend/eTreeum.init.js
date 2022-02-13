// Set the contract address
var contractAddress = '0x6e1F7123c9DE64a07e737C8Bf0338fd753B30BB6';

// Set the relative URI of the contract’s skeleton (with ABI)
var contractJSON = "../build/contracts/ETreeumGame.json"

// Set the sending address
var senderAddress = '0x0';

// Set contract ABI and the contract
var contract = null;

// Asynchronous function (to work with modules loaded on the go)
// For further info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/async_function
async function initialise() {

    // Initialisation of Web3
	if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
	} else {
        // Set the provider you want from Web3.providers
        // Use the WebSocketProvider to enable events subscription.
        web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));
	}

    // Load the ABI. We await the loading is done through "await"
    // More on the await operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
    await $.getJSON(contractJSON,
        function( contractData ) { // Use of IIFEs: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
              contract = new web3.eth.Contract(contractData.abi, contractAddress);
        }
    ).catch((error) => { console.error(error); });
    // Arrow funcction expression at work. For further info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions

    if (!contract) {
        console.error("No contract loaded.");
        return false;
    }

    // Set the address from which transactions are sent
    accounts = await web3.eth.getAccounts();
    senderAddress = accounts[0];
    console.log("Sender address set: " + senderAddress);

}

// function that actually buy the new seed
async function buySeed(){

    var treeNickname = document.getElementById("name_newSeed").value;
    document.getElementById("name_newSeed").value = "";

    try {
        var transaction = await contract.methods.buySeed(treeNickname).send(
            {
                from:senderAddress, 
                value: web3.utils.toWei('0.001', 'ether'),
                gas: 1500000
            });
        console.log("TRANSACTION", transaction);

        if(window.location.href.indexOf('index') != -1){
            cancel();
            await getTrees();
            printTrees();
        }else{
            cancelNewSeed();
            alert("You bought a new seed! You'll find it in the home page.");
        }
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}

function subscribeToUpdatedPlayerScore(){
    contract.events.UpdatedPlayerScore(
        async function(error, event){
            if (!error) {
                console.log('UpdatedPlayerScore event', event);
                var newScore = event.returnValues['score'];
                if (senderAddress == event.returnValues.a) {
                    player_score = newScore;
                    printUserInfo();
                    if(window.location.href.indexOf('index') != -1){
                        calculatePodium();
                    }
                }
            }
        }
    );
}

async function getPlayer(){

    try {
        var nickname_score = await contract.methods.getPlayerInfo(senderAddress).call({from:senderAddress, gas: 1500000});
        player_username = nickname_score[0];
        player_score = nickname_score[1];
        printUserInfo();
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}

function printUserInfo(){

    let username_span = document.getElementById("username");
    let score_span = document.getElementById("user_score");

    username_span.innerHTML = player_username;    
    score_span.innerHTML = player_score + " points";

}

function getErrorMessage(msg) {
    var errorMessage = msg;
    var index = msg.indexOf("reason\":\"");
    if (index != -1) {
        errorMessage = msg.substring(index + 9);
        errorMessage = errorMessage.substring(0, errorMessage.indexOf("\"}"));
    }
    return errorMessage;
}

//function that given a value return the color to show in background
function whichColor(value){
    switch(value){
        case '0':
            return "rosybrown";
        case '1':
            return "#9400D3";
        case '2':
            return "#b9f2ff";
        case '3':
            return "#FFD700";
        case '4':
            return "#CD853F";
        case '5':
            return "#FF8C00";
        
        default:
            return "rosybrown";
    }
}

function whichRisk(value){

    switch(value){
        case '0':
            return "Least Concern";
        case '1':
            return "Conservation Dependent";
        case '2':
            return "Near Threatened";
        case '3':
            return "Vulnerable";
        case '4':
            return "Endangered";
        case '5':
            return "Critically Endangered";
               
        default:
            return "Undefined";
    }
}

function whichStage(value){
    switch(value){
        case '0':
            return "Seed";
        case '1':
            return "Bush";
        case '2':
            return "Adult";
        case '3':
            return "Majestic";
        case '4':
            return "Secular";
        default:
            return "Undefined";
    }
}