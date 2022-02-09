
// Set the contract address
var contractAddress = '0xcd1AF761a7D4CB19CE3862218723Ac063579CD79';

// Set the relative URI of the contract’s skeleton (with ABI)
var contractJSON = "build/contracts/ETreeumGame.json"

// Set the sending address
var senderAddress = '0x0';

// Set contract ABI and the contract
var contract = null;
var isNewUser = undefined;
var userTrees = [];
var userIdsOfTrees = [];


async function start(){
    //Check is new user --> return
    if (isNewUser == undefined) isNewUser = await contract.methods.isNewUser(senderAddress).call({from:senderAddress, gas: 1200000});
    console.log('isNewUser:'+ isNewUser);

    if (isNewUser) {
        registerPlayer();
    } else {
        login();
    }
}

function registerPlayer() {
    
    var join, username, rules, start_play;
    var initial_div;

    join = document.getElementById("join");
    username = document.getElementById("submit_username");
    rules = document.getElementById("okrules_clicked");
    start_play = document.getElementById("start_play");

    initial_div = document.getElementById("initial_div");

    initial_div.style.display = "flex";

    join.addEventListener('click', setUsername);
    username.addEventListener('click', showRules);
    rules.addEventListener('click', setPlantName);
    start_play.addEventListener('click', joinGame);
    
    username.disabled = true;
    rules.disabled = true;
    start_play.disabled = true;
    join.disabled = false;    

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

async function login() {

    try {
        var userIdsTrees = await contract.methods.getPlayerTrees(senderAddress).call({from:senderAddress, gas: 1500000});
        userIdsOfTrees = userIdsTrees[0];
        userTrees = userIdsTrees[1];
        console.log("userIdsOfTrees", userIdsOfTrees);
        console.log("userTrees", userTrees);
        printTrees();
        getPlayer();
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}

// function that allow the counter
// DA CITARE
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
    var join, username;

    initial_div = document.getElementById("initial_div");
    div_username = document.getElementById("insert_username");

    //  buttons
    username = document.getElementById("submit_username");
    join = document.getElementById("join");
    
    initial_div.style.display = "none";
    div_username.style.display = "flex";

    username.disabled = false;
    join.disabled = true;
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
    rules_button = document.getElementById("okrules_clicked");
    
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
    rules_button = document.getElementById("okrules_clicked");
    
    rules_div.style.display = "none";
    div_plantName.style.display = "flex";

    rules_button.disabled = true;
    start_play.disabled = false;

}

async function joinGame () {

    var input_treeName, username, treename;

    input_treeName = document.getElementById("input_treeName");
    username = document.getElementById("username").innerHTML;

    input_treeName.innerHTML = "";
    treename = input_treeName.value;

    contract.events.JoinedGame(
        async function(error, event){
            if (!error) {
                // console.log(event.returnValues['a']);
                // console.log(event.returnValues['tree']);
                let freeTreeId = event.returnValues['id'];
                let freeTree = event.returnValues['tree'];
                if (senderAddress == event.returnValues.a) {
                    isNewUser = false;
                    userIdsOfTrees.push(freeTreeId);
                    userTrees.push(freeTree);
                    printTrees();
                    getPlayer();
                }
            }
        }
    );

    try {
        var transaction = await contract.methods.joinGame(username, treename).send({from:senderAddress, gas: 1500000});
        console.log("TRANSACTION", transaction);
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }
    
}

async function getPlayer(){

    try {
        var nickname_score = await contract.methods.getPlayerInfo(senderAddress).call({from:senderAddress, gas: 1500000});
        let username = nickname_score[0];
        let score = nickname_score[1];
        // console.log("nickname_score");
        // console.log(nickname_score);
        printUserInfo(username, score);
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}

function printUserInfo(username, score){

    let username_span = document.getElementById("username");
    let score_span = document.getElementById("user_score");

    username_span.innerHTML = username;    
    score_span.innerHTML = score + " points";

}

// setting up all the necessary buttons and elements in the page
async function setupPage(){

    var water, sun, rename, info, find_out_button, exit_stat, submit_change, menu_buy_seed;
    var cancel_button, buy_seed_button;
    var div_treeName, complete_body, infoRow, counter, right_top_header;

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info");
    find_out_button = document.getElementById("find_out");
    exit_stat = document.getElementById("exit");
    submit_change = document.getElementById("submit_change_name");
    menu_buy_seed = document.getElementById("menu_buySeed");

    cancel_button = document.getElementById("cancel");
    buy_seed_button = document.getElementById("buy_seed_button");

    // divs
    infoRow = document.getElementById("top");
    div_treeName = document.getElementById("select_treeName");
    complete_body = document.getElementById("complete_body");
    counter = document.getElementById("counting_tree");
    right_top_header = document.getElementById("right_top_header");

    rename.addEventListener('click', changeName);
    submit_change.addEventListener('click', submitNewName);
    exit_stat.addEventListener('click', exitStat);
    info.addEventListener("click", showInfo);
    sun.addEventListener('click', giveSun);
    water.addEventListener('click', giveWater);
    menu_buy_seed.addEventListener('click', buyNewSeed);

    cancel_button.addEventListener('click', cancel);
    buy_seed_button.addEventListener('click', buySeed);
    
    find_out_button.style.display = "block";

    div_treeName.style.display = "none";
    infoRow.style.display = "flex";
    complete_body.style.display = "flex";

    counter.style.display = "flex";
    right_top_header.style.display = "flex";

    water.style.cursor = "pointer";
    sun.style.cursor = "pointer";
    
    water.disabled = false;
    sun.disabled = false;
    rename.disabled = false;

    startTreeCounter();

    calculatePodium();
    
}

// function that allow you to change the nickname of a plant
// display a div in wich you can input the new nickname
function changeName(){

    var complete_body, divRename, tot_trees;
    var water, sun, rename, arrow, info;
    
    // divs and other elements
    divRename = document.getElementById("treeName_change_div");
    complete_body = document.getElementById("complete_body");
    tot_trees = document.getElementById("tot_trees");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info")
    arrow = document.getElementsByClassName("arrow")
    
    divRename.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    rename.disabled = true;

    info.removeEventListener("click", showInfo);
    
    if(tot_trees.innerHTML > 1){
        arrow[0].removeEventListener("click", swipe(true));
        arrow[1].removeEventListener("click", swipe(false));
    }

}

// function that sumbit the change of the nickname
// ADD THE CALL TO THE CONTRACT METHOD 'renameTree'
function submitNewName(){

    var label, name, complete_body, divRename, tot_trees;
    var water, sun, rename, arrow, info;

    // divs and other elements
    label = document.getElementById("treeName");
    name = document.getElementById("newTreeName");
    divRename = document.getElementById("treeName_change_div");
    complete_body = document.getElementById("complete_body");
    tot_trees = document.getElementById("tot_trees");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    arrow = document.getElementsByClassName("arrow")
    info = document.getElementById("info")
    
    label.innerText = name.value;
    name.value = "";

    divRename.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);

    if (tot_trees.innerHTML > 1){
        arrow[0].addEventListener("click", swipe(true));
        arrow[1].addEventListener("click", swipe(false));
    }

}

// function that calculate the actual podium
async function calculatePodium(){

    var first, second, third;

    first = document.getElementById("first_name");
    second = document.getElementById("second_name");
    third = document.getElementById("third_name");

    try {
        var ranking = await contract.methods.getRanking().call({from:senderAddress, gas: 120000});
        console.log("RANKING", ranking);
        first.innerHTML = ranking[0].nickname + ": " + ranking[0].score;
        second.innerHTML = ranking[1].nickname + ": " + ranking[1].score;;
        third.innerHTML = ranking[2].nickname + ": " + ranking[2].score;;
    }
    catch(e) {
        getErrorMessage(e.message);
    }

}

// function that show all the owned trees with the respective info and the user nickname
function printTrees(){

    setupPage();

    var initial_div;
    initial_div = document.getElementById("initial_div");
    initial_div.style.display = "none";

    var counter, tree_num, tot_trees, div_tree, tree_img, tree_name;
    var arrow, info, treeCard;

    counter = document.getElementById("counting_tree");
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");
    treeCard = document.getElementById("treeCard")
    tree_name = document.getElementById("treeName");

    // button
    info = document.getElementById("info")
    
    info.addEventListener("click", showInfo);

    arrow = document.getElementsByClassName("arrow")

    if(userTrees.length > 1){
    
        arrow[0].style.opacity = 1;
        arrow[1].style.opacity = 1;

        arrow[0].style.cursor = "pointer";
        arrow[1].style.cursor = "pointer";

        arrow[0].addEventListener("click", swipe(true));
        arrow[1].addEventListener("click", swipe(false));

    }else{
        arrow[0].removeEventListener("click", swipe(true));
        arrow[1].removeEventListener("click", swipe(false));

        arrow[0].style.cursor = "not-allowed";
        arrow[1].style.cursor = "not-allowed";
    }

    tree_num.innerHTML = 1;
    tot_trees.innerHTML = userTrees.length;

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["stage"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["specie"]["risk"]);
    
    tree_name.innerHTML = userTrees[tree_num.innerHTML -1].nickname;

    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

    counter.style.display = "flex";

}

function swipe(left) {
    var tree_num, tot_trees, div_tree, tree_img, treeCard;
    
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");
    treeCard = document.getElementById("treeCard")
    
    if(tree_num.innerHTML == tot_trees.innerHTML){
        tree_num.innerHTML = 1;
    }else{
        tree_num.innerHTML = left ? tree_num.innerHTML -1 : tree_num.innerHTML +1;
    }

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["image"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["specie"]["name"])

    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";
}

// if you click on the left arrow you can see the tree on the left side
/*function goLeft(){

    var tree_num, tot_trees, div_tree, tree_img, treeCard;
    
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");
    treeCard = document.getElementById("treeCard")

    if(tree_num.innerHTML == 1){
        tree_num.innerHTML = tot_trees.innerHTML;
    }else{
        tree_num.innerHTML--;
    }

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["stage"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["specie"]["risk"]);

    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

}

// if you click on the right arrow you can see the tree on the right side
function goRight(){

    var tree_num, tot_trees, div_tree, tree_img, treeCard;
    
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");
    treeCard = document.getElementById("treeCard")
    
    if(tree_num.innerHTML == tot_trees.innerHTML){
        tree_num.innerHTML = 1;
    }else{
        tree_num.innerHTML++;
    }

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["stage"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["specie"]["risk"])

    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

}*/

//function that given a value return the type of image to show
function whichImage(value){
    switch(value){
        case '0':
            return "seed.gif";
        case '1':
            return "little_tree.gif";
        case '2':
            return "da9cc5efa7671200c3def8a880721db7.gif";
        case '3':
            return "da9cc5efa7671200c3def8a880721db7.gif";
        case '4':
            return "da9cc5efa7671200c3def8a880721db7.gif";
        default:
            return "seed.gif";
    }
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

// function used to show the information (stat) of a tree
function showInfo(){

    var complete_body, stat_div, tot_trees, num_tree, tree_id;
    var water, sun, rename, arrow, info;
    var stage, spiece, risk;
    
    // divs and other elements
    stat_div = document.getElementById("treeStat");
    complete_body = document.getElementById("complete_body");
    num_tree = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    tree_id = document.getElementById("tree_id");
    spiece = document.getElementById("spiece");
    stage = document.getElementById("stage");
    risk = document.getElementById("risk");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info")
    arrow = document.getElementsByClassName("arrow");
    
    tree_id.innerHTML = userIdsOfTrees[num_tree.innerHTML-1];
    spiece.innerHTML = userTrees[num_tree.innerHTML-1]["specie"]["name"];
    risk.innerHTML = whichRisk(userTrees[num_tree.innerHTML-1]["specie"]["risk"]);
    stage.innerHTML = whichStage(userTrees[num_tree.innerHTML-1]["stage"]);

    stat_div.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    rename.disabled = true;

    info.removeEventListener("click", showInfo);
    
    if(tot_trees.innerHTML > 1){
        arrow[0].removeEventListener("click", swipe(true));
        arrow[1].removeEventListener("click", swipe(false));
    }

}

// function used when exiting off the stat of the tree
function exitStat(){

    var complete_body, stat_div, tot_trees;
    var water, sun, rename, arrow, info;

    // divs and other elements
    stat_div = document.getElementById("treeStat");
    complete_body = document.getElementById("complete_body");
    tot_trees = document.getElementById("tot_trees");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    arrow = document.getElementsByClassName("arrow")
    info = document.getElementById("info")

    stat_div.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);

    if (tot_trees.innerHTML > 1){
        arrow[0].addEventListener("click", swipe(true));
        arrow[1].addEventListener("click", swipe(false));
    }

}


// function that gives the sun to the tree
async function giveSun(){

    var sunHours = prompt("How much sun you want to give to your plant?");
    var treeId, num_tree;

    num_tree = document.getElementById("tree_number").innerHTML;

    treeId = userIdsOfTrees[num_tree - 1];

    contract.events.TreeGrown(
        async function(error, event){
            if (!error) {
                console.log('TreeGrown event, returnValues: ' + event.returnValues);
            }
        }
    );

    try {
        var transaction = await contract.methods.giveSun(treeId, sunHours).send({from:senderAddress, gas: 1500000});
        console.log("Transaction giveSun: ", transaction);
        alert("Good job, you gave " + sunHours + " hour(s) of sun to your tree");
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}


// function that gives the water to the tree
async function giveWater(){

    var waterAmount = prompt("How much water you want to give to your plant?");
    var treeId, num_tree;

    num_tree = document.getElementById("tree_number").innerHTML;

    treeId = userIdsOfTrees[num_tree - 1];
    
    contract.events.TreeGrown(
        async function(error, event){
            if (!error) {
                console.log('TreeGrown event, returnValues: ' + event.returnValues);
            }
        }
    );

    try {
        var transaction = await contract.methods.giveWater(treeId, waterAmount).send({from:senderAddress, gas: 1500000});
        console.log("Transaction giveWater: ", transaction);
        alert("Good job, you gave " + waterAmount + " liters of water to your tree");
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }
     
}

// function that allow the user to buy a new seed
function buyNewSeed(){
    var complete_body, buy_seed_div;
    var buy_button, cancel_button;

    var water, sun, rename, arrow, info, menu_buySeed;

    complete_body = document.getElementById("complete_body");
    buy_seed_div = document.getElementById("buy_new_seed");

    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info")
    arrow = document.getElementsByClassName("arrow");
    menu_buySeed = document.getElementById("menu_buySeed");

    buy_button = document.getElementsByClassName("buy_seed_button");
    cancel_button = document.getElementsByClassName("cancel");

    buy_seed_div.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    rename.disabled = true;

    info.removeEventListener("click", showInfo);
    menu_buySeed.removeEventListener('click', buyNewSeed);
    
    if(tot_trees.innerHTML > 1){
        arrow[0].removeEventListener("click", swipe(true));
        arrow[1].removeEventListener("click", swipe(false));
    }

}

// function that go out from the buy option
function cancel(){
    var complete_body, buy_seed_div;
    var water, sun, rename, arrow, info, menu_buySeed;

    // divs and other elements
    buy_seed_div = document.getElementById("buy_new_seed");
    complete_body = document.getElementById("complete_body");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    arrow = document.getElementsByClassName("arrow");
    info = document.getElementById("info");
    menu_buySeed = document.getElementById("menu_buySeed");

    buy_seed_div.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);
    menu_buySeed.addEventListener('click', buyNewSeed);

    if (tot_trees.innerHTML > 1){
        arrow[0].addEventListener("click", swipe(true));
        arrow[1].addEventListener("click", swipe(false));
    }

}

// function that actually buy the new seed
// ADD CALL TO THE BACK-END METHOD
function buySeed(){
    var tree_id, num_tree;

    num_tree = document.getElementById("tree_number").innerHTML;

    tree_id = userIdsOfTrees[num_tree-1];

    alert(tree_id);
    cancel();

}

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
    senderAddress = accounts[0];
    console.log("Sender address set: " + senderAddress);

    start();

}