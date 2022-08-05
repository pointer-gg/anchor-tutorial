import { IdlAccounts, Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { DrawWithFrens } from "../idl/draw_with_frens";

type PixelAccount = IdlAccounts<DrawWithFrens>['pixel']

interface Props {
  posX: number,
  posY: number,
  program: Program<DrawWithFrens>,
  pixelData?: PixelAccount,
}

export default function Pixel({ posX, posY, program, pixelData }: Props) {
  const { colR, colG, colB } = pixelData || {};
  const color = pixelData ? `rgb(${colR}, ${colG}, ${colB})` : "white"

  const getPixelAddress = () => {
    const [pixelPublicKey] = PublicKey.findProgramAddressSync(
      [Buffer.from("pixel"), Buffer.from([posX, posY])],
      program.programId,
    )
    return pixelPublicKey
  }

  const createPixel = async () => {
    await program.methods
      .createPixel(posX, posY, 255, 0, 0)
      .accounts({
        pixel: getPixelAddress(),
        user: program.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  return <td
    className="h-4 min-w-[1rem]"
    style={{ backgroundColor: color }}
    onClick={createPixel}
  />
}
