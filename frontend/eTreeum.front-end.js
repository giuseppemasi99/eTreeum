
// Set the contract address
var contractAddress = '0x6b7476E576987c1955527E4A1C369b50E5aF57c3';

// Set the relative URI of the contract’s skeleton (with ABI)
var contractJSON = "build/contracts/ETreeum.json"

// Set the sending address
var senderAddress = '0x0';

// Set contract ABI and the contract
var contract = null;

function start(){

    // remove comment when working with blockchain
    isNewUser(senderAddress);

    // comment this line when working with blockchain
    //thenIsNewUser(isNewUser(senderAddress));

}



/* BLOCKCHAIN INTERACTION - START */


// function that check if you are or not a new user
function isNewUser(senderAddress){
    
    // comment the return when working with the blockchain
    //infoNewUser = Math.floor(Math.random() * 2)
    //return infoNewUser;

    // remove comment when working with the blockchain
    contract.methods.isNewUser(senderAddress).call({from:senderAddress, gas: 1200000}).then(function(newUser) {
        console.log('isNewUser:'+ newUser);
        thenIsNewUser(newUser);
    }); 

}

function plantFreeSeed(senderAddress){

     // Subscribe to all PlantedFreeSeed events
    contract.events.JoinedGame(
        function(error, event){
                if (!error) {
                    if (event.returnValues["owner"] == senderAddress) {
                        console.log('After PlantedFreeSeed event');
                        console.log(event.returnValues['freePlantedTree']);
                    }
                }
            }
      );

    contract.methods.joinGame('myNickName').send({from:senderAddress, gas: 150000}).on('receipt', function(transaction) {
        console.log(transaction);        
    });

}


/* BLOCKCHAIN INTERACTION - END */



/* AFTER BLOCKCHAIN CALL - START */


function thenIsNewUser(newUser){
    
    var water, sun, shop;
    var seed, rename, submit_change, exit_stat;
    var username, rules, start_play;

    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");

    seed = document.getElementById("free_seed");
    username = document.getElementById("submit_username");
    rules = document.getElementById("rules_observed");
    start_play = document.getElementById("start_play");
    
    rename = document.getElementById("change_name");
    submit_change = document.getElementById("submit_change_name");
    exit_stat = document.getElementById("exit");

    seed.addEventListener('click', setUsername);
    username.addEventListener('click', showRules);
    rules.addEventListener('click', setPlantName);
    start_play.addEventListener('click', setupPage);

    rename.addEventListener('click', changeName);
    submit_change.addEventListener('click', submitNewName);
    exit_stat.addEventListener('click', exitStat);
    sun.addEventListener('click', giveSun);
    water.addEventListener('click', giveWater);
    
    if(newUser){ // new user
        
        water.disabled = true;
        sun.disabled = true;
        shop.disabled = true;
        rename.disabled = true;
        username.disabled = true;
        rules.disabled = true;
        start_play.disabled = true;

        seed.disabled = false;    
        
    }else{ // old user
        
        water.disabled = false;
        sun.disabled = false;
        shop.disabled = false;
        rename.disabled = false;
        
        rules.disabled = true;
        start_play.disabled = true;
        username.disabled = true;
        seed.disabled = true;
        printTrees(senderAddress);

    }

}

/* AFTER BLOCKCHAIN CALL - END */

// function that allow the counter
function startTreeCounter(){
    var a = 0;
    $(window).ready(function() {

    var oTop = $('#counter').offset().top - window.innerHeight;
    if (a == 0 && $(window).scrollTop() > oTop) {
        $('.counter-value').each(function() {
        var $this = $(this),
            countTo = $this.attr('data-count');
        $({
            countNum: $this.text()
        }).animate({
            countNum: countTo
            },

            {
            duration: 6000,
            easing: 'swing',
            step: function() {
                $this.text(Math.floor(this.countNum));
            },
            complete: function() {
                $this.text(this.countNum);
            }

            });
        });
        a = 1;
    }

    });
}

// function that set the username for a new user
function setUsername(){
    var initial_div, div_username;
    var seed, username;

    initial_div = document.getElementById("initial_div");
    div_username = document.getElementById("insert_username");

    //  buttons
    username = document.getElementById("submit_username");
    seed = document.getElementById("free_seed");
    
    initial_div.style.display = "none";
    div_username.style.display = "flex";

    username.disabled = false;
    
    seed.disabled = true;
}

// function that show the rules of the game
function showRules(){
    var div_username, rules_div;
    var username_button, rules_button;
    var span, username;

    div_username = document.getElementById("insert_username");
    rules_div = document.getElementById("game_rules");
    span = document.getElementById("username");
    username = document.getElementById("input_username");

    //  buttons
    username_button = document.getElementById("submit_username");
    rules_button = document.getElementById("rules_observed");
    
    span.innerHTML = username.value;
    username.innerHTML = "";

    div_username.style.display = "none";
    rules_div.style.display = "flex";

    username_button.disabled = true;
    rules_button.disabled = false;
    
}

// function that set the plant name for a new user
function setPlantName(){
    var div_plantName, rules_div;
    var start_play, rules_button;

    div_plantName = document.getElementById("select_treeName");
    rules_div = document.getElementById("game_rules");

    //  buttons
    start_play = document.getElementById("start_play");
    rules_button = document.getElementById("rules_observed");
    
    rules_div.style.display = "none";
    div_plantName.style.display = "flex";

    rules_button.disabled = true;
    start_play.disabled = false;
}

// setting up all the necessary buttons and elements in the page
function setupPage(){

    var water, sun, seed, shop, rename, info, play_button;
    var div_treeName, complete_body, infoRow, counter, tree_num, tot_trees;
    var right_top_header;

    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    seed = document.getElementById("free_seed");
    play_button = document.getElementById("start_play");
    shop = document.getElementById("shop");
    info = document.getElementById("info");

    infoRow = document.getElementById("info-row");
    div_treeName = document.getElementById("select_treeName");
    complete_body = document.getElementById("complete_body");
    //plant = document.getElementById("tree");
    counter = document.getElementById("counting_tree");
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    right_top_header = document.getElementById("right_top_header");
    
    div_treeName.style.display = "none";
    infoRow.style.display = "flex";
    complete_body.style.display = "flex";

    tree_num.innerHTML = 1;
    tot_trees.innerHTML = 1;
    counter.style.display = "flex";
    right_top_header.style.display = "flex";

    water.style.cursor = "pointer";
    sun.style.cursor = "pointer";
    shop.style.cursor = "pointer";

    seed.disabled = true;
    play_button.disabled = true;
    
    water.disabled = false;
    sun.disabled = false;
    shop.disabled = false;
    rename.disabled = false;

    info.addEventListener("click", showInfo);

    startTreeCounter();

    if(infoNewUser){
        var input_treeName, label_treeName;

        input_treeName = document.getElementById("input_treeName");
        label_treeName = document.getElementById("nickName");

        label_treeName.innerHTML = input_treeName.value;
        input_treeName.innerHTML = "";

    }
    else{
        var initial_div;
        initial_div = document.getElementById("initial_div");
        initial_div.style.display = "none";
    }

    calculatePodium();
    
}

// new user that plant a seed for free
function freeSeed(){
    
    // remove comment when working with the blockchain
    plantFreeSeed(senderAddress);

    setupPage();

}

// function that allow you to change the nickname of a plant
// disply a div in wich you can input the new nickname
function changeName(){

    var complete_body, divRename, tot_trees;
    var water, sun, shop, rename, arrow, info;
    
    // divs and other elements
    divRename = document.getElementById("nickName_change_div");
    complete_body = document.getElementById("complete_body");
    tot_trees = document.getElementById("tot_trees");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");
    info = document.getElementById("info")
    arrow = document.getElementsByClassName("arrow")
    
    divRename.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    shop.disabled = true;
    rename.disabled = true;

    info.removeEventListener("click", showInfo);
    
    if(tot_trees.innerHTML > 1){
        arrow[0].removeEventListener("click", goLeft);
        arrow[1].removeEventListener("click", goRight);
    }

}

// function that sumbit the change of the nickname
function submitNewName(){

    var label, name, complete_body, divRename, tot_trees;
    var water, sun, shop, rename, arrow, info;

    // divs and other elements
    label = document.getElementById("nickName");
    name = document.getElementById("newName");
    divRename = document.getElementById("nickName_change_div");
    complete_body = document.getElementById("complete_body");
    tot_trees = document.getElementById("tot_trees");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");
    arrow = document.getElementsByClassName("arrow")
    info = document.getElementById("info")
    
    label.innerText = name.value;
    name.value = "";

    divRename.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    shop.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);

    if (tot_trees.innerHTML > 1){
        arrow[0].addEventListener("click", goLeft);
        arrow[1].addEventListener("click", goRight);
    }

}

// function that calculate the actual podium
function calculatePodium(){

    var podium, first, second, third, fourth, fifth;
    var username;

    podium = ["A", "B", "UserName", "D", "E"];

    first = document.getElementById("first_name");
    second = document.getElementById("second_name");
    third = document.getElementById("third_name");
    fourth = document.getElementById("fourth_name");
    fifth = document.getElementById("fifth_name");

    username = document.getElementById("username");

    first.innerHTML = podium[0];
    if(first.innerHTML == username.innerHTML){
        first.innerHTML += " (you)";
    }

    second.innerHTML = podium[1];
    if(second.innerHTML == username.innerHTML){
        second.innerHTML += " (you)";
    }

    third.innerHTML = podium[2];
    if(third.innerHTML == username.innerHTML){
        third.innerHTML += " (you)";
    }

    fourth.innerHTML = podium[3];
    if(fourth.innerHTML == username.innerHTML){
        fourth.innerHTML += " (you)";
    }

    fifth.innerHTML = podium[4];
    if(fifth.innerHTML == username.innerHTML){
        fifth.innerHTML += " (you)";
    }

    if(!podium.includes(username.innerHTML)){
        var you, your_name;
        
        you = document.getElementById("you");
        your_name = document.getElementById("your_name");

        your_name.innerHTML = username.innerHTML;
        you.style.display = "inline";
    }

}

// function that show all the owned trees with the respective info and the user nickname
function printTrees(senderAddress){
    //web3.eth.getTreesByAddress(senderAddress).then(function(trees){});
    // qui mi ritornerà l'informazione relativa a tutti i gli alberi che ho
    setupPage();

    var counter, tree_num, tot_trees, div_tree, tree_img;
    var arrow, info;

    counter = document.getElementById("counting_tree");
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");

    // button
    info = document.getElementById("info")
    
    trees = [1, 2, 3, 2, 1, 2];

    info.addEventListener("click", showInfo);

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

        arrow[0].style.cursor = "not-allowed";
        arrow[1].style.cursor = "not-allowed";
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

// function used to show the information (stat) of a tree
function showInfo(value){

    var complete_body, stat_div, tot_trees, num_tree, stat_label;
    var water, sun, shop, rename, arrow, info;
    
    // divs and other elements
    stat_div = document.getElementById("treeStat");
    complete_body = document.getElementById("complete_body");
    num_tree = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    stat_label = document.getElementById("tree_id");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");
    info = document.getElementById("info")
    arrow = document.getElementsByClassName("arrow")
    
    stat_label.innerHTML = num_tree.innerHTML;
    stat_div.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    shop.disabled = true;
    rename.disabled = true;

    info.removeEventListener("click", showInfo);
    
    if(tot_trees.innerHTML > 1){
        arrow[0].removeEventListener("click", goLeft);
        arrow[1].removeEventListener("click", goRight);
    }

}

// function used when exiting off the stat of the tree
function exitStat(){

    var complete_body, stat_div, tot_trees;
    var water, sun, shop, rename, arrow, info;

    // divs and other elements
    stat_div = document.getElementById("treeStat");
    complete_body = document.getElementById("complete_body");
    tot_trees = document.getElementById("tot_trees");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    shop = document.getElementById("shop");
    arrow = document.getElementsByClassName("arrow")
    info = document.getElementById("info")

    stat_div.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    shop.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);

    if (tot_trees.innerHTML > 1){
        arrow[0].addEventListener("click", goLeft);
        arrow[1].addEventListener("click", goRight);
    }

}

// timer used for water and sun button
function startTimer(duration, display, msg) {

    var timer = duration, minutes, seconds, intervalID;
        
    intervalID = setInterval(
        function () {
                
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.innerHTML = minutes + ":" + seconds;

            if (--timer < 0) {
                //timer = duration;
                clearInterval(intervalID)
                display.disabled = false;
                display.style.cursor = "pointer";
                display.innerHTML = msg;
            }
        }, 
        1000);

}

// function that gives the sun to the tree
function giveSun(){

    var counter, sun;
    counter = 60;
    sun = document.getElementById('sun');

    sun.disabled = true;
    sun.style.cursor = "not-allowed"
    startTimer(counter, sun, "&#9728;");

}

// function that gives the water to the tree
function giveWater(){

    var counter, water;
    counter = 30;
    water = document.getElementById('water');

    water.disabled = true;
    water.style.cursor = "not-allowed"
    startTimer(counter, water, "&#128167;");

}

/* DO NOT MODIFY CODE BELOW */

$(window).on('load', function() {
    // comment this code when working with blockchain
    //start();

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