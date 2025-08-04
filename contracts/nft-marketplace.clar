;; Simple NFT Marketplace Contract
;; Allows buying and selling of SIP-009 NFTs

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_LISTED (err u102))
(define-constant ERR_NOT_LISTED (err u103))
(define-constant ERR_INSUFFICIENT_FUNDS (err u104))
(define-constant ERR_INVALID_PRICE (err u105))
(define-constant ERR_SELF_PURCHASE (err u106))

;; Data Variables
(define-data-var marketplace-fee uint u250) ;; 2.5% (250/10000)
(define-data-var total-volume uint u0)
(define-data-var total-sales uint u0)

;; Data Maps
(define-map listings 
  {nft-contract: principal, token-id: uint}
  {seller: principal, price: uint, royalty-percent: uint, royalty-recipient: (optional principal)})

(define-map user-stats principal {sales: uint, purchases: uint, volume: uint})

;; Read-only functions
(define-read-only (get-listing (nft-contract principal) (token-id uint))
  (map-get? listings {nft-contract: nft-contract, token-id: token-id}))

(define-read-only (get-marketplace-fee)
  (var-get marketplace-fee))

(define-read-only (get-total-volume)
  (var-get total-volume))

(define-read-only (get-total-sales)
  (var-get total-sales))

(define-read-only (get-user-stats (user principal))
  (default-to {sales: u0, purchases: u0, volume: u0} 
    (map-get? user-stats user)))

(define-read-only (calculate-fees (price uint))
  (let ((marketplace-cut (/ (* price (var-get marketplace-fee)) u10000)))
    {marketplace-fee: marketplace-cut, seller-amount: (- price marketplace-cut)}))

;; Public functions
(define-public (list-nft 
  (nft-contract <nft-trait>) 
  (token-id uint) 
  (price uint)
  (royalty-percent uint)
  (royalty-recipient (optional principal)))
  (let ((listing-key {nft-contract: (contract-of nft-contract), token-id: token-id}))
    
    ;; Validations
    (asserts! (> price u0) ERR_INVALID_PRICE)
    (asserts! (<= royalty-percent u1000) ERR_INVALID_PRICE) ;; Max 10%
    (asserts! (is-none (map-get? listings listing-key)) ERR_ALREADY_LISTED)
    
    ;; Check ownership
    (let ((owner-response (contract-call? nft-contract get-owner token-id)))
      (asserts! (is-ok owner-response) ERR_NOT_FOUND)
      (let ((owner-option (unwrap! owner-response ERR_NOT_FOUND)))
        (asserts! (is-some owner-option) ERR_NOT_FOUND)
        (asserts! (is-eq (unwrap-panic owner-option) tx-sender) ERR_UNAUTHORIZED)))
    
    ;; Create listing
    (map-set listings listing-key {
      seller: tx-sender,
      price: price,
      royalty-percent: royalty-percent,
      royalty-recipient: royalty-recipient
    })
    
    (ok true)))

(define-public (buy-nft (nft-contract <nft-trait>) (token-id uint) (seller principal))
  (let ((listing-key {nft-contract: (contract-of nft-contract), token-id: token-id})
        (listing (unwrap! (map-get? listings listing-key) ERR_NOT_LISTED)))
    
    ;; Validations
    (asserts! (is-eq (get seller listing) seller) ERR_NOT_FOUND)
    (asserts! (not (is-eq tx-sender seller)) ERR_SELF_PURCHASE)
    
    (let ((price (get price listing))
          (royalty-percent (get royalty-percent listing))
          (royalty-recipient (get royalty-recipient listing))
          (fees (calculate-fees price)))
      
      ;; Calculate payments
      (let ((marketplace-cut (get marketplace-fee fees))
            (royalty-amount (/ (* price royalty-percent) u10000))
            (seller-amount (- (- price marketplace-cut) royalty-amount)))
        
        ;; Transfer STX payments
        (try! (stx-transfer? marketplace-cut tx-sender CONTRACT_OWNER))
        (try! (stx-transfer? seller-amount tx-sender seller))
        
        ;; Pay royalty if specified
        (if (and (> royalty-amount u0) (is-some royalty-recipient))
          (try! (stx-transfer? royalty-amount tx-sender (unwrap-panic royalty-recipient)))
          true)
        
        ;; Transfer NFT
        (try! (contract-call? nft-contract transfer token-id seller tx-sender))
        
        ;; Remove listing
        (map-delete listings listing-key)
        
        ;; Update statistics
        (var-set total-volume (+ (var-get total-volume) price))
        (var-set total-sales (+ (var-get total-sales) u1))
        
        ;; Update user stats
        (update-user-stats seller true price)
        (update-user-stats tx-sender false price)
        
        (ok true)))))

(define-public (cancel-listing (nft-contract principal) (token-id uint))
  (let ((listing-key {nft-contract: nft-contract, token-id: token-id})
        (listing (unwrap! (map-get? listings listing-key) ERR_NOT_LISTED)))
    
    (asserts! (is-eq (get seller listing) tx-sender) ERR_UNAUTHORIZED)
    (map-delete listings listing-key)
    (ok true)))

;; Admin functions
(define-public (set-marketplace-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (<= new-fee u1000) ERR_INVALID_PRICE) ;; Max 10%
    (var-set marketplace-fee new-fee)
    (ok new-fee)))

(define-public (withdraw-fees (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (stx-transfer? amount (as-contract tx-sender) CONTRACT_OWNER)))

;; Private functions
(define-private (update-user-stats (user principal) (is-seller bool) (amount uint))
  (let ((current-stats (get-user-stats user)))
    (if is-seller
      (map-set user-stats user {
        sales: (+ (get sales current-stats) u1),
        purchases: (get purchases current-stats),
        volume: (+ (get volume current-stats) amount)
      })
      (map-set user-stats user {
        sales: (get sales current-stats),
        purchases: (+ (get purchases current-stats) u1),
        volume: (+ (get volume current-stats) amount)
      }))))

;; NFT Trait
(define-trait nft-trait
  (
    (get-last-token-id () (response uint uint))
    (get-token-uri (uint) (response (optional (string-ascii 256)) uint))
    (get-owner (uint) (response (optional principal) uint))
    (transfer (uint principal principal) (response bool uint))
  ))
