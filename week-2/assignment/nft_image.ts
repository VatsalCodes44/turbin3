import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "./wallet.json";
import fs from "fs";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
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
    const image = fs.readFileSync("./assets/iron-throne.png");

    const file = createGenericFile(image, "iron-throne.png", {
      contentType: "image/png",
    });

    const [myUri] = await umi.uploader.upload([file]);
    console.log("Image uploaded to Irys! URI:", myUri);
  } catch (error) {
    console.error("Error:", error);
  }
})();
