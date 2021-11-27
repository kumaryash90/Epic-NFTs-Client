import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ClipLoader from "react-spinners/ClipLoader";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE_YASH = 'yash09061';
const TWITTER_LINK_YASH = `https://twitter.com/${TWITTER_HANDLE_YASH}`;
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/stoicnft-mfnbiu3c4j';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x956F62691cB5720fA6cD9B2F2bEE19F9aF8eCBe1";
const rinkebyChainId = "0x4";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalMinted, setTotalMinted] = useState(0);
  const [isMining, setIsMining] = useState(false);
  
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("make sure you have metamask");
      return;
    } else {
      console.log("we have ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("connected to chain: ", chainId);
    if(chainId !== rinkebyChainId) {
      alert("you're not connected to rinkeby test network");
      return;
    } else {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if(accounts.length!==0) {
      const account = accounts[0];
      console.log("found an authorised account: ", account);
      setCurrentAccount(account);

      setupEventListener();
      getTotalMinted();
      } else {
        console.log("no authorised account found");
      }
    }
    
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if(!ethereum) {
        alert("get metamask");
        return;
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("connected to chain: ", chainId);
      if(chainId !== rinkebyChainId) {
        alert("you're not connected to rinkeby test network");
        return;
      } else {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log("connected account: ", accounts[0]);
        setCurrentAccount(accounts[0]);

        setupEventListener();
      }
    } catch(error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Your NFT has been sent to your wallet. It can take a while to show up on OpenSea.. here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });

        console.log("setup event listener");
      } else {
        console.log("ethereum object doesn't exist");
      }
    } catch(error) {
      console.log(error);
    }
  }

  const getTotalMinted = async () => {
    try {
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        let totalNFTMinted = await connectedContract.getTotalMinted();
        setTotalMinted(totalNFTMinted.toNumber());

      } else {
        console.log("ethereum object doesn't exist");
      }
    } catch(error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    
    try {
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        let nftTxn = await connectedContract.makeAnEpicNFT();
        setIsMining(true);
        console.log("Mining...");
        await nftTxn.wait();

        console.log(`mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setIsMining(false);
        getTotalMinted();

      } else {
        console.log("ethereum object doesn't exist");
      }
    } catch(error) {
      console.log(error);
    }
  }
  
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

useEffect(() => {
  checkIfWalletIsConnected();
}, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-sub-text">{totalMinted}/25 NFTs Minted So Far</p>
          {!currentAccount ? renderNotConnectedContainer() :
          (
            <button onClick={askContractToMintNft} className="cta-button mint-button" disabled={isMining}>Mint NFT</button>
          )}

          <a href={OPENSEA_LINK} className="opensea-button" target="_blank">View Collection On OpenSea</a>

          {isMining && (
          <div className="spinner">
            <span id="spinnerSpan">mining... </span>
            <ClipLoader color="grey" loading={true} size={12} />
          </div>
          )}

        </div>
        <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;