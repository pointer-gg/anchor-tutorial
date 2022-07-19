import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { DrawWithFrens } from "../target/types/draw_with_frens";

describe("draw-with-frens", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DrawWithFrens as Program<DrawWithFrens>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
