export const VALID_SCREENS = [
  "Login",
  "ProductList",
  "Cart",
  "Checkout",
  "Notifications",
  "Transactions",
  "Main",
  "Account",
  "AddTransaction",
  "Products",
] as const;

export type ValidScreenName = (typeof VALID_SCREENS)[number];
