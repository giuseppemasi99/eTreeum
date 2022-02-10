var isNewUser;

$(window).on('load', async function() {
    // comment this code when working with blockchain
    await initialise();
    if (isNewUser == undefined) isNewUser = await contract.methods.isNewUser(senderAddress).call({from:senderAddress, gas: 1200000});

    if(isNewUser){
        window.location.href = "./index.html";
    }else{
        showSellingTrees();
    }

});


function subscribeToAllEvents(){

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

// sostituire con getShop
var sellingTrees = [{"image":1, "rarity":1, "price":12, "id":1}, {"image":2, "rarity":1, "price":12, "id":2}, 
{"image":1, "rarity":2, "price":12, "id":3}, {"image":3, "rarity":1, "price":12, "id":4}, {"image":2, "rarity":0, "price":12, "id":5},
{"image":1, "rarity":0, "price":12, "id":6}, {"image":3, "rarity":1, "price":12, "id":7}, {"image":1, "rarity":2, "price":12, "id":8}]

// AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
//      farsi restituire i tree in vendita
// AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

async function showSellingTrees(){

    await getPlayer();

    subscribeToAllEvents();
    
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

        tree_info = document.createTextNode("alberello");
        eth_value = document.createTextNode(sellingTrees[i]["price"]+" ETH");

        tree_name_div.className = "tree_logo_name";
        tree_row.className = "tree_row";
        tree_div.className = "tree_logo";
        img.className = "tree_img";
        eth.className = "eth_value";
        eth.id = sellingTrees[i]["id"];

        eth.addEventListener('click', buyOptions.bind(null, event, sellingTrees[i]["id"]));

        container.appendChild(tree_row);
        tree_row.appendChild(tree_name_div);
        tree_name_div.appendChild(tree_div);
        tree_name_div.appendChild(tree_info);
        tree_div.appendChild(img);
        tree_row.appendChild(eth);
        eth.appendChild(eth_value);

        // PER PEPPOZ, UNA VOLTA RESTITUITI I TREE IN VENDITA METTI 
        // "sellingTree[i]["specie"]["risk"]" al posto di sellingTrees[i]["rarity"] e
        // "sellingTree[i]["stage"]" al posto di sellingTrees[i]["image"]
        tree_div.style.backgroundColor = whichColor(sellingTrees[i]["rarity"]);
        src += whichImage(sellingTrees[i]["image"]);
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

function buyOptions(event, value){
    var buy_option_div, shop_div, tree_to_show_div, tree_image;
    var buy_buttons;

    // in base a questa mostro l'immagine carina

    buy_option_div = document.getElementById("buy_options");
    shop_div = document.getElementById("shop_body");
    tree_to_show_div = document.getElementById("tree_to_sell");
    tree_image = document.getElementById("tree_to_sell_image");

    buy_buttons = document.getElementsByClassName("eth_value");

    for (let i=0; i<buy_buttons.length; i++){
        var elClone = buy_buttons[i].cloneNode(true);
        buy_buttons[i].parentNode.replaceChild(elClone, buy_buttons[i]);
        buy_buttons[i].style.cursor = "default";
    }

    tree_to_show_div.style.backgroundColor = whichColor(sellingTrees[value-1]["rarity"]);
    tree_image.src = "img/" + whichImage(sellingTrees[value-1]["image"]);
    tree_image.alt = value;

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
        buy_buttons[i].addEventListener('click', buyOptions.bind(null, event, sellingTrees[i]["id"]));
        buy_buttons[i].style.cursor = "pointer";
    }

    buy_option_div.style.display = "none";
    shop_div.style.opacity = 1;
}

// CALL A METHOD OF THE BLOCKCHAIN THAT BUY THE TREE
function buyTree(){
    
    var tree_id, tree_image;

    tree_image = document.getElementById("tree_to_sell_image");

    tree_id = tree_image.alt;

    alert(tree_id);
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
        buy_buttons[i].addEventListener('click', buyOptions.bind(null, event, sellingTrees[i]["id"]));
        buy_buttons[i].style.cursor = "pointer";
    }

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
    }
    catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}
