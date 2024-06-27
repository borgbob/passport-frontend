import { FC } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"

export type ConnectHeaderProps = {
  isConnected: boolean
  onSignOut: () => void
}

export const ConnectHeader: FC<ConnectHeaderProps> = ({
  onSignOut
}) => {
  return (
    <div className="flex flex-row justify-between items-center mb-5">
      <div className="flex flex-row">
        <Image src={`/logo.png`} alt={`Header`} width={50} height={50} />
        <div className="flex flex-col">
          <span className="font-bold text-xl uppercase">Peaks</span>
          <span className="text-xs uppercase">Avax Passport</span>
        </div>
      </div>
      <div>
        <Button variant="passport" className="pl-20 pr-20" type="button" onClick={() => {
          onSignOut()
        }}>Logout</Button>
      </div>
    </div>
  )
}
