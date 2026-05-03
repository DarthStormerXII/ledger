import { HDNodeWallet, getAddress } from "ethers";

export function verifyDerivation(
  masterPubkey: string,
  child1: string,
  child2: string,
  nonce1: bigint,
  nonce2: bigint
): boolean {
  try {
    const master = HDNodeWallet.fromExtendedKey(masterPubkey);
    const derived1 = getAddress(master.derivePath(`0/${nonce1.toString()}`).address);
    const derived2 = getAddress(master.derivePath(`0/${nonce2.toString()}`).address);

    return derived1 === getAddress(child1) && derived2 === getAddress(child2);
  } catch {
    return false;
  }
}
