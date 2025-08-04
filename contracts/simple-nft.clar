;; Simple NFT Contract (SIP-009 Compatible)
;; Example NFT for testing the marketplace

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

;; Data Variables
(define-data-var last-token-id uint u0)
(define-data-var token-uri-prefix (string-ascii 256) "https://api.example.com/metadata/")

;; Data Maps
(define-map token-count principal uint)
(define-map market-approved {token-id: uint, spender: principal} bool)

;; Non-Fungible Token Definition
(define-non-fungible-token simple-nft uint)

;; SIP-009 Implementation
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (some (concat (var-get token-uri-prefix) (uint-to-ascii token-id)))))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? simple-nft token-id)))

;; Transfer function
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
    (asserts! (is-some (nft-get-owner? simple-nft token-id)) ERR_NOT_FOUND)
    (nft-transfer? simple-nft token-id sender recipient)))

;; Mint function
(define-public (mint (recipient principal))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (try! (nft-mint? simple-nft token-id recipient))
    (var-set last-token-id token-id)
    (map-set token-count recipient 
      (+ (get-balance recipient) u1))
    (ok token-id)))

;; Marketplace approval
(define-public (set-approved (token-id uint) (spender principal) (approved bool))
  (let ((owner (unwrap! (nft-get-owner? simple-nft token-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
    (ok (map-set market-approved {token-id: token-id, spender: spender} approved))))

(define-read-only (is-approved (token-id uint) (spender principal))
  (default-to false 
    (map-get? market-approved {token-id: token-id, spender: spender})))

;; Helper functions
(define-read-only (get-balance (account principal))
  (default-to u0 (map-get? token-count account)))

(define-private (uint-to-ascii (value uint))
  (if (<= value u9)
    (unwrap-panic (element-at "0123456789" value))
    (get r (fold uint-to-ascii-inner 
      0x000000000000000000000000000000000000000000000000000000000000000000000000 
      {v: value, r: ""}))))

(define-private (uint-to-ascii-inner (i (buff 1)) (d {v: uint, r: (string-ascii 39)}))
  (if (> (get v d) u0)
    {
      v: (/ (get v d) u10),
      r: (unwrap-panic (as-max-len? 
        (concat (unwrap-panic (element-at "0123456789" (mod (get v d) u10))) (get r d)) 
        u39))
    }
    d))

;; Initialize with some test NFTs
(mint CONTRACT_OWNER)
(mint CONTRACT_OWNER)
(mint CONTRACT_OWNER)
