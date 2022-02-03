
// Set the contract address
var contractAddress = '0xc2cC599462E5C3040F1b157cd576b47eBAb32Eb9';

// Set the relative URI of the contract’s skeleton (with ABI)
var contractJSON = "build/contracts/ETreeum.json"

// Set the sending address
var senderAddress = '0x0';

// Set contract ABI and the contract
var contract = null;

$(window).on('load', function() {
    initialise(contractAddress);
    calculatePodium();
    var water, sun, seed, shop, rename;
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    seed = document.getElementById("free_seed");
    shop = document.getElementById("shop");
    rename = document.getElementById("change_name");
    submit_change = document.getElementById("submit_change_name");

    seed.addEventListener('click', freeSeed);
    rename.addEventListener('click', changeName);
    submit_change.addEventListener('click', submitNewName);

    
    if (checkNewUser(senderAddress)){
        water.disabled = true;
        sun.disabled = true;
        shop.disabled = true;
        rename.disabled = true;
        seed.disabled = false;
    }
    else{
        printTrees(senderAddress);
    }
});

// new used that plant a seed for free
function freeSeed(){
    var initial_div, complete_body, plant, water, sun, seed, shop, rename, infoRow;

    infoRow = document.getElementById("info-row");
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    seed = document.getElementById("free_seed");
    shop = document.getElementById("shop");
    initial_div = document.getElementById("initial_div");
    complete_body = document.getElementById("complete_body");
    plant = document.getElementById("tree");
    
    initial_div.style.display = "none";
    complete_body.style.opacity = 1;
    plant.style.filter = "grayscale(0%)";
    infoRow.style.display = "flex";

    water.style.cursor = "pointer";
    sun.style.cursor = "pointer";
    shop.style.cursor = "pointer";

    seed.disabled = true;
    water.disabled = false;
    sun.disabled = false;
    shop.disabled = false;
    rename.disabled = false;
}

// function that allow you to change the nickname of a plant
// disply a div in wich you can input the new nickname
function changeName(){
    var complete_body, divRename, water, sun, shop, rename;

    divRename = document.getElementById("nickName_change_div");
    complete_body = document.getElementById("complete_body");

    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");
    
    divRename.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    shop.disabled = true;
    rename.disabled = true;
}

// function that sumbit the change of the nickname
function submitNewName(){
    var label, name, complete_body, divRename, water, sun, shop, rename;
    
    label = document.getElementById("nickName");
    name = document.getElementById("newName");

    divRename = document.getElementById("nickName_change_div");
    complete_body = document.getElementById("complete_body");
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");
    
    label.innerText = name.value;
    name.value = "";

    divRename.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    shop.disabled = false;
    rename.disabled = false;
}


// Asynchronous function (to work with modules loaded on the go)
// For further info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/async_function
async function initialise(contractAddress) {
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
              // console.log(contractAbi);
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
    senderAddress = accounts[0]
    console.log("Sender address set: " + senderAddress)

    // Update the information displayed
    updateDisplayedInformation();

}

function updateDisplayedInformation() {
    checkWeiBalance();
	displayMinter();
	displayAccountAddress();
	return false;
}


function calculatePodium(){
    return ["aaaa", "bbbb", "cccc"];
}

function checkNewUser(senderAddress){
    return 1;
}

function printTrees(senderAddress){
    web3.eth.getTreesByAddress(senderAddress).then(function(trees){

    });
}



// Displays the current wei balance
function checkWeiBalance(){
    web3.eth.getBalance(senderAddress).then(function(result){
        $("#myweibalance").html(result);
    });
}

// Displays the current minter address
function displayMinter() {
    contract.methods.minter().call({from:senderAddress, gas: 120000}).then(function(result) { // A promise in action
        $("#currentminter").html(result);
    });
    //  // The “send” method is not required here as it is a view on a public attribute of the contract.
    //  // Therefore, no state change is necessary on the contract and the sole call() suffices.
    //  contract.methods.minter().send({from:senderAddress, gas: 120000}).on('receipt', function(receipt){
    //    console.log("Tx Hash of displayMinter(): " + receipt.transactionHash);
    //  });
}

// Displays the account address
function displayAccountAddress() {
	$("#myaccountaddress").html(
		senderAddress
	);
}
