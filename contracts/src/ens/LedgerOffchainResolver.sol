// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IExtendedResolver {
    function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory);
}

interface IResolverService {
    function resolve(bytes calldata name, bytes calldata data)
        external
        view
        returns (bytes memory result, uint64 expires, bytes memory sig);
}

contract LedgerOffchainResolver is IExtendedResolver {
    string public url;
    mapping(address signer => bool trusted) public signers;

    event NewSigner(address indexed signer, bool trusted);
    event NewUrl(string url);

    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    constructor(string memory initialUrl, address[] memory initialSigners) {
        url = initialUrl;
        emit NewUrl(initialUrl);
        for (uint256 i = 0; i < initialSigners.length; i++) {
            signers[initialSigners[i]] = true;
            emit NewSigner(initialSigners[i], true);
        }
    }

    function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory) {
        bytes memory callData = abi.encodeWithSelector(IResolverService.resolve.selector, name, data);
        string[] memory urls = new string[](1);
        urls[0] = url;
        revert OffchainLookup(address(this), urls, callData, this.resolveWithProof.selector, callData);
    }

    function resolveWithProof(bytes calldata response, bytes calldata extraData)
        external
        view
        returns (bytes memory)
    {
        (bytes memory result, uint64 expires, bytes memory sig) =
            abi.decode(response, (bytes, uint64, bytes));
        require(expires >= block.timestamp, "LedgerOffchainResolver: expired");

        bytes32 digest = keccak256(
            abi.encodePacked(hex"1900", address(this), expires, keccak256(extraData), keccak256(result))
        );
        address signer = recover(digest, sig);
        require(signers[signer], "LedgerOffchainResolver: untrusted signer");
        return result;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IExtendedResolver).interfaceId || interfaceId == 0x01ffc9a7;
    }

    function recover(bytes32 digest, bytes memory sig) internal pure returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        if (sig.length == 64) {
            bytes32 vs;
            assembly {
                r := mload(add(sig, 0x20))
                vs := mload(add(sig, 0x40))
            }
            s = vs & bytes32(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
            v = uint8((uint256(vs) >> 255) + 27);
        } else if (sig.length == 65) {
            assembly {
                r := mload(add(sig, 0x20))
                s := mload(add(sig, 0x40))
                v := byte(0, mload(add(sig, 0x60)))
            }
            if (v < 27) v += 27;
        } else {
            revert("LedgerOffchainResolver: bad sig length");
        }

        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "LedgerOffchainResolver: bad sig");
        return signer;
    }
}
