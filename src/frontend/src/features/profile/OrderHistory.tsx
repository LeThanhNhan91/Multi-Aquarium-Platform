"use client"

import React from "react"

import { Package, Truck, CheckCircle2, Clock, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const orders = [
  {
    id: "AQM-2026-0047",
    date: "Feb 5, 2026",
    status: "Delivered",
    total: "3,150,000",
    shop: "Saigon Aquatics",
    items: [
      { name: "Betta Halfmoon Galaxy", qty: 2, price: "350,000", image: "/images/product-betta.jpg" },
      { name: "ADA 60P Glass Tank", qty: 1, price: "2,800,000", image: "/images/product-tank.jpg" },
    ],
  },
  {
    id: "AQM-2026-0043",
    date: "Jan 28, 2026",
    status: "In Transit",
    total: "1,200,000",
    shop: "Hanoi Fish World",
    items: [
      { name: "Discus Blue Diamond", qty: 1, price: "1,200,000", image: "/images/product-discus.jpg" },
    ],
  },
  {
    id: "AQM-2026-0039",
    date: "Jan 20, 2026",
    status: "Processing",
    total: "890,000",
    shop: "AquaScape Studio",
    items: [
      { name: "CO2 Diffuser Pro Kit", qty: 1, price: "890,000", image: "/images/product-co2.jpg" },
    ],
  },
  {
    id: "AQM-2025-0128",
    date: "Dec 15, 2025",
    status: "Delivered",
    total: "7,150,000",
    shop: "Koi Garden Center",
    items: [
      { name: "Koi Showa Premium", qty: 1, price: "5,500,000", image: "/images/product-koi.jpg" },
      { name: "LED Aquarium Light RGB", qty: 1, price: "1,650,000", image: "/images/product-light.jpg" },
    ],
  },
]

const statusConfig: Record<string, { icon: React.ElementType; className: string }> = {
  Delivered: { icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  "In Transit": { icon: Truck, className: "bg-primary/10 text-primary border-primary/20" },
  Processing: { icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
}

export function OrderHistory() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold font-serif text-foreground">Order History</h2>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your purchases</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-border text-foreground hover:bg-muted gap-2"
        >
          <Package className="h-4 w-4" />
          View All
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status]?.icon ?? Clock
          const statusClass = statusConfig[order.status]?.className ?? ""

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-secondary/30">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <Badge className={`border ${statusClass} gap-1.5`}>
                    <StatusIcon className="h-3 w-3" />
                    {order.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-bold text-foreground">{order.total}d</p>
                </div>
              </div>

              <Separator />

              {/* Order items */}
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground mb-3">
                  from <span className="font-medium text-foreground">{order.shop}</span>
                </p>
                <div className="flex flex-col gap-3">
                  {order.items.map((item) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0">
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground shrink-0">{item.price}d</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/50 bg-secondary/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1.5 text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Track Order
                </Button>
                {order.status === "Delivered" && (
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  >
                    Buy Again
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
