// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
    @title The eTreeum game
    @author F. Migliorini, G. Masi, R. Pisciuneri
*/
contract ETreeumGame is ERC721URIStorage {

    /**
        @notice Represents the possible extinction risks for a species
    */
    enum ExtinctionRisk {LeastConcern, ConservationDependent, NearThreatened, Vulnerable, Endangered, CriticallyEndangered}
    /**
        @notice Represents the possible stages for a species
    */
    enum Stages {Seed, Bush, Adult, Majestic, Secular}

    //money collected up to now to plant real trees
    uint256 private moneyToThePlanter = 0;
    /// @notice The price for a new seed 
    uint constant public SEED_PRICE = 1e15;
    //max water a player can give to a plant at once
    //JUST FOR LIVE DEMO: uint16 constant private MAX_WATER = 200;
    uint16 constant private MAX_WATER = 10000;
    //max sun a player can give to a plant at once
    ////JUST FOR LIVE DEMO: uint8 constant private MAX_SUN = 4;
    uint8 constant private MAX_SUN = 255;
    /// @notice Number of trees in the game
    uint256 public treeCounter;
    //the creator of the game
    address payable private _gardener;
    /// @notice The organization in charge of planting real trees in the world
    address payable constant public planter = payable(0xFBB311A55434A47C99700F56B7b20fC3Cb440a98);
    Species[] private gameSpecies;
    //useful to generate a random species based on their extinction risks: 0 -> 35 %, 1 -> 30 %, 2 -> 20 %, 3 -> 9 %, 4 -> 5 %, 5 -> 1%
    uint8[100] private probabilitiesDitribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5];        
    //associates each extinction risk to the species in the game; number of species in the world: about 390000 --> uint32
    mapping(ExtinctionRisk => uint32[]) private risksIndexes;
    //associates each extinction risk to its values for each stage
    mapping(ExtinctionRisk => uint8[5]) private valuesForStage;
    //associates every tokenId to its corresponding tree object
    mapping(uint256 => Tree) private trees;
    //associate each account to a player object
    mapping(address => Player) private players;
    //every account playing in the game
    address[] private playersAddresses;
    //associates every tokenId to a price in the shop
    mapping(uint256 => uint256) private shop;
    //all the tokenIds of the tree currently selling in the shop
    uint256[] private shopIds;

    /**
        @notice The object representing a species in the game    
    */
    struct Species {
        string name; 
        ExtinctionRisk risk;
        uint16 waterNeededInAWeek;
        uint8 sunNeededInAWeek;
    }

    /**
        @notice The object representing a tree in the game
    */
    struct Tree {
        Species specie;
        string nickname;
        uint16 waterGivenInAWeek;
        uint8 sunGivenInAWeek;
        Stages stage;
        uint8 value;
        uint256 startWeek;
        uint256 lastWater;
        uint256 lastSun;
    }

    /**
        @notice An object representing a player in the ranking
    */
    struct PlayerInRanking {
        string nickname;
        uint32 score;
    }

    /**
        @notice The object representing a player in the game
    */
    struct Player {
        string nickname;
        uint256[] treeOwned;
        uint256 lastEntered;
        uint32 score;
    }

    /**
        @notice Check is the caller owns a tree
        @param id The tokenId associated with the tree to check
    */
    modifier MustOwnTree(uint256 id){
        require (_ownsTree(msg.sender, id), "This tree isn't yours");
        _;
    }

    /**
        @notice Set the last entrance in the game of a player
    */
    modifier SetLastEntered(){
        players[msg.sender].lastEntered = block.timestamp;
        _;
    }

    /**
        @notice Check if the caller is the gardener
    */
    modifier MustBeGardener() {
        require(msg.sender == _gardener, "You cannot set the rules of the game");
        _;
    }

    /**
        @notice Updates the score of a player
        @param player The player whose score needs to be updated

        @dev
            Emits a {UpdatedPlayerScore} event
    */
    modifier UpdatePlayerScore(address player){
        _;
        uint32 oldScore = players[player].score;
        players[player].score = _computePlayerScore(player);
        if (oldScore != players[player].score){
            emit UpdatedPlayerScore(player, players[player].score);
        } 
    }

    /**
        @notice This event is emitted when a new player joins the game
        @param a The account of the new player
        @param id The token id of the tree given to the player
        @param tree The tree object given to the player
    */
    event JoinedGame(address a, uint256 id, Tree tree);
    /**
        @notice This event is emitted when a tree passes to the next stage
        @param a The account of the owner of the tree
        @param treeId The token id of the tree which grew
        @param t The tree object which grew
    */
    event TreeGrown(address a, uint256 treeId, Tree t);
    /**
        @notice This event is emitted when a player buys a new seed
        @param a The account of the player who bought the seed
        @param id The token id of the tree bought
        @param t The tree bought
    */
    event BoughtSeed(address a, uint256 id, Tree t);
    /**
        @notice This event is emitted when the score of a player changes
        @param a The account of the player whose score changed
        @param score The new score of the player
    */
    event UpdatedPlayerScore(address a, uint32 score);

    /// @notice Initializes the contract by setting the gardener, which is the creator of the game, and creating the initial species
    constructor() ERC721("Tree", "eT"){
        treeCounter = 0;
        _gardener = payable(msg.sender);
        addSpecies("Abies Nebrodensis", ExtinctionRisk.CriticallyEndangered, 600, 40);
        addSpecies("Callitris Pancheri", ExtinctionRisk.Endangered, 600, 40);
        addSpecies("Afzelia Africana", ExtinctionRisk.Vulnerable, 1000, 60);
        addSpecies("Aloe Squarrosa", ExtinctionRisk.Vulnerable, 5000, 100);
        addSpecies("Canarium Zeylanicum", ExtinctionRisk.Vulnerable, 600, 40);
        addSpecies("Pinus Latteri", ExtinctionRisk.NearThreatened, 1000, 50);
        addSpecies("Baccaurea Polyneura", ExtinctionRisk.ConservationDependent, 1000, 50);
        addSpecies("Malus Domestica", ExtinctionRisk.LeastConcern, 3000, 50);
        addSpecies("Pinus Sylvestris", ExtinctionRisk.LeastConcern, 600, 40);
        addSpecies("Theobroma Cacao", ExtinctionRisk.LeastConcern, 1000, 30);
        valuesForStage[ExtinctionRisk.CriticallyEndangered] = [40, 45, 55, 65, 80];
        valuesForStage[ExtinctionRisk.Endangered] = [30, 35, 45, 55, 65];
        valuesForStage[ExtinctionRisk.Vulnerable] = [25, 30, 40, 50, 60];
        valuesForStage[ExtinctionRisk.NearThreatened] = [15, 20, 30, 35, 45];
        valuesForStage[ExtinctionRisk.ConservationDependent] = [5, 10, 15, 25, 35];
        valuesForStage[ExtinctionRisk.LeastConcern] = [1, 5, 10, 15, 25];
    }

    /// @dev Base URI for computing {tokenURI}
    function _baseURI() override internal view virtual returns (string memory) {
        return "../utils/json/";
    }

    /**
        @notice Add a new species to the game
        @param speciesName The name of the new species
        @param risk The ExtinctionRisk of the new species
        @param waterNeeded The millimiters of water the new species neeeds in a week 
        @param sunNeeded The hours of sun the new species needs in a week

        @dev
            Requirements:
            - The caller must be the gardener
            - The speciesName cannot be empty
            - In the game there cannot already be a species with the speciesName given
    */
    function addSpecies(string memory speciesName, ExtinctionRisk risk, uint16 waterNeeded, uint8 sunNeeded) MustBeGardener() public {
        require(bytes(speciesName).length > 0, "The name cannot be empty");
        require(!_existsSpecies(speciesName), "This species already exists");
        gameSpecies.push(Species(speciesName, risk, waterNeeded, sunNeeded));
        risksIndexes[risk].push(uint32(gameSpecies.length -1));
    }

    /**
        @notice Change the Extinction Risk of a species, if it is in the game
        @param speciesName The name of the species
        @param newRisk The new ExtinctionRisk for the species

        @dev
            Requirements:
            - The caller must be the gardener of this game
    */
    function changeExtinctionRisk(string calldata speciesName, ExtinctionRisk newRisk) MustBeGardener() public {
        for(uint8 i=0; i<gameSpecies.length; i++) {
            if (keccak256(bytes(gameSpecies[i].name)) == keccak256(bytes(speciesName))) {
                gameSpecies[i].risk = newRisk;
            }
        }
    }

    //check if a species already exists in the game
    function _existsSpecies(string memory speciesName) view private returns (bool) {
        for(uint8 i=0; i<gameSpecies.length; i++) {
            if (keccak256(bytes(gameSpecies[i].name)) == keccak256(bytes(speciesName))) return true;
        }
        return false;
    }

    /**
        @notice Change the values associated to an ExtinctionRisk
        @param risk The ExtinctionRisk to update
        @param values The new values for the ExtinctionRisk

        @dev
            Requirements:
            - The caller must be the gardener of this game
    */
    function changeValuesForStage(ExtinctionRisk risk, uint8[5] calldata values) MustBeGardener() public {
        valuesForStage[risk] = values;
    }

    /**
        @notice Lets a new player join the game
        @param userNickname The nickname associated to the new player
        @param treeNickname The nickname for the free tree given to the player

        @dev
            Requirements:
            - The caller cannot be already a player in the game
            
            Emits a {JoinedGame} event
    */
    function joinGame(string calldata userNickname, string calldata treeNickname) SetLastEntered public {
        require (isNewUser(msg.sender), "You're already playing");
        players[msg.sender].nickname = bytes(userNickname).length > 0 ? userNickname : "Player"; 
        playersAddresses.push(msg.sender);
        (uint256 id, Tree memory t) = _plantSeed(msg.sender, treeNickname);
        emit JoinedGame(msg.sender, id, t);
    }

    /**
        @notice Check if an account is not a player in the game
        @param playerAddress The account to check
        @return True if the account is not a player, False otherwise
    */
    function isNewUser(address playerAddress) public view returns (bool) {
        return !(bytes(players[playerAddress].nickname).length > 0);
    }

    /**
        @notice Get all the trees owned by a player
        @param playerAddress The player whose tree are requested
        @return The tokenIds associated to the trees of the player
        @return The trees of the player

        @dev
            Requirements:
            -The playerAddress must already be a player in the game
    */
    function getPlayerTrees(address playerAddress) public view returns (uint256[] memory, Tree[] memory) {
        require (!isNewUser(playerAddress), "This user is not playing yet");
        uint256[] memory treeIds = players[playerAddress].treeOwned;
        Tree[] memory playerTrees = new Tree[](treeIds.length);
        for (uint i=0; i<treeIds.length; i++) {
            playerTrees[i] = trees[treeIds[i]];
        }
        return (treeIds, playerTrees);
    }

    /**
        @notice Get a single tree
        @param treeId The tokenId of the tree requested
        @return The tree object requested

        @dev
            Requirements:
            -There must exist a tree with the given treeId in the game
    */
    function getTree(uint256 treeId) public view returns (Tree memory) {
        require(ERC721._exists(treeId), "This tree doesn't exist");
        return trees[treeId];
    }

    //Mints a new tree with a random species and associates it to the owner
    function _plantSeed(address owner, string calldata nickname) UpdatePlayerScore(owner) private returns (uint256 id, Tree memory) {
        uint256 treeId = treeCounter;
        _safeMint(owner, treeId);
        uint random = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, treeCounter)));
        ExtinctionRisk risk = ExtinctionRisk(probabilitiesDitribution[random % 100]);
        uint32[] memory speciesAtRisk = risksIndexes[risk];
        uint32 speciesIndex = speciesAtRisk[random % speciesAtRisk.length];
        Tree memory t = Tree(gameSpecies[speciesIndex], nickname, 0, 0, Stages.Seed, _getTreeValue(risk, Stages.Seed), 0, 0, 0);
        trees[treeId] = t;
        players[owner].treeOwned.push(treeId);
        _setTokenURI(treeId, string(abi.encodePacked("Seed/", gameSpecies[speciesIndex].name, ".json")));
        treeCounter = treeCounter + 1;
        return (treeId, t);
    }

    //Returns the name of a stage
    function _getStageName(Stages stage) pure private returns (string memory) {
        if (stage == Stages.Seed) return "Seed";
        if (stage == Stages.Bush) return "Bush";
        if (stage == Stages.Adult) return "Adult";
        if (stage == Stages.Majestic) return "Majestic";
        if (stage == Stages.Secular) return "Secular";
        return "";
    }

    //Check if a player owns a tree
    function _ownsTree(address player, uint256 id) view private returns (bool) {
        return ERC721.ownerOf(id) == player;
    }

    /**
        @notice Changes the nickname associated to a tree
        @param id The tokenId of the tree
        @param newNickname The new nickname for the player

        @dev
            Requirements:
            -The caller must own the tree
    */
    function renameTree(uint64 id, string calldata newNickname) MustOwnTree(id) public {
        trees[id].nickname = newNickname;
    }

    //Check if a tree must grow and in this case it makes it grow
    function _growTree(uint256 id, Tree storage t) private {
        if (t.stage != Stages.Secular && t.waterGivenInAWeek >= t.specie.waterNeededInAWeek && t.sunGivenInAWeek >= t.specie.sunNeededInAWeek) {
            t.stage = Stages(uint8(t.stage)+1);
            t.value = _getTreeValue(t.specie.risk, t.stage);
            t.waterGivenInAWeek = 0;
            t.sunGivenInAWeek = 0;
            players[msg.sender].score = _computePlayerScore(msg.sender);
            _setTokenURI(id, string(abi.encodePacked(_getStageName(t.stage), "/", t.specie.name, ".json")));
            emit UpdatedPlayerScore(msg.sender, players[msg.sender].score);
            emit TreeGrown(ERC721.ownerOf(id), id, t);
        }
    }

    /**
        @notice Gives water to a tree
        @param id The tokenId of the tree to water
        @param waterAmount The millimiters of water to give to the tree

        @dev
            Requirements:
            -The caller must own the tree
            -The waterAmount cannot exceed the maximum allowed
            -Six hours must be passed since the last time the tree was watered

            Emits a {UpdatedPlayerScore} event
            Emits a {TreeGrown} event
    */
    function giveWater(uint256 id, uint16 waterAmount) MustOwnTree(id) SetLastEntered public {
        require(waterAmount <= MAX_WATER, "Too much water");
        Tree storage t = trees[id];
        //JUST FOR LIVE DEMO: require(t.lastWater < block.timestamp -6 hours, "You watered this plant not so long ago");
        require(t.lastWater < block.timestamp -1 minutes, "You watered this plant not so long ago");
        if (t.startWeek > block.timestamp -1 weeks) {
            t.waterGivenInAWeek += waterAmount;
            _growTree(id, t);
        }
        else {
            t.startWeek = block.timestamp;
            t.waterGivenInAWeek = waterAmount;
            t.sunGivenInAWeek = 0;
        }
        t.lastWater = block.timestamp;
    }

    /**
        @notice Gives sun to a tree
        @param id The tokenId of the tree
        @param sunHours The hours of sun to give to the tree

        @dev
            Requirements:
            -The caller must own the tree
            -The sunHours cannot exceed the maximum allowed
            -Six hours must be passed since the last time the tree was exposed to the sun

            Emits a {UpdatedPlayerScore} event
            Emits a {TreeGrown} event
    */
    function giveSun(uint64 id, uint8 sunHours) MustOwnTree(id) SetLastEntered public {
        require(sunHours <= MAX_SUN, "Too much sun");
        Tree storage t = trees[id];
        //require(t.lastSun < block.timestamp -6 hours, "You exposed this plant to the sun not so long ago");
        require(t.lastSun < block.timestamp -1 minutes, "You exposed this plant to the sun not so long ago");
        if (t.startWeek > block.timestamp -1 weeks) {
            t.sunGivenInAWeek += sunHours;
            _growTree(id, t);
        }
        else {
            t.startWeek = block.timestamp;
            t.sunGivenInAWeek = sunHours;
            t.waterGivenInAWeek = 0;
        }
        t.lastSun = block.timestamp;
    }

    /**
        @notice Lets a player buy a new tree
        @param treeNickname The nickname for the new tree

        @dev
            Requirements:
            -The value sent must be at least equal to the seed price
    */
    function buySeed(string calldata treeNickname) SetLastEntered public payable {
        require(msg.value >= SEED_PRICE, "Not enough money for a seed");
        planter.transfer(msg.value);
        moneyToThePlanter += msg.value;
        _plantSeed(msg.sender, treeNickname);
    }

    /**
        @notice Lets a player put one of his tree on the shop
        @param treeId The tokenId of the tree to be sold
        @param price The price at which the tree will be sold

        @dev
            Requirements:
            -The caller must own the tree
            -The tree must be at least Adult to be sold
            -The price cannot be 0
            -The tree cannot be already in the shop
    */
    function sellTree(uint256 treeId, uint256 price) SetLastEntered public {
        _checkSelling(treeId, price);
        require(checkNotInShop(treeId), "This tree is already in the shop");
        shop[treeId] = price;
        shopIds.push(treeId);
    }

    /**
        @notice Check if a tree is not for sale in the shop
        @param treeId The tokenId of the tree which must be checked
        @return True if the tree is not in the shop, False otherwise
    */
    function checkNotInShop(uint256 treeId) view public returns (bool) {
        return shop[treeId] == 0;
    }

    /**
        @notice Let a player change the price of a tree in the shop
        @param treeId The tokenId of the tree
        @param newPrice The new price for the tree
        
        @dev
            Requirements:
            -The caller must own the tree
            -The tree must be at least Adult to be sold
            -The price cannot be 0
            -The tree must be in the shop

    */
    function changePrice(uint256 treeId, uint256 newPrice) SetLastEntered public {
        _checkSelling(treeId, newPrice);
        require(!checkNotInShop(treeId), "This tree is not in the shop");
        shop[treeId] = newPrice;
    }

    //Check the requirements to put a tree in the shop
    function _checkSelling(uint256 treeId, uint256 price) MustOwnTree(treeId) view private {
        Tree memory t = trees[treeId];
        require(uint8(t.stage) >= 2, "This tree isn't old enough for selling it");
        require(price != 0, "The price cannot be 0");
    }

    //Returns the index of the tree in the player's owned trees
    function _getOwnerIndex(uint256 treeId, address player) view private returns (uint256 index) {
        for (uint256 i; i<players[player].treeOwned.length; i++) {
            if (players[player].treeOwned[i] == treeId) {
                return i;
            }
        }
    }

    /**
        @notice Lets a player buy a tree from the shop
        @param treeId The tokenId of the tree to be bought
        @param shopIndex The index of the tree in the shopIds

        @dev
            Requirements:
            -The caller cannot be the owner of the tree
            -The tree must be up for sale in the shop
            -The id at shopIndex in shopIds must equal treeId
            -The value sent must be at least the price of the tree in the shop plus its value expressed in finney
    */
    function buyTree(uint256 treeId, uint256 shopIndex) SetLastEntered public payable  {
        require(!_ownsTree(msg.sender, treeId), "You can't buy your own trees");
        require(!checkNotInShop(treeId), "This tree is not up for sale");
        require(shopIds[shopIndex] == treeId, "You are selecting the wrong tree");
        uint256 price = shop[treeId];
        uint256 commission = trees[treeId].value * 1e15;
        require(msg.value >= price + commission, "You are not paying enough");
        address oldOwner = ERC721.ownerOf(treeId);
        uint256 oldOwnerIndex = _getOwnerIndex(treeId, oldOwner);
        planter.transfer(commission);
        moneyToThePlanter += commission;
        payable(oldOwner).transfer(msg.value - commission);
        _afterSelling(oldOwner, msg.sender, treeId, shopIndex, oldOwnerIndex);
    }

    //Completes the aftermath of a sell by setting the right indexes in the arrays and the right mappings
    function _afterSelling(address oldOwner, address newOwner, uint256 treeId, uint256 shopIndex, uint256 oldOwnerIndex) UpdatePlayerScore(newOwner) UpdatePlayerScore(oldOwner) private {
        shop[treeId] = 0;
        shopIds[shopIndex] = shopIds[shopIds.length -1];
        shopIds.pop();
        players[oldOwner].treeOwned[oldOwnerIndex] = players[oldOwner].treeOwned[players[oldOwner].treeOwned.length -1];
        players[oldOwner].treeOwned.pop();
        players[msg.sender].treeOwned.push(treeId);
        ERC721._transfer(oldOwner, newOwner, treeId);
    }

    /**
        @notice Gets all the trees currently in the shop
        @return The tokenIds of the trees
        @return The trees in the shop
        @return The prices of the trees
        @return The owners of the tress
    */
    function getShop() view public returns (uint256[] memory, Tree[] memory, uint256[] memory, address[] memory){
        Tree[] memory treesInShop = new Tree[](shopIds.length);
        uint256[] memory prices = new uint256[](shopIds.length);
        address[] memory owners = new address[](shopIds.length);
        for (uint256 i=0; i<shopIds.length; i++) {
            treesInShop[i] = trees[shopIds[i]];
            prices[i] = shop[shopIds[i]];
            owners[i] = ERC721.ownerOf(shopIds[i]);
        }
        return (shopIds, treesInShop, prices, owners);
    }

    //Get the value associated to a risk and a stage
    function _getTreeValue(ExtinctionRisk risk, Stages stage) view private returns (uint8) {
        return valuesForStage[risk][uint8(stage)];
    }

    /**
        @notice Gets the info of a player to be displayed
        @param player The account of the player
        @return The nickname of the player
        @return The score of the player

        @dev
            Requirements:
            -The player must already be playing in the game
    */
    function getPlayerInfo(address player) view public returns (string memory, uint32) {
        require (!isNewUser(player), "This user is not playing yet");
        return (players[player].nickname, players[player].score);
    }

    //Computes the score of a player
    function _computePlayerScore(address player) view private returns (uint32) {
        uint256[] storage ids = players[player].treeOwned;
        uint32 score = 0;
        for (uint64 i=0; i<ids.length; i++) {
            score += trees[ids[i]].value;
        }
        return score;
    }

    /**
        @notice Gets the ranking
        @return The list of all the players with their score
    */
    function getScores() view public returns (PlayerInRanking[] memory){
        PlayerInRanking[] memory playerScores = new PlayerInRanking[](playersAddresses.length);
        for (uint i=0; i<playersAddresses.length; i++) {
            Player memory p = players[playersAddresses[i]];
            playerScores[i] = PlayerInRanking(p.nickname, p.score);
        }
        return playerScores;
    }

    /**
        @notice Gets an estimate of the real trees planted in the world
        @return An estimate of the trees planted
    */
    function getPlantedTreesInTheWorld() view public returns (uint256) {
        return moneyToThePlanter / (8 * 1e15); // about 20 euros
    }

}
