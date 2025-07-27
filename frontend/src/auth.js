export const doLogin = (token) => {
  localStorage.setItem("token", token);
};

export const doLogout = () => {
  localStorage.removeItem("token");
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};
