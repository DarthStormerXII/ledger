// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockTEEOracle} from "../src/MockTEEOracle.sol";
import {WorkerINFT} from "../src/WorkerINFT.sol";

contract WorkerINFTTest {
    WorkerINFT private inft;
    bytes private constant VALID_PROOF = "ledger-valid-tee-proof";

    function testMintTransferAndRekeyMemory() external {
        MockTEEOracle oracle = new MockTEEOracle(keccak256(VALID_PROOF));
        inft = new WorkerINFT(address(oracle));

        address alice = address(this);
        address bob = address(0xB0B);
        uint256 tokenId = inft.mint(alice, "worker-001", "sealed-for-alice", "0g://memory-before", "erc8004:worker-001");

        require(inft.ownerOf(tokenId) == alice, "mint owner");
        inft.transfer(alice, bob, tokenId, "sealed-for-bob", VALID_PROOF);

        require(inft.ownerOf(tokenId) == bob, "transfer owner");
        WorkerINFT.AgentMetadata memory meta = inft.getMetadata(tokenId);
        require(keccak256(bytes(meta.memoryCID)) == keccak256("0g://memory-before"), "cid stays stable");
        require(keccak256(meta.sealedKey) == keccak256("sealed-for-bob"), "sealed key rekeyed");
    }

    function testInvalidProofReverts() external {
        MockTEEOracle oracle = new MockTEEOracle(keccak256(VALID_PROOF));
        inft = new WorkerINFT(address(oracle));
        uint256 tokenId =
            inft.mint(address(this), "worker-001", "sealed-for-alice", "0g://memory-before", "erc8004:worker-001");

        (bool ok,) = address(inft).call(
            abi.encodeWithSelector(
                WorkerINFT.transfer.selector,
                address(this),
                address(0xB0B),
                tokenId,
                bytes("sealed-for-bob"),
                bytes("invalid")
            )
        );
        require(!ok, "invalid proof should revert");
    }
}
