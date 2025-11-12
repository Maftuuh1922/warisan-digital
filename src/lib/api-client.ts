import { ApiResponse } from "../../shared/types"
import { useAuthStore } from "@/stores/authStore";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const user = useAuthStore.getState().user;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  // This is a temporary way to "authenticate" the user for the backend entities.
  // In a real app, this would be an Authorization header with a JWT.
  if (user?.email) {
    headers.set('X-User-Email', user.email);
  }
  const res = await fetch(path, { ...init, headers });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}