// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LedgerMarketplace} from "../src/LedgerMarketplace.sol";

interface IWorkerINFT {
    function mint(
        address to,
        string calldata agentName,
        bytes calldata sealedKey,
        string calldata memoryCID,
        string calldata initialReputationRef
    ) external returns (uint256 tokenId);

    function approve(address to, uint256 tokenId) external;
    function nextTokenId() external view returns (uint256);
}

interface Vm {
    function envUint(string calldata) external view returns (uint256);
    function envAddress(string calldata) external view returns (address);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

/// Mint workers 7-15, approve the marketplace, and list each at a varied
/// ask price. Reads PRIVATE_KEY, WORKER_INFT_ADDRESS, MARKETPLACE_ADDRESS.
contract BatchMintAndList {
    Vm private constant vm =
        Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    bytes private constant SEALED_KEY = "sealed-for-reserve-owner";
    bytes private constant TEE_PROOF = "ledger-valid-tee-proof";
    string private constant ERC8004_REG_REF =
        "ai.rep.registry=0x8004B663056A597Dffe9eCcC1965A193B7388713";

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address inftAddr = vm.envAddress("WORKER_INFT_ADDRESS");
        address mpAddr = vm.envAddress("MARKETPLACE_ADDRESS");
        IWorkerINFT inft = IWorkerINFT(inftAddr);
        LedgerMarketplace mp = LedgerMarketplace(mpAddr);

        // 9 worker profiles — each gets a unique name + memory CID + ask
        string[9] memory names = [
            "Sentinel-007 (research)",
            "Aurora-008 (data)",
            "Helix-009 (code)",
            "Vega-010 (creative)",
            "Praxis-011 (ops)",
            "Echo-012 (trading)",
            "Nyx-013 (research)",
            "Lyra-014 (data)",
            "Quanta-015 (code)"
        ];
        // Distinct memory CIDs (32-byte fake hashes for the demo seed)
        string[9] memory cids = [
            "0g://0x1111aa22bb33cc44dd55ee66ff7788990011223344556677889900aabbccdd07",
            "0g://0x2222bb33cc44dd55ee66ff77889900112233445566778899001122334455ee08",
            "0g://0x3333cc44dd55ee66ff7788990011223344556677889900112233445566778809",
            "0g://0x4444dd55ee66ff77889900112233445566778899001122334455667788990010",
            "0g://0x5555ee66ff778899001122334455667788990011223344556677889900aabb11",
            "0g://0x6666ff778899001122334455667788990011223344556677889900aabbccdd12",
            "0g://0x7777889900112233445566778899001122334455667788990011223344556613",
            "0g://0x88880011223344556677889900112233445566778899001122334455667788ee14",
            "0g://0x9999112233445566778899001122334455667788990011223344556677889915"
        ];
        // Ask prices in 0G (varied so the marketplace looks alive)
        uint256[9] memory prices = [
            uint256(0.04 ether),
            uint256(0.07 ether),
            uint256(0.12 ether),
            uint256(0.025 ether),
            uint256(0.18 ether),
            uint256(0.09 ether),
            uint256(0.06 ether),
            uint256(0.15 ether),
            uint256(0.21 ether)
        ];

        address recipient = vm.envAddress("DEPLOYER");
        vm.startBroadcast(pk);
        for (uint256 i = 0; i < 9; i++) {
            uint256 tokenId = inft.mint(
                recipient,
                names[i],
                SEALED_KEY,
                cids[i],
                ERC8004_REG_REF
            );
            inft.approve(mpAddr, tokenId);
            mp.list(tokenId, prices[i], SEALED_KEY, TEE_PROOF);
        }
        vm.stopBroadcast();
    }
}
