export type ReaderLoginRequest = {
  email: string;
  password: string;
};

export type ReaderLoginResponse = {
  access: string;
  refresh: string;
};

export type ReaderLoginError = {
  error: string;
};
