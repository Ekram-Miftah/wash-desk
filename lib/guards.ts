import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";

export async function requireUser() {
  await connection();
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (user.role !== "OWNER") redirect("/dashboard");
  return user;
}