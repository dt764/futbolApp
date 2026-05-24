import { p as promiseResolve, b as bootstrapLazy } from './index-CA13Qhmh.js';
export { s as setNonce } from './index-CA13Qhmh.js';
import { g as globalScripts } from './app-globals-DQuL1Twl.js';

/*
 Stencil Client Patch Browser v4.43.4 | MIT Licensed | https://stenciljs.com
 */

var patchBrowser = () => {
  const importMeta = import.meta.url;
  const opts = {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return promiseResolve(opts);
};

patchBrowser().then(async (options) => {
  await globalScripts();
  return bootstrapLazy([["player-detail",[[0,"player-detail",{"player":[16],"comments":[16],"isAdmin":[4,"is-admin"],"loading":[4],"commentLoading":[4,"comment-loading"],"error":[1],"commentAuthor":[32],"commentText":[32],"commentRating":[32],"hoverRating":[32],"commentLocation":[32],"locationLoading":[32]}]]]], options);
});
