pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
 import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable{
    using SafeMath for uint256;

    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    bytes32[] public tokenList;

    mapping(bytes32 => Token) public tokenMapping;
    mapping(address => mapping(bytes32 => uint256)) public balance;

    modifier tokenExist(bytes32 ticker) {
         require(tokenMapping[ticker].tokenAddress != address(0));
         _;
    }

    function addToken(bytes32 ticker, address tokenAddress) onlyOwner external {
        tokenMapping[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
    }

    function deposit(uint amount, bytes32 ticker) tokenExist(ticker) external {
        balance[msg.sender][ticker] = balance[msg.sender][ticker].add(amount);
        IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
    }

    function depositEth() payable external {
        balance[msg.sender][bytes32("ETH")] = balance[msg.sender][bytes32("ETH")].add(msg.value);
    }

   /* function withdrawEth(uint amount) external {
        require(balance[msg.sender][bytes32("ETH")] >= amount,'Insuffient balance'); 
        balance[msg.sender][bytes32("ETH")] = balance[msg.sender][bytes32("ETH")].sub(amount);
        msg.sender.call{value:amount}("");
    } */

    function withdraw(uint amount, bytes32 ticker) tokenExist(ticker) external {
       require(balance[msg.sender][ticker] >= amount, "Insufficient Balance");
       balance[msg.sender][ticker] = balance[msg.sender][ticker].sub(amount); 
       IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
    }


}