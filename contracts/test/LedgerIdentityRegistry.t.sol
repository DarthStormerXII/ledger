// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LedgerIdentityRegistry} from "../src/LedgerIdentityRegistry.sol";

contract LedgerIdentityRegistryTest {
    function testRegisterAndLookup() external {
        LedgerIdentityRegistry registry = new LedgerIdentityRegistry();
        address worker = address(0xA11CE);
        registry.registerAgent(worker, "worker-001.ledger.eth", "who,pay,tx,rep,mem");

        LedgerIdentityRegistry.AgentIdentity memory identity = registry.getAgent(worker);
        require(identity.agentAddress == worker, "agent");
        require(keccak256(bytes(identity.ensName)) == keccak256("worker-001.ledger.eth"), "ens");
        require(keccak256(bytes(identity.capabilities)) == keccak256("who,pay,tx,rep,mem"), "capabilities");
    }
}
