// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LedgerEscrow} from "../src/LedgerEscrow.sol";
import {LedgerIdentityRegistry} from "../src/LedgerIdentityRegistry.sol";
import {MockTEEOracle} from "../src/MockTEEOracle.sol";
import {WorkerINFT} from "../src/WorkerINFT.sol";

interface Vm {
    function envUint(string calldata name) external view returns (uint256);
    function envOr(string calldata name, address defaultValue) external view returns (address);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract Deploy {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    bytes private constant DEMO_VALID_PROOF = "ledger-valid-tee-proof";

    function run()
        external
        returns (
            MockTEEOracle oracle,
            WorkerINFT workerINFT,
            LedgerEscrow escrow,
            LedgerIdentityRegistry identityRegistry
        )
    {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address reputationRegistry =
            vm.envOr("ERC8004_REGISTRY_ADDR", address(0x8004B663056A597Dffe9eCcC1965A193B7388713));

        vm.startBroadcast(privateKey);
        oracle = new MockTEEOracle(keccak256(DEMO_VALID_PROOF));
        workerINFT = new WorkerINFT(address(oracle));
        escrow = new LedgerEscrow(reputationRegistry, address(workerINFT));
        identityRegistry = new LedgerIdentityRegistry();
        vm.stopBroadcast();
    }
}
