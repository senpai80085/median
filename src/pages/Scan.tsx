import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchMedia, scanMedia, type ScanResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  Unauthorized: { icon: ShieldAlert, color: "destructive" as const, label: "Unauthorized Use Detected" },
  Safe: { icon: ShieldCheck, color: "default" as const, label: "Safe — No Infringement" },
  "No Match": { icon: ShieldQuestion, color: "secondary" as const, label: "No Match Found" },
};

export default function ScanPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const { toast } = useToast();

  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ["media"],
    queryFn: fetchMedia,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: scanMedia,
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => {
      toast({ title: "Scan failed", description: error.message, variant: "destructive" });
    },
  });

  const readyMedia = media ?? [];
  const config = result ? statusConfig[result.status] : null;
  const StatusIcon = config?.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scan for Matches</h1>
        <p className="text-muted-foreground mt-1">
          Select an uploaded image and scan for unauthorized copies.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Media</label>
            <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setResult(null); }}>
              <SelectTrigger>
                <SelectValue placeholder={mediaLoading ? "Loading..." : "Choose an uploaded image"} />
              </SelectTrigger>
              <SelectContent>
                {readyMedia.map((item) => (
                  <SelectItem key={item.media_id} value={item.media_id}>
                    <span className="font-mono text-xs">{item.media_id.slice(0, 8)}...</span>
                    <span className="ml-2 text-muted-foreground text-xs">
                      {item.labels.slice(0, 3).join(", ")}
                    </span>
                  </SelectItem>
                ))}
                {readyMedia.length === 0 && !mediaLoading && (
                  <SelectItem value="_none" disabled>
                    No media available to scan
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={() => mutation.mutate(selectedId)}
            disabled={!selectedId || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Run Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && config && StatusIcon && (
        <Card className={result.status === "Unauthorized" ? "border-destructive/50" : ""}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-6 w-6 ${
                result.status === "Unauthorized" ? "text-destructive" :
                result.status === "Safe" ? "text-primary" : "text-muted-foreground"
              }`} />
              <div>
                <CardTitle>{config.label}</CardTitle>
                <Badge variant={config.color} className="mt-1">
                  {result.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Similarity Score */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Similarity Score</span>
                <span className="font-semibold">{(result.similarity_score * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.similarity_score * 100} className="h-2" />
            </div>

            {/* Matched ID */}
            {result.matched_id && (
              <div>
                <p className="text-sm text-muted-foreground">Best Match</p>
                <p className="font-mono text-sm">{result.matched_id}</p>
              </div>
            )}

            {/* AI Explanation */}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium mb-2">AI Analysis</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.ai_explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {mutation.isError && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm">{mutation.error.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
