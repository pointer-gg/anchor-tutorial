import ColorSelector from "../components/ColorSelector";
import Title from "../components/Title";
import { Color, colors } from "../lib/colors";
import { useState } from "react";
import Canvas from "../components/Canvas";

export default function Home() {
  const [selectedColor, setSelectedColor] = useState<Color>(colors[0])

  return (
    <div className="flex flex-col items-stretch gap-8 px-4 pt-24 mx-auto max-w-max">
      <main className="flex flex-col gap-4">
        <Title>Draw With Frens</Title>

        <ColorSelector selectedColor={selectedColor} setSelectedColor={setSelectedColor} />

        <Canvas />
      </main>
    </div >
  )
}
