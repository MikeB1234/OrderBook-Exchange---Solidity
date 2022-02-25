const Token = artifacts.require("Token");
const Dex = artifacts.require("Dex");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Token);
};
