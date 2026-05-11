import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "./wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz",
  }),
);

(async () => {
  try {
    const image =
      "https://gateway.irys.xyz/5faJJtXXWjPrypwWZovKEJR9AvQvu16jPuYaLsa2EZAf";

    const metadata = {
      name: "Iron Throne",
      description: "The Iron Throne",
      image: image,
      attributes: [
        {
          trait_type: "rarity",
          value: "legendary",
        },
        {
          trait_type: "power",
          value: "100",
        },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: image,
          },
        ],
        category: "image",
      },
    };

    const myUri = await umi.uploader.uploadJson(metadata);

    console.log("Metadata uploaded to Irys! URI:", myUri);
  } catch (error) {
    console.error("Error:", error);
  }
})();
