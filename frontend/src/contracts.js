import { ethers } from "ethers";
import TokenABI from "./abi/Token.json";
import FaucetABI from "./abi/Faucet.json";

const RPC_URL = import.meta.env.VITE_RPC_URL;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS;

// Read-only provider
export function getProvider() {
  return new ethers.providers.JsonRpcProvider(RPC_URL);
}

// MetaMask signer
export function getSigner() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getSigner();
}

export function getTokenContract(signerOrProvider) {
  return new ethers.Contract(
    TOKEN_ADDRESS,
    TokenABI.abi,
    signerOrProvider
  );
}

export function getFaucetContract(signerOrProvider) {
  return new ethers.Contract(
    FAUCET_ADDRESS,
    FaucetABI.abi,
    signerOrProvider
  );
}
