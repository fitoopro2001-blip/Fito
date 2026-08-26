'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { H2, H3, Text } from '../atoms/Typography';
import ImageGallery from '../organisms/ImageGallery';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import ProductDetailSkeleton from './ProductDetailSkeleton';
import FeaturedProducts from '../organisms/FeaturedProducts';
import ReviewSection from '../organisms/ReviewSection';
import QuantitySelector from '../molecules/QuantitySelector';
import useCart from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';
import useApiResource from '../../hooks/useApiResource';
import { getProduct } from '../../services/product.service';
import formatCategory from '../../utils/formatCategory';
import { useCountry } from '../../context/CountryContext';
import NotAvailableNotice from '../molecules/NotAvailableNotice';

// Interactive half of the product page. The route's server component owns
// metadata and structured data; everything stateful lives here.
export default function ProductTemplate({ id, initialProduct = null }) {
    const { productsAvailable } = useCountry();
    const {
        data: apiProduct,
        loading,
        error,
        setData: setProduct,
    } = useApiResource(() => getProduct(id), [id], {
        // The server component already fetched this product for metadata, so skip
        // the duplicate request on first paint when we have it. Also skipped
        // outright when products aren't available in the visitor's country —
        // the route itself already renders NotAvailableNotice in that case
        // (see app/(public)/product/[id]/page.jsx); this only guards direct
        // reuse of this component elsewhere.
        skip: !productsAvailable || !id || Boolean(initialProduct),
        fallback: initialProduct,
    });

    const product = apiProduct ?? initialProduct;

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const { addToCart, isInCart } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();

    // Resets the selected variant during render (not an effect) whenever the
    // product itself changes, so a variant never carries over onto a product
    // it doesn't belong to. See https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
    const [selectedForProductId, setSelectedForProductId] = useState(product?.id);
    if (product?.id !== selectedForProductId) {
        setSelectedForProductId(product?.id);
        if (selectedVariant) setSelectedVariant(null);
    }

    if (!productsAvailable) {
        return <NotAvailableNotice />;
    }

    const hasVariants = Boolean(product?.variants?.length);
    // Requires a variant to be picked before add-to-cart when the product has
    // any; the price/stock shown below follow whichever is selected.
    const effectivePrice = selectedVariant?.price ?? product?.discountedPrice ?? product?.price;
    const effectiveStock = selectedVariant ? selectedVariant.stock : product?.stock;

    if (loading && !product) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        return (
            <div className="pt-24 pb-16 min-h-screen">
                <div className="max-w-xl mx-auto px-4 text-center py-20">
                    <H2>Product Not Found</H2>
                    <Text muted className="mt-2">
                        {error || "That product doesn't exist or is no longer available."}
                    </Text>
                    <Button href="/shop" variant="primary" size="lg" className="mt-6">
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    const inCart = isInCart(product.id, selectedVariant);
    const needsVariant = hasVariants && !selectedVariant;
    const comingSoon = product.status === 'coming_soon';

    const handleAddToCart = () => {
        if (!inCart && !needsVariant && !comingSoon) addToCart(product, quantity, selectedVariant);
    };

    // Keeps the rating summary in sync after a review is written or removed.
    const handleRatingChange = ({ rating, reviewCount }) => {
        setProduct((prev) => (prev ? { ...prev, rating, reviews: reviewCount, reviewCount } : prev));
    };

    return (
        <div className="pt-24 pb-16 min-h-screen bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <ImageGallery
                            images={product.images?.length ? product.images : [product.image].filter(Boolean)}
                            alt={product.seo?.imageAlt || product.name}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <div>
                            <Text className="text-yellow-400 font-medium uppercase tracking-wider mb-1">
                                {formatCategory(product.category)}
                            </Text>
                            {/* Single H1 per page, carrying the generated headline for keyword relevance. */}
                            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
                            {product.seo?.headline && product.seo.headline !== product.name && (
                                <Text muted className="mt-1">
                                    {product.seo.headline}
                                </Text>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Icon name="star" className="w-5 h-5 fill-current" />
                                    <span className="font-semibold text-white">
                                        {Number(product.rating ?? 0).toFixed(1)}
                                    </span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-400">{product.reviews ?? 0} reviews</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-3 flex-wrap">
                            <div className="text-3xl font-bold text-white whitespace-nowrap">
                                PKR {effectivePrice.toFixed(2)}
                            </div>
                            {!selectedVariant?.price && product.discountPercent > 0 && (
                                <>
                                    <span className="text-lg text-gray-400 line-through whitespace-nowrap">
                                        PKR {product.price.toFixed(2)}
                                    </span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 whitespace-nowrap">
                                        {product.discountPercent}% off
                                    </span>
                                </>
                            )}
                        </div>

                        {hasVariants && (
                            <div>
                                <Text className="text-gray-300 font-medium mb-2">Options</Text>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant) => {
                                        const active = selectedVariant?.sku
                                            ? selectedVariant.sku === variant.sku
                                            : selectedVariant?.name === variant.name;
                                        const outOfStock = Number(variant.stock ?? 0) <= 0;
                                        return (
                                            <button
                                                key={variant.sku || variant.name}
                                                type="button"
                                                disabled={outOfStock}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                                    active
                                                        ? 'bg-primary border-primary text-text-inverse'
                                                        : 'border-border-light text-gray-300 hover:bg-overlay-strong'
                                                }`}
                                            >
                                                {variant.name}
                                                {outOfStock && ' (Out of stock)'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mt-4">
                            {!inCart && <QuantitySelector value={quantity} onChange={setQuantity} />}
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={inCart || needsVariant || comingSoon}
                                className="flex-1 min-w-[150px]"
                            >
                                {comingSoon ? (
                                    <>
                                        <Icon name="cart" className="w-5 h-5 mr-2" />
                                        Coming Soon
                                    </>
                                ) : inCart ? (
                                    <>
                                        <Icon name="check" className="w-5 h-5 mr-2" />
                                        In Cart
                                    </>
                                ) : (
                                    <>
                                        <Icon name="cart" className="w-5 h-5 mr-2" />
                                        {needsVariant ? 'Select an Option' : 'Add to Cart'}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => toggleWishlist(product)}
                                aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                aria-pressed={isWishlisted(product.id)}
                                className="px-4"
                            >
                                <Icon
                                    name="heart"
                                    className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                                />
                            </Button>
                        </div>

                        {inCart && (
                            <Link
                                href="/cart"
                                className="text-sm text-primary font-medium hover:text-primary-hover transition-colors -mt-2"
                            >
                                View cart →
                            </Link>
                        )}

                        <div className="text-sm text-gray-400 mt-2">
                            {comingSoon ? (
                                <span className="text-yellow-400">Coming Soon</span>
                            ) : effectiveStock > 0 ? (
                                <span className="text-green-400">In Stock</span>
                            ) : (
                                <span className="text-red-400">Out of Stock</span>
                            )}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 max-w-3xl border-t border-white/10 pt-8"
                >
                    <H3 className="text-2xl font-bold text-white mb-4">Description</H3>
                    {/* `description` is sanitized HTML from the admin's Tiptap editor
                        (bold/italic/strike/links only) — same as blog `content`. */}
                    <div
                        className="text-gray-300 leading-relaxed flex flex-col gap-3 [&_p]:m-0 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-white [&_em]:italic [&_s]:line-through"
                        dangerouslySetInnerHTML={{ __html: product.description ?? '' }}
                    />
                </motion.div>

                {product.nutritionFacts?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-16 max-w-2xl"
                    >
                        <H3 className="text-2xl font-bold text-white mb-6">Nutrition Facts</H3>
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody>
                                    {product.nutritionFacts.map((row, idx) => (
                                        <tr key={row.key} className={idx % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                                            <td className="px-4 py-3 text-gray-300 border-b border-white/5 font-medium">
                                                {row.key}
                                            </td>
                                            <td className="px-4 py-3 text-white border-b border-white/5 text-right">
                                                {row.value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                <ReviewSection
                    productId={product.id}
                    rating={product.rating ?? 0}
                    reviewCount={product.reviews ?? 0}
                    onRatingChange={handleRatingChange}
                />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16"
                >
                    <H3 className="text-2xl font-bold text-white mb-6">You May Also Like</H3>
                    <FeaturedProducts title="" subtitle="" limit={4} excludeId={product.id} />
                </motion.div>
            </div>
        </div>
    );
}
