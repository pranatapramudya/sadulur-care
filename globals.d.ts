export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "NURSE" | "PATIENT";
    };
  }
}
