interface Props {
  posX: number,
  posY: number,
}

export default function Pixel({ posX, posY }: Props) {
  const color = "white";

  return <td
    className="h-4 min-w-[1rem]"
    style={{ backgroundColor: color }}
  />
}
