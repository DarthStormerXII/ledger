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

contract MockWorkerINFT {
    mapping(uint256 => address) public owners;

    function setOwner(uint256 tokenId, address owner) external {
        owners[tokenId] = owner;
    }

    function ownerOf(uint256 tokenId) external view returns (address owner) {
        owner = owners[tokenId];
        require(owner != address(0), "missing owner");
    }
}

contract LedgerEscrowTest {
    receive() external payable {}

    function testFullTaskLifecycle() external {
        MockReputationRegistry reputation = new MockReputationRegistry();
        LedgerEscrow escrow = new LedgerEscrow(address(reputation), address(0));
        WorkerWallet worker = new WorkerWallet();
        bytes32 taskId = keccak256("task-001");
        uint256 payment = 1 ether;
        uint256 bidAmount = 0.8 ether;
        uint256 bondAmount = 0.1 ether;
        bytes32 resultHash = keccak256("result");

        escrow.postTask{value: payment}(taskId, payment, block.timestamp + 1 hours, 4e18);
        worker.accept{value: bondAmount}(escrow, taskId, bidAmount, bondAmount);
        escrow.releasePayment(taskId, resultHash);

        (,,,,,,,, LedgerEscrow.Status status) = escrow.tasks(taskId);
        require(status == LedgerEscrow.Status.Released, "released");
        require(address(worker).balance == bidAmount + bondAmount, "worker paid and bond returned");
        require(reputation.lastWorker() == address(worker), "feedback worker");
        require(reputation.lastResultHash() == resultHash, "feedback hash");
    }

    function testTokenBidPaysCurrentINftOwnerAtRelease() external {
        MockReputationRegistry reputation = new MockReputationRegistry();
        MockWorkerINFT inft = new MockWorkerINFT();
        LedgerEscrow escrow = new LedgerEscrow(address(reputation), address(inft));

        bytes32 taskId = keccak256("task-token-owned");
        uint256 tokenId = 1;
        uint256 payment = 1 ether;
        uint256 bidAmount = 0.8 ether;
        uint256 bondAmount = 0.1 ether;
        bytes32 resultHash = keccak256("result");
        address ownerA = address(this);
        address ownerB = address(0xB0B);

        inft.setOwner(tokenId, ownerA);
        escrow.postTask{value: payment}(taskId, payment, block.timestamp + 1 hours, 4e18);
        escrow.acceptTokenBid{value: bondAmount}(taskId, tokenId, bidAmount, bondAmount);

        inft.setOwner(tokenId, ownerB);
        uint256 beforeOwnerB = ownerB.balance;

        require(escrow.payoutRecipient(taskId) == ownerB, "current owner before release");
        escrow.releasePayment(taskId, resultHash);

        require(ownerB.balance == beforeOwnerB + bidAmount + bondAmount, "current owner paid and bond returned");
        require(reputation.lastWorker() == ownerB, "feedback current owner");
        require(reputation.lastResultHash() == resultHash, "feedback hash");
    }
}
