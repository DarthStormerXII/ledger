// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LedgerMarketplace} from "../src/LedgerMarketplace.sol";

interface Vm {
    function envUint(string calldata name) external view returns (uint256);
    function envAddress(string calldata name) external view returns (address);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

/// Deploy LedgerMarketplace bound to the live WorkerINFT.
/// Required env: PRIVATE_KEY, WORKER_INFT_ADDRESS.
contract DeployMarketplace {
    Vm private constant vm =
        Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (LedgerMarketplace marketplace) {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address workerInft = vm.envAddress("WORKER_INFT_ADDRESS");
        vm.startBroadcast(privateKey);
        marketplace = new LedgerMarketplace(workerInft);
        vm.stopBroadcast();
    }
}
