import { configureStore } from "@reduxjs/toolkit";

const initialState = {
  showSuggest: false,
  showGoogleAuth: false
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
    default:
      return state;
  }
};

const store = configureStore({
  reducer: Reducer,
});

export default store;
