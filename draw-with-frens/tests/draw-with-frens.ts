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
    const x = 10
    const y = 10

    const [pixelPublicKey] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pixel"), Buffer.from([x, y])],
      program.programId,
    )

    await program.methods
      .createPixel(x, y, 0, 0, 255)
      .accounts({
        pixel: pixelPublicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    const storedPixel = await program.account.pixel.fetch(pixelPublicKey)
    assert.equal(storedPixel.posX, x)
    assert.equal(storedPixel.posY, y)
    assert.equal(storedPixel.colR, 0)
    assert.equal(storedPixel.colG, 0)
    assert.equal(storedPixel.colB, 255)
  });

  it("Does not allow creating a pixel out of bounds", async () => {
    const x = 0;
    const y = 200;

    const [pixelPublicKey] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pixel"), Buffer.from([x, y])],
      program.programId,
    )

    await program.methods
      .createPixel(x, y, 0, 0, 255)
      .accounts({
        pixel: pixelPublicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
      .then(
        () => Promise.reject(new Error('Expected to error!')),
        (e: AnchorError) => {
          // Log is eg. 'AnchorError occurred. Error Code: InvalidYCoordinate. Error Number: 6001. Error Message: The given Y co-ordinate is not between 0-99.'
          assert.ok(e.errorLogs.some(log => log.includes('InvalidYCoordinate') && log.includes('The given Y co-ordinate is not between 0-99.')))
        }
      );
  })

  it("Does not allow creating the same pixel twice", async () => {
    const x = 20
    const y = 20

    const [pixelPublicKey] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pixel"), Buffer.from([x, y])],
      program.programId,
    )

    // Create the pixel: this should pass
    await program.methods
      .createPixel(x, y, 0, 0, 255)
      .accounts({
        pixel: pixelPublicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    // Create the same pixel: this should fail
    await program.methods
      .createPixel(x, y, 0, 0, 255)
      .accounts({
        pixel: pixelPublicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .postInstructions([
        // make the transaction unique
        web3.SystemProgram.transfer({
          fromPubkey: anchorProvider.wallet.publicKey,
          toPubkey: anchorProvider.wallet.publicKey,
          lamports: 1,
        })
      ])
      .rpc()
      .then(
        () => Promise.reject(new Error('Expected to error!')),
        (e: web3.SendTransactionError) => {
          // Log is eg. 'Allocate: account Address { address: 6V4qyzgQ9zdDrjiP74hoaece98gLcRt874JFqTsexrQd, base: None } already in use'
          assert.ok(e.logs.some(log => log.includes(pixelPublicKey.toBase58()) && log.includes('already in use')))
        }
      )
  })

  it("Does not allow passing an incorrect address", async () => {
    // Generate the PDA for (0, 0)
    const [pixelPublicKey] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pixel"), Buffer.from([0, 0])],
      program.programId,
    )

    // Attempt to use it to create (30, 30)
    await program.methods
      .createPixel(30, 30, 0, 0, 255)
      .accounts({
        pixel: pixelPublicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
      .then(
        () => Promise.reject(new Error('Expected to error!')),
        (e: web3.SendTransactionError) => {
          // Log is eg. '5NbE1G4B95BMHrz94jLk3Q1GivRgh9Eyj8mtHss3sVZA's signer privilege escalated'
          const expectedError = `${pixelPublicKey.toBase58()}'s signer privilege escalated`
          assert.ok(e.logs.some(log => log === expectedError))
        }
      )
  })

  it("Can update a created pixel", async () => {
    const x = 40
    const y = 40

    const [pixelPublicKey] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pixel"), Buffer.from([x, y])],
      program.programId,
    )

    // Create the pixel
    await program.methods
      .createPixel(x, y, 0, 0, 255)
      .accounts({
        pixel: pixelPublicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    // Update the pixel
    await program.methods
      .updatePixel(255, 0, 0)
      .accounts({
        pixel: pixelPublicKey,
      })
      .rpc()

    const storedPixel = await program.account.pixel.fetch(pixelPublicKey)
    assert.equal(storedPixel.posX, x)
    assert.equal(storedPixel.posY, y)
    assert.equal(storedPixel.colR, 255)
    assert.equal(storedPixel.colG, 0)
    assert.equal(storedPixel.colB, 0)
  })

  it("Emits an event when a pixel is created", async () => {
    let events = [];
    const listener = program.addEventListener('PixelChanged', (event: any) => {
      events.push(event)
    })

    const x = 50
    const y = 50

    const [pixelPublicKey] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pixel"), Buffer.from([x, y])],
      program.programId,
    )

    await program.methods
      .createPixel(x, y, 0, 0, 255)
      .accounts({
        pixel: pixelPublicKey,
        user: anchorProvider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    assert.equal(events.length, 1)
    const event = events[0];

    assert.equal(event.posX, x)
    assert.equal(event.posY, y)
    assert.equal(event.colR, 0)
    assert.equal(event.colG, 0)
    assert.equal(event.colB, 255)

    program.removeEventListener(listener)
  })

  it("Emits an event when a pixel is updated", async () => {
    // Update the (50, 50) from the previous test
    let events = [];
    const listener = program.addEventListener('PixelChanged', (event: any) => {
      events.push(event)
    })

    const x = 50
    const y = 50

    const [pixelPublicKey] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pixel"), Buffer.from([x, y])],
      program.programId,
    )

    await program.methods
      .updatePixel(255, 0, 0)
      .accounts({
        pixel: pixelPublicKey,
      })
      .rpc()

    assert.equal(events.length, 1)
    const event = events[0];

    assert.equal(event.posX, x)
    assert.equal(event.posY, y)
    assert.equal(event.colR, 255)
    assert.equal(event.colG, 0)
    assert.equal(event.colB, 0)

    program.removeEventListener(listener)
  })
});