import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  openItem: ['dashboard'],
  openComponent: 'buttons',
  selectedID: null,
  drawerOpen: false,
  componentDrawerOpen: true,
  menu: {},
  error: null
};

const slice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    activeItemSuccess(state, action) {
      state.openItem = action.payload.openItem;
    },

    activeIDSuccess(state, action) {
      state.selectedID = action.payload;
    },

    activeComponentSuccess(state, action) {
      state.openComponent = action.payload.openComponent;
    },

    openDrawerSuccess(state, action) {
      state.drawerOpen = action.payload;
    },

    openComponentDrawerSuccess(state, action) {
      state.componentDrawerOpen = action.payload.componentDrawerOpen;
    },

    hasError(state, action) {
      state.error = action.payload;
    }
  },
});

export const { 
  activeItemSuccess, 
  activeIDSuccess, 
  activeComponentSuccess, 
  openDrawerSuccess, 
  openComponentDrawerSuccess, 
  hasError 
} = slice.actions;

export const activeComponent = (data) => (dispatch) => {
  try {
    dispatch(activeComponentSuccess(data));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message);
  }
};

export const activeID = (id) => (dispatch) => {
  try {
    dispatch(activeIDSuccess(id));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message);
  }
};

export const openDrawer = (isOpen) => (dispatch) => {
  try {
    dispatch(openDrawerSuccess(isOpen));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message);
  }
};

export const openComponentDrawer = (isOpen) => (dispatch) => {
  try {
    dispatch(openComponentDrawerSuccess(isOpen));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message);
  }
};

export const activeItem = (item) => (dispatch) => {
  try {
    dispatch(activeItemSuccess(item));
  } catch (error) {
    dispatch(hasError(error.message));
    toast.error(error.message);
  }
};

export default slice.reducer;