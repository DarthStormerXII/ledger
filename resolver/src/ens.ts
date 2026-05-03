import {
  AbiCoder,
  FunctionFragment,
  Interface,
  Signature,
  SigningKey,
  getBytes,
  hexlify,
  isAddress,
  keccak256,
  namehash,
  solidityPackedKeccak256
} from "ethers";
import { decodeDnsName } from "./dns.js";
import type { ResolverConfig } from "./config.js";
import { resolveName } from "./resolver.js";

const ETH_COIN_TYPE = 60n;

const resolverInterface = new Interface([
  "function addr(bytes32 node) view returns (address)",
  "function addr(bytes32 node, uint256 coinType) view returns (bytes)",
  "function text(bytes32 node, string key) view returns (string)",
  "function contenthash(bytes32 node) view returns (bytes)"
]);

const serviceInterface = new Interface([
  "function resolve(bytes name, bytes data) view returns (bytes result, uint64 expires, bytes sig)"
]);

const serviceResolveFragment = serviceInterface.getFunction("resolve");
if (!serviceResolveFragment) {
  throw new Error("Unable to load IResolverService.resolve ABI");
}
const serviceResolve = serviceResolveFragment as FunctionFragment;

export type GatewayRequest = {
  sender: string;
  callData: string;
};

export type GatewayResponse = {
  data: string;
};

export async function handleGatewayRequest(
  request: GatewayRequest,
  config: ResolverConfig
): Promise<GatewayResponse> {
  if (!isAddress(request.sender)) {
    throw new Error("Invalid resolver sender address");
  }
  if (!request.callData.startsWith("0x")) {
    throw new Error("Invalid callData");
  }
  if (!config.privateKey) {
    throw new Error("RESOLVER_PRIVATE_KEY is required to sign CCIP-Read responses");
  }

  const decoded = serviceInterface.decodeFunctionData(serviceResolve, request.callData);
  const encodedName = hexlify(decoded[0]);
  const innerData = hexlify(decoded[1]);
  const result = await query(encodedName, innerData, config);
  const expires = BigInt(Math.floor(Date.now() / 1000) + config.ttlSeconds);
  const sig = signResponse(config.privateKey, request.sender, expires, request.callData, result);
  const data = serviceInterface.encodeFunctionResult(serviceResolve, [result, expires, sig]);

  return { data };
}

export async function query(
  encodedName: string,
  data: string,
  config: ResolverConfig
): Promise<string> {
  const name = decodeDnsName(encodedName);
  const parsed = resolverInterface.parseTransaction({ data });
  if (!parsed) {
    throw new Error("Unsupported resolver calldata");
  }

  const node = parsed.args[0] as string;
  if (namehash(name) !== node) {
    throw new Error("Resolver node does not match DNS-encoded name");
  }

  if (parsed.signature === "addr(bytes32)") {
    const address = await resolveName(name, "addr", config);
    return resolverInterface.encodeFunctionResult(parsed.fragment, [address]);
  }

  if (parsed.signature === "addr(bytes32,uint256)") {
    const coinType = BigInt(parsed.args[1]);
    if (coinType !== ETH_COIN_TYPE) {
      return resolverInterface.encodeFunctionResult(parsed.fragment, ["0x"]);
    }
    const address = await resolveName(name, "addr", config);
    return resolverInterface.encodeFunctionResult(parsed.fragment, [
      AbiCoder.defaultAbiCoder().encode(["address"], [address])
    ]);
  }

  if (parsed.signature === "text(bytes32,string)") {
    const value = await resolveName(name, "text", config, parsed.args[1] as string);
    return resolverInterface.encodeFunctionResult(parsed.fragment, [value]);
  }

  if (parsed.signature === "contenthash(bytes32)") {
    return resolverInterface.encodeFunctionResult(parsed.fragment, ["0x"]);
  }

  throw new Error(`Unsupported resolver function ${parsed.signature}`);
}

export function signResponse(
  privateKey: string,
  target: string,
  expires: bigint,
  requestData: string,
  result: string
): string {
  const digest = solidityPackedKeccak256(
    ["bytes2", "address", "uint64", "bytes32", "bytes32"],
    ["0x1900", target, expires, keccak256(requestData), keccak256(result)]
  );
  const signingKey = new SigningKey(privateKey);
  const signature = Signature.from(signingKey.sign(getBytes(digest)));
  return signature.compactSerialized;
}
