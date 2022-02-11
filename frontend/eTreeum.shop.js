var isNewUser;

var sellingTrees = Array();
var prices = Array();

$(window).on('load', async function() {
    // comment this code when working with blockchain
    await initialise();

    subscribeToAllEvents();

    if (isNewUser == undefined) isNewUser = await contract.methods.isNewUser(senderAddress).call({from:senderAddress, gas: 1200000});

    if(isNewUser){
        window.location.href = "./index.html";
    }else{
        showSellingTrees();
    }

});


function subscribeToAllEvents(){

    console.log('EVENTS SUBSCRIPTION SHOP');

    contract.events.BoughtSeed(
        async function(error, event){
            if (!error) {
                if (senderAddress == event.returnValues.a) {
                    cancelNewSeed();
                    getPlayer();
                }
            }
        }
    );
}

async function getShopTrees(){
    let ret = await contract.methods.getShop().call({from:senderAddress, gas: 1500000});
    sellingTrees = ret[0];
    prices = ret[1];
    // console.log(sellingTrees);
    // console.log(prices);
}

async function showSellingTrees(){

    await getPlayer();
    await getShopTrees();

    var container, buy_button, cancel_button;
    var num_selling_trees = sellingTrees.length, i;
    
    var tree_row, tree_name_div, tree_div, eth, eth_value, tree_info, img, src;
    var menu_buy_seed, cancel_seed_button, buy_seed_button;

    container = document.getElementById("trees_container");
    buy_button = document.getElementById("buy");
    cancel_button = document.getElementById("cancel");
   
    cancel_seed_button = document.getElementById("cancel_newSeed");
    buy_seed_button = document.getElementById("buy_seed_button");
    menu_buy_seed = document.getElementById("menu_buySeed");
    
    menu_buy_seed.addEventListener('click', buyNewSeed);
    cancel_seed_button.addEventListener('click', cancelNewSeed);
    buy_seed_button.addEventListener('click', buySeed);

    cancel_button.addEventListener('click', cancelOption);
    buy_button.addEventListener('click', buyTree);


    for(i = 0; i < num_selling_trees; i++){

        src = "frontend/img/";

        tree_row = document.createElement("div");
        tree_name_div = document.createElement("div");
        tree_div = document.createElement("div");
        img = document.createElement("img");
        eth = document.createElement("span");

        let s = sellingTrees[i]['nickname'] + ': ' + whichStage(sellingTrees[i]["stage"]) + ', ' + sellingTrees[i]["specie"]["name"] + ' - Risk: ' + whichRisk(sellingTrees[i]["specie"]["risk"]);
        tree_info = document.createTextNode(s);
        eth_value = document.createTextNode(web3.utils.fromWei(prices[i].toString(), 'ether') + " ETH");

        tree_name_div.className = "tree_logo_name";
        tree_row.className = "tree_row";
        tree_div.className = "tree_logo";
        img.className = "tree_img";
        eth.className = "eth_value";
        eth.id = i;

        eth.addEventListener('click', buyOptions.bind(null, event, i));

        container.appendChild(tree_row);
        tree_row.appendChild(tree_name_div);
        tree_name_div.appendChild(tree_div);
        tree_name_div.appendChild(tree_info);
        tree_div.appendChild(img);
        tree_row.appendChild(eth);
        eth.appendChild(eth_value);

        tree_div.style.backgroundColor = whichColor(sellingTrees[i]["specie"]["risk"]);
        src += whichImage(sellingTrees[i]["stage"]);
        img.src = src;

    }
    

}

function buyNewSeed(){
    var shop_body, buy_seed_div;

    var menu_buySeed, buy_buttons;

    shop_body = document.getElementById("shop_body");
    buy_seed_div = document.getElementById("buy_new_seed");

    menu_buySeed = document.getElementById("menu_buySeed");
    buy_buttons = document.getElementsByClassName("eth_value");

    buy_seed_div.style.display = "flex";
    shop_body.style.opacity = 0.2;

    menu_buySeed.removeEventListener('click', buyNewSeed);
    
    for (let i=0; i<buy_buttons.length; i++){
        var elClone = buy_buttons[i].cloneNode(true);
        buy_buttons[i].parentNode.replaceChild(elClone, buy_buttons[i]);
        buy_buttons[i].style.cursor = "default";
    }

}

function buyOptions(event, i){
    
    var buy_option_div, shop_div, tree_to_show_div, tree_image, eth_span;
    var buy_buttons;

    // in base a questa mostro l'immagine carina

    buy_option_div = document.getElementById("buy_options");
    shop_div = document.getElementById("shop_body");
    tree_to_show_div = document.getElementById("tree_to_sell");
    tree_image = document.getElementById("tree_to_sell_image");
    eth_span = document.getElementById("buy_options_eth");

    buy_buttons = document.getElementsByClassName("eth_value");

    for (let j=0; j<buy_buttons.length; j++){
        var elClone = buy_buttons[j].cloneNode(true);
        buy_buttons[j].parentNode.replaceChild(elClone, buy_buttons[j]);
        buy_buttons[j].style.cursor = "default";
    }

    tree_to_show_div.style.backgroundColor = whichColor(sellingTrees[i]["specie"]["risk"]);
    tree_image.src = "frontend/img/" + whichImage(sellingTrees[i]["stage"]);
    tree_image.alt = i;

    eth_span.innerHTML = web3.utils.fromWei(prices[i].toString(), 'ether');

    buy_option_div.style.display = "flex";
    shop_div.style.opacity = 0.2;

}

function cancelOption(){

    var buy_option_div, shop_div;
    var buy_buttons;

    buy_option_div = document.getElementById("buy_options");
    shop_div = document.getElementById("shop_body");

    buy_buttons = document.getElementsByClassName("eth_value");

    for (let i=0; i<buy_buttons.length; i++){
        buy_buttons[i].addEventListener('click', buyOptions.bind(null, event, i));
        buy_buttons[i].style.cursor = "pointer";
    }
    
    buy_option_div.style.display = "none";
    shop_div.style.opacity = 1;
}

// function that actually buy the tree from the shop
async function _buyTree(shopIndex){

    var price = prices[shopIndex];
    //var treeId = shopTreeIds[shopIndex];

    try {
        var transaction = await contract.methods.buyTree(0 /*treeId*/, shopIndex).send(
            {
                from:senderAddress, 
                value: price, 
                gas: 1500000
            });
        console.log("TRANSACTION", transaction);
        alert("Tree bought!");
        showSellingTrees();
    }catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}

// CALL A METHOD OF THE BLOCKCHAIN THAT BUY THE TREE
async function buyTree(){

    var shopIndex = document.getElementById("tree_to_sell_image").alt;

    await _buyTree(shopIndex);

    cancelOption();

}

// function that go out from the buy option
function cancelNewSeed(){
    var shop_body, buy_seed_div;
    var menu_buySeed, buy_buttons;

    // divs and other elements
    buy_seed_div = document.getElementById("buy_new_seed");
    shop_body = document.getElementById("shop_body");

    // buttons
    menu_buySeed = document.getElementById("menu_buySeed");
    buy_buttons = document.getElementsByClassName("eth_value");

    buy_seed_div.style.display = "none";
    shop_body.style.opacity = 1;

    menu_buySeed.addEventListener('click', buyNewSeed);
    

    for (let i=0; i<buy_buttons.length; i++){
        buy_buttons[i].addEventListener('click', buyOptions.bind(null, event, i));
        buy_buttons[i].style.cursor = "pointer";
    }

}
