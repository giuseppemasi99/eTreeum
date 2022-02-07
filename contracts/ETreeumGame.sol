// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ETreeumGame is ERC721 {

    enum ExtinctionRisk {LeastConcern, ConservationDependent, NearThreatened, Vulnerable, Endangered, CriticallyEndangered}
    enum Stages {Seed, Bush, Adult, Majestic, Secular}

    uint constant public SEED_PRICE = 1e15;
    uint256 public treeCounter;
    address payable private _gardener;
    //fake address
    address payable constant public planter = payable(0x6A503fbe59Aac4C52a812A5F96876d5B71f4e7aA);
    Species[] private gameSpecies;
    uint8[] private probabilitiesDitribution = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5];        
    //number of plants in the world: about 390000
    mapping (ExtinctionRisk => uint32[]) private risksIndexes;
    mapping (uint256 => Tree) trees;
    mapping(address => string) private userNicknames;
    mapping(address => Player) private players;
    address[] private playersAddresses;
    //mapping(address => )

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

    modifier MustOwnTree (uint256 id) {
        require (_ownsTree(msg.sender, id), "This tree isn't yours");
        _;
    }

    modifier SetLastEntered () {
        players[msg.sender].lastEntered = block.timestamp;
        _;
    }

    modifier UpdatePlayerScore (address player) {
        _;
        players[player].score = _computePlayerScore(player);
    }
  
    constructor () ERC721 ("Tree", "T"){
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
        require(msg.sender == _gardener, "Only the gardener can set the rules of the game");
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

    function joinGame(string calldata userNickname, string calldata treeNickname) SetLastEntered() public returns (uint256) {
        require (isNewUser(msg.sender), "You're already playing");
        players[msg.sender].nickname = userNickname;
        playersAddresses.push(msg.sender);
        return _plantSeed(msg.sender, treeNickname);
    }

    function isNewUser(address userAddress) public view returns (bool) {
        return bytes(players[userAddress].nickname).length > 0;
    }

    function _plantSeed(address owner, string calldata nickname) UpdatePlayerScore(owner) private returns (uint256) {
        uint256 treeId = treeCounter;
        _safeMint(owner, treeId);
        //_setTokenURI(treeCounter, tokenURI);
        uint random = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, treeCounter)));
        ExtinctionRisk risk = ExtinctionRisk(probabilitiesDitribution[random % probabilitiesDitribution.length]);
        uint32[] memory speciesAtRisk = risksIndexes[risk];
        uint32 speciesIndex = speciesAtRisk[random % speciesAtRisk.length];
        trees[treeId] = Tree(gameSpecies[speciesIndex], nickname, 0, 0, Stages.Seed, _computeTreeValue(risk, Stages.Seed), 0, 0, 0);
        players[owner].treeOwned.push(treeId);
        treeCounter = treeCounter + 1;
        return treeId;
    }

    function _ownsTree(address player, uint256 id) view private returns (bool) {
        return ERC721.ownerOf(id) == player;
    }

    function _growTree(Tree storage t) private returns (Stages) {
        if (t.startWeek > block.timestamp -1 weeks) {
            if (t.stage != Stages.Secular && t.waterGivenInAWeek == t.specie.waterNeededInAWeek && t.sunGivenInAWeek == t.specie.sunNeededInAWeek) {
                t.stage = Stages(uint8(t.stage)+1);
                t.value = _computeTreeValue(t.specie.risk, t.stage);
                players[msg.sender].score = _computePlayerScore(msg.sender);
            }
        }
        else { t.startWeek = block.timestamp; }
        return t.stage;
    }

    function giveWater(uint256 id, uint16 waterAmount) MustOwnTree(id) SetLastEntered public returns (Stages) {
        Tree storage t = trees[id];
        require(t.lastWater < block.timestamp -6 hours, "You watered this plant not so long ago");
        t.waterGivenInAWeek += waterAmount;
        t.lastWater = block.timestamp;
        return _growTree(t);
    }

    function giveSun(uint64 id, uint8 sunHours) MustOwnTree(id) SetLastEntered public returns (Stages) {
        Tree storage t = trees[id];
        require(t.lastSun < block.timestamp -6 hours, "You exposed this plant to the sun not so long ago");
        t.sunGivenInAWeek += sunHours;
        return _growTree(t);
    }

    /*function resetStartWeek(Tree storage t) private {
        t.startWeek = block.timestamp;
    }*/

    function buySeed(string calldata treeNickname) SetLastEntered public payable {
        require(msg.value >= SEED_PRICE, "Not enough money for a seed");
        planter.transfer(msg.value);
        _plantSeed(msg.sender, treeNickname);
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

    function _computePlayerScore(address player) view private returns (uint32) {
        uint256[] storage ids = players[player].treeOwned;
        uint32 score = 0;
        for (uint64 i=0; i<ids.length; i++) {
            score += trees[ids[i]].value;
        }
        return score;
    }

    function computeRanking() view public {
    }
}
