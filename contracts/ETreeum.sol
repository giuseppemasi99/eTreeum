// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

contract ETreeum {

    /** The originator of this contract */
    address payable public minter;

    // organization who plants real-world plants
    address payable private planter;

    enum SpeciesNames = {specie1, specie2, ...};
    enum StagesNames = {Seed, Ok, Good, ...};

    constant int MAX_RARITY = 2; // maximum number of levels of rarity [0 -> normal, 1-> low risk, 2 -> high risk]
    constant int SEED_PRICE = 150; // price of a seed
    constant int PERCENTAGE_FOR_REAL_PLANT = 5; // percentage of ETH used for plant real tree

    struct Specie {
        int rarity; // level of rarity
        SpeciesNames specieName; // name of the specie
        int waterNeeded; // millimeter of water
        int sunNeeded; // hours of sun
    }

    struct Tree {
        Specie specie; // specie of the tree among Species
        int id; // identifier of the tree
        string nickname; // think about
        int waterGiven; // millimeter of water given to the tree
        int sunGiven; // hours of sun given to the tree
        StagesNames stage; // status of the tree
        int value; // value of the tree as linear combination of stage and rarity
    }

    private Specie[] species;

    // user_address -> user_nickname
    private mapping(address => string) address2nickname;

    // user_address -> [Tree1, Tree2, ...]
    private mapping(address => Tree[]) user2trees;

    // tree_id -> tree_price
    private mapping(int => int) shop;

    constructor() {

        minter = payable(msg.sender);

        // initialise species

    }

    // create a new tree and store it in the user2trees mapping
    // input: nickname
    // output: Tree
    function plantSeed(){}

    // change nickname of the tree
    // input: new_nickname
    // output: bool (success or failure)
    function renameTree(){}

    // check if the tree is going to grow or not (and eventually update the tree status)
    // input:
    // output: (new)status
    function growTree(){}

    // give water to the tree
    // input: tree_id, amount_of_millimeters
    // output: (new)status
    function giveWater(){}

    // give sun to the tree
    // input: tree_id, hours_of_sun
    // output: (new)status
    function giveSun(){}

    // adding a new type of Tree
    // only the minter is able to run this method
    // input: Specie
    // output: bool (success or failure)
    // events: emit event when a new specie is added by the minter
    function addSpecie(){}

    // create a new tree and store it in the user2trees mapping
    // this method requires some weis and then call the method plantSeed()
    // input: nickname
    // output: Tree
    function buySeed(){}

    // computing the score of the user as sum of the owned trees
    // input: user_address
    // output: user_score
    function computeUserScore(){}

    // compute the ranking and store it in the ranking field, by iterating on all the users
    // input:
    // output:
    // events: emit event when the ranking is going to change
    function computeRanking(){}

    // get the ranking
    // input:
    // output: list of three users
    function getRanking(){}

    // the new owner but the tree from the old owner
    //      (update user2trees, send the wei to the old owner)
    //      check that the tree is in the shop and msg.value == tree_price + ETH for real plant
    //      transfer tree_price to the owner of the tree and the ETH for real plant to the planter
    // input: tree_id
    // output: bool (success or failure)
    // events: emit event when the tree is sold
    function buyTree(){}

    // store the tree in the shop field at the price given by user (check that the price is in the range of the value of the tree)
    // input: tree_id, user_given_price
    // output: bool (success or failure)
    // events: emit event when the tree is inserted in the shop
    function sellTree(){}

    // destruct everything
    // check that the sender is the minter
    // input:
    // output:
    function selfDestruction(){}

}
