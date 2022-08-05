import { IdlAccounts, Program } from "@project-serum/anchor";
import clsx from "clsx"
import { useEffect, useState, useMemo } from "react";
import { DrawWithFrens } from "../idl/draw_with_frens";
import Pixel from "./Pixel"

interface Props {
  program?: Program<DrawWithFrens>
}

type PixelAccount = IdlAccounts<DrawWithFrens>['pixel']

export default function Canvas({ program }: Props) {
  const disabled = !program;
  const [fetchedPixels, setFetchedPixels] = useState<PixelAccount[]>([]);

  const fetchPixels = async () => {
    if (program) {
      const pixels = await program.account.pixel.all()
      console.log("got the pixels!", pixels)
      setFetchedPixels(pixels.map(p => p.account))
    }
  }

  useEffect(() => {
    fetchPixels()
  }, [program])

  const pixelsMap = useMemo(() => {
    const map: { [id: number]: PixelAccount } = {};
    fetchedPixels.forEach(p => {
      const id = p.posY * 100 + p.posX;
      map[id] = p;
    })
    return map
  }, [fetchedPixels])

  return (
    <div className={clsx(disabled && "opacity-25 cursor-not-allowed")}>
      <table className="border border-gray-300 table-fixed">
        <tbody className="divide-y divide-gray-300">
          {[...Array(100)].map((_, y) => {
            return (
              <tr className="divide-x divide-gray-300" key={y}>
                {[...Array(100)].map((_, x) => {
                  const id = y * 100 + x;
                  const pixelData = pixelsMap[id];

                  return <Pixel
                    posX={x}
                    posY={y}
                    program={program}
                    pixelData={pixelData}
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
