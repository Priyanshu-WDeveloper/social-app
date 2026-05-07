import { z } from 'zod';
// export const registerSchema = z.object({
//   body: z.object({
//     name: z.string().min(1, { message: 'Name is required' }),
//     email: z.string().email({ message: 'Invalid email address' }),
//     username: z.string().min(1, { message: 'Username is required' }),
//     password: z
//       .string()
//       .min(6, { message: 'Password must be at least 6 characters' }),
//   }),
// });
// export const loginSchema = z.object({
//   body: z.object({
//     email: z.string().email({ message: 'Invalid email address' }),
//     password: z.string().min(6, { message: 'Password is required' }),
//   }),
// });
export const registerSchema = z.object({
    fullName: z.string().trim().min(2).max(80),
    email: z
        .string()
        .trim()
        .email()
        .transform((email) => email.toLowerCase()),
    username: z
        .string()
        .trim()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.')
        .transform((username) => username.toLowerCase()),
    password: z.string().min(8),
});
export const loginSchema = z.object({
    identifier: z
        .string()
        .trim()
        .min(3)
        .transform((identifier) => identifier.toLowerCase()),
    password: z.string().min(1),
});
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .email()
        .transform((email) => email.toLowerCase()),
});
export const resetPasswordSchema = z
    .object({
    token: z.string().min(32),
    password: z.string().min(8),
    confirmPassword: z.string().min(8).optional(),
})
    .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
});
