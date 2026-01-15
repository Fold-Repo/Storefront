import React from 'react'
import Image from 'next/image'
import CelestailBlue from '@/public/img/HomePage/Celestial-Blue.svg'

export const LearningMonitor = () => {
  return (
    <div className="w-full grid place-items-center py-4 rounded-lg bg-white">
      <Image
        src={CelestailBlue}
        alt="monitor view"
        width={300}
        height={300}
        className="w-auto h-auto"
      />
    </div>
  );
}
