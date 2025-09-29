"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Footer } from "./footer"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't show sidebar/footer on login page
  if (pathname === "/") {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        {/* <Footer /> */}
      </div>
    </div>
  )
}
