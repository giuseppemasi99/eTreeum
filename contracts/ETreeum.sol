// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

/**
 *  @title eTreeumGame
 */
contract ETreeum {

    /// @notice The originator of this contract
    address payable public minter;

    /// @notice Organization who plants real-world plants
    address payable private planter;

    enum SpeciesName {AbiesNebrodensis, AfzeliaAfricana, AloeSquarrosa, CanariumZeylanicum, PinusSylvestris, MalusDomestica, TheobromaCacao}
    enum StagesName {Seed, Bush, Adult, Majestic, Secular}
    enum ExtinctionRisk {LeastConcern, Vulnerable, CriticallyEndangered}

    uint8 private speciesLength = 7;
    uint64 private treesInTheGame = 0;

    /// @notice Maximum number of levels of rarity
    //int constant MAX_RARITY = 2; // [0 -> normal, 1-> low risk, 2 -> high risk]
    
    /// @notice price of a seed (1 finney)
    uint constant SEED_PRICE = 1e15;

    /// @notice percentage of ETH used for plant real tree
    uint8 constant PERCENTAGE_FOR_REAL_PLANT = 5;

    struct Species {
        SpeciesName specieName; // name of the specie NOTE: if we want to be able to add a specie this cannot be an enum
        ExtinctionRisk risk; // risk for the species -> determines rarity in the game
        uint16 waterNeeded; // millimeter of water
        uint8 sunNeeded; // hours of sun
    }

    struct Tree {
        Species species; // specie of the tree
        string nickname; // think about
        uint16 waterGiven; // millimeter of water given to the tree
        uint8 sunGiven; // hours of sun given to the tree
        StagesName stage; // status of the tree
        //since this can be calculated, probably better not to store it
        //uint value; // value of the tree as linear combination of stage and rarity
    }

    struct TreeOwned {
        bool isValid;
        uint64[] treeIds;
        //from identifier of the tree to the tree itself
        mapping(uint64 => Tree) trees;
    }

    Species[] private gameSpecies;

    // user_address -> user_nickname
    mapping(address => string) private userNicknames;

    // user_address -> [Tree1, Tree2, ...]
    mapping(address => TreeOwned) private ownedTrees;

    // tree_id -> tree_price
    mapping(int => int) private shop;

    modifier MustOwnTree (uint64 id) {
        require (ownsTree(msg.sender, id), "This tree isn't yours");
        _;
    }

    // event to be emitted when the free seed is planted
    event JoinedGame(address owner, Tree freePlantedTree);

    constructor() {

        minter = payable(msg.sender);

        // initialise species
        gameSpecies.push(Species(SpeciesName.AbiesNebrodensis, ExtinctionRisk.CriticallyEndangered, 1000, 10));
        gameSpecies.push(Species(SpeciesName.AfzeliaAfricana, ExtinctionRisk.Vulnerable, 1000, 10));
        gameSpecies.push(Species(SpeciesName.AloeSquarrosa, ExtinctionRisk.Vulnerable, 1000, 10));
        gameSpecies.push(Species(SpeciesName.CanariumZeylanicum, ExtinctionRisk.Vulnerable, 1000, 10));
        gameSpecies.push(Species(SpeciesName.MalusDomestica, ExtinctionRisk.LeastConcern, 1000, 10));
        gameSpecies.push(Species(SpeciesName.PinusSylvestris, ExtinctionRisk.LeastConcern, 1000, 10));
        gameSpecies.push(Species(SpeciesName.TheobromaCacao, ExtinctionRisk.LeastConcern, 1000, 10));
    }

    function joinGame(string calldata nickname) public {
        require (isNewUser(msg.sender), "You're already playing");
        ownedTrees[msg.sender].isValid = true;
        emit JoinedGame(msg.sender, plantSeed(msg.sender, nickname));
    }

    // create a new tree and assign it to the player
    // input: nickname
    // output: Tree
    function plantSeed(address player, string calldata nickname) private returns (Tree memory) {
        uint specie = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, treesInTheGame)));
        specie = specie % speciesLength;
        Tree memory t = Tree(gameSpecies[specie], nickname, 0, 0, StagesName.Seed);
        ownedTrees[player].trees[treesInTheGame] = t;
        ownedTrees[player].treeIds.push(treesInTheGame);
        treesInTheGame++;
        return t;
    }

    // change nickname of the tree
    // input: id, new_nickname
    // output: bool (success or failure)
    function renameTree(uint64 id, string calldata newNickname) public MustOwnTree(id) {
        ownedTrees[msg.sender].trees[id].nickname = newNickname;
    }

    function ownsTree(address player, uint64 id) view private returns (bool) {
        return bytes(ownedTrees[player].trees[id].nickname).length > 0;
    }

    // check if the tree is going to grow or not (and in case update the tree status)
    // input:
    // output: (new)status
    function growTree(Tree storage t) private view returns (StagesName) {
        uint8 currentStage = uint8(t.stage);
        if (currentStage < 3 && t.waterGiven == t.species.waterNeeded && t.sunGiven == t.species.sunNeeded) {
            currentStage++;
        }
        return StagesName(currentStage);
    }

    // give water to the tree
    // input: tree_id, amount_of_millimeters
    // output: (new)status
    function giveWater(uint64 id, uint16 waterAmount) public MustOwnTree(id) returns (StagesName) {
        Tree storage t = ownedTrees[msg.sender].trees[id];
        t.waterGiven += waterAmount;
        return growTree(t);
    }

    // give sun to the tree
    // input: tree_id, hours_of_sun
    // output: (new)status
    function giveSun(uint64 id, uint8 sunHours) public MustOwnTree(id) returns (StagesName) {
        Tree storage t = ownedTrees[msg.sender].trees[id];
        t.sunGiven += sunHours;
        return growTree(t);
    }

    // adding a new type of Tree
    // only the minter is able to run this method
    // input: Specie
    // output: bool (success or failure)
    // events: emit event when a new specie is added by the minter
    function addSpecie() public {
        //require(msg.sender == minter, "Only the Original Gardener can set the rules for this game");
    }

    // requires the player pays the seed price, calls the method plantSeed()
    // input: nickname
    // output: Tree
    function buySeed(string calldata nickname) public payable {
        require(msg.value >= SEED_PRICE, "Not enough money for a seed");
        planter.transfer(msg.value);
        plantSeed(msg.sender, nickname);
    }

    //Maximum value for a tree = 75 (Maximum rarity and stage);
    //Minimum 6
    function computeTreeValue(Tree storage t) view private returns (uint8) {
        uint8 value = uint8(t.species.risk) == 0 ? 50 : (uint8(t.species.risk) == 1? 15 : 5);
        value += (uint8(t.stage)+1) * 5;
        return value;
    }

    // computing the score of the user as sum of the owned trees
    // input: user_address
    // output: user_score
    function computeUserScore(address player) view public returns (uint32) {
        uint64[] storage ids = ownedTrees[player].treeIds;
        uint32 userScore = 0;
        for (uint64 i=0; i<ids.length; i++) {
            userScore += computeTreeValue(ownedTrees[player].trees[ids[i]]);
        }
        return userScore;
    }

    // compute the ranking and store it in the ranking field, by iterating on all the users
    // input:
    // output:
    // events: emit event when the ranking is going to change
    function computeRanking() public {}

    // get the ranking
    // input:
    // output: list of three users
    function getRanking() public {}

    // the new owner but the tree from the old owner
    //      (update user2trees, send the wei to the old owner)
    //      check that the tree is in the shop and msg.value == tree_price + ETH for real plant
    //      transfer tree_price to the owner of the tree and the ETH for real plant to the planter
    // input: tree_id
    // output: bool (success or failure)
    // events: emit event when the tree is sold
    function buyTree() public {}

    // store the tree in the shop field at the price given by user (check that the price is in the range of the value of the tree)
    // requires tree to be at least adult
    // input: tree_id, user_given_price
    // output: bool (success or failure)
    // events: emit event when the tree is inserted in the shop
    function addTreeToTheShop() public {}

    // check that the user is a new one or it already got the free seed
    // input:
    // output: bool (0 -> old user, 1 -> new user)
    function isNewUser(address userAddress) public view returns (bool) {
        return !ownedTrees[userAddress].isValid;
    }

    // destruct everything
    // check that the sender is the minter
    // input:
    // output:
    function selfDestruction() public {}

}