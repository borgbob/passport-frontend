import { FC } from 'react'
import Image from 'next/image'

export type HeaderProps = {
  isConnected: boolean
  walletAddress: string
  score: number
  userName: string
}

export const Header: FC<HeaderProps> = ({
  walletAddress,
  score,
  userName
}) => {
  return (
    <div>
      <div className="rounded-sm w-full">
        <div className="rounded-t-sm bg-[#191322] grid grid-cols-7 items-left w-full p-10">
          <Image src={`/header-logo.png`} className="col-span-1" alt={`Header`} width={100} height={100} />
          <div className="col-span-5 flex flex-col justify-center">
            <span className="text-passport-pink font-bold text-2xl">{userName}</span>
            <span className="text-sm">{walletAddress}</span>
          </div>
          <div className="col-span-1 flex flex-col justify-center">
            <span className="text-xs">My score:</span>
            <div className="flex flex-row" >
              <span className="font-bold text-2xl">{score}</span>
              <span>&nbsp;pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
