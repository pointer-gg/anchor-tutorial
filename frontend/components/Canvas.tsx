import { Program } from "@project-serum/anchor";
import clsx from "clsx"
import { useEffect } from "react";
import { DrawWithFrens } from "../idl/draw_with_frens";
import Pixel from "./Pixel"

interface Props {
  program?: Program<DrawWithFrens>
}

export default function Canvas({ program }: Props) {
  const disabled = !program;

  const fetchPixels = async () => {
    if (program) {
      const pixels = await program.account.pixel.all()
      console.log("got the pixels!", pixels)
    }
  }

  useEffect(() => {
    fetchPixels()
  }, [program])

  return (
    <div className={clsx(disabled && "opacity-25 cursor-not-allowed")}>
      <table className="border border-gray-300 table-fixed">
        <tbody className="divide-y divide-gray-300">
          {[...Array(100)].map((_, y) => {
            return (
              <tr className="divide-x divide-gray-300" key={y}>
                {[...Array(100)].map((_, x) => {

                  return <Pixel
                    posX={x}
                    posY={y}
                    key={x}
                  />
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
