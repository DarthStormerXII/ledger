// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LedgerOffchainResolver} from "../src/ens/LedgerOffchainResolver.sol";

interface VmEns {
    function envUint(string calldata name) external view returns (uint256);
    function envString(string calldata name) external view returns (string memory);
    function envAddress(string calldata name) external view returns (address);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract DeployEnsResolver {
    VmEns private constant vm = VmEns(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (LedgerOffchainResolver resolver) {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        string memory url = vm.envString("RESOLVER_URL");
        address signer = vm.envAddress("RESOLVER_SIGNER");
        address[] memory signers = new address[](1);
        signers[0] = signer;

        vm.startBroadcast(privateKey);
        resolver = new LedgerOffchainResolver(url, signers);
        vm.stopBroadcast();
    }
}
