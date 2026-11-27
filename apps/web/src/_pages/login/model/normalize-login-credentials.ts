export function normalizeLoginCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return {
    email: email.trim().toLowerCase(),
    password,
  };
}
