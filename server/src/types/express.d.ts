import "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
      admin?: {
        id: string;
        name: string;
        email: string;
      };
      auth?: {
        csrfToken: string;
      };
    }
  }
}

export {};
