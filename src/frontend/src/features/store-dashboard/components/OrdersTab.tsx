"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import TabPlaceholder from "./TabPlaceholder";

interface OrdersTabProps {
  storeId: string;
}

export default function OrdersTab({ storeId }: OrdersTabProps) {
  return <TabPlaceholder title="Đơn hàng" icon={ShoppingBag} />;
}
