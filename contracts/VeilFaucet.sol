// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VeilFaucet
 * @notice Distributes 3 USDC per claim from a pre-funded pool.
 * Uses Privara's USDC on Arbitrum Sepolia.
 */
contract VeilFaucet {
    IERC20 public immutable usdc;
    uint256 public constant CLAIM_AMOUNT = 3 * 1e6; // 3 USDC (6 decimals)
    address public immutable owner;

    event Claimed(address indexed user, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }

    /// @notice Claim 3 USDC (can claim multiple times)
    function claim() external {
        require(usdc.balanceOf(address(this)) >= CLAIM_AMOUNT, "Faucet empty");
        require(usdc.transfer(msg.sender, CLAIM_AMOUNT), "Transfer failed");
        emit Claimed(msg.sender, CLAIM_AMOUNT);
    }

    /// @notice Check faucet balance
    function faucetBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
