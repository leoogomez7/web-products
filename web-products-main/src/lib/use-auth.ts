import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { client } from "@/lib/db";

export type AuthState = {
  loading: boolean;
  session: null;
  user: any | null;
};

export function useAuth(): AuthState {
  const { user, isLoading } = useKindeAuth();
  return { loading: isLoading, session: null, user };
}

export async function isStaff(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const res = await client.execute({
    sql: "SELECT role FROM user_roles WHERE user_id = ?",
    args: [userId],
  });
  return ((res.rows ?? []) as Array<{ role: string }>).some(
    (r) => r.role === "admin" || r.role === "editor",
  );
}
