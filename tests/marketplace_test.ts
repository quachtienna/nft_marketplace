import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const seller = accounts.get("wallet_1")!;
const buyer = accounts.get("wallet_2")!;

describe("NFT Marketplace Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  it("should initialize with correct default values", () => {
    const marketplaceFee = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-marketplace-fee",
      [],
      deployer
    );
    expect(marketplaceFee.result).toBeUint(250); // 2.5%

    const totalVolume = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-total-volume",
      [],
      deployer
    );
    expect(totalVolume.result).toBeUint(0);
  });

  it("should mint NFTs successfully", () => {
    const mintResult = simnet.callPublicFn(
      "simple-nft",
      "mint",
      [Cl.principal(seller)],
      deployer
    );
    expect(mintResult.result).toBeOk(Cl.uint(4)); // Token ID 4 (after initial 3)

    // Check owner
    const ownerResult = simnet.callReadOnlyFn(
      "simple-nft",
      "get-owner",
      [Cl.uint(4)],
      deployer
    );
    expect(ownerResult.result).toBeOk(Cl.some(Cl.principal(seller)));
  });

  it("should list NFT for sale", () => {
    // First mint an NFT to seller
    simnet.callPublicFn(
      "simple-nft",
      "mint",
      [Cl.principal(seller)],
      deployer
    );

    // List the NFT
    const listResult = simnet.callPublicFn(
      "nft-marketplace",
      "list-nft",
      [
        Cl.contractPrincipal(deployer, "simple-nft"),
        Cl.uint(4),
        Cl.uint(1000000), // 1 STX
        Cl.uint(500), // 5% royalty
        Cl.some(Cl.principal(deployer))
      ],
      seller
    );
    expect(listResult.result).toBeOk(Cl.bool(true));

    // Check listing exists
    const listing = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-listing",
      [Cl.principal(`${deployer}.simple-nft`), Cl.uint(4)],
      deployer
    );
    expect(listing.result).toBeSome();
  });

  it("should prevent unauthorized listing", () => {
    // Try to list NFT that buyer doesn't own
    const listResult = simnet.callPublicFn(
      "nft-marketplace",
      "list-nft",
      [
        Cl.contractPrincipal(deployer, "simple-nft"),
        Cl.uint(1), // NFT owned by deployer
        Cl.uint(1000000),
        Cl.uint(0),
        Cl.none()
      ],
      buyer
    );
    expect(listResult.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });

  it("should allow buying listed NFT", () => {
    // Mint and list NFT
    simnet.callPublicFn("simple-nft", "mint", [Cl.principal(seller)], deployer);
    simnet.callPublicFn(
      "nft-marketplace",
      "list-nft",
      [
        Cl.contractPrincipal(deployer, "simple-nft"),
        Cl.uint(4),
        Cl.uint(1000000),
        Cl.uint(0),
        Cl.none()
      ],
      seller
    );

    // Buy the NFT
    const buyResult = simnet.callPublicFn(
      "nft-marketplace",
      "buy-nft",
      [
        Cl.contractPrincipal(deployer, "simple-nft"),
        Cl.uint(4),
        Cl.principal(seller)
      ],
      buyer
    );
    expect(buyResult.result).toBeOk(Cl.bool(true));

    // Check new owner
    const ownerResult = simnet.callReadOnlyFn(
      "simple-nft",
      "get-owner",
      [Cl.uint(4)],
      deployer
    );
    expect(ownerResult.result).toBeOk(Cl.some(Cl.principal(buyer)));

    // Check listing is removed
    const listing = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-listing",
      [Cl.principal(`${deployer}.simple-nft`), Cl.uint(4)],
      deployer
    );
    expect(listing.result).toBeNone();
  });

  it("should calculate fees correctly", () => {
    const fees = simnet.callReadOnlyFn(
      "nft-marketplace",
      "calculate-fees",
      [Cl.uint(1000000)], // 1 STX
      deployer
    );
    
    // 2.5% of 1 STX = 25000 microSTX
    // Seller gets 975000 microSTX
    expect(fees.result).toBeTuple({
      "marketplace-fee": Cl.uint(25000),
      "seller-amount": Cl.uint(975000)
    });
  });

  it("should allow canceling listing", () => {
    // Mint and list NFT
    simnet.callPublicFn("simple-nft", "mint", [Cl.principal(seller)], deployer);
    simnet.callPublicFn(
      "nft-marketplace",
      "list-nft",
      [
        Cl.contractPrincipal(deployer, "simple-nft"),
        Cl.uint(4),
        Cl.uint(1000000),
        Cl.uint(0),
        Cl.none()
      ],
      seller
    );

    // Cancel listing
    const cancelResult = simnet.callPublicFn(
      "nft-marketplace",
      "cancel-listing",
      [Cl.principal(`${deployer}.simple-nft`), Cl.uint(4)],
      seller
    );
    expect(cancelResult.result).toBeOk(Cl.bool(true));

    // Check listing is removed
    const listing = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-listing",
      [Cl.principal(`${deployer}.simple-nft`), Cl.uint(4)],
      deployer
    );
    expect(listing.result).toBeNone();
  });

  it("should prevent unauthorized cancel", () => {
    // Mint and list NFT
    simnet.callPublicFn("simple-nft", "mint", [Cl.principal(seller)], deployer);
    simnet.callPublicFn(
      "nft-marketplace",
      "list-nft",
      [
        Cl.contractPrincipal(deployer, "simple-nft"),
        Cl.uint(4),
        Cl.uint(1000000),
        Cl.uint(0),
        Cl.none()
      ],
      seller
    );

    // Try to cancel from different user
    const cancelResult = simnet.callPublicFn(
      "nft-marketplace",
      "cancel-listing",
      [Cl.principal(`${deployer}.simple-nft`), Cl.uint(4)],
      buyer
    );
    expect(cancelResult.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });

  it("should update statistics correctly", () => {
    // Mint and list NFT
    simnet.callPublicFn("simple-nft", "mint", [Cl.principal(seller)], deployer);
    simnet.callPublicFn(
      "nft-marketplace",
      "list-nft",
      [
        Cl.contractPrincipal(deployer, "simple-nft"),
        Cl.uint(4),
        Cl.uint(1000000),
        Cl.uint(0),
        Cl.none()
      ],
      seller
    );

    // Buy NFT
    simnet.callPublicFn(
      "nft-marketplace",
      "buy-nft",
      [
        Cl.contractPrincipal(deployer, "simple-nft"),
        Cl.uint(4),
        Cl.principal(seller)
      ],
      buyer
    );

    // Check total volume
    const totalVolume = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-total-volume",
      [],
      deployer
    );
    expect(totalVolume.result).toBeUint(1000000);

    // Check total sales
    const totalSales = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-total-sales",
      [],
      deployer
    );
    expect(totalSales.result).toBeUint(1);
  });

  it("should allow admin to set marketplace fee", () => {
    const setFeeResult = simnet.callPublicFn(
      "nft-marketplace",
      "set-marketplace-fee",
      [Cl.uint(300)], // 3%
      deployer
    );
    expect(setFeeResult.result).toBeOk(Cl.uint(300));

    const newFee = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-marketplace-fee",
      [],
      deployer
    );
    expect(newFee.result).toBeUint(300);
  });

  it("should prevent non-admin from setting fee", () => {
    const setFeeResult = simnet.callPublicFn(
      "nft-marketplace",
      "set-marketplace-fee",
      [Cl.uint(300)],
      seller
    );
    expect(setFeeResult.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });
});
