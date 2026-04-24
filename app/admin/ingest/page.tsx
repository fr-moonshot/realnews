import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminIngestPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-3">
        <Badge variant="outline">Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Run ingestion</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Trigger the server-side MVP ingestion job. The secret is checked only on the server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual trigger</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/ingest" method="post" className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Ingestion secret
              <input
                name="secret"
                type="password"
                autoComplete="off"
                className="h-11 rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                placeholder="ADMIN_INGEST_SECRET"
                required
              />
            </label>
            <Button type="submit" className="w-full sm:w-fit">
              Run ingestion
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
