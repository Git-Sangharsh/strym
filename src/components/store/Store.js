import { configureStore } from "@reduxjs/toolkit";

const initialState = {
  showSuggest: false,
};

const Reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SHOW_SUGGEST":
      return { ...state, showSuggest: !state.showSuggest };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: Reducer,
});

export default store;
