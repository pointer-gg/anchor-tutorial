import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { web3 } from "@project-serum/anchor";
import { DrawWithFrens } from "../target/types/draw_with_frens";
import { assert } from "chai"

describe("draw-with-frens", () => {
  // Configure the client to use the local cluster.
  const anchorProvider = anchor.AnchorProvider.env();
  anchor.setProvider(anchorProvider);

  const program = anchor.workspace.DrawWithFrens as Program<DrawWithFrens>;

  it("Can create a pixel", async () => {
    const pixelKeypair = web3.Keypair.generate()

    await program.methods
      .createPixel(10, 10, 0, 0, 255)
      .accounts({
        pixel: pixelKeypair.publicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([pixelKeypair])
      .rpc()

    const storedPixel = await program.account.pixel.fetch(pixelKeypair.publicKey)
    assert.equal(storedPixel.posX, 10)
    assert.equal(storedPixel.posY, 10)
    assert.equal(storedPixel.colR, 0)
    assert.equal(storedPixel.colG, 0)
    assert.equal(storedPixel.colB, 255)
  });

  it("Does not allow creating a pixel out of bounds", async () => {
    const pixelKeypair = web3.Keypair.generate()

    await program.methods
      .createPixel(0, 200, 0, 0, 255)
      .accounts({
        pixel: pixelKeypair.publicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([pixelKeypair])
      .rpc()
      .then(
        () => Promise.reject(new Error('Expected to error!')),
        (e: AnchorError) => {
          // Log is eg. `AnchorError occurred. Error Code: InvalidYCoordinate. Error Number: 6001. Error Message: The given Y co-ordinate is not between 0-99.`
          assert.ok(e.errorLogs.some(log => log.includes('InvalidYCoordinate') && log.includes('The given Y co-ordinate is not between 0-99.')))
        }
      );
  })
});
