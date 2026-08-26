'use client';

import { memo } from 'react';
import Link from 'next/link';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import useCart from '../../hooks/useCart';
import { useCountry } from '../../context/CountryContext';

// The only interactive part of a ProductCard, split out so the card itself can
// stay a server component. Keeping the cart subscription down here means a cart
// update re-renders these few buttons instead of the whole product grid.
//
// `relative z-10` lifts these above the card's stretched-link overlay so clicks
// land on the button and not the link.
function ProductCardActions({ product, isWishlisted = false, onToggleWishlist }) {
    const { addToCart, isInCart } = useCart();
    const { productsAvailable } = useCountry();
    const hasVariants = Boolean(product.variants?.length);
    const inCart = isInCart(product.id);
    const hasDiscount = product.discountPercent > 0;
    const chargedPrice = product.discountedPrice ?? product.price;
    const comingSoon = product.status === 'coming_soon';

    return (
        <>
            <button
                type="button"
                onClick={() => onToggleWishlist?.(product)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full glass-strong flex items-center justify-center transition-colors hover:bg-primary/20 border border-border-light"
                aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                aria-pressed={isWishlisted}
            >
                <Icon
                    name="heart"
                    className={`w-4 h-4 ${isWishlisted ? 'text-primary' : 'text-text-secondary'}`}
                />
            </button>

            <div className="relative z-10 mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="text-xl font-bold text-text whitespace-nowrap">PKR {chargedPrice.toFixed(2)}</span>
                    {hasDiscount && (
                        <span className="text-xs text-text-muted line-through whitespace-nowrap">
                            PKR {product.price.toFixed(2)}
                        </span>
                    )}
                </div>
                {!productsAvailable ? (
                    <Button variant="outline" size="sm" disabled className="rounded-full px-4 py-1.5 text-xs">
                        Unavailable
                    </Button>
                ) : comingSoon ? (
                    <Button variant="outline" size="sm" disabled className="rounded-full px-4 py-1.5 text-xs">
                        Coming Soon
                    </Button>
                ) : hasVariants ? (
                    <Link
                        href={`/product/${product.slug || product.id}`}
                        className="relative z-10 rounded-full px-4 py-1.5 text-xs font-semibold border border-border text-text hover:bg-overlay-strong transition-colors"
                    >
                        Select Options
                    </Link>
                ) : (
                    <Button
                        variant={inCart ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => !inCart && addToCart(product)}
                        disabled={inCart}
                        className="rounded-full px-4 py-1.5 text-xs"
                    >
                        {inCart ? 'In Cart' : 'Quick Add'}
                    </Button>
                )}
            </div>
        </>
    );
}

export default memo(ProductCardActions);
