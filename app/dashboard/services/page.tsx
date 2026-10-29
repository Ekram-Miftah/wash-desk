import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { formatBirr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleServiceActive } from "./action";

async function ServicesTable() {
  const user = await requireUser();
  const isOwner = user.role === "OWNER";
  const services = await db.service.findMany({ orderBy: { createdAt: "asc" } });

  if (services.length === 0) {
    return (
      <p className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
        No services yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            {isOwner && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{formatBirr(service.price)}</TableCell>
              <TableCell>{service.durationMin} min</TableCell>
              <TableCell>
                <Badge variant={service.active ? "secondary" : "outline"}>
                  {service.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              {isOwner && (
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/services/${service.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Edit
                    </Link>
                    <form action={toggleServiceActive.bind(null, service.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        {service.active ? "Deactivate" : "Activate"}
                      </Button>
                    </form>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

async function NewServiceButton() {
  const user = await requireUser();
  if (user.role !== "OWNER") return null;
  return (
    <Link href="/dashboard/services/new" className={buttonVariants()}>
      New service
    </Link>
  );
}

export default function ServicesPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">
            The services you offer and what each one costs.
          </p>
        </div>
        <Suspense fallback={null}>
          <NewServiceButton />
        </Suspense>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <ServicesTable />
      </Suspense>
    </div>
  );
}