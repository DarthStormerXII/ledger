// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IWorkerINFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external;
}

/**
 * LedgerMarketplace
 *
 * Minimal escrowless marketplace for WorkerINFT. The seller stores their
 * pre-signed sealed-key + TEE proof inside the listing at list time; the
 * buyer just sends native 0G to buy(tokenId). The contract calls
 * WorkerINFT.transfer() with the stored proof to move the iNFT and forwards
 * the proceeds to the seller in the same tx.
 *
 * Custody model: non-custodial. The seller retains ownership while listed
 * and only needs to grant approve(marketplace, tokenId) once. Cancel is a
 * single-tx no-op for the seller.
 */
contract LedgerMarketplace {
    struct Listing {
        address seller;
        uint256 askPrice;       // wei (native 0G)
        uint256 listedAt;       // block.timestamp
        bytes   sealedKey;      // re-keyed sealed key for the new owner
        bytes   transferProof;  // TEE proof bytes that satisfy the oracle
        bool    active;
    }

    IWorkerINFT public immutable workerINFT;

    mapping(uint256 => Listing) public listings;

    event ListingCreated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 askPrice,
        uint256 listedAt
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event ListingUpdated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 newAskPrice
    );
    event ListingSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    error NotOwner();
    error NotSeller();
    error InvalidPrice();
    error NotListed();
    error WrongPayment();
    error NotApproved();
    error TransferFailed();

    constructor(address workerINFT_) {
        workerINFT = IWorkerINFT(workerINFT_);
    }

    /// List an iNFT for sale. Seller must have approved this contract first
    /// via `WorkerINFT.approve(marketplace, tokenId)` or
    /// `setApprovalForAll(marketplace, true)`.
    function list(
        uint256 tokenId,
        uint256 askPrice,
        bytes calldata sealedKey,
        bytes calldata transferProof
    ) external {
        if (workerINFT.ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (askPrice == 0) revert InvalidPrice();
        if (
            workerINFT.getApproved(tokenId) != address(this) &&
            !workerINFT.isApprovedForAll(msg.sender, address(this))
        ) revert NotApproved();

        listings[tokenId] = Listing({
            seller: msg.sender,
            askPrice: askPrice,
            listedAt: block.timestamp,
            sealedKey: sealedKey,
            transferProof: transferProof,
            active: true
        });

        emit ListingCreated(tokenId, msg.sender, askPrice, block.timestamp);
    }

    /// Update the ask price on an existing active listing.
    function updatePrice(uint256 tokenId, uint256 newAskPrice) external {
        Listing storage l = listings[tokenId];
        if (!l.active) revert NotListed();
        if (l.seller != msg.sender) revert NotSeller();
        if (newAskPrice == 0) revert InvalidPrice();
        l.askPrice = newAskPrice;
        emit ListingUpdated(tokenId, msg.sender, newAskPrice);
    }

    /// Cancel an active listing. Idempotent — a cancelled listing stays
    /// in storage as a historical record but `active = false`.
    function cancel(uint256 tokenId) external {
        Listing storage l = listings[tokenId];
        if (!l.active) revert NotListed();
        if (l.seller != msg.sender) revert NotSeller();
        l.active = false;
        emit ListingCancelled(tokenId, msg.sender);
    }

    /// Buy a listed iNFT. Pays the seller in native 0G and triggers the
    /// re-keyed transfer through WorkerINFT in the same tx.
    function buy(uint256 tokenId) external payable {
        Listing storage l = listings[tokenId];
        if (!l.active) revert NotListed();
        if (msg.value != l.askPrice) revert WrongPayment();

        address seller = l.seller;
        uint256 price = l.askPrice;
        bytes memory sk = l.sealedKey;
        bytes memory tp = l.transferProof;

        // Mark inactive BEFORE the external calls (CEI).
        l.active = false;

        // Move the iNFT seller -> buyer with the seller-provided sealed key
        // + proof. Marketplace must already be approved (checked at list).
        workerINFT.transfer(seller, msg.sender, tokenId, sk, tp);

        // Forward payment to the seller.
        (bool ok, ) = seller.call{value: price}("");
        if (!ok) revert TransferFailed();

        emit ListingSold(tokenId, seller, msg.sender, price);
    }

    /// Convenience view for the frontend.
    function isListed(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].active;
    }

    function getListing(uint256 tokenId)
        external
        view
        returns (
            address seller,
            uint256 askPrice,
            uint256 listedAt,
            bool active
        )
    {
        Listing storage l = listings[tokenId];
        return (l.seller, l.askPrice, l.listedAt, l.active);
    }
}
