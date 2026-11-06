import { StarFilled, StarOutlined } from '@ant-design/icons';

export default function RatingStars({ rating = 0 }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <span className="inline-flex items-center gap-0.5 text-amber-400">
            {stars.map((s) =>
                s <= Math.round(rating) ? (
                    <StarFilled key={s} className="text-xs" />
                ) : (
                    <StarOutlined key={s} className="text-xs text-gray-300" />
                )
            )}
            <span className="ml-1 text-xs text-gray-500">{rating}</span>
        </span>
    );
}
