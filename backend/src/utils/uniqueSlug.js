// Appends -2, -3, ... only when `base` is already taken by another document,
// so most slugs stay clean and only genuine name collisions get a (still
// readable) suffix instead of an opaque id fragment.
const ensureUniqueSlug = async (Model, base, excludeId) => {
    let slug = base;
    let n = 2;
    while (await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
        slug = `${base}-${n}`;
        n += 1;
    }
    return slug;
};

export default ensureUniqueSlug;
