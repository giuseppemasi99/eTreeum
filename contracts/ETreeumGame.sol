// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ETreeumGame is ERC721URIStorage {

    enum ExtinctionRisk {LeastConcern, ConservationDependent, NearThreatened, Vulnerable, Endangered, CriticallyEndangered}
    enum Stages {Seed, Bush, Adult, Majestic, Secular}

    uint256 private moneyToThePlanter = 0;
    uint constant public SEED_PRICE = 1e15; // SEED_PRICE costa 1 finney
    uint16 constant MAX_WATER = 200;
    uint8 constant MAX_SUN = 4;
    uint256 public treeCounter;
    address payable private _gardener;
    //fake address
    address payable constant public planter = payable(0xFBB311A55434A47C99700F56B7b20fC3Cb440a98);
    Species[] private gameSpecies;
    // 0 -> 35 %
    // 1 -> 30 %
    // 2 -> 20 %
    // 3 -> 9 %
    // 4 -> 5 %
    // 5 -> 1%
    uint8[100] private probabilitiesDitribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5];        
    //number of species in the world: about 390000 --> uint32
    mapping(ExtinctionRisk => uint32[]) private risksIndexes;
    mapping(ExtinctionRisk => uint8[5]) private valuesForStage;
    mapping(uint256 => Tree) trees;
    mapping(address => string) private userNicknames;
    mapping(address => Player) private players;
    address[] private playersAddresses;
    mapping(uint256 => uint256) private shop;
    uint256[] private shopIds;

    struct Species {
        string name; 
        ExtinctionRisk risk;
        uint16 waterNeededInAWeek;
        uint8 sunNeededInAWeek;
    }

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

    struct PlayerInRanking {
        string nickname;
        uint32 score;
    }

    struct Player {
        string nickname;
        uint256[] treeOwned;
        uint256 lastEntered;
        uint32 score;
    }

    modifier MustOwnTree(uint256 id){
        require (_ownsTree(msg.sender, id), "This tree isn't yours");
        _;
    }

    modifier SetLastEntered(){
        players[msg.sender].lastEntered = block.timestamp;
        _;
    }

    modifier MustBeGardener() {
        require(msg.sender == _gardener, "You cannot set the rules of the game");
        _;
    }

    modifier UpdatePlayerScore(address player){
        _;
        uint32 oldScore = players[player].score;
        players[player].score = _computePlayerScore(player);
        if (oldScore != players[player].score){
            emit UpdatedPlayerScore(player, players[player].score);
        } 
    }

    event JoinedGame(address a, uint256 id, Tree tree);
    event TreeGrown(address a, uint256 treeId, Tree t);
    event BoughtSeed(address a, uint256 id, Tree t);
    event UpdatedPlayerScore(address a, uint32 score);

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

    function _baseURI() override internal view virtual returns (string memory) {
        return "../utils/json/";
    }

    function addSpecies(string memory speciesName, ExtinctionRisk risk, uint16 waterNeeded, uint8 sunNeeded) MustBeGardener() public {
        require(bytes(speciesName).length > 0, "The name cannot be empty");
        require(!_existsSpecies(speciesName), "This species already exists");
        gameSpecies.push(Species(speciesName, risk, waterNeeded, sunNeeded));
        risksIndexes[risk].push(uint32(gameSpecies.length -1));
    }

    function changeExtinctionRisk(string calldata speciesName, ExtinctionRisk newRisk) MustBeGardener() public {
        for(uint8 i=0; i<gameSpecies.length; i++) {
            if (keccak256(bytes(gameSpecies[i].name)) == keccak256(bytes(speciesName))) {
                gameSpecies[i].risk = newRisk;
            }
        }
    }

    function _existsSpecies(string memory speciesName) view private returns (bool) {
        for(uint8 i=0; i<gameSpecies.length; i++) {
            if (keccak256(bytes(gameSpecies[i].name)) == keccak256(bytes(speciesName))) return true;
        }
        return false;
    }

    function changeValuesForStage(ExtinctionRisk risk, uint8[5] calldata values) MustBeGardener() public {
        valuesForStage[risk] = values;
    }

    function joinGame(string calldata userNickname, string calldata treeNickname) SetLastEntered public {
        require (isNewUser(msg.sender), "You're already playing");
        players[msg.sender].nickname = bytes(userNickname).length > 0 ? userNickname : "Player"; 
        playersAddresses.push(msg.sender);
        (uint256 id, Tree memory t) = _plantSeed(msg.sender, treeNickname);
        emit JoinedGame(msg.sender, id, t);
    }

    function isNewUser(address playerAddress) public view returns (bool) {
        return !(bytes(players[playerAddress].nickname).length > 0);
    }

    function getPlayerTrees(address playerAddress) public view returns (uint256[] memory, Tree[] memory) {
        require (!isNewUser(playerAddress), "This user is not playing yet");
        uint256[] memory treeIds = players[playerAddress].treeOwned;
        Tree[] memory playerTrees = new Tree[](treeIds.length);
        for (uint i=0; i<treeIds.length; i++) {
            playerTrees[i] = trees[treeIds[i]];
        }
        return (treeIds, playerTrees);
    }

    function getTree(uint256 treeId) public view returns (Tree memory) {
        require(ERC721._exists(treeId), "This tree doesn't exist");
        return trees[treeId];
    }

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

    function _getStageName(Stages stage) pure private returns (string memory) {
        if (stage == Stages.Seed) return "Seed";
        if (stage == Stages.Bush) return "Bush";
        if (stage == Stages.Adult) return "Adult";
        if (stage == Stages.Majestic) return "Majestic";
        if (stage == Stages.Secular) return "Secular";
        return "";
    }

    function _ownsTree(address player, uint256 id) view private returns (bool) {
        return ERC721.ownerOf(id) == player;
    }

    function renameTree(uint64 id, string calldata newNickname) MustOwnTree(id) public {
        trees[id].nickname = newNickname;
    }

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

    function giveWater(uint256 id, uint16 waterAmount) MustOwnTree(id) SetLastEntered public {
        //require(waterAmount <= MAX_WATER, "Too much water");
        Tree storage t = trees[id];
        require(t.lastWater < block.timestamp -1 minutes, "You watered this plant not so long ago");
        //require(t.lastWater < block.timestamp -6 hours, "You watered this plant not so long ago");
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

    function giveSun(uint64 id, uint8 sunHours) MustOwnTree(id) SetLastEntered public {
        //require(sunHours <= MAX_SUN, "Too much sun");
        Tree storage t = trees[id];
        require(t.lastSun < block.timestamp -1 minutes, "You exposed this plant to the sun not so long ago");
        //require(t.lastSun < block.timestamp -6 hours, "You exposed this plant to the sun not so long ago");
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

    function buySeed(string calldata treeNickname) SetLastEntered public payable {
        require(msg.value >= SEED_PRICE, "Not enough money for a seed");
        planter.transfer(msg.value);
        moneyToThePlanter += msg.value;
        _plantSeed(msg.sender, treeNickname);
    }

    function sellTree(uint256 treeId, uint256 price) SetLastEntered public {
        _checkSelling(treeId, price);
        require(shop[treeId] == 0, "This tree is already in the shop");
        shop[treeId] = price;
        shopIds.push(treeId);
    }

    function changePrice(uint256 treeId, uint256 newPrice) SetLastEntered public {
        _checkSelling(treeId, newPrice);
        shop[treeId] = newPrice;
    }

    function _checkSelling(uint256 treeId, uint256 price) MustOwnTree(treeId) view private {
        Tree memory t = trees[treeId];
        require(uint8(t.stage) >= 2, "This tree isn't old enough for selling it");
        require(price != 0, "The price cannot be 0");
    }

    function _getOwnerIndex(uint256 treeId, address player) view private returns (uint256 index) {
        for (uint256 i; i<players[player].treeOwned.length; i++) {
            if (players[player].treeOwned[i] == treeId) {
                return i;
            }
        }
    }

    function buyTree(uint256 treeId, uint256 shopIndex) SetLastEntered public payable  {
        require(!_ownsTree(msg.sender, treeId), "You can't buy your own trees");
        require(shop[treeId] != 0, "This tree is not up for sale");
        require(shopIds[shopIndex] == treeId, "You are selecting the wrong tree");
        uint256 price = shop[treeId];
        uint256 commission = trees[treeId].value * 1e15; 
        // msg.value espresso in wei
        require(msg.value >= price + commission, "You are not paying enough");
        address oldOwner = ERC721.ownerOf(treeId);
        uint256 oldOwnerIndex = _getOwnerIndex(treeId, oldOwner);
        planter.transfer(commission);
        moneyToThePlanter += commission;
        //ERC721._transfer(oldOwner, msg.sender, treeId);
        payable(oldOwner).transfer(msg.value - commission);
        _afterSelling(oldOwner, msg.sender, treeId, shopIndex, oldOwnerIndex);
    }

    function _afterSelling(address oldOwner, address newOwner, uint256 treeId, uint256 shopIndex, uint256 oldOwnerIndex) UpdatePlayerScore(newOwner) UpdatePlayerScore(oldOwner) private {
        shop[treeId] = 0;
        shopIds[shopIndex] = shopIds[shopIds.length -1];
        shopIds.pop();
        players[oldOwner].treeOwned[oldOwnerIndex] = players[oldOwner].treeOwned[players[oldOwner].treeOwned.length -1];
        players[oldOwner].treeOwned.pop();
        players[msg.sender].treeOwned.push(treeId);
        ERC721._transfer(oldOwner, newOwner, treeId);
    }

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

    function _getTreeValue(ExtinctionRisk risk, Stages stage) view private returns (uint8) {
        return valuesForStage[risk][uint8(stage)];
    }

    function getPlayerInfo(address player) view public returns (string memory, uint32) {
        return (players[player].nickname, players[player].score);
    }

    function _computePlayerScore(address player) view private returns (uint32) {
        uint256[] storage ids = players[player].treeOwned;
        uint32 score = 0;
        for (uint64 i=0; i<ids.length; i++) {
            score += trees[ids[i]].value;
        }
        return score;
    }

    function getScores() view public returns (PlayerInRanking[] memory){
        PlayerInRanking[] memory playerScores = new PlayerInRanking[](playersAddresses.length);
        for (uint i=0; i<playersAddresses.length; i++) {
            Player memory p = players[playersAddresses[i]];
            playerScores[i] = PlayerInRanking(p.nickname, p.score);
        }
        return playerScores;
    }

    function getPlantedTreesInTheWorld() view public returns (uint256) {
        return moneyToThePlanter / (8 * 1e15); // about 20 euros
    }

}
