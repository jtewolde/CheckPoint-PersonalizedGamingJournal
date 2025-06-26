
import { Metadata } from "next"
import GameDetails from "./GamesPage"

// Set the page title for Journal page
export const metadata: Metadata = {
  title: `Game Details | CheckPoint`
}

export default function Page() {
    return <GameDetails />
}
