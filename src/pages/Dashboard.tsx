import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMedia, deleteMedia, API_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ImageIcon, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: media = [], isLoading, isError } = useQuery({
    queryKey: ["media"],
    queryFn: fetchMedia,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Media deleted", description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-4">
          <ImageIcon className="h-4 w-4 text-primary" />
          <span>Dashboard</span>
        </div>
        <h1 className="text-4xl font-bold">
          Media <span className="gradient-text">Library</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage all your uploaded media files and their AI signatures.
        </p>
      </div>

      {isLoading && <div className="text-center text-muted-foreground py-20">Loading media...</div>}
      {isError && <div className="text-center text-destructive py-20">Failed to load media.</div>}

      {!isLoading && !isError && media.length === 0 && (
        <Card className="glass border-white/10 text-center py-16">
          <CardContent>
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No media found. Upload some images to see them here.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {media.map((item) => (
          <Card key={item.media_id} className="glass border-white/10 hover-glow animate-fade-in-up overflow-hidden flex flex-col">
            <div className="relative aspect-square bg-muted/30 w-full overflow-hidden">
              <img
                src={`${API_URL}/media/${item.media_id}`}
                alt="Uploaded media preview"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-mono truncate">{item.media_id}</CardTitle>
              {item.upload_time && (
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(item.upload_time).toLocaleDateString()}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.labels.slice(0, 3).map((label) => (
                  <Badge key={label} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {label}
                  </Badge>
                ))}
                {item.labels.length > 3 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{item.labels.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                variant="destructive"
                size="sm"
                className="w-full bg-destructive/80 hover:bg-destructive text-xs"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this media?")) {
                    deleteMutation.mutate(item.media_id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
