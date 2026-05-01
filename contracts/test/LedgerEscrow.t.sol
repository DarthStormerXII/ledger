// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LedgerEscrow} from "../src/LedgerEscrow.sol";

contract MockReputationRegistry {
    address public lastBuyer;
    address public lastWorker;
    bytes32 public lastResultHash;

    function feedback(address buyer, address worker, int128, bytes32 resultHash, bytes calldata) external {
        lastBuyer = buyer;
        lastWorker = worker;
        lastResultHash = resultHash;
    }
}

contract WorkerWallet {
    function accept(LedgerEscrow escrow, bytes32 taskId, uint256 bidAmount, uint256 bondAmount) external payable {
        escrow.acceptBid{value: msg.value}(taskId, address(this), bidAmount, bondAmount);
    }

    receive() external payable {}
}

contract LedgerEscrowTest {
    receive() external payable {}

    function testFullTaskLifecycle() external {
        MockReputationRegistry reputation = new MockReputationRegistry();
        LedgerEscrow escrow = new LedgerEscrow(address(reputation));
        WorkerWallet worker = new WorkerWallet();
        bytes32 taskId = keccak256("task-001");
        uint256 payment = 1 ether;
        uint256 bidAmount = 0.8 ether;
        uint256 bondAmount = 0.1 ether;
        bytes32 resultHash = keccak256("result");

        escrow.postTask{value: payment}(taskId, payment, block.timestamp + 1 hours, 4e18);
        worker.accept{value: bondAmount}(escrow, taskId, bidAmount, bondAmount);
        escrow.releasePayment(taskId, resultHash);

        (,,,,,,,, LedgerEscrow.S
    // TODO: more cases
}