// import { useEffect, useState } from "react";
// import {
//   getProvider,
//   getSigner,
//   getTokenContract,
//   getFaucetContract,
// } from "./contracts";

// function App() {
//   const [address, setAddress] = useState(null);
//   const [balance, setBalance] = useState("0");
//   const [canClaim, setCanClaim] = useState(false);
//   const [remaining, setRemaining] = useState("0");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function connectWallet() {
//     try {
//       if (!window.ethereum) {
//         alert("Please install MetaMask");
//         return;
//       }
//       const accounts = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });
//       setAddress(accounts[0]);
//     } catch (err) {
//       setError(err.message);
//     }
//   }

//   async function loadData(user) {
//     try {
//       const provider = getProvider();
//       const token = getTokenContract(provider);
//       const faucet = getFaucetContract(provider);

//       const bal = await token.balanceOf(user);
//       const can = await faucet.canClaim(user);
//       const rem = await faucet.remainingAllowance(user);

//       setBalance(bal.toString());
//       setCanClaim(can);
//       setRemaining(rem.toString());
//     } catch (err) {
//       setError(err.message);
//     }
//   }

//   async function requestTokens() {
//     try {
//       setLoading(true);
//       setError("");

//       const signer = getSigner();
//       const faucet = getFaucetContract(signer);

//       const tx = await faucet.requestTokens();
//       await tx.wait();

//       await loadData(address);
//     } catch (err) {
//       setError(err.reason || err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     if (address) {
//       loadData(address);
//     }
//   }, [address]);

//   return (
//     <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
//       <h1>ERC20 Faucet DApp</h1>

//       {!address ? (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       ) : (
//         <>
//           <p><b>Connected:</b> {address}</p>
//           <p><b>Token Balance:</b> {balance}</p>
//           <p><b>Remaining Allowance:</b> {remaining}</p>
//           <p><b>Can Claim:</b> {canClaim ? "Yes" : "No"}</p>

//           <button
//             onClick={requestTokens}
//             disabled={!canClaim || loading}
//           >
//             {loading ? "Claiming..." : "Request Tokens"}
//           </button>
//         </>
//       )}

//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// }

// export default App;
import { useEffect, useState } from "react";
import {
  getProvider,
  getSigner,
  getTokenContract,
  getFaucetContract,
} from "./contracts";

function App() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [canClaim, setCanClaim] = useState(false);
  const [remaining, setRemaining] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- HELPER FUNCTION TO SWITCH NETWORKS ---
  async function switchToSepolia() {
    const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // Error code 4902 means the network is not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Test Network',
              nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
              rpcUrls: ['https://rpc2.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
        } catch (addError) {
          throw new Error("Could not add Sepolia network to MetaMask");
        }
      } else {
        throw switchError;
      }
    }
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      // 1. Force the switch to Sepolia first
      await switchToSepolia();

      // 2. Request accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      setAddress(accounts[0]);
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadData(user) {
    try {
      const provider = getProvider();
      const token = getTokenContract(provider);
      const faucet = getFaucetContract(provider);

      const bal = await token.balanceOf(user);
      const can = await faucet.canClaim(user);
      const rem = await faucet.remainingAllowance(user);

      setBalance(bal.toString());
      setCanClaim(can);
      setRemaining(rem.toString());
    } catch (err) {
      // If the user switches network manually after connecting, 
      // loadData might fail. We catch that here.
      setError("Please ensure you are on the Sepolia Network.");
    }
  }

  async function requestTokens() {
    try {
      setLoading(true);
      setError("");

      const signer = getSigner();
      const faucet = getFaucetContract(signer);

      const tx = await faucet.requestTokens();
      await tx.wait();

      await loadData(address);
    } catch (err) {
      setError(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (address) {
      loadData(address);
    }
    
    // Optional: Refresh page if user changes network manually
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', (acc) => setAddress(acc[0] || null));
    }
  }, [address]);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>ERC20 Faucet DApp</h1>

      {!address ? (
        <button onClick={connectWallet}>Connect Wallet (Sepolia)</button>
      ) : (
        <>
          <p><b>Connected:</b> {address}</p>
          <p><b>Token Balance:</b> {balance}</p>
          <p><b>Remaining Allowance:</b> {remaining}</p>
          <p><b>Can Claim:</b> {canClaim ? "Yes" : "No"}</p>

          <button
            onClick={requestTokens}
            disabled={!canClaim || loading}
          >
            {loading ? "Claiming..." : "Request Tokens"}
          </button>
        </>
      )}

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
    </div>
  );
}

export default App;