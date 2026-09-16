"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  FileText,
  Search,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { categoryStyle } from "@/components/blog/categories";
import {
  api,
  fmtDate,
  PageHeader,
  EmptyState,
  adminCard,
  type AdminPost,
} from "./admin-shared";

export function PostsTable() {
  const [posts, setPosts] = React.useState<AdminPost[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [busyId, setBusyId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    api<{ posts: AdminPost[] }>("/api/admin/posts")
      .then((d) => setPosts(d.posts))
      .catch((e: Error) => {
        if (e.name === "AdminUnauthorized") return;
        setError(e.message);
        setPosts([]);
      });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function patch(id: number, data: Record<string, unknown>, okMsg: string) {
    setBusyId(id);
    try {
      await api(`/api/admin/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success(okMsg);
      load();
    } catch (e) {
      if ((e as Error).name !== "AdminUnauthorized") {
        toast.error((e as Error).message || "Update failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number, title: string) {
    setBusyId(id);
    try {
      await api(`/api/admin/posts/${id}`, { method: "DELETE" });
      toast.success(`“${title}” deleted`);
      setPosts((p) => p?.filter((x) => x.id !== id) ?? null);
    } catch (e) {
      if ((e as Error).name !== "AdminUnauthorized") {
        toast.error((e as Error).message || "Delete failed");
      }
    } finally {
      setBusyId(null);
    }
  }

  const filtered = (posts ?? []).filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const loading = posts === null && !error;

  return (
    <div>
      <PageHeader
        title="Blog Posts"
        subtitle={`${posts?.length ?? "…"} posts · write, edit and publish articles for the website.`}
      >
        <Button
          asChild
          className="rounded-full font-display font-semibold"
          size="sm"
        >
          <Link href="/admin/posts/new">
            <Plus className="size-4" /> New Post
          </Link>
        </Button>
      </PageHeader>

      <div className={cn(adminCard, "overflow-hidden")}>
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#f0e4d3] p-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="rounded-xl border-[#eadfcc] bg-cream-soft pl-9"
              aria-label="Search posts"
            />
          </div>
          {posts ? (
            <span className="ml-auto text-xs font-bold text-ink-faint">
              {filtered.length} shown
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4">
            <EmptyState
              icon={<Inbox />}
              title="Couldn't load posts"
              description={error}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<FileText />}
              title={query ? "No posts match your search" : "No posts yet"}
              description={
                query
                  ? "Try a different keyword, or clear the search."
                  : "Write your first article — it will appear on the public blog."
              }
            >
              {!query ? (
                <Button
                  asChild
                  size="sm"
                  className="mt-2 rounded-full font-display font-semibold"
                >
                  <Link href="/admin/posts/new">
                    <Plus className="size-4" /> New Post
                  </Link>
                </Button>
              ) : null}
            </EmptyState>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-cream-soft/60 hover:bg-cream-soft/60">
                <TableHead className="pl-5 text-xs font-extrabold tracking-wider text-ink-faint uppercase">
                  Post
                </TableHead>
                <TableHead className="hidden text-xs font-extrabold tracking-wider text-ink-faint uppercase md:table-cell">
                  Category
                </TableHead>
                <TableHead className="text-center text-xs font-extrabold tracking-wider text-ink-faint uppercase">
                  Featured
                </TableHead>
                <TableHead className="text-xs font-extrabold tracking-wider text-ink-faint uppercase">
                  Published
                </TableHead>
                <TableHead className="hidden text-xs font-extrabold tracking-wider text-ink-faint uppercase sm:table-cell">
                  Date
                </TableHead>
                <TableHead className="pr-5 text-right text-xs font-extrabold tracking-wider text-ink-faint uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const style = categoryStyle(p.category);
                const busy = busyId === p.id;
                return (
                  <TableRow
                    key={p.id}
                    className={cn(
                      "transition-opacity",
                      busy && "pointer-events-none opacity-50"
                    )}
                  >
                    <TableCell className="max-w-64 pl-5">
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="block group"
                      >
                        <span className="line-clamp-1 font-bold text-ink transition-colors group-hover:text-brand">
                          {p.title}
                        </span>
                        <span className="line-clamp-1 text-xs text-ink-faint">
                          /{p.slug}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold",
                          style.badge
                        )}
                      >
                        {p.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        aria-label={
                          p.featured
                            ? `Remove ${p.title} from featured`
                            : `Feature ${p.title}`
                        }
                        onClick={() =>
                          patch(
                            p.id,
                            { featured: !p.featured },
                            p.featured ? "Removed from featured" : "Marked as featured"
                          )
                        }
                        className="rounded-md p-1.5 transition-colors hover:bg-yellow-soft"
                      >
                        <Star
                          className={cn(
                            "size-[1.1rem] transition-all",
                            p.featured
                              ? "fill-yellow-pop text-yellow-pop scale-110"
                              : "text-ink-faint hover:text-yellow-pop"
                          )}
                        />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.published}
                        aria-label={
                          p.published
                            ? `Unpublish ${p.title}`
                            : `Publish ${p.title}`
                        }
                        onCheckedChange={(v) =>
                          patch(
                            p.id,
                            { published: v },
                            v ? "Post published" : "Post unpublished"
                          )
                        }
                        className="data-[state=checked]:bg-green-pop"
                      />
                    </TableCell>
                    <TableCell className="hidden text-xs font-semibold whitespace-nowrap text-ink-soft sm:table-cell">
                      {fmtDate(p.createdAt)}
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${p.title}`}
                          className="size-8 text-ink-soft hover:bg-brand-soft hover:text-brand"
                        >
                          <Link href={`/admin/posts/${p.id}`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete ${p.title}`}
                              className="size-8 text-ink-soft hover:bg-red-soft hover:text-red-pop"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display">
                                Delete this post?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                “{p.title}” will be permanently removed from the
                                blog. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => remove(p.id, p.title)}
                                className="bg-red-pop text-white hover:bg-[#e22c5c]"
                              >
                                <Trash2 className="size-4" /> Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
