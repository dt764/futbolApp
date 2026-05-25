import { b as bootstrapLazy } from './index-CA13Qhmh.js';
export { s as setNonce } from './index-CA13Qhmh.js';
import { g as globalScripts } from './app-globals-DQuL1Twl.js';

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await globalScripts();
  return bootstrapLazy([["player-detail",[[0,"player-detail",{"player":[16],"comments":[16],"isAdmin":[4,"is-admin"],"loading":[4],"commentLoading":[4,"comment-loading"],"error":[1],"loggedInUser":[1,"logged-in-user"],"commentAuthor":[32],"commentText":[32],"commentRating":[32],"hoverRating":[32],"commentLocation":[32],"locationLoading":[32],"commentTextError":[32],"commentAuthorError":[32]}]]]], options);
};

export { defineCustomElements };
