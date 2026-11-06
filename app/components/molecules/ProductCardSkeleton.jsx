import Skeleton from '../atoms/Skeleton';

// Mirrors ProductCard's layout (image, title, category, rating, description,
// actions) so grids don't jump when real cards swap in.
export default function ProductCardSkeleton() {
  return (
    <div className="glass border border-border-light rounded-2xl p-4 flex flex-col">
      <Skeleton className="w-full aspect-square mb-4" rounded="rounded-xl" />

      <div className="flex flex-col flex-1 gap-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-1/2 h-4 mt-1" />
        <Skeleton className="w-full h-4 mt-2" />
        <Skeleton className="w-2/3 h-4" />
      </div>

      <div className="flex gap-2 mt-4">
        <Skeleton className="flex-1 h-10" rounded="rounded-xl" />
        <Skeleton className="w-10 h-10" rounded="rounded-xl" />
      </div>
    </div>
  );
}
