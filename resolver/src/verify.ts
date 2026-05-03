import { HDNodeWallet, getAddress } from "ethers";

/**
 * Verify two pay.* resolutions came from the claimed master xpub.
 *
 * The resolver derives addresses at path `<tokenId>/<nonce>` so each
 * worker has its own address sequence (path is tokenId-namespaced).
 */
export function verifyDerivation(
  masterPubkey: string,
  child1: string,
  child2: string,
  nonce1: bigint,
  nonce2: bigint,
  tokenId: bigint,
): boolean {
  try {
    const master = HDNodeWallet.fromExtendedKey(masterPubkey);
    const path1 = `${tokenId.toString()}/${nonce1.toString()}`;
    const path2 = `${tokenId.toString()}/${nonce2.toString()}`;
    const derived1 = getAddress(master.derivePath(path1).address);
    const derived2 = getAddress(master.derivePath(path2).address);

    return derived1 === getAddress(child1) && derived2 === getAddress(child2);
  } catch {
    return false;
  }
}
