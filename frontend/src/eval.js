import {
  getSigner,
  getProvider,
  getTokenContract,
  getFaucetContract
} from "./contracts";

window.__EVAL__ = {
  connectWallet: async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    return accounts[0];
  },

  requestTokens: async () => {
    const signer = getSigner();
    const faucet = getFaucetContract(signer);
    const tx = await faucet.requestTokens();
    await tx.wait();
    return tx.hash;
  },

  getBalance: async (address) => {
    const provider = getProvider();
    const token = getTokenContract(provider);
    const balance = await token.balanceOf(address);
    return balance.toString();
  },

  canClaim: async (address) => {
    const provider = getProvider();
    const faucet = getFaucetContract(provider);
    return await faucet.canClaim(address);
  },

  getRemainingAllowance: async (address) => {
    const provider = getProvider();
    const faucet = getFaucetContract(provider);
    const allowance = await faucet.remainingAllowance(address);
    return allowance.toString();
  },

  getContractAddresses: async () => {
    return {
      token: import.meta.env.VITE_TOKEN_ADDRESS,
      faucet: import.meta.env.VITE_FAUCET_ADDRESS
    };
  }
};
