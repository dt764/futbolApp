'use strict';

var index = require('./index-CdvjcK02.js');
var appGlobals = require('./app-globals-V2Kpy_OQ.js');

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await appGlobals.globalScripts();
  return index.bootstrapLazy([["player-detail.cjs",[[0,"player-detail",{"player":[16],"comments":[16],"isAdmin":[4,"is-admin"],"loading":[4],"commentLoading":[4,"comment-loading"],"error":[1],"loggedInUser":[1,"logged-in-user"],"commentAuthor":[32],"commentText":[32],"commentRating":[32],"hoverRating":[32],"commentLocation":[32],"locationLoading":[32],"commentTextError":[32],"commentAuthorError":[32]},null,{"player":[{"handlePlayerChange":0}]}]]]], options);
};

exports.setNonce = index.setNonce;
exports.defineCustomElements = defineCustomElements;
