import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  address,
  createKeyPairSignerFromBytes,
  sendAndConfirmTransactionFactory,
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  getSignatureFromTransaction,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import wallet from "./wallet.json";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferCheckedInstruction,
  getTransferInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

const token_decimals = 1_000_000;

const mint = address("3sRPTgAk6ue1LU4VcMM2ZmtPrNvZAwFphVfnUpNhBPMA");
const mintTo = address("HaLdUZkgSWGRXiW93cQVDJuQKGKUYELxc58uytEkRygs");

(async () => {
  try {
    const signer = await createKeyPairSignerFromBytes(Uint8Array.from(wallet));

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    const [fromAta] = await findAssociatedTokenPda({
      mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    const [toAta] = await findAssociatedTokenPda({
      mint,
      owner: mintTo,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    const createReceiverAtaIx = getCreateAssociatedTokenIdempotentInstruction({
      ata: toAta,
      mint,
      owner: mintTo,
      payer: signer,
    });

    const transferIx = getTransferCheckedInstruction({
      amount: 1n * BigInt(token_decimals),
      source: fromAta,
      destination: toAta,
      authority: signer,
      decimals: 6,
      mint,
    });

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const msg = createTransactionMessage({ version: 0 });

    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);

    const msgWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      msgWithPayer,
    );

    const txMessage = appendTransactionMessageInstructions(
      [createReceiverAtaIx, transferIx],
      msgWithLifetime,
    );

    const signedTx = await signTransactionMessageWithSigners(txMessage);

    assertIsTransactionWithBlockhashLifetime(signedTx);

    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    const signature = getSignatureFromTransaction(signedTx);

    console.log("transfer txId: ", signature);
  } catch (error) {
    console.log(error);
  }
})();
