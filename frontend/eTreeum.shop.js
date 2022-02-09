$(window).on('load', function() {
    // comment this code when working with blockchain
    showSellingTrees();

});

var sellingTrees = [{"image":1, "rarity":1, "price":12, "id":1}, {"image":2, "rarity":1, "price":12, "id":2}, 
{"image":1, "rarity":2, "price":12, "id":3}, {"image":3, "rarity":1, "price":12, "id":4}, {"image":2, "rarity":0, "price":12, "id":5},
{"image":1, "rarity":0, "price":12, "id":6}, {"image":3, "rarity":1, "price":12, "id":7}, {"image":1, "rarity":2, "price":12, "id":8}]


function showSellingTrees(){
    
    var container, buy_button, cancel_button;
    var num_selling_trees = sellingTrees.length, i;
    
    var tree_row, tree_name_div, tree_div, eth, eth_value, tree_info, img, src;

    container = document.getElementById("trees_container");
    buy_button = document.getElementById("buy");
    cancel_button = document.getElementById("cancel");
    
    cancel_button.addEventListener('click', cancelOption);
    buy_button.addEventListener('click', buyTree);

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

        eth.addEventListener('click', buyOptions.bind(null, event, sellingTrees[i]["id"]));

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

//function that given a value return the type of image to show
function whichImage(value){
    switch(value){
        case 0:
            return "seed.gif";
        case 1:
            return "little_tree.gif";
        case 2:
            return "da9cc5efa7671200c3def8a880721db7.gif";
        case 3:
            return "da9cc5efa7671200c3def8a880721db7.gif";
        case 4:
            return "da9cc5efa7671200c3def8a880721db7.gif";
        default:
            return "seed.gif";
    }
}

//function that given a value return the color to show in background
function whichColor(value){
    switch(value){
        case "AbiesNebrodensis":
            return "rosybrown";
        case "CallitrisPancheri":
            return "#9400D3";
        case "AfzeliaAfricana":
            return "#b9f2ff";
        case "AloeSquarrosa":
            return "#FFD700";
        case "CanariumZeylanicum":
            return "#CD853F";
        case "PinusLatteri":
            return "#FF8C00";
        case "BaccaureaPolyneura":
            return "#C0C0C0";
        case "MalusDomestica":
            return "#CD7F32";
        case "PinusSylvestris":
            return "#87CEEB";
        case "TheobromaCacao":
            return "#E4A598";
        
        default:
            return "rosybrown";
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

function buyTree(){
    var tree_id, tree_image;

    tree_image = document.getElementById("tree_to_sell_image");

    tree_id = tree_image.alt;

    alert(tree_id);
    cancelOption();

}