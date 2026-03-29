// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title VeilUSDC
 * @notice Test USDC token for VeilData marketplace. Unlimited faucet claims.
 */
contract VeilUSDC is ERC20 {
    uint256 public constant CLAIM_AMOUNT = 3 * 1e6; // 3 USDC (6 decimals)

    constructor() ERC20("VeilData USD Coin", "vUSDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function claim() external {
        _mint(msg.sender, CLAIM_AMOUNT);
    }
}
