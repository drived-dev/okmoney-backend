export type AuthJwtPayload = {
  type: string; // Google, Facebook, Line, Phone
  sub: string;
};
