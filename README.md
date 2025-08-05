# Project 12: Simple NFT Marketplace

# Contract Addresses: STT7DEMBVKGRGBQFG5EP801XC71566V9ZQM4C9GZ.simple-nft

## Mô tả
Simple NFT Marketplace là một smart contract đơn giản cho phép mua bán NFT một cách an toàn và hiệu quả. Đây là infrastructure cơ bản cần thiết cho mọi NFT ecosystem.

## Tính năng chính
- **List NFT**: Chủ sở hữu có thể list NFT để bán
- **Buy NFT**: Người dùng có thể mua NFT đã được list
- **Cancel Listing**: Chủ sở hữu có thể hủy listing
- **Royalty System**: Hỗ trợ royalty cho creator
- **Commission Fee**: Marketplace fee cho platform

## Cấu trúc dự án
```
project12_simple_nft_marketplace/
├── contracts/
│   ├── nft-marketplace.clar   # Main marketplace contract
│   └── simple-nft.clar        # Example NFT contract
├── tests/
│   └── marketplace_test.ts    # Unit tests
├── scripts/
│   └── deploy.ts              # Deployment script
├── Clarinet.toml              # Clarinet configuration
├── package.json               # Dependencies
└── README.md                  # Documentation
```

## Cách sử dụng

### 1. List NFT để bán
```clarity
(contract-call? .nft-marketplace list-nft 
  .simple-nft 
  u1 
  u1000000) ;; 1 STX
```

### 2. Mua NFT
```clarity
(contract-call? .nft-marketplace buy-nft 
  .simple-nft 
  u1 
  'SP2SELLER...)
```

### 3. Hủy listing
```clarity
(contract-call? .nft-marketplace cancel-listing 
  .simple-nft 
  u1)
```

### 4. Xem thông tin listing
```clarity
(contract-call? .nft-marketplace get-listing 
  .simple-nft 
  u1)
```

## Thông số kỹ thuật
- **Marketplace Fee**: 2.5% mỗi giao dịch
- **Royalty Support**: Tối đa 10% cho creator
- **Payment**: STX tokens
- **NFT Standard**: SIP-009 compatible

## Lợi ích
1. **Đơn giản**: Code ngắn gọn, dễ hiểu
2. **An toàn**: Escrow mechanism, ownership checks
3. **Hiệu quả**: Optimized gas usage
4. **Flexible**: Hỗ trợ mọi loại NFT SIP-009
5. **Revenue**: Commission system cho platform

## Tính năng bảo mật
- ✅ Ownership verification
- ✅ Escrow mechanism
- ✅ Reentrancy protection
- ✅ Input validation
- ✅ Access control

## Use Cases
- **Digital Art**: Marketplace cho nghệ thuật số
- **Gaming Items**: Bán item trong game
- **Collectibles**: Trading cards, collectibles
- **Domain Names**: NFT domain marketplace
- **Music/Video**: Media NFT trading

## Deployment
1. Clone repository
2. Run `npm install`
3. Configure Clarinet settings
4. Deploy với `clarinet deploy`

## Testing
```bash
npm test
```
