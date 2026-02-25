"use client";

import React from "react";
import { Package } from "lucide-react";
import TabPlaceholder from "./TabPlaceholder";

interface ProductsTabProps {
  storeId: string;
}

export default function ProductsTab({ storeId }: ProductsTabProps) {
  // Logic to fetch products will go here
  return <TabPlaceholder title="Sản phẩm" icon={Package} />;
}
