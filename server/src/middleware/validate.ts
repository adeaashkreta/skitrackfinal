import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);
    // store the parsed/coerced value back so handlers can rely on it
    (req as unknown as Record<string, unknown>)[source] = parsed as unknown as Record<string, unknown>;
    next();
  };
}
