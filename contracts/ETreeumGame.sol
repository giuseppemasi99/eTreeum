// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ETreeumGame is ERC721 {

    enum ExtinctionRisk {LeastConcern, ConservationDependent, NearThreatened, Vulnerable, Endangered, CriticallyEndangered}
    enum Stages {Seed, Bush, Adult, Majestic, Secular}

    uint constant public SEED_PRICE = 1e15;
    uint16 constant MAX_WATER = 200;
    uint8 constant MAX_SUN = 3;
    uint8 constant PERCENTAGE_FOR_REAL_PLANT = 1;
    uint256 public treeCounter;
    address payable private _gardener;
    //fake address
    address payable constant public planter = payable(0x335Ebf7EBd5e7e1318D75f8914CEA6e334cB92b7);
    Species[] private gameSpecies;
    uint8[] private probabilitiesDitribution = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5];        
    //number of plants in the world: about 390000
    mapping (ExtinctionRisk => uint32[]) private risksIndexes;
    mapping (uint256 => Tree) trees;
    mapping(address => string) private userNicknames;
    mapping(address => Player) private players;
    address[] private playersAddresses;
    mapping(uint256 => uint8) private shop;
    Player[3] private ranking;

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

    modifier UpdatePlayerScore(address player){
        _;
        uint32 oldScore = players[player].score;
        players[player].score = _computePlayerScore(player);
        if (oldScore != players[player].score) computeRanking();
    }

    event JoinedGame(address a, uint256 id, Tree tree);
    event RankingChanged(Player[3] ranking);
    event TreeGrown(address a, uint256 treeId, Stages stage);

    constructor() ERC721("Tree", "T"){
        treeCounter = 0;
        _gardener = payable(msg.sender);
        addSpecies("AbiesNebrodensis", ExtinctionRisk.CriticallyEndangered, 1000, 10);
        addSpecies("CallitrisPancheri", ExtinctionRisk.Endangered, 1000, 10);
        addSpecies("AfzeliaAfricana", ExtinctionRisk.Vulnerable, 1000, 10);
        addSpecies("AloeSquarrosa", ExtinctionRisk.Vulnerable, 1000, 10);
        addSpecies("CanariumZeylanicum", ExtinctionRisk.Vulnerable, 1000, 10);
        addSpecies("PinusLatteri", ExtinctionRisk.NearThreatened, 1000, 10);
        addSpecies("BaccaureaPolyneura", ExtinctionRisk.ConservationDependent, 1000, 10);
        addSpecies("MalusDomestica", ExtinctionRisk.LeastConcern, 1000, 10);
        addSpecies("PinusSylvestris", ExtinctionRisk.LeastConcern, 1000, 10);
        addSpecies("TheobromaCacao", ExtinctionRisk.LeastConcern, 1000, 10);
    }

    function addSpecies(string memory speciesName, ExtinctionRisk risk, uint16 waterNeeded, uint8 sunNeeded) public {
        require(msg.sender == _gardener, "You cannot set the rules of the game");
        require(bytes(speciesName).length > 0, "The name cannot be empty");
        require(!_existsSpecies(speciesName), "This species already exists");
        gameSpecies.push(Species(speciesName, risk, waterNeeded, sunNeeded));
        risksIndexes[risk].push(uint32(gameSpecies.length -1));
    }

    function _existsSpecies(string memory speciesName) view private returns (bool) {
        for(uint8 i=0; i<gameSpecies.length; i++) {
            if (keccak256(bytes(gameSpecies[i].name)) == keccak256(bytes(speciesName))) return true;
        }
        return false;
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
        //_setTokenURI(treeCounter, tokenURI);
        uint random = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, treeCounter)));
        ExtinctionRisk risk = ExtinctionRisk(probabilitiesDitribution[random % probabilitiesDitribution.length]);
        uint32[] memory speciesAtRisk = risksIndexes[risk];
        uint32 speciesIndex = speciesAtRisk[random % speciesAtRisk.length];
        Tree memory t = Tree(gameSpecies[speciesIndex], nickname, 0, 0, Stages.Seed, _computeTreeValue(risk, Stages.Seed), 0, 0, 0);
        trees[treeId] = t;
        players[owner].treeOwned.push(treeId);
        trees[treeId] = t;
        treeCounter = treeCounter + 1;
        return (treeId, t);
    }

    function _ownsTree(address player, uint256 id) view private returns (bool) {
        return ERC721.ownerOf(id) == player;
    }

    function renameTree(uint64 id, string calldata newNickname) MustOwnTree(id) public {
        trees[id].nickname = newNickname;
    }

    function _growTree(uint256 id, Tree storage t) private {
        if (t.startWeek > block.timestamp -1 weeks) {
            if (t.stage != Stages.Secular && t.waterGivenInAWeek >= t.specie.waterNeededInAWeek && t.sunGivenInAWeek >= t.specie.sunNeededInAWeek) {
                t.stage = Stages(uint8(t.stage)+1);
                t.value = _computeTreeValue(t.specie.risk, t.stage);
                players[msg.sender].score = _computePlayerScore(msg.sender);
                emit TreeGrown(ERC721.ownerOf(id), id, t.stage);
            }
        }
        else { t.startWeek = block.timestamp; }
    }

    function giveWater(uint256 id, uint16 waterAmount) MustOwnTree(id) SetLastEntered public {
        require(waterAmount <= MAX_WATER, "Too much water");
        Tree storage t = trees[id];
        require(t.lastWater < block.timestamp -6 hours, "You watered this plant not so long ago");
        t.waterGivenInAWeek += waterAmount;
        t.lastWater = block.timestamp;
        _growTree(id, t);
    }

    function giveSun(uint64 id, uint8 sunHours) MustOwnTree(id) SetLastEntered public {
        require(sunHours <= MAX_SUN, "Too much sun");
        Tree storage t = trees[id];
        require(t.lastSun < block.timestamp -6 hours, "You exposed this plant to the sun not so long ago");
        t.sunGivenInAWeek += sunHours;
        _growTree(id, t);
    }

    function buySeed(string calldata treeNickname) SetLastEntered public payable {
        require(msg.value >= SEED_PRICE, "Not enough money for a seed");
        planter.transfer(msg.value);
        _plantSeed(msg.sender, treeNickname);
    }

    function sellTree(uint256 treeId, uint8 price) MustOwnTree(treeId) SetLastEntered public {
        Tree storage t = trees[treeId];
        require(uint8(t.stage) >= 2, "This tree isn't old enough for selling it");
        require(shop[treeId] == 0, "This tree is already in the shop");
        require(_checkTreePrice(t.value, price), "The price is not between the allowed range");
        shop[treeId] = price;
    }

    function buyTree(uint256 treeId, uint256 index) public payable SetLastEntered { //UpdatePlayerScore(msg.sender){
        require(!_ownsTree(msg.sender, treeId), "You can't buy your own trees");
        require(shop[treeId] != 0, "This tree is not up for sale");
        uint8 price = shop[treeId];
        require(msg.value >= price, "You are not paying enough");
        address oldOwner = ERC721.ownerOf(treeId);
        require (players[oldOwner].treeOwned[index] == treeId, "You are selecting the wrong tree");
        uint8 percentage = price / 100;
        price = price - percentage;
        planter.transfer(percentage);
        ERC721.safeTransferFrom(oldOwner, msg.sender, treeId);
        payable(oldOwner).transfer(price);
        _afterSelling(oldOwner, msg.sender, treeId, index);
    }

    function _afterSelling(address oldOwner, address newOwner, uint256 treeId, uint256 index) private UpdatePlayerScore(newOwner) UpdatePlayerScore(oldOwner) {
        shop[treeId] = 0;
        players[oldOwner].treeOwned[index] = players[oldOwner].treeOwned[players[oldOwner].treeOwned.length -1];
        players[oldOwner].treeOwned.pop();
        players[msg.sender].treeOwned.push(treeId);
    }

    //ADD GET SHOP

    function _checkTreePrice(uint256 value, uint8 price) pure private returns (bool) {
        uint256 percentage = value/100;
        return price >= value - percentage && price <= value + percentage && price != 0;
    }

    function _computeTreeValue(ExtinctionRisk risk, Stages stage) pure private returns (uint8) {
        uint8 value;
        if (risk == ExtinctionRisk.CriticallyEndangered) value = 50;
        else if (risk == ExtinctionRisk.Endangered) value = 40;
        else if (risk == ExtinctionRisk.Vulnerable) value = 30;
        else if (risk == ExtinctionRisk.NearThreatened) value = 15;
        else if (risk == ExtinctionRisk.ConservationDependent) value = 5;
        else if (risk == ExtinctionRisk.LeastConcern) value = 1;
        value += (uint8(stage)+1) * 5;
        return value;
    }

    function getPlayerScore(address player) view public returns (uint32) {
        return players[player].score;
    }

    function _computePlayerScore(address player) view private returns (uint32) {
        uint256[] storage ids = players[player].treeOwned;
        uint32 score = 0;
        for (uint64 i=0; i<ids.length; i++) {
            score += trees[ids[i]].value;
        }
        return score;
    }

    function getRanking() view public returns (Player[3] memory) {
        return ranking;
    }

    function computeRanking() public {
        bool changed = false;
        for(uint i=0; i<playersAddresses.length; i++) {
            Player memory p = players[playersAddresses[i]];
            //first place
            if (p.score > ranking[0].score) {
                ranking[2] = ranking[1];
                ranking[1] = ranking[0];
                ranking[0] = p;
                changed = true;
            }
            else if (p.score > ranking[1].score) {
                ranking[2] = ranking[1];
                ranking[1] = p;
                changed = true;
            }
            else if (p.score > ranking[2].score) {
                ranking[2] = p;
                changed = true;
            }
        }
        if (changed) {
            emit RankingChanged(ranking);
        }
    }
}
