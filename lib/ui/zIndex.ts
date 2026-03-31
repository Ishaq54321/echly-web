/** Global fullscreen modal overlay layer. Keep this as the canonical modal stack token. */
export const MODAL_LAYER_Z_INDEX = 2147480000;
/** Menus that are portaled from inside dialogs should render above the modal panel. */
export const PORTAL_DROPDOWN_Z_INDEX = MODAL_LAYER_Z_INDEX + 150;
