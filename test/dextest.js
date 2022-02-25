const Dex = artifacts.require("Dex");
const Token = artifacts.require("Token")
const truffleAssert = require("truffle-assertions");

contract("Dex", accounts => {

    it("User deposited Eth > buy limit-order value", async () => {
        let dex = await Dex.deployed()
        let token = await Token.deployed()
        await truffleAssert.reverts(
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 10, 1)
        )
        await dex.depositEth({value: 10, from: accounts[0]})
        await truffleAssert.passes(
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 1)
        )
    })

    it("User deposited token balance >= sell limit-order token amount", async () => {
        let dex = await Dex.deployed()
        let token = await Token.deployed()
        await truffleAssert.reverts(
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 1)
        )
        await token.approve(dex.address, 500);
        await dex.addToken(web3.utils.fromUtf8("LINK"), token.address, {from: accounts[0]})
        await dex.deposit(10, web3.utils.fromUtf8("LINK"));
        await truffleAssert.passes(
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 1)
        )
    })

    it("Buy order book ordered correctly", async () => {
        let dex = await Dex.deployed()
        let token = await Token.deployed()
        await token.approve(dex.address, 500)
        await dex.depositEth({value: 3000})
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 100)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 200)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 400)

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 0);
        assert(orderbook.length > 0);
        console.log(orderbook);
        for (let i = 0; i < orderbook.length - 1; i++) {
            assert(orderbook[i].price >= orderbook[i+1].price, "not right order in buy book")
        }
    })

    it("Sell order book ordered correctly", async () => {
        let dex = await Dex.deployed()
        let token = await Token.deployed()
        await token.approve(dex.address, 500)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 100)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 200)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 400)

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1);
        assert(orderbook.length > 0);
        console.log(orderbook)
        for (let i = 0; i < orderbook.length - 1; i++) {
            assert(orderbook[i].price <= orderbook[i+1].price, "not right order in sell book")
        }
    })

})