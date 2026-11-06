import Skeleton from '../atoms/Skeleton';

// Mirrors ProductTemplate's grid (gallery + info column) so the layout
// doesn't jump once the real product loads in.
export default function ProductDetailSkeleton() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-row md:flex-col gap-2 order-2 md:order-1">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="w-20 h-20 flex-shrink-0" rounded="rounded-lg" />
              ))}
            </div>
            <Skeleton className="flex-1 aspect-square order-1 md:order-2" rounded="rounded-2xl" />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <Skeleton className="w-24 h-4 mb-3" />
              <Skeleton className="w-3/4 h-8 mb-2" />
              <Skeleton className="w-1/3 h-5 mt-3" />
            </div>

            <Skeleton className="w-32 h-9" />

            <div className="border-t border-white/10 pt-6 flex flex-col gap-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-4" />
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Skeleton className="w-28 h-12" rounded="rounded-xl" />
              <Skeleton className="flex-1 min-w-[150px] h-12" rounded="rounded-xl" />
              <Skeleton className="w-12 h-12" rounded="rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
