
// Set the contract address
var contractAddress = '0xbA4a95BEDd82911a3Ac01605fE8e119723caeF7f';

// Set the relative URI of the contract’s skeleton (with ABI)
var contractJSON = "build/contracts/ETreeumGame.json"

// Set the sending address
var senderAddress = '0x0';

// Set contract ABI and the contract
var contract = null;
var isNewUser = undefined;
var userTrees = [];


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
    //LEAVE with blockchain
    start_play.addEventListener('click', joinGame);
    //REMOVE without blockchain
    //start_play.addEventListener('click', setupPage);

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
        userTrees = await contract.methods.getPlayerTrees(senderAddress).call({from:senderAddress, gas: 1500000});
        console.log("TREES", userTrees);
        printTrees();
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }
}



/* BLOCKCHAIN INTERACTION - START */


// function that check if you are or not a new user
/*function isNewUser(senderAddress){
    
    // comment the return when working with the blockchain
    //return Math.floor(Math.random() * 2);

    // remove comment when working with the blockchain
    contract.methods.isNewUser(senderAddress).call({from:senderAddress, gas: 1200000}).then(function(newUser) {
        console.log('isNewUser:'+ newUser);
        thenIsNewUser(newUser);
    }); 

}*/

/*async function plantFreeSeed(senderAddress, nicknameUser, nicknameTree){

     // Subscribe to all PlantedFreeSeed events
    contract.events.JoinedGame(
        async function(error, event){
            if (!error) {
                setupPage();
                console.log('FREE PLANTED TREE');
                console.log(event.returnValues['a']);
                console.log(event.returnValues['treeId']);
                plantedSeed = event.returnValues['treeId'];
                //HERE WE SHOULD CHECK FOR THE ADDRESS
                thenPlantFreeSeed(plantedSeed);
            }
        }
    );
    //contract.methods.joinGame(nicknameUser, nicknameTree).send({from:senderAddress, gas: 1500000});
}*/

/* BLOCKCHAIN INTERACTION - END */



/* AFTER BLOCKCHAIN CALL - START */

//var infoNewUser;

/*async function thenIsNewUser(newUser){

    infoNewUser = newUser;
    
    var water, sun;
    var seed, rename, submit_change, exit_stat;
    var username, rules, start_play;

    water = document.getElementById("water");
    sun = document.getElementById("sun");

    seed = document.getElementById("join");
    username = document.getElementById("submit_username");
    rules = document.getElementById("okrules_clicked");
    start_play = document.getElementById("start_play");
    
    rename = document.getElementById("change_name");
    submit_change = document.getElementById("submit_change_name");
    exit_stat = document.getElementById("exit");

    seed.addEventListener('click', setUsername);
    username.addEventListener('click', showRules);
    rules.addEventListener('click', setPlantName);
    // remove the comment when working with the blockchain
    start_play.addEventListener('click', joinGame);
    // comment when working with the blockchain
    //start_play.addEventListener('click', setupPage);

    rename.addEventListener('click', changeName);
    submit_change.addEventListener('click', submitNewName);
    exit_stat.addEventListener('click', exitStat);
    sun.addEventListener('click', giveSun);
    water.addEventListener('click', giveWater);
    
    if(newUser){ // new user
        
        water.disabled = true;
        sun.disabled = true;
        rename.disabled = true;
        username.disabled = true;
        rules.disabled = true;
        start_play.disabled = true;

        seed.disabled = false;    
        
    }else{ // old user
        
        water.disabled = false;
        sun.disabled = false;
        rename.disabled = false;
        
        rules.disabled = true;
        start_play.disabled = true;
        username.disabled = true;
        seed.disabled = true;
        printTrees(senderAddress);


        console.log('CALLING GET TREES');
        response = await contract.methods.getPlayerTrees(senderAddress).call({from:senderAddress, gas: 120000});
        console.log('RESPONSE', response);

    }

}*/

//var userTrees = new Array();
/*var userTrees = [{"image":1, "rarity":3}, {"image":2, "rarity":1}, {"image":3, "rarity":2},
            {"image":2, "rarity":1}, {"image":3, "rarity":3}, {"image":2, "rarity":2},];
*/

function thenPlantFreeSeed(freePlantedTree){
    userTrees.push(freePlantedTree)
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
                setupPage();
                console.log('addressSender' + event.returnValues['a']);
                console.log('treeId:' + event.returnValues['treeId']);
                plantedSeed = event.returnValues['treeId'];
                if (senderAddress == event.returnValues.a) {
                    //DA RIPENSARCI
                    //window.reload();
                }
                //thenPlantFreeSeed(plantedSeed);
                //HERE WE SHOULD CHECK FOR THE ADDRESS
                //thenPlantFreeSeed(plantedSeed);
            }
        }
    );

    try {
        var transaction = await contract.methods.joinGame(username, treename).send({from:senderAddress, gas: 1500000});
        console.log("TRANSACTION", transaction);
        
        //plantFreeSeed(senderAddress, username.innerHTML, label_treeName.innerHTML);
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: "+errorMessage);
        //ALERT
    }
    
}

// setting up all the necessary buttons and elements in the page
async function setupPage(){

    var water, sun, rename, info, find_out_button, exit_stat, submit_change;
    var div_treeName, complete_body, infoRow, counter, right_top_header;

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info");
    find_out_button = document.getElementById("find_out");
    exit_stat = document.getElementById("exit");
    submit_change = document.getElementById("submit_change_name");

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

    /*if(infoNewUser){

        var input_treeName, label_treeName, username, tree_num, tot_trees, tree_img;

        input_treeName = document.getElementById("input_treeName");
        label_treeName = document.getElementById("treeName");
        username = document.getElementById("username");
        tree_num = document.getElementById("tree_number");
        tot_trees = document.getElementById("tot_trees");
        div_tree = document.getElementById("tree");

        tree_img = whichImage(userTrees[tree_num.innerHTML-1]["image"]);
        treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["rarity"])

        div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

        tree_num.innerHTML = 1;
        tot_trees.innerHTML = 1;
        label_treeName.innerHTML = input_treeName.value;
        input_treeName.innerHTML = "";

        // remove this comment when working with the blockchain
        //await plantFreeSeed(senderAddress, username.innerHTML, label_treeName.innerHTML);

    }else{

        var initial_div;
        initial_div = document.getElementById("initial_div");
        initial_div.style.display = "none";

    }*/

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
        arrow[0].removeEventListener("click", goLeft);
        arrow[1].removeEventListener("click", goRight);
    }

}

// function that sumbit the change of the nickname
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
        arrow[0].addEventListener("click", goLeft);
        arrow[1].addEventListener("click", goRight);
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

        arrow[0].addEventListener("click", goLeft);
        arrow[1].addEventListener("click", goRight);

    }else{
        arrow[0].removeEventListener("click", goLeft);
        arrow[1].removeEventListener("click", goRight);

        arrow[0].style.cursor = "not-allowed";
        arrow[1].style.cursor = "not-allowed";
    }

    tree_num.innerHTML = 1;
    tot_trees.innerHTML = userTrees.length;

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["image"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["rarity"]);
    
    tree_name.innerHTML = userTrees[tree_num.innerHTML -1].nickname;

    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

    counter.style.display = "flex";

}

// if you click on the left arrow you can see the tree on the left side
function goLeft(){

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

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["image"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["rarity"])

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

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["image"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["rarity"])

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

//function that given a value return the color to show in background
function whichColor(value){
    switch(value){
        case 1:
            return "rosybrown";
        case 2:
            return "#9400D3";
        case 3:
            return "#b9f2ff";
        default:
            return "rosybrown";
    }
}

// function used to show the information (stat) of a tree
function showInfo(){

    var complete_body, stat_div, tot_trees, num_tree, tree_id;
    var water, sun, rename, arrow, info;
    var rarity, spiece;
    
    // divs and other elements
    stat_div = document.getElementById("treeStat");
    complete_body = document.getElementById("complete_body");
    num_tree = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    tree_id = document.getElementById("tree_id");
    spiece = document.getElementById("spiece");
    rarity = document.getElementById("rarity");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info")
    arrow = document.getElementsByClassName("arrow");
    
    tree_id.innerHTML = num_tree.innerHTML;
    spiece.innerHTML = userTrees[num_tree.innerHTML-1]["image"];
    rarity.innerHTML = userTrees[num_tree.innerHTML-1]["rarity"];

    stat_div.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
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
        arrow[0].addEventListener("click", goLeft);
        arrow[1].addEventListener("click", goRight);
    }

}

// timer used for water and sun button
function startTimer(duration, display, msg, type_button) {

    var timer = duration, minutes, seconds, intervalID;
        
    intervalID = setInterval(
        function () {
                
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.innerHTML = minutes + ":" + seconds;

            if (--timer < 0) {
                
                clearInterval(intervalID)

                if(type_button == "sun"){
                    sun_button_active = false;
                }
                else{
                    water_button_active = false;
                }

                if(!sun_button_active && !water_button_active){
                    
                    var arrow;

                    arrow = document.getElementsByClassName("arrow")
                    
                    arrow[0].style.cursor = "pointer";
                    arrow[1].style.cursor = "pointer";

                    arrow[0].addEventListener("click", goLeft);
                    arrow[1].addEventListener("click", goRight);
                }

                display.disabled = false;
                display.style.cursor = "pointer";
                display.innerHTML = msg;
            }
        }, 
        1000);

}


// function that gives the sun to the tree
async function giveSun(treeId, sunHours){

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
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
        //ALERT
    }

    // var coin;

    // coin = Math.floor(Math.random() * 2);

    // if(coin){
    //     var sun = prompt("How much sun you want to give to the plant?");
    //     alert("Good job you gave "+sun+" hours of sun to your tree!");
    // }else{
    //     alert("You gave too much sun to your tree, STOP IT!");
    // }

}


// function that gives the water to the tree
async function giveWater(treeId, waterAmount){
    
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
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
        //ALERT
    }

    // var coin;

    // coin = Math.floor(Math.random() * 2);

    // if(coin){
    //     var water = prompt("How much water you want to give to the plant?");
    //     alert("Good job you gave "+water+" liters of water to your tree!");
    // }else{
    //     alert("You gave too much water to your tree, STOP IT!");
    // }

     
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
    senderAddress = accounts[0];
    console.log("Sender address set: " + senderAddress);

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