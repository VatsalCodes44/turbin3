import { create, mplCore, ruleSet } from "@metaplex-foundation/mpl-core";
import wallet from "./wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

umi.use(mplCore());
(async () => {
  const metadataUri =
    "https://gateway.irys.xyz/5CsrVEJQCvuhVx9J2NfoC1S3vFdHw8NoUFdSumSBAcDn";

  const asset = generateSigner(umi);

  const tx = await create(umi, {
    asset,
    name: "Iron Throne",
    uri: metadataUri,
    updateAuthority: keypair.publicKey,
    plugins: [
      {
        type: "Royalties",
        basisPoints: 1000,
        creators: [
          {
            address: keypair.publicKey,
            percentage: 100,
          },
        ],
        ruleSet: ruleSet("None"),
      },
    ],
  }).sendAndConfirm(umi);

  console.log("Asset created at", asset.publicKey);
})();
