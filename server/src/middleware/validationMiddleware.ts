import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    // Note: The schema from validationSchemas should validate the body object directly
    schema.parse(req.body);
    next();
  } catch (error: any) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors,
    });
  }
};

export default validate;
