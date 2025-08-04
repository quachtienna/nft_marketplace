import { StacksTestnet } from '@stacks/network';
import {
    AnchorMode,
    broadcastTransaction,
    contractPrincipalCV,
    makeContractCall,
    noneCV,
    PostConditionMode,
    someCV,
    standardPrincipalCV,
    uintCV,
} from '@stacks/transactions';

// Configuration
const network = new StacksTestnet();
const contractAddress = 'STT7DEMBVKGRGBQFG5EP801XC71566V9ZQM4C9GZ';
const marketplaceContract = 'nft-marketplace';
const nftContract = 'simple-nft';

// Your private key (replace with actual key)
const privateKey = process.env.PRIVATE_KEY || '';

async function mintNFT(recipient: string) {
  if (!privateKey) {
    console.error('Please set PRIVATE_KEY environment variable');
    return;
  }

  try {
    console.log(`🎨 Minting NFT to ${recipient}...`);

    const txOptions = {
      contractAddress,
      contractName: nftContract,
      functionName: 'mint',
      functionArgs: [standardPrincipalCV(recipient)],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    console.log('✅ Mint transaction sent!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('Explorer:', `https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);

  } catch (error) {
    console.error('❌ Mint failed:', error);
  }
}

async function listNFT(tokenId: number, price: number, royaltyPercent: number = 0) {
  if (!privateKey) {
    console.error('Please set PRIVATE_KEY environment variable');
    return;
  }

  try {
    console.log(`🏷️ Listing NFT #${tokenId} for ${price} microSTX...`);

    const txOptions = {
      contractAddress,
      contractName: marketplaceContract,
      functionName: 'list-nft',
      functionArgs: [
        contractPrincipalCV(contractAddress, nftContract),
        uintCV(tokenId),
        uintCV(price),
        uintCV(royaltyPercent),
        royaltyPercent > 0 ? someCV(standardPrincipalCV(contractAddress)) : noneCV()
      ],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    console.log('✅ List transaction sent!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('Explorer:', `https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);

  } catch (error) {
    console.error('❌ Listing failed:', error);
  }
}

async function buyNFT(tokenId: number, seller: string) {
  if (!privateKey) {
    console.error('Please set PRIVATE_KEY environment variable');
    return;
  }

  try {
    console.log(`💰 Buying NFT #${tokenId} from ${seller}...`);

    const txOptions = {
      contractAddress,
      contractName: marketplaceContract,
      functionName: 'buy-nft',
      functionArgs: [
        contractPrincipalCV(contractAddress, nftContract),
        uintCV(tokenId),
        standardPrincipalCV(seller)
      ],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    console.log('✅ Buy transaction sent!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('Explorer:', `https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);

  } catch (error) {
    console.error('❌ Purchase failed:', error);
  }
}

async function cancelListing(tokenId: number) {
  if (!privateKey) {
    console.error('Please set PRIVATE_KEY environment variable');
    return;
  }

  try {
    console.log(`❌ Canceling listing for NFT #${tokenId}...`);

    const txOptions = {
      contractAddress,
      contractName: marketplaceContract,
      functionName: 'cancel-listing',
      functionArgs: [
        standardPrincipalCV(`${contractAddress}.${nftContract}`),
        uintCV(tokenId)
      ],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    console.log('✅ Cancel transaction sent!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('Explorer:', `https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);

  } catch (error) {
    console.error('❌ Cancel failed:', error);
  }
}

async function getMarketplaceStats() {
  console.log('📊 Marketplace Statistics:');
  console.log('Use Stacks Explorer or clarinet console to check:');
  console.log(`- Total Volume: (contract-call? '${contractAddress}.${marketplaceContract} get-total-volume)`);
  console.log(`- Total Sales: (contract-call? '${contractAddress}.${marketplaceContract} get-total-sales)`);
  console.log(`- Marketplace Fee: (contract-call? '${contractAddress}.${marketplaceContract} get-marketplace-fee)`);
  console.log(`Explorer: https://explorer.stacks.co/address/${contractAddress}.${marketplaceContract}?chain=testnet`);
}

// Command line interface
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];
const arg3 = process.argv[5];

switch (command) {
  case 'mint':
    if (arg1) {
      mintNFT(arg1);
    } else {
      console.log('Usage: npm run interact mint <recipient-address>');
    }
    break;
  case 'list':
    if (arg1 && arg2) {
      listNFT(parseInt(arg1), parseInt(arg2), arg3 ? parseInt(arg3) : 0);
    } else {
      console.log('Usage: npm run interact list <token-id> <price> [royalty-percent]');
    }
    break;
  case 'buy':
    if (arg1 && arg2) {
      buyNFT(parseInt(arg1), arg2);
    } else {
      console.log('Usage: npm run interact buy <token-id> <seller-address>');
    }
    break;
  case 'cancel':
    if (arg1) {
      cancelListing(parseInt(arg1));
    } else {
      console.log('Usage: npm run interact cancel <token-id>');
    }
    break;
  case 'stats':
    getMarketplaceStats();
    break;
  default:
    console.log('Available commands:');
    console.log('  npm run interact mint <recipient-address>');
    console.log('  npm run interact list <token-id> <price> [royalty-percent]');
    console.log('  npm run interact buy <token-id> <seller-address>');
    console.log('  npm run interact cancel <token-id>');
    console.log('  npm run interact stats');
}

export { buyNFT, cancelListing, getMarketplaceStats, listNFT, mintNFT };

