// src/utils/authUtils.ts
let globalLogoutFunction: (() => void) | null = null;

export const setGlobalLogout = (logoutFn: () => void) => {
  globalLogoutFunction = logoutFn;
};

export const globalLogout = () => {
  if (globalLogoutFunction) {
    globalLogoutFunction();
  } else {
    console.error("Global logout function not set.");
    // Fallback if for some reason the globalLogoutFunction isn't set
    localStorage.clear();
    window.location.replace('/login');
  }
};
