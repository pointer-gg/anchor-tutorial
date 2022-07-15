import clsx from "clsx"
import Pixel from "./Pixel"

export default function Canvas() {
  const disabled = false;

  return (
    <div className={clsx(disabled && "opacity-25 cursor-not-allowed")}>
      <table className="border border-gray-300 table-fixed">
        <tbody className="divide-y divide-gray-300">
          {[...Array(100)].map((_, y) => {
            return (
              <tr className="divide-x divide-gray-300" key={y} >
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
