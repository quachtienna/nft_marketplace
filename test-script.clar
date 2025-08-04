;; Test Script for NFT Marketplace
;; This script tests all major functions of the marketplace

;; Test 1: Check initial state
(print "=== TEST 1: Initial State ===")
(print (contract-call? .nft-marketplace get-marketplace-fee))
(print (contract-call? .nft-marketplace get-total-volume))
(print (contract-call? .nft-marketplace get-total-sales))

;; Test 2: Check NFT contract initial state
(print "=== TEST 2: NFT Initial State ===")
(print (contract-call? .simple-nft get-last-token-id))
(print (contract-call? .simple-nft get-owner u1))
(print (contract-call? .simple-nft get-owner u2))
(print (contract-call? .simple-nft get-owner u3))

;; Test 3: Mint new NFT
(print "=== TEST 3: Mint New NFT ===")
(print (contract-call? .simple-nft mint tx-sender))
(print (contract-call? .simple-nft get-last-token-id))
(print (contract-call? .simple-nft get-owner u4))

;; Test 4: List NFT for sale
(print "=== TEST 4: List NFT ===")
(print (contract-call? .nft-marketplace list-nft 
  .simple-nft 
  u4 
  u1000000 ;; 1 STX
  u500     ;; 5% royalty
  (some tx-sender)))

;; Test 5: Check listing
(print "=== TEST 5: Check Listing ===")
(print (contract-call? .nft-marketplace get-listing .simple-nft u4))

;; Test 6: Calculate fees
(print "=== TEST 6: Calculate Fees ===")
(print (contract-call? .nft-marketplace calculate-fees u1000000))

;; Test 7: Check if can claim (this should work for different user)
(print "=== TEST 7: User Stats ===")
(print (contract-call? .nft-marketplace get-user-stats tx-sender))

;; Test 8: Try to list already listed NFT (should fail)
(print "=== TEST 8: Double List (Should Fail) ===")
(print (contract-call? .nft-marketplace list-nft 
  .simple-nft 
  u4 
  u2000000 
  u0 
  none))

;; Test 9: Cancel listing
(print "=== TEST 9: Cancel Listing ===")
(print (contract-call? .nft-marketplace cancel-listing .simple-nft u4))
(print (contract-call? .nft-marketplace get-listing .simple-nft u4))

;; Test 10: List again after cancel
(print "=== TEST 10: List After Cancel ===")
(print (contract-call? .nft-marketplace list-nft 
  .simple-nft 
  u4 
  u500000 ;; 0.5 STX
  u0       ;; No royalty
  none))

;; Test 11: Admin functions
(print "=== TEST 11: Admin Functions ===")
(print (contract-call? .nft-marketplace set-marketplace-fee u300)) ;; 3%
(print (contract-call? .nft-marketplace get-marketplace-fee))

;; Test 12: NFT URI and metadata
(print "=== TEST 12: NFT Metadata ===")
(print (contract-call? .simple-nft get-token-uri u1))
(print (contract-call? .simple-nft get-token-uri u4))

;; Test 13: Check balances
(print "=== TEST 13: NFT Balances ===")
(print (contract-call? .simple-nft get-balance tx-sender))

(print "=== ALL TESTS COMPLETED ===")
