var isNewUser = undefined;
var userTrees = Array();
var userIdsOfTrees = Array();
var scores = Array();
var player_username;
var player_score;

var swipeEventActive = false;


async function start(){

    subscribeToAllEvents();
    
    //Check is new user --> return
    if (isNewUser == undefined) isNewUser = await contract.methods.isNewUser(senderAddress).call({from:senderAddress, gas: 1200000});
    console.log('isNewUser:'+ isNewUser);

    if (isNewUser) {
        registerPlayer();
    } else {
        login();
    }

}

function subscribeToAllEvents(){

    contract.events.JoinedGame(
        async function(error, event){
            if (!error) {
                console.log('JoinedGame event');
                // console.log(event.returnValues['a']);
                // console.log(event.returnValues['tree']);
                var freeTreeId = event.returnValues['id'];
                var freeTree = event.returnValues['tree'];
                if (senderAddress == event.returnValues.a) {
                    isNewUser = false;
                    var userIdsTrees = await contract.methods.getPlayerTrees(senderAddress).call({from:senderAddress, gas: 1500000});
                    userTrees = Array();
                    userIdsOfTrees = Array();
                    userIdsTrees[0].forEach(element => userIdsOfTrees.push(parseInt(element)));
                    userIdsTrees[1].forEach(element => userTrees.push({...element}));
                    printTrees();
                    getPlayer();
                }
            }
        }
    );

    contract.events.UpdatedPlayerScore(
        async function(error, event){
            if (!error) {
                console.log('UpdatedPlayerScore event');
                // console.log(event.returnValues['a']);
                // console.log(event.returnValues['tree']);
                var newScore = event.returnValues['score'];
                if (senderAddress == event.returnValues.a) {
                    player_score = newScore;
                    printUserInfo();
                }
            }
        }
    );

    contract.events.BoughtSeed(
        async function(error, event){
            if (!error) {
                console.log('BoughtSeed event');
                var boughtTreeId = event.returnValues['id'];
                var boughtTree = event.returnValues['t'];
                if (senderAddress == event.returnValues.a) {
                    var userIdsTrees = await contract.methods.getPlayerTrees(senderAddress).call({from:senderAddress, gas: 1500000});
                    userTrees = Array();
                    userIdsOfTrees = Array();
                    userIdsTrees[0].forEach(element => userIdsOfTrees.push(parseInt(element)));
                    userIdsTrees[1].forEach(element => userTrees.push({...element}));
                    cancel();
                    printTrees();
                }
            }
        }
    );

    contract.events.TreeGrown(
        async function(error, event){
            if (!error) {
                console.log('TreeGrown event');
                var treeId = event.returnValues['treeId'];
                var newStage = event.returnValues['stage'];
                if (senderAddress == event.returnValues.a) {
                    userTrees[userIdsOfTrees.indexOf(treeId)]['stage'] = newStage;
                    printTrees();
                }
            }
        }
    );

    console.log('EVENTS SUBSCRIPTION');

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

async function login() {

    try {

        var userIdsTrees = await contract.methods.getPlayerTrees(senderAddress).call({from:senderAddress, gas: 1500000});
        
        userIdsTrees[0].forEach(element => userIdsOfTrees.push(parseInt(element)));
        
        userIdsTrees[1].forEach(element => userTrees.push({...element}));

        printTrees();
        getPlayer();

    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}

// function that allow the counter
// This function comes from: https://codepen.io/dmcreis/pen/VLLYPo
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

    try {
        var transaction = await contract.methods.joinGame(username, treename).send({from:senderAddress, gas: 1500000});
        console.log("TRANSACTION", transaction);
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }
    
}

// setting up all the necessary buttons and elements in the page
async function setupPage(){

    var water, sun, rename, info, find_out_button, exit_stat, submit_change, menu_buy_seed;
    var cancel_button, buy_seed_button, cancel_change_button, sell_button;
    var sell_tree_button, cancel_sell_tree_button;
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
    sell_button = document.getElementById("sell_tree");
    sell_tree_button = document.getElementById("sell_tree_button");
    cancel_sell_tree_button = document.getElementById("cancel_sell_tree");

    cancel_change_button = document.getElementById("cancel_change_treeName");
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
    sell_button.addEventListener('click', sellTree);
    sell_tree_button.addEventListener('click', sellingTheTree);
    cancel_sell_tree_button.addEventListener('click', cancelSellTree);

    cancel_change_button.addEventListener('click', cancelChangeName);
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
    var water, sun, rename, arrow, info, menu_buySeed, sell_button;
    
    // divs and other elements
    divRename = document.getElementById("treeName_change_div");
    complete_body = document.getElementById("complete_body");
    tot_trees = document.getElementById("tot_trees");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info")
    menu_buySeed = document.getElementById("menu_buySeed")
    sell_button = document.getElementById("sell_tree")
    arrow = document.getElementsByClassName("arrow")
    
    divRename.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    rename.disabled = true;

    info.removeEventListener("click", showInfo);
    menu_buySeed.removeEventListener('click', buyNewSeed);
    sell_button.removeEventListener('click', sellTree);
    
    if(parseInt(tot_trees.innerHTML) > 1){
        swipeEventActive = false;
        var arrow0clone = arrow[0].cloneNode(true);
        var arrow1clone = arrow[1].cloneNode(true);

        arrow[0].parentNode.replaceChild(arrow0clone, arrow[0]);
        arrow[1].parentNode.replaceChild(arrow1clone, arrow[1]);

        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";

    } else{

        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
        
    }

}

async function renameTree(treeId, newNickname){

    try {
        var transaction = await contract.methods.renameTree(treeId, newNickname).send({from:senderAddress, gas: 1500000});
        console.log("TRANSACTION", transaction);
        return true;
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
        return false;
    }
    
}

// function that sumbit the change of the nickname
async function submitNewName(){

    var label, name, complete_body, divRename, num_tree;

    // divs and other elements
    label = document.getElementById("treeName");
    name = document.getElementById("newTreeName");
    divRename = document.getElementById("treeName_change_div");
    complete_body = document.getElementById("complete_body");

    num_tree = parseInt(document.getElementById("tree_number").innerHTML);
    treeId = userIdsOfTrees[num_tree - 1];

    if (await renameTree(treeId, name.value)){

        console.log(userTrees[num_tree-1]['nickname']);
        console.log(name.value)
        userTrees[num_tree-1]['nickname'] = name.value;
        console.log(userTrees[num_tree-1]['nickname']);

        label.innerText = name.value;
        name.value = "";
    
        divRename.style.display = "none";
        complete_body.style.opacity = 1;
    
        printTrees();

    }

}

// function that calculate the actual podium
async function calculatePodium(){

    var first, second, third;

    first = document.getElementById("first_name");
    second = document.getElementById("second_name");
    third = document.getElementById("third_name");

    try {
        scores_ = await contract.methods.getScores().call({from:senderAddress, gas: 120000});
        scores_.forEach(element => scores.push(
            {
                'nickname': element.nickname,
                'score': parseInt(element.score)
            }
        ));
        scores = scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
        // console.log('sorted scores');
        // console.log(scores);
        first.innerHTML = scores[0].nickname + ": " + scores[0].score;
        second.innerHTML = scores[1].nickname + ": " + scores[1].score;;
        third.innerHTML = scores[2].nickname + ": " + scores[2].score;;
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
    var arrow, treeCard, sell_tree_button;

    counter = document.getElementById("counting_tree");
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");
    treeCard = document.getElementById("treeCard")
    tree_name = document.getElementById("treeName");

    // button
    sell_tree_button = document.getElementById("sell_tree");
    arrow = document.getElementsByClassName("arrow");

    counter.style.display = "flex";

    var tree_body_div = document.getElementById('tree_body');
    var counting_tree_div = document.getElementById('counting_tree');
    var noTrees_div = document.getElementById('noTrees');

    if(userTrees.length == 0){
        
        tree_body_div.style.display = 'none';
        counting_tree_div.style.display = 'none';
        noTrees_div.style.display = 'flex';

        return;

    }
        
    tree_body_div.style.display = 'flex';
    counting_tree_div.style.display = 'flex';
    noTrees_div.style.display = 'none';


    if(userTrees.length > 1 && !swipeEventActive){
        swipeEventActive = true;
        arrow[0].style.opacity = 1;
        arrow[1].style.opacity = 1;

        arrow[0].style.cursor = "pointer";
        arrow[1].style.cursor = "pointer";

        arrow[0].addEventListener("click", swipe.bind(null, event, true));
        arrow[1].addEventListener("click", swipe.bind(null, event, false));

        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";

    }else if(userTrees.length == 1){
        swipeEventActive = false;
        var arrow0clone = arrow[0].cloneNode(true);
        var arrow1clone = arrow[1].cloneNode(true);

        arrow[0].parentNode.replaceChild(arrow0clone, arrow[0]);
        arrow[1].parentNode.replaceChild(arrow1clone, arrow[1]);

        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
    }

    tree_num.innerHTML = 1;
    tot_trees.innerHTML = userTrees.length;

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["stage"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["specie"]["risk"]);
    
    tree_name.innerHTML = userTrees[tree_num.innerHTML -1].nickname;

    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

    if(parseInt(userTrees[tree_num.innerHTML-1]["stage"]) >= 2 ){
        sell_tree_button.style.display = "flex";
    }
    else{
        sell_tree_button.style.display = "none";
    }

}

function swipe(e, left) {

    var tree_num, tot_trees, div_tree, tree_img, treeCard, tree_name, sell_tree_button;
    
    tree_num = document.getElementById("tree_number");
    tot_trees = document.getElementById("tot_trees");
    div_tree = document.getElementById("tree");
    treeCard = document.getElementById("treeCard")
    tree_name = document.getElementById("treeName");
    sell_tree_button = document.getElementById("sell_tree");
    
    if (left && parseInt(tree_num.innerHTML) == 1){
        tree_num.innerHTML = tot_trees.innerHTML;
    }else if(!left && tree_num.innerHTML == tot_trees.innerHTML){
        tree_num.innerHTML = 1;
    }else{
        tree_num.innerHTML = left ? parseInt(tree_num.innerHTML)-1 : parseInt(tree_num.innerHTML)+1;
    }

    tree_img = whichImage(userTrees[tree_num.innerHTML-1]["stage"]);
    treeCard.style.backgroundColor = whichColor(userTrees[tree_num.innerHTML-1]["specie"]["risk"]);
    tree_name.innerHTML = userTrees[tree_num.innerHTML-1]["nickname"];

    div_tree.style.backgroundImage = "url(frontend/img/"+tree_img+")";

    if(parseInt(userTrees[tree_num.innerHTML-1]["stage"]) >= 0 ){
        sell_tree_button.style.display = "flex";
    }
    else{
        sell_tree_button.style.display = "none";
    }
}

// function used to show the information (stat) of a tree
function showInfo(){

    var complete_body, stat_div, tot_trees, num_tree, tree_id;
    var water, sun, rename, arrow, info, menu_buySeed, sell_button;
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
    menu_buySeed = document.getElementById("menu_buySeed")
    sell_button = document.getElementById("sell_tree")
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
    menu_buySeed.removeEventListener('click', buyNewSeed);
    sell_button.removeEventListener('click', sellTree);
    
    if(parseInt(tot_trees.innerHTML) > 1){
        swipeEventActive = false;
        var arrow0clone = arrow[0].cloneNode(true);
        var arrow1clone = arrow[1].cloneNode(true);

        arrow[0].parentNode.replaceChild(arrow0clone, arrow[0]);
        arrow[1].parentNode.replaceChild(arrow1clone, arrow[1]);

        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";

    }else{
        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
    }

}

// function used when exiting off the stat of the tree
function exitStat(){

    var complete_body, stat_div, tot_trees;
    var water, sun, rename, arrow, info, menu_buySeed, sell_button;

    // divs and other elements
    stat_div = document.getElementById("treeStat");
    complete_body = document.getElementById("complete_body");
    tot_trees = document.getElementById("tot_trees");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    arrow = document.getElementsByClassName("arrow");
    info = document.getElementById("info");
    menu_buySeed = document.getElementById("menu_buySeed");
    sell_button = document.getElementById("sell_tree");

    stat_div.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);
    menu_buySeed.addEventListener('click', buyNewSeed);
    sell_button.addEventListener('click', sellTree);

    if (!swipeEventActive && parseInt(tot_trees.innerHTML) > 1){
        swipeEventActive = true;
        console.log(arrow)
        arrow[0].addEventListener("click", swipe.bind(null, event, true));
        arrow[1].addEventListener("click", swipe.bind(null, event, false));
        
        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";

    }else if (parseInt(tot_trees.innerHTML) == 1){
        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
    }

}

// function that gives the sun to the tree
async function giveSun(){

    var sunHours = prompt("How much sun you want to give to your plant?");
    var treeId, num_tree;

    num_tree = document.getElementById("tree_number").innerHTML;

    treeId = userIdsOfTrees[num_tree - 1];

    try {
        var transaction = await contract.methods.giveSun(treeId, sunHours).send({from:senderAddress, gas: 1500000});
        console.log("Transaction giveSun: ", transaction);
        var sun = sunHours == 1 ? "hour" : "hours";
        alert("Good job, you gave " + sunHours + " " + sun + " of sun to your tree");
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

    try {
        var transaction = await contract.methods.giveWater(treeId, waterAmount).send({from:senderAddress, gas: 1500000});
        console.log("Transaction giveWater: ", transaction);
        alert("Good job, you gave " + waterAmount + " milliliters of water to your tree");
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }
     
}

// function that allow the user to buy a new seed
function buyNewSeed(){
    var complete_body, buy_seed_div;

    var water, sun, rename, arrow, info, menu_buySeed, sell_button;

    complete_body = document.getElementById("complete_body");
    buy_seed_div = document.getElementById("buy_new_seed");

    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info")
    arrow = document.getElementsByClassName("arrow");
    menu_buySeed = document.getElementById("menu_buySeed");
    sell_button = document.getElementById("sell_tree")

    buy_seed_div.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    rename.disabled = true;

    info.removeEventListener("click", showInfo);
    menu_buySeed.removeEventListener('click', buyNewSeed);
    sell_button.removeEventListener('click', sellTree);
    
    if(parseInt(tot_trees.innerHTML) > 1){
        swipeEventActive = false;
        var arrow0clone = arrow[0].cloneNode(true);
        var arrow1clone = arrow[1].cloneNode(true);

        arrow[0].parentNode.replaceChild(arrow0clone, arrow[0]);
        arrow[1].parentNode.replaceChild(arrow1clone, arrow[1]);

        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";

    }else {
        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
    }


}

// function that go out from the change of the Tree Name
function cancelChangeName(){
    var complete_body, change_treeName_div;
    var water, sun, rename, arrow, info, menu_buySeed, sell_button;

    // divs and other elements
    change_treeName_div = document.getElementById("treeName_change_div");
    complete_body = document.getElementById("complete_body");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    arrow = document.getElementsByClassName("arrow");
    info = document.getElementById("info");
    menu_buySeed = document.getElementById("menu_buySeed");
    sell_button = document.getElementById("sell_tree");

    change_treeName_div.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);
    menu_buySeed.addEventListener('click', buyNewSeed);
    sell_button.addEventListener('click', sellTree);

    if (!swipeEventActive && parseInt(tot_trees.innerHTML) > 1){
        swipeEventActive = true;
        arrow[0].addEventListener("click", swipe.bind(null, event, true));
        arrow[1].addEventListener("click", swipe.bind(null, event, false));
        
        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";

    }else if (parseInt(tot_trees.innerHTML) == 1){
        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
    }

    
}

// function that go out from the buy option
function cancel(){
    var complete_body, buy_seed_div;
    var water, sun, rename, arrow, info, menu_buySeed, sell_button;

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
    sell_button = document.getElementById("sell_tree");

    buy_seed_div.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);
    menu_buySeed.addEventListener('click', buyNewSeed);
    sell_button.addEventListener('click', sellTree);

    if (!swipeEventActive && parseInt(tot_trees.innerHTML) > 1){
        swipeEventActive = true;
        arrow[0].addEventListener("click", swipe.bind(null, event, true));
        arrow[1].addEventListener("click", swipe.bind(null, event, false));
        
        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";

    }else if (parseInt(tot_trees.innerHTML) == 1){
        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
    }


}

function sellTree(){
    // ottenere immagine e sfonto del tree da vendere
    var complete_body, sell_tree_div, tree_to_sell_div, num_tree, tree_img;
    var tree_img_src;
    var water, sun, rename, arrow, info, menu_buySeed, sell_button;

    complete_body = document.getElementById("complete_body");
    sell_tree_div = document.getElementById("sell_tree_div");

    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    info = document.getElementById("info");
    arrow = document.getElementsByClassName("arrow");
    menu_buySeed = document.getElementById("menu_buySeed");
    sell_button = document.getElementById("sell_tree");
    tree_to_sell_div = document.getElementById("tree_to_sell");
    tree_img = document.getElementById("tree_to_sell_img");

    num_tree = parseInt(document.getElementById("tree_number").innerHTML);

    sell_tree_div.style.display = "flex";
    complete_body.style.opacity = 0.2;

    water.disabled = true;
    sun.disabled = true;
    rename.disabled = true;

    info.removeEventListener("click", showInfo);
    menu_buySeed.removeEventListener('click', buyNewSeed);
    sell_button.removeEventListener('click', sellTree);

    tree_img_src = whichImage(userTrees[num_tree-1]["stage"]);
    tree_img.src = "frontend/img/"+tree_img_src;

    tree_to_sell_div.style.backgroundColor = whichColor(userTrees[num_tree-1]["specie"]["risk"]);

    
    if(parseInt(tot_trees.innerHTML) > 1){
        swipeEventActive = false;
        var arrow0clone = arrow[0].cloneNode(true);
        var arrow1clone = arrow[1].cloneNode(true);

        arrow[0].parentNode.replaceChild(arrow0clone, arrow[0]);
        arrow[1].parentNode.replaceChild(arrow1clone, arrow[1]);

        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";
    }
    else{
        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
    }
}

function cancelSellTree(){
    var complete_body, sell_tree_div;
    var water, sun, rename, arrow, info, menu_buySeed, sell_button;

    // divs and other elements
    sell_tree_div = document.getElementById("sell_tree_div");
    complete_body = document.getElementById("complete_body");

    // buttons
    rename = document.getElementById("change_name");
    water = document.getElementById("water");
    sun = document.getElementById("sun");
    arrow = document.getElementsByClassName("arrow");
    info = document.getElementById("info");
    menu_buySeed = document.getElementById("menu_buySeed");
    sell_button = document.getElementById("sell_tree");

    sell_tree_div.style.display = "none";
    complete_body.style.opacity = 1;

    water.disabled = false;
    sun.disabled = false;
    rename.disabled = false;
    info.addEventListener("click", showInfo);
    menu_buySeed.addEventListener('click', buyNewSeed);
    sell_button.addEventListener('click', sellTree);

    if (!swipeEventActive && parseInt(tot_trees.innerHTML) > 1){
        swipeEventActive = true;
        arrow[0].addEventListener("click", swipe.bind(null, event, true));
        arrow[1].addEventListener("click", swipe.bind(null, event, false));

        arrow[0].style.display = "inline";
        arrow[1].style.display = "inline";

    } else if (parseInt(tot_trees.innerHTML) == 1){

        arrow[0].style.display = "none";
        arrow[1].style.display = "none";
        
    }
}

// function that actually add to the shop the tree
async function _sellTree(treeId, price){

    try{
        price = web3.utils.toWei(price, 'ether');
    }catch(e){
        alert("Please, enter a number!");
        return;
    }

    try {
        var transaction = await contract.methods.sellTree(treeId, price).send(
            {
                from:senderAddress, 
                gas: 1500000
            });
        console.log("TRANSACTION", transaction);
        alert("Tree added to the shop!");
    }catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}

async function sellingTheTree(){

    num_tree = document.getElementById("tree_number").innerHTML;
    treeId = userIdsOfTrees[num_tree - 1];
    
    price = document.getElementById("tree_price").value;
    document.getElementById("tree_price").value = "";

    await _sellTree(treeId, price);

    // dopo aver fatto la transazione lanciare la funzione cancelSellTree
    // e magari un alert che hai messo in vendita l'albero ad un certo tot
    cancelSellTree()
}

/* DO NOT MODIFY CODE BELOW */

$(window).on('load', async function() {
    await initialise();
    start();
});
