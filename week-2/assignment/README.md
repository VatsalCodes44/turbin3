# Solana SPL Token & NFT Assignment

A hands-on Solana devnet project that covers the full lifecycle of **SPL Tokens** (fungible) and **NFTs** (non-fungible) using the modern `@solana/kit` and Metaplex UMI toolkits.

---

## Overview

This project walks through two main tracks:

| Track              | What it does                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **SPL Token**      | Create a fungible token mint, attach on-chain metadata, mint tokens to a wallet, and transfer them                       |
| **NFT (MPL Core)** | Upload an image & JSON metadata to Irys (decentralized storage), then mint an NFT asset with royalties via Metaplex Core |

All scripts target **Solana Devnet**.

---

## Prerequisites

| Tool                   | Version                              |
| ---------------------- | ------------------------------------ |
| [Bun](https://bun.sh)  | ≥ 1.0                                |
| Node.js                | ≥ 18 (for type support)              |
| A funded Devnet wallet | `wallet.json` (raw secret key array) |

> **Get devnet SOL:** `solana airdrop 2 <your-address> --url devnet`

---

## Setup

```bash
# Install dependencies
bun install

# Place your wallet secret key in wallet.json
# Format: [12, 34, 56, ...]  (Uint8Array as a JSON array)
```

> ⚠️ `wallet.json` is listed in `.gitignore`. Never commit your private key.

---

## Project Structure

```
spl-assignment/
├── assets/
│   └── iron-throne.png      # NFT image asset
│
├── spl_init.ts              # 1. Create a new SPL token mint
├── spl_metadata.ts          # 2. Attach on-chain metadata to the mint
├── spl_mint.ts              # 3. Mint tokens to your ATA
├── spl_transfer.ts          # 4. Transfer tokens to another wallet
│
├── nft_image.ts             # 1. Upload NFT image to Irys
├── nft_metadata.ts          # 2. Upload NFT JSON metadata to Irys
├── nft_mint.ts              # 3. Mint NFT asset via Metaplex Core
│
├── wallet.json              # Your devnet keypair (gitignored)
├── package.json
└── tsconfig.json
```

---

## SPL Token Track

Run the scripts **in order**:

### 1. Initialize a Mint — `spl_init.ts`

```bash
bun run spl:init
```

**What it does:**

- Loads your keypair from `wallet.json`
- Generates a new random keypair for the mint account
- Fetches the minimum rent-exempt balance for a mint account
- Builds a versioned transaction (v0) with two instructions:
  1. `CreateAccount` — allocates the mint account on-chain, owned by the Token Program
  2. `InitializeMint` — sets 6 decimals, and your wallet as both mint authority and freeze authority
- Signs and confirms the transaction
- Prints the **mint address** and **transaction signature**

**Libraries:** `@solana/kit`, `@solana-program/token`, `@solana-program/system`

---

### 2. Attach Metadata — `spl_metadata.ts`

```bash
bun run spl:metadata
```

**What it does:**

- Connects to the mint `3sRPTgAk6ue1LU4VcMM2ZmtPrNvZAwFphVfnUpNhBPMA`
- Uses Metaplex UMI + `mpl-token-metadata` to call `createMetadataAccountV3`
- Stores on-chain metadata:
  - **Name:** `Bot Coin`
  - **Symbol:** `BOT`
  - **URI:** external JSON (hosted at `l1nq.com/3an23mr`)
  - `isMutable: true` — metadata can be updated later
- Prints the transaction signature (base58-encoded)

**Libraries:** `@metaplex-foundation/umi`, `@metaplex-foundation/mpl-token-metadata`, `bs58`

---

### 3. Mint Tokens — `spl_mint.ts`

```bash
bun run spl:mint
```

**What it does:**

- Derives the **Associated Token Account (ATA)** for your wallet and the mint
- Builds a transaction with two instructions:
  1. `CreateAssociatedTokenAccountIdempotent` — creates the ATA if it doesn't exist (safe to re-run)
  2. `MintTo` — mints **1 token** (1 × 10⁶ base units, given 6 decimals)
- Confirms the transaction and prints the **mint transaction ID**

**Libraries:** `@solana/kit`, `@solana-program/token`

---

### 4. Transfer Tokens — `spl_transfer.ts`

```bash
bun run spl:transfer
```

**What it does:**

- Derives ATAs for both sender (`wallet.json`) and receiver (`HaLdUZkgSWGRXiW93cQVDJuQKGKUYELxc58uytEkRygs`)
- Builds a transaction with:
  1. `CreateAssociatedTokenAccountIdempotent` — creates receiver's ATA if needed
  2. `TransferChecked` — transfers **1 token** (with decimal validation) from sender to receiver
- Prints the **transfer transaction ID**

**Libraries:** `@solana/kit`, `@solana-program/token`

---

## NFT Track (Metaplex Core)

Run the scripts **in order**:

### 1. Upload Image — `nft_image.ts`

```bash
bun run nft:image
```

**What it does:**

- Reads `./assets/iron-throne.png` from disk
- Wraps it as a `GenericFile` with `contentType: image/png`
- Uploads it to **Irys devnet** (`https://devnet.irys.xyz`) via the UMI Irys uploader
- Prints the **Irys gateway URI** for the uploaded image

> Uploaded image: `https://gateway.irys.xyz/5faJJtXXWjPrypwWZovKEJR9AvQvu16jPuYaLsa2EZAf`

**Libraries:** `@metaplex-foundation/umi`, `@metaplex-foundation/umi-uploader-irys`

---

### 2. Upload Metadata — `nft_metadata.ts`

```bash
bun run nft:metadata
```

**What it does:**

- Constructs a JSON metadata object following the [Metaplex NFT standard](https://docs.metaplex.com/programs/token-metadata/token-standard):
  ```json
  {
    "name": "Iron Throne",
    "description": "The Iron Throne",
    "image": "<irys-image-uri>",
    "attributes": [
      { "trait_type": "rarity", "value": "legendary" },
      { "trait_type": "power", "value": "100" }
    ],
    "properties": {
      "files": [{ "type": "image/png", "uri": "<irys-image-uri>" }],
      "category": "image"
    }
  }
  ```
- Uploads the JSON to **Irys devnet** via `umi.uploader.uploadJson()`
- Prints the **metadata URI**

> Uploaded metadata: `https://gateway.irys.xyz/5CsrVEJQCvuhVx9J2NfoC1S3vFdHw8NoUFdSumSBAcDn`

**Libraries:** `@metaplex-foundation/umi`, `@metaplex-foundation/umi-uploader-irys`

---

### 3. Mint NFT — `nft_mint.ts`

```bash
bun run nft:mint
```

**What it does:**

- Uses **Metaplex Core** (`mpl-core`) — the next-gen NFT standard replacing Token Metadata
- Generates a new random signer as the **asset keypair**
- Calls `create()` to mint a Core NFT asset with:
  - **Name:** `Iron Throne`
  - **URI:** the Irys metadata URI from step 2
  - **Update Authority:** your wallet
  - **Royalties plugin:** 10% (`1000` basis points), 100% to your wallet, no rule set restrictions
- Confirms the transaction and prints the **asset public key**

**Libraries:** `@metaplex-foundation/mpl-core`, `@metaplex-foundation/umi`

---

## Key Concepts

| Concept                            | Description                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **ATA (Associated Token Account)** | A deterministic token account derived from the owner's wallet + mint address                                           |
| **Irys**                           | A decentralized storage network; files uploaded here are permanent and content-addressed                               |
| **Metaplex Core**                  | The modern NFT standard on Solana — assets are single accounts, cheaper and more composable than legacy Token Metadata |
| **UMI**                            | Metaplex's framework for building Solana transactions in a consistent, plugin-based way                                |
| **Versioned Transactions (v0)**    | The modern Solana transaction format, enabling address lookup tables                                                   |

---

## Scripts Reference

```bash
bun run spl:init        # Create a new token mint
bun run spl:metadata    # Attach on-chain metadata to the mint
bun run spl:mint        # Mint tokens to your wallet
bun run spl:transfer    # Transfer tokens to another wallet

bun run nft:image       # Upload NFT image to Irys
bun run nft:metadata    # Upload NFT JSON metadata to Irys
bun run nft:mint        # Mint NFT asset via Metaplex Core
```

---

## Dependencies

| Package                                    | Purpose                                             |
| ------------------------------------------ | --------------------------------------------------- |
| `@solana/kit`                              | Modern Solana web3 SDK (replaces `@solana/web3.js`) |
| `@solana-program/token`                    | SPL Token program client (codama-generated)         |
| `@metaplex-foundation/umi`                 | Metaplex unified framework                          |
| `@metaplex-foundation/umi-bundle-defaults` | Default UMI setup with RPC, signers, etc.           |
| `@metaplex-foundation/umi-uploader-irys`   | Irys uploader plugin for UMI                        |
| `@metaplex-foundation/mpl-token-metadata`  | Legacy Token Metadata program client                |
| `@metaplex-foundation/mpl-core`            | Metaplex Core NFT program client                    |
| `bs58`                                     | Base58 encode/decode (for printing signatures)      |
