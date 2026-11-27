import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Обязательное поле")
    .pipe(z.email("Введите корректную почту")),
  password: z.string().min(1, "Обязательное поле"),
});
