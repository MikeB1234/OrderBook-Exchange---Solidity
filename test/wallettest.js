const Dex = artifacts.require("Dex");
const Token = artifacts.require("Token")
const truffleAssert = require("truffle-assertions");

contract.skip("Dex", accounts => {
    it("only possible for owner to add tokens", async () => {
        let dex = await Dex.deployed()
        let token = await Token.deployed()
        await truffleAssert.passes(
            dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[0]})
        )
        await truffleAssert.reverts(
            dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[1]})
        )
    }) 

    it("should handle deposits correctly", async () => {
        let dex = await Dex.deployed()
        let token = await Token.deployed()
        await token.approve(dex.address, 500);
        await dex.deposit(100, web3.utils.fromUtf8("LINK"));
        let balance = await dex.balance(accounts[0], web3.utils.fromUtf8("LINK"))
        assert.equal(balance.toNumber(), 100)
    }) 

    it("should handle faulty withdrawals correctly", async () => {
        let dex = await Dex.deployed()
        let token = await Token.deployed()
        await truffleAssert.reverts(
            dex.withdraw(500, web3.utils.fromUtf8("LINK"))
        )
    }) 

    it("should handle correct withdrawals correctly", async () => {
        let dex = await Dex.deployed()
        let token = await Token.deployed()
        await truffleAssert.passes(
            dex.withdraw(100, web3.utils.fromUtf8("LINK"))
        )
    }) 

})