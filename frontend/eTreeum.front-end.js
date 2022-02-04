
// Set the contract address
var contractAddress = '0x4e4647C36C5c737C601CaD6D1A0966D3e182595c';

// Set the relative URI of the contract’s skeleton (with ABI)
var contractJSON = "build/contracts/ETreeum.json"

// Set the sending address
var senderAddress = '0x0';

// Set contract ABI and the contract
var contract = null;

function start(){

    calculatePodium();

    isNewUser(senderAddress);

}

function setupPage(){

    var initial_div, complete_body, plant, water, sun, seed, shop, rename, infoRow, counter, tree_num, tot_trees;

    infoRow = document.getElementById("info-row");
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    seed = document.getElementById("free_seed");
    shop = document.getElementById("shop");
    initial_div = document.getElementById("initial_div");
    complete_body = document.getElementById("complete_body");
    plant = document.getElementById("tree");
    counter = document.getElementById("counting_tree");
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    
    initial_div.style.display = "none";
    complete_body.style.opacity = 1;
    plant.style.filter = "grayscale(0%)";
    infoRow.style.display = "flex";

    tree_num.innerHTML = 1;
    tot_trees.innerHTML = 1;
    counter.style.display = "flex";

    water.style.cursor = "pointer";
    sun.style.cursor = "pointer";
    shop.style.cursor = "pointer";

    seed.disabled = true;
    water.disabled = false;
    sun.disabled = false;
    shop.disabled = false;
    rename.disabled = false;
    
}

// new used that plant a seed for free
function freeSeed(){

    plantFreeSeed(senderAddress);

    setupPage();

}

// function that allow you to change the nickname of a plant
// disply a div in wich you can input the new nickname
function changeName(){

    var complete_body, divRename, water, sun, shop, rename, arrow;

    divRename = document.getElementById("nickName_change_div");
    complete_body = document.getElementById("complete_body");

    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");

    arrow = document.getElementsByClassName("arrow")
    
    divRename.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    shop.disabled = true;
    rename.disabled = true;
    arrow[0].removeEventListener("click", goLeft);
    arrow[1].removeEventListener("click", goRight);

}

// function that sumbit the change of the nickname
function submitNewName(){

    var label, name, complete_body, divRename, water, sun, shop, rename, arrow;
    
    label = document.getElementById("nickName");
    name = document.getElementById("newName");

    divRename = document.getElementById("nickName_change_div");
    complete_body = document.getElementById("complete_body");
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");

    arrow = document.getElementsByClassName("arrow")
    
    label.innerText = name.value;
    name.value = "";

    divRename.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    shop.disabled = false;
    rename.disabled = false;
    arrow[0].addEventListener("click", goLeft);
    arrow[1].addEventListener("click", goRight);

}

function calculatePodium(){

    var podium, first, second, third;

    podium = ["A", "B", "C"];
    first = document.getElementById("first_name");
    second = document.getElementById("second_name");
    third = document.getElementById("third_name");

    first.innerHTML = podium[0];
    second.innerHTML = podium[1];
    third.innerHTML = podium[2];

}

// function that show all the owned trees with the respective info
function printTrees(senderAddress){
    //web3.eth.getTreesByAddress(senderAddress).then(function(trees){});
    // qui mi ritornerà l'informazione relativa a tutti i gli alberi che ho
    setupPage();

    var counter, tree_num, tot_trees, div_tree, tree_img, arrow;

    counter = document.getElementById("counting_tree");
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");
    
    trees = [1, 2, 3, 2, 1, 2];

    arrow = document.getElementsByClassName("arrow")

    if(trees.length > 1){
    
        arrow[0].style.opacity = 1;
        arrow[1].style.opacity = 1;

        arrow[0].style.cursor = "pointer";
        arrow[1].style.cursor = "pointer";

        arrow[0].addEventListener("click", goLeft);
        arrow[1].addEventListener("click", goRight);

    }else{
        arrow[0].removeEventListener("click", goLeft);
        arrow[1].removeEventListener("click", goRight);
    }

    tree_num.innerHTML = 1;
    tot_trees.innerHTML = trees.length;

    tree_img = whichImage(trees[tree_num.innerHTML-1]);
    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

    counter.style.display = "flex";

}

// if you click on the left arrow you can see the tree on the left side
function goLeft(){

    var tree_num, tot_trees, div_tree, tree_img;
    
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");

    if(tree_num.innerHTML == 1){
        tree_num.innerHTML = tot_trees.innerHTML;
    }else{
        tree_num.innerHTML--;
    }

    tree_img = whichImage(trees[tree_num.innerHTML-1]);
    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

}

// if you click on the right arrow you can see the tree on the right side
function goRight(){

    var tree_num, tot_trees, div_tree, tree_img;
    
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");
    
    if(tree_num.innerHTML == tot_trees.innerHTML){
        tree_num.innerHTML = 1;
    }else{
        tree_num.innerHTML++;
    }

    tree_img = whichImage(trees[tree_num.innerHTML-1]);
    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

}

//function that given a value return the type of image to show
function whichImage(value){
    switch(value){
        case 1:
            return "seed.gif";
        case 2:
            return "little_tree.gif";
        case 3:
            return "da9cc5efa7671200c3def8a880721db7.gif";
        default:
            return "seed.gif";
    }
}


/* START BLOCKCHAIN INTERACTION */

function isNewUser(senderAddress){
    contract.methods.isNewUser(senderAddress).call({from:senderAddress, gas: 120000}).then(function(newUser) {
        console.log('isNewUser:'+ newUser);
        thenIsNewUser(newUser);
    });
}

function thenIsNewUser(newUser){
    
    var water, sun, shop;
    var seed, rename, submit_change;

    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");

    seed = document.getElementById("free_seed");
    rename = document.getElementById("change_name");
    submit_change = document.getElementById("submit_change_name");

    seed.addEventListener('click', freeSeed);
    rename.addEventListener('click', changeName);
    submit_change.addEventListener('click', submitNewName);
    
    if(newUser){ // new user
        
        console.log('nuovo utente');
        water.disabled = true;
        sun.disabled = true;
        shop.disabled = true;
        rename.disabled = true;
        seed.disabled = false;    
        
    }else{ // old user
        
        console.log('vecchio utente');
        water.disabled = false;
        sun.disabled = false;
        shop.disabled = false;
        rename.disabled = false;
        seed.disabled = true;
        printTrees(senderAddress);

    }

}

function plantFreeSeed(senderAddress){

     // Subscribe to all PlantedFreeSeed events
    contract.events.PlantedFreeSeed(
        function(error, event){
                if (!error) {
                    if (event.returnValues["owner"] == senderAddress) {
                        console.log('After PlantedFreeSeed event');
                        console.log(event.returnValues['freePlantedTree']);
                    }
                }
            }
      );

    contract.methods.joinGame('myNickName').send({from:senderAddress, gas: 120000}).on('receipt', function(transaction) {
        console.log(transaction);
    });

}


/* END BLOCKCHAIN INTERACTION */



/* DO NOT MODIFY CODE BELOW */

$(window).on('load', function() {
    initialise(contractAddress);
});

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

    start();

}



/*

    METODI PROFESSORE

function updateDisplayedInformation() {
    checkWeiBalance();
	displayMinter();
	displayAccountAddress();
	return false;
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
*/