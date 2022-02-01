const ContractName = artifacts.require("ContractName");

module.exports = function(deployer){
    deployer.deploy(ContractName, constructor_param1, etc);
};
