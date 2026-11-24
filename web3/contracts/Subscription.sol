// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";

contract Subscription is Ownable2Step, ReentrancyGuardTransient {
    uint256 public price = 0.05 ether;
    uint256 public duration = 30 days;

    mapping(address => uint256) public subscribedUntil;

    error IncorrectPayment();
    error NothingToWithdraw();
    error TransferFailed();
    error OwnershipRenunciationDisabled();

    event Subscribed(address indexed user, uint256 expiresAt);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function subscribe() external payable {
        if (msg.value != price) revert IncorrectPayment();

        uint256 currentExpiry = subscribedUntil[msg.sender];
        uint256 start = block.timestamp > currentExpiry
            ? block.timestamp
            : currentExpiry;
        uint256 newExpiry = start + duration;

        subscribedUntil[msg.sender] = newExpiry;
        emit Subscribed(msg.sender, newExpiry);
    }

    function isSubscribed(address user) external view returns (bool) {
        return subscribedUntil[user] > block.timestamp;
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NothingToWithdraw();

        address payable recipient = payable(owner());
        (bool ok, ) = recipient.call{value: balance}("");
        if (!ok) revert TransferFailed();

        emit Withdrawn(recipient, balance);
    }

    function renounceOwnership() public pure override {
        revert OwnershipRenunciationDisabled();
    }
}