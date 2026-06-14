// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FaucetToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;
    address public minter;
    address public owner;

    constructor() ERC20("Faucet Token", "FAU") {
        owner = msg.sender;
    }

    function setMinter(address _minter) external {
        require(msg.sender == owner, "Only owner");
        minter = _minter;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only faucet can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}