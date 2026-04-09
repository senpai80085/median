import { useQuery } from "@tanstack/react-query";
import { fetchMedia, type MediaItem } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Image, Tag, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: media, isLoading, isError } = useQuery({
    queryKey: ["media"],
    queryFn: fetchMedia,
    retry: 1,
  });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">AI Media Guardian</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Protect your images from unauthorized use with AI-powered detection and analysis.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link to="/upload">Upload Media</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/scan">Run Scan</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Media</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "—" : (media?.length ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Embeddings</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "—" : (media?.filter((m) => m.has_embedding).length ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready to Scan</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "—" : (media?.filter((m) => m.has_embedding).length ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Uploaded Media</h2>
        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium">Could not connect to backend</p>
                <p className="text-sm text-muted-foreground">
                  Make sure the FastAPI server is running at{" "}
                  <code className="bg-muted px-1 rounded text-xs">
                    {import.meta.env.VITE_API_URL || "http://localhost:8000"}
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : media && media.length > 0 ? (
          <div className="grid gap-3">
            {media.map((item) => (
              <Card key={item.media_id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-mono text-sm">{item.media_id}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.labels.slice(0, 5).map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      {item.labels.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.labels.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={item.has_embedding ? "default" : "outline"}>
                    {item.has_embedding ? "Ready" : "No Embedding"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Image className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No media uploaded yet.</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/upload">Upload your first image</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
