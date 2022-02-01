const BitMathGame = artifacts.require("BitMathGame");

module.exports = function(deployer){
    deployer.deploy(BitMathGame, 1);
};
