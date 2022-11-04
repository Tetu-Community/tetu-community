import { FC } from 'react'

const More: FC = () => {
	return (
    <div className="max-w-2xl mx-auto px-6 pt-4">
      <h2 className="text-2xl pt-4 pb-6">About</h2>
      <div>This page is community-run. You can get in touch with us in the <a href="https://discord.gg/xs8VESN4yz" target="_blank" rel="noreferrer">Tetu Discord</a>.</div>

      <h2 className="text-2xl py-6 pt-10">Links</h2>
      <ul className="list-disc pl-4">
        <li>
          <a href="https://tetu.io" target="_blank" rel="noreferrer">Tetu Home Page</a>
        </li>
        <li>
          <a href="https://app.tetu.io" target="_blank" rel="noreferrer">Tetu DApp</a>
        </li>
        <li>
          <a href="https://www.defiwars.xyz/balancer" target="_blank" rel="noreferrer">DeFi Wars: Balancer</a>
        </li>
        <li>
          <a href="https://0xworkinprogress.substack.com/p/align-your-chakras-buy-tetu" target="_blank" rel="noreferrer">Align your chakras, buy TETU</a>
        </li>
      </ul>
    </div>
	)
}

export default More
