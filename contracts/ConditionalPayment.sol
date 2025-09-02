// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConditionalPayment {
    address public payer;
    address public payee;
    uint256 public amount;
    string public condition;
    bool public isPaid;

    constructor(address _payee, uint256 _amount, string memory _condition) payable {
        require(msg.value == _amount, "Must send exact amount");
        payer = msg.sender;
        payee = _payee;
        amount = _amount;
        condition = _condition;
        isPaid = false;
    }

    function releasePayment() external {
        require(!isPaid, "Already paid");
        require(msg.sender == payer, "Only payer can release");
        
        isPaid = true;
        payable(payee).transfer(amount);
    }

    function getDetails() external view returns (
        address, address, uint256, string memory, bool
    ) {
        return (payer, payee, amount, condition, isPaid);
    }
}
