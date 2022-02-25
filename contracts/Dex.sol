pragma solidity ^0.8.0;
pragma abicoder v2;

import "./Wallet.sol";

contract Dex is Wallet {

    using SafeMath for uint256;

    enum Side {
        BUY, 
        SELL
    }

    struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
    }

    uint public nextOrderId = 0;

    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

    function getOrderBook(bytes32 _ticker, Side _side) view public returns(Order[] memory) {
        return orderBook[_ticker][uint(_side)];
    }

    function createLimitOrder(Side _side, bytes32 _ticker, uint _amount, uint _price) public {
        if(_side == Side.BUY) {
            require(balance[msg.sender]["ETH"] >= _amount.mul(_price));
        }
        else if(_side == Side.SELL) {
            require(balance[msg.sender][_ticker] >= _amount);
        }

        Order[] storage orders = orderBook[_ticker][uint(_side)];
        orders.push(
            Order(nextOrderId, msg.sender, _side, _ticker, _amount, _price)
        );
        
        for(uint i = orders.length > 0 ? orders.length - 1 : 0; i > 0; i--) {
        if(_side == Side.BUY) {
            if(orders[i - 1].price > orders[i].price) {
                break;
            }
            else {
                Order memory orderToSwitch = orders[i - 1]; 
                orders[i - 1] = orders[i]; 
                orders[i] = orderToSwitch; 
            }
        }

        else if(_side == Side.SELL) {
            if(orders[i - 1].price < orders[i].price) {
                break;
            }
            else {
                Order memory orderToSwitch = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToSwitch;
            }
        }
        }
        nextOrderId++;
    }

}