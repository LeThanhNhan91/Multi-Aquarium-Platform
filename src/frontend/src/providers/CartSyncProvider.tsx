"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/libs/redux/hook";
import { useGetCartQuery, useMergeCartMutation } from "@/services/cartApi";
import { setItems, clearCart, CartItem } from "@/libs/redux/features/cartSlice";

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const localItems = useAppSelector((state) => state.cart.items);

  // Use skip: !accessToken to only fetch when logged in
  const { data: backendCart, isLoading } = useGetCartQuery(undefined, {
    skip: !accessToken,
  });

  const [mergeCart] = useMergeCartMutation();
  const hasMerged = useRef(false);

  // Sync backend cart to Redux when it changes
  useEffect(() => {
    if (backendCart?.data) {
      const mappedItems: CartItem[] = backendCart.data.map((item: any) => ({
        cartId: item.fishInstanceId
          ? `${item.productId}-${item.fishInstanceId}`
          : item.productId,
        productId: item.productId,
        fishInstanceId: item.fishInstanceId,
        productType: item.productType,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.imageUrl,
        storeId: item.storeId,
        storeName: item.storeName,
        availableStock: item.availableStock,
      }));
      dispatch(setItems(mappedItems));
    }
  }, [backendCart, dispatch]);

  // Clear Redux and LocalStorage on Logout
  useEffect(() => {
    if (!accessToken) {
      // Redux state is already reset by rootReducer logout action,
      // but ensure localStorage is clean if it wasn't already.
      localStorage.removeItem("cart");
      hasMerged.current = false;
    }
  }, [accessToken]);

  // Merging guest cart to backend on login
  useEffect(() => {
    const handleMerge = async () => {
      if (accessToken && !hasMerged.current) {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            const guestItems: CartItem[] = JSON.parse(savedCart);
            if (guestItems.length > 0) {
              const mergePayload = guestItems.map((item) => ({
                productId: item.productId,
                fishInstanceId: item.fishInstanceId,
                quantity: item.quantity,
              }));

              await mergeCart(mergePayload).unwrap();
              // Mutation will invalidate "Cart" tag, triggering GetCartQuery update

              localStorage.removeItem("cart");
            }
          } catch (error) {
            console.error("Failed to merge cart:", error);
          }
        }
        hasMerged.current = true;
      }
    };

    handleMerge();
  }, [accessToken, mergeCart]);

  return <>{children}</>;
}
