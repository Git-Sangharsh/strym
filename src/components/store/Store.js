import { configureStore } from "@reduxjs/toolkit";

const initialState = {
  showSuggest: false,
  showGoogleAuth: false,
  userState: null,
  playlistState: false,
  userEmail: null,
  showAddPlaylist: null,
  storeTrackTitle: null,
  storeGetPlaylist: [],
  isLogin: false,
};

const Reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SHOW_SUGGEST":
      return { ...state, showSuggest: !state.showSuggest };
    case "SET_SHOW_GOOGLE_AUTH":
      return {
        ...state,
        showGoogleAuth: !state.showGoogleAuth,
      };
    case "SET_USER":
      return { ...state, userState: action.payload };
    case "LOGOUT_USER":
      return { ...state, userState: null };
    case "SET_PLAYLIST_MODAL":
      return { ...state, playlistState: !state.playlistState };
    case "TOGGLE_ADD_PLAYLIST":
      return { ...state, showAddPlaylist: !state.showAddPlaylist };
    case "SET_SHOW_TRACK_TITLE":
      return { ...state, storeTrackTitle: action.payload };
    case "SET_STORE_GET_PLAYLIST":
      return { ...state, storeGetPlaylist: action.payload };
    case "SET_IS_LOGIN":
      return { ...state, isLogin: action.payload };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: Reducer,
});

export default store;
