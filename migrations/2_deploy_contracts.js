const ETreeum = artifacts.require("ETreeum");

module.exports = function(deployer){
    // parameters for the constructor
    deployer.deploy(ETreeum);
};
