// Set the contract address
var contractAddress = '0xf6CABd014fe2F29c5A5d047C1E07C902Fbd02Da8';

// Set the relative URI of the contract’s skeleton (with ABI)
var contractJSON = "build/contracts/ETreeumGame.json"

// Set the sending address
var senderAddress = '0x0';

// Set contract ABI and the contract
var contract = null;


$(window).on('load', function() {
    // comment this code when working with blockchain
    showSellingTrees();

});

var sellingTrees = [{"image":1, "rarity":1, "price":12, "id":1}, {"image":2, "rarity":1, "price":12, "id":2}, 
{"image":1, "rarity":2, "price":12, "id":3}, {"image":3, "rarity":1, "price":12, "id":4}, {"image":2, "rarity":3, "price":12, "id":5},
{"image":1, "rarity":3, "price":12, "id":6}, {"image":3, "rarity":1, "price":12, "id":7}, {"image":1, "rarity":2, "price":12, "id":8}]


function showSellingTrees(){
    var container;
    var num_selling_trees = sellingTrees.length, i;
    
    var tree_row, tree_name_div, tree_div, eth, eth_value, tree_info, img, src;

    container = document.getElementById("trees_container");

    for(i = 0; i < num_selling_trees; i++){

        src = "img/";

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

        eth.addEventListener('click', buyOptions);

        container.appendChild(tree_row);
        tree_row.appendChild(tree_name_div);
        tree_name_div.appendChild(tree_div);
        tree_name_div.appendChild(tree_info);
        tree_div.appendChild(img);
        tree_row.appendChild(eth);
        eth.appendChild(eth_value);

        tree_div.style.backgroundColor = whichColor(sellingTrees[i]["rarity"]);
        src += whichImage(sellingTrees[i]["image"]);
        img.src = src;


    }
    

}

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

function buyOptions(){
    var buy_option_div;
    var cancel_button;

    buy_option_div = document.getElementById("buy_options");
    cancel_button = document.getElementById("cancel");

    buy_option_div.style.display = "flex";

    cancel_button.addEventListener('click', cancelOption);

}

function cancelOption(){
    var buy_option_div;

    buy_option_div = document.getElementById("buy_options");

    buy_option_div.style.display = "none";
}