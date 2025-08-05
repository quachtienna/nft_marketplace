# Simple NFT Marketplace

# Contract Addresses: STT7DEMBVKGRGBQFG5EP801XC71566V9ZQM4C9GZ.simple-nft

## Description
Simple NFT Marketplace is a simple smart contract that enables the safe and efficient buying and selling of NFTs. It is the basic infrastructure required for any NFT ecosystem.

## Main Features
- **List NFT**: Owners can list NFTs for sale
- **Buy NFT**: Users can buy listed NFTs
- **Cancel Listing**: Owners can cancel listings
- **Royalty System**: Royalty support for creators
- **Commission Fee**: Marketplace fee for the platform

## Project Structure
```
simple_nft_marketplace/
├── contracts/
│ ├── nft-marketplace.clar # Main marketplace contract
│ └── simple-nft.clar # Example NFT contract
├── tests/
│ └── marketplace_test.ts # Unit tests
├── scripts/
│ └── deploy.ts # Deployment script
├── Clarinet.toml # Clarinet configuration
├── package.json # Dependencies
└── README.md # Documentation
```

## How to use

### 1. List of NFTs for sale
```clarity
(contract-call? .nft-marketplace list-nft 
.simple-nft 
u1 
u1000000);; 1 STX
```

### 2. Buy NFTs
```clarity
(contract-call? .nft-marketplace buy-nft 
.simple-nft 
u1 
'SP2SELLER...)
```

### 3. Cancel listing
```clarity
(contract-call? .nft-marketplace cancel-listing 
.simple-nft 
u1)
```

### 4. View listing information
```clarity
(contract-call? .nft-marketplace get-listing 
.simple-nft 
u1)
```

## Specifications
- **Marketplace Fee**: 2.5% per transaction
- **Royal Support**: Maximum 10% for creator
- **Payment**: STX tokens
- **NFT Standard**: SIP-009 compatible

## Benefits
1. **Simple**: Short, easy-to-understand code
2. **Safe**: Escrow mechanism, ownership checks
3. **Efficient**: Optimized gas usage
4. **Flexible**: Supports all types of NFT SIP-009
5. **Revenue**: Commission system for platform

## Security features
- ✅ Ownership verification
- ✅ Escrow mechanism
- ✅ Reentrancy protection
- ✅ Input validation
- ✅ Access control

## Use Cases
- **Digital Art**: Marketplace for digital art
- **Gaming Items**: Selling in-game items
- **Collectibles**: Trading cards, collectibles
- **Domain Names**: NFT domain marketplace
- **Music/Video**: Media NFT trading

## Deployment
1. Clone repository
2. Run `npm install`
3. Configure Clarinet settings
4. Deploy with `clarinet deploy`

## Testing
```bash
npm test
```
