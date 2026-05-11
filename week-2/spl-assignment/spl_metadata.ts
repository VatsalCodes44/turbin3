import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "./wallet.json";
import {
  createMetadataAccountV3,
  type CreateMetadataAccountV3InstructionAccounts,
  type CreateMetadataAccountV3InstructionArgs,
  type DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

const mint = publicKey("3sRPTgAk6ue1LU4VcMM2ZmtPrNvZAwFphVfnUpNhBPMA");

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(wallet));

const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    const data: DataV2Args = {
      name: "Bot Coin",
      symbol: "BOT",
      uri: "https://l1nq.com/3an23mr",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    const args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };

    const tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });

    const result = await tx.sendAndConfirm(umi);

    console.log(
      "Transaction sig: ",
      bs58.encode(Buffer.from(result.signature)),
    );
  } catch (error) {
    console.log(error);
  }
})();
