var isNewUser;

var sellingTrees = Array();
var prices = Array();
var shopIds = Array();
var owners = Array();

$(window).on('load', async function() {
    // comment this code when working with blockchain
    await initialise();

    if (isNewUser == undefined) isNewUser = await contract.methods.isNewUser(senderAddress).call({from:senderAddress, gas: 1200000});

    if(isNewUser){
        window.location.href = "./index.html";
    }else{
        showSellingTrees();
        subscribeToUpdatedPlayerScore();
    }

});


async function getShopTrees(){
    let ret = await contract.methods.getShop().call({from:senderAddress, gas: 1500000});
    // ret = (shopIds, treesInShop, prices, owners)
    shopIds = ret[0];
    sellingTrees = ret[1];
    prices = ret[2];
    owners = ret[3];
    // console.log(sellingTrees);
    // console.log(prices);
    // console.log(shopIds);
    // console.log(owners);
}

async function showSellingTrees(){

    await getPlayer();
    await getShopTrees();

    var container, buy_button, cancel_button, cancel_change_button, submit_change_button;
    var num_selling_trees = sellingTrees.length, i;
    
    var tree_row, tree_name_div, tree_div, eth, eth_value, tree_info, img, src, eth_div;
    var menu_buy_seed, cancel_seed_button, buy_seed_button;

    container = document.getElementById("trees_container");

    while(container.lastElementChild){
        container.removeChild(container.lastElementChild);
    }

    buy_button = document.getElementById("buy");
    cancel_button = document.getElementById("cancel");
   
    cancel_seed_button = document.getElementById("cancel_newSeed");
    buy_seed_button = document.getElementById("buy_seed_button");
    menu_buy_seed = document.getElementById("menu_buySeed");

    cancel_change_button = document.getElementById("cancel_change_value");
    submit_change_button = document.getElementById("change_price_value");
    
    menu_buy_seed.addEventListener('click', buyNewSeed);
    cancel_seed_button.addEventListener('click', cancelNewSeed);
    buy_seed_button.addEventListener('click', buySeed);

    cancel_button.addEventListener('click', cancelOption);
    buy_button.addEventListener('click', buyTree);

    cancel_change_button.addEventListener('click', cancelChangePrice);
    submit_change_button.addEventListener('click', changePrice);


    for(i = 0; i < num_selling_trees; i++){

        //src = "frontend/img/";

        tree_row = document.createElement("div");
        tree_name_div = document.createElement("div");
        tree_div = document.createElement("div");
        img = document.createElement("img");
        eth_div = document.createElement("div");
        eth = document.createElement("span");

        let s = sellingTrees[i]['nickname'] + ': ' + whichStage(sellingTrees[i]["stage"]) + ', ' + sellingTrees[i]["specie"]["name"] + ' - Risk: ' + whichRisk(sellingTrees[i]["specie"]["risk"]);
        tree_info = document.createTextNode(s);
        eth_value = document.createTextNode(web3.utils.fromWei(prices[i].toString(), 'ether') + " ETH");
        
        tree_name_div.className = "tree_logo_name";
        tree_row.className = "tree_row";
        tree_div.className = "tree_logo";
        img.className = "tree_img";
        eth.className = "eth_value";
        eth.id = "id" + i;

        container.appendChild(tree_row);
        tree_row.appendChild(tree_name_div);
        tree_name_div.appendChild(tree_div);
        tree_name_div.appendChild(tree_info);
        tree_div.appendChild(img);
        tree_row.appendChild(eth_div);
        
        eth_div.appendChild(eth);        
        eth.appendChild(eth_value);

        if(owners[i] == senderAddress){
            
            var change_value, image;

            change_value = document.createElement("span");
            image = document.createElement("img");
            image.src = "frontend/img/edit.png";
            image.width = "15";
            
            change_value.className = "change_value";
            change_value.id = "id" + i;
            
            eth_div.appendChild(change_value);
            change_value.appendChild(image);
            
            change_value.addEventListener('click', clickChangePrice.bind(null, event, i));
            eth.style.cursor = "default";
            eth.style.opacity = 0.2;
            
        }else{
            eth.addEventListener('click', buyOptions.bind(null, event, i));
        }

        info = await getTreeInfo(shopIds[i]);
        //src += whichImage(sellingTrees[i]["stage"]);
        img.src = info.image;

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

        let k = 0;

        let elClone = buy_buttons[i].cloneNode(true);
        buy_buttons[i].parentNode.replaceChild(elClone, buy_buttons[i]);
        buy_buttons[i].style.cursor = "default";

        if(owners[i] == senderAddress){

            let elClone = change_price_buttons[k].cloneNode(true);
            change_price_buttons[k].parentNode.replaceChild(elClone, change_price_buttons[k]);
            change_price_buttons[k].style.cursor = "default";

            k += 1;
        }
    }

}

async function buyOptions(event, treeIndex){
    
    var buy_option_div, shop_div, tree_image, eth_span;
    var buy_buttons, change_price_buttons, menu_buySeed;

    buy_option_div = document.getElementById("buy_options");
    shop_div = document.getElementById("shop_body");
    tree_image = document.getElementById("tree_to_sell_image");
    eth_span = document.getElementById("buy_options_eth");

    menu_buySeed = document.getElementById("menu_buySeed");
    buy_buttons = document.getElementsByClassName("eth_value");
    change_price_buttons = document.getElementsByClassName("change_value")

    menu_buySeed.removeEventListener('click', buyNewSeed);

    for (let i=0; i<buy_buttons.length; i++){

        let k = 0;

        let elClone = buy_buttons[i].cloneNode(true);
        buy_buttons[i].parentNode.replaceChild(elClone, buy_buttons[i]);
        buy_buttons[i].style.cursor = "default";

        if(owners[i] == senderAddress){

            let elClone = change_price_buttons[k].cloneNode(true);
            change_price_buttons[k].parentNode.replaceChild(elClone, change_price_buttons[k]);
            change_price_buttons[k].style.cursor = "default";

            k += 1;
        }
    }

    info = await getTreeInfo(shopIds[treeIndex]);
    tree_image.src = info.image;
    //tree_image.src = "frontend/img/" + whichImage(sellingTrees[treeIndex]["stage"]);

    document.getElementById('buy').value = treeIndex;

    eth_span.innerHTML = web3.utils.fromWei(prices[treeIndex].toString(), 'ether');

    buy_option_div.style.display = "flex";
    shop_div.style.opacity = 0.2;

}

function cancelOption(){

    var buy_option_div, shop_div;
    var buy_buttons, menu_buySeed, change_price_buttons;

    buy_option_div = document.getElementById("buy_options");
    shop_div = document.getElementById("shop_body");

    menu_buySeed = document.getElementById("menu_buySeed");    
    buy_buttons = document.getElementsByClassName("eth_value");
    change_price_buttons = document.getElementsByClassName("change_value")

    menu_buySeed.addEventListener('click', buyNewSeed);

    for (let i=0; i<buy_buttons.length; i++){
        
        let k = 0;

        if(owners[i] == senderAddress){
            change_price_buttons[k].addEventListener('click', clickChangePrice.bind(null, event, i));
            change_price_buttons[k].style.cursor = "pointer";
            k += 1;
        }else{
            buy_buttons[i].addEventListener('click', buyOptions.bind(null, event, i));
            buy_buttons[i].style.cursor = "pointer";
        }
    }

    
    buy_option_div.style.display = "none";
    shop_div.style.opacity = 1;
}

// function that actually buy the tree from the shop
async function _buyTree(shopIndex){

    var price = prices[shopIndex];
    var treeId = shopIds[shopIndex];

    let fee = web3.utils.toWei(sellingTrees[shopIndex].value, 'finney');
    
    price = (parseInt(price) + parseInt(fee)).toString();

    try {
        var transaction = await contract.methods.buyTree(treeId, shopIndex).send(
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

async function buyTree(){

    var shopIndex = document.getElementById('buy').value;

    await _buyTree(shopIndex);

    cancelOption();

}

// function that go out from the buy option
function cancelNewSeed(){
    var shop_body, buy_seed_div;
    var menu_buySeed, buy_buttons, change_price_buttons;

    // divs and other elements
    buy_seed_div = document.getElementById("buy_new_seed");
    shop_body = document.getElementById("shop_body");

    // buttons
    menu_buySeed = document.getElementById("menu_buySeed");
    buy_buttons = document.getElementsByClassName("eth_value");
    change_price_buttons = document.getElementsByClassName("change_value")

    buy_seed_div.style.display = "none";
    shop_body.style.opacity = 1;

    menu_buySeed.addEventListener('click', buyNewSeed);
    

    for (let i=0; i<buy_buttons.length; i++){

        let k = 0;

        if(owners[i] == senderAddress){
            change_price_buttons[k].addEventListener('click', clickChangePrice.bind(null, event, i));
            change_price_buttons[k].style.cursor = "pointer";
            k += 1;
        }else{
            buy_buttons[i].addEventListener('click', buyOptions.bind(null, event, i));
            buy_buttons[i].style.cursor = "pointer";
        }
    }

}

// function that open the div that allow you to change the price value of a tree
function clickChangePrice(event, treeIndex){
    var shop_body, change_price_value_div;

    var menu_buySeed, buy_buttons, change_price_buttons;

    document.getElementById('change_price_value').value = treeIndex;

    shop_body = document.getElementById("shop_body");
    change_price_value_div = document.getElementById("change_price_value_div");

    menu_buySeed = document.getElementById("menu_buySeed");
    buy_buttons = document.getElementsByClassName("eth_value");
    change_price_buttons = document.getElementsByClassName("change_value");

    change_price_value_div.style.display = "flex";
    shop_body.style.opacity = 0.2;

    menu_buySeed.removeEventListener('click', buyNewSeed);
    
    for (let i=0; i<buy_buttons.length; i++){
        
        let k = 0;

        let elClone = buy_buttons[i].cloneNode(true);
        buy_buttons[i].parentNode.replaceChild(elClone, buy_buttons[i]);
        buy_buttons[i].style.cursor = "default";

        if(owners[i] == senderAddress){
            let elClone = change_price_buttons[k].cloneNode(true);
            change_price_buttons[k].parentNode.replaceChild(elClone, change_price_buttons[k]);
            change_price_buttons[k].style.cursor = "default";

            k += 1;
        }

    }

}

// function that actually change the price of the tree in the shop
async function _changePrice(treeId, new_price){

    try{
        new_price = web3.utils.toWei(new_price, 'ether');
    }catch(e){
        alert("Please, enter a number!");
        return;
    }

    try {
        var transaction = await contract.methods.changePrice(treeId, new_price).send(
            {
                from:senderAddress, 
                gas: 1500000
            });
        console.log("TRANSACTION", transaction);
        alert("Price changed!");
    }catch(e) {
        var errorMessage = getErrorMessage(e.message);
        alert("Something went wrong: " + errorMessage);
    }

}

// function that effectively change the tree price value
async function changePrice(){

    var new_price = document.getElementById('new_eth_input').value;
    document.getElementById('new_eth_input').value = "";

    var treeIndex = document.getElementById('change_price_value').value;

    await _changePrice(shopIds[treeIndex], new_price);

    var change_price_value_div, shop_div;
    change_price_value_div = document.getElementById("change_price_value_div");
    shop_div = document.getElementById("shop_body");
    change_price_value_div.style.display = "none";
    shop_div.style.opacity = 1;

    showSellingTrees();

}

// function that go out from the div that allow you to change the price value
function cancelChangePrice(){

    var change_price_value_div, shop_div;
    var buy_buttons, change_price_buttons;

    change_price_value_div = document.getElementById("change_price_value_div");
    shop_div = document.getElementById("shop_body");

    buy_buttons = document.getElementsByClassName("eth_value");
    change_price_buttons = document.getElementsByClassName("change_value")

    for (let i=0; i<buy_buttons.length; i++){

        let k = 0;

        if(owners[i] == senderAddress){
            change_price_buttons[k].addEventListener('click', clickChangePrice.bind(null, event, i));
            change_price_buttons[k].style.cursor = "pointer";
            k += 1;
        }else{
            buy_buttons[i].addEventListener('click', buyOptions.bind(null, event, i));
            buy_buttons[i].style.cursor = "pointer";
        }

    }
    
    change_price_value_div.style.display = "none";
    shop_div.style.opacity = 1;
}
