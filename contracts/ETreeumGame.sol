// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ETreeumGame is ERC721 {

    enum ExtinctionRisk {LeastConcern, ConservationDependent, NearThreatened, Vulnerable, Endangered, CriticallyEndangered}
    enum StagesName {Seed, Bush, Adult, Majestic, Secular}

    uint256 public treeCounter;
    address payable private _gardener;
    //fake address
    address payable constant public planter = payable(0x6A503fbe59Aac4C52a812A5F96876d5B71f4e7aA);
    Species[] private gameSpecies;
    uint8[] private probabilitiesDitribution = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5];        
    //number of plants in the world: about 390000
    mapping (ExtinctionRisk => uint32[]) private risksIndexes;
    mapping (uint256 => Tree) trees;

    struct Species {
        string name; 
        ExtinctionRisk risk;
        uint16 waterNeeded;
        uint8 sunNeeded;
    }

    struct Tree {
        Species species;
        string nickname;
        uint16 waterGiven;
        uint8 sunGiven;
        StagesName stage;
        uint8 value;
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

    function joinGame(string calldata nickname) public returns (uint256) {
       return plantSeed(msg.sender, nickname);
    }

    function plantSeed(address owner, string calldata nickname) private returns (uint256) {
        uint256 treeId = treeCounter;
        _safeMint(owner, treeId);
        //_setTokenURI(treeCounter, tokenURI);
        uint random = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, treeCounter)));
        ExtinctionRisk risk = ExtinctionRisk(probabilitiesDitribution[random % probabilitiesDitribution.length]);
        uint32[] memory speciesAtRisk = risksIndexes[risk];
        uint32 speciesIndex = speciesAtRisk[random % speciesAtRisk.length];
        trees[treeId].species = gameSpecies[speciesIndex];
        trees[treeId].nickname = nickname;
        //actually not necessary since they're already 0d out
        trees[treeId].waterGiven = 0;
        trees[treeId].sunGiven = 0;
        trees[treeId].stage = StagesName.Seed;
        trees[treeId].value = computeTreeValue(risk, StagesName.Seed);
        treeCounter = treeCounter + 1;
        return treeId;
    }

    //Maximum value for a tree = 75 (Maximum rarity and stage);
    //Minimum 6
    function computeTreeValue(ExtinctionRisk risk, StagesName stage) pure private returns (uint8) {
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
}
