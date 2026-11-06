// Whether a category is offered for new products / shown on the storefront.
// Inactive categories stay attached to whatever products already reference
// them (see adminCategories.controller.js delete guard) but drop out of the
// public listing and the admin product form's dropdown.
export const CATEGORY_STATUS = Object.freeze({
    ACTIVE: 'active',
    INACTIVE: 'inactive',
});
