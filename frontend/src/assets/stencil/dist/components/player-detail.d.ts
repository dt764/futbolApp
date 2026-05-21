import type { Components, JSX } from "../types/components";

interface PlayerDetail extends Components.PlayerDetail, HTMLElement {}
export const PlayerDetail: {
    prototype: PlayerDetail;
    new (): PlayerDetail;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
