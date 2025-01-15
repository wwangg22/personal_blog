'use client'
import React from 'react'
import Image from "next/image"

import Link from 'next/link'

function Articles({title, author,date, id,image}: {title:string, author:string, date:string, id:string,image:string}) {
  return (
    <Link href ={ `/blog/${id}`}>
        <div className = "w-full h-art outline outline-1 grid grid-cols-46">
                <div className="relative p-2 h-full w-full overflow-hidden">
                    <img
                        src={image || ''}
                        className = "object-cover w-full h-full"
                        alt="test image" />
                </div>
                <div className="p-2 grid grid-rows-91 font">
                    <h1 className="m-auto font-crsemibold text-2xl">
                        {title}
                    </h1>
                    <div className="flex justify-between">
                        <h3></h3>
                        <h3>{date}</h3>
                    </div>
                    
                </div>

        </div>
     </Link>
  )
}

export default Articles;