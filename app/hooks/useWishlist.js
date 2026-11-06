'use client';

import { useWishlistContext } from '../context/WishlistContext';

export default function useWishlist() {
  return useWishlistContext();
}
