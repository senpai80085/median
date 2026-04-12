import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchMedia, scanMedia, API_URL, type ScanResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  Unauthorized: { icon: ShieldAlert, color: "destructive" as const, label: "Unauthorized Use Detected" },
  Review: { icon: AlertTriangle, color: "secondary" as const, label: "Manual Review Required" },
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
            <div className="flex items-start gap-4">
              <div className="flex-1">
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
              {selectedId && selectedId !== "_none" && (
                <div className="h-10 w-10 shrink-0 bg-muted rounded overflow-hidden border border-white/10">
                  <img 
                    src={`${API_URL}/media/${selectedId}`} 
                    alt="Preview" 
                    className="h-full w-full object-cover" 
                  />
                </div>
              )}
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={result.status === "Unauthorized" ? "border-destructive/50" : result.status === "Review" ? "border-yellow-500/50" : ""}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StatusIcon className={`h-6 w-6 ${
                  result.status === "Unauthorized" ? "text-destructive" :
                  result.status === "Review" ? "text-yellow-500" :
                  result.status === "Safe" ? "text-primary" : "text-muted-foreground"
                }`} />
                <div>
                  <CardTitle>{config.label}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={config.color} className={result.status === "Review" ? "text-yellow-600 border-yellow-500" : ""}>
                      {result.status}
                    </Badge>
                    {result.confidence && (
                      <Badge variant="outline">{result.confidence} Confidence</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score Breakdown */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Combined Score</span>
                    <span className="font-semibold">{(result.similarity_score * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={result.similarity_score * 100} className="h-2" />
                </div>
                
                {result.embedding_score !== undefined && result.embedding_score !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Semantic (AI Embedding)</span>
                      <span className="font-semibold">{(result.embedding_score * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={result.embedding_score * 100} className="h-1.5" />
                  </div>
                )}
                
                {result.phash_score !== undefined && result.phash_score !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Structural (pHash)</span>
                      <span className="font-semibold">{(result.phash_score * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={result.phash_score * 100} className="h-1.5" />
                  </div>
                )}
              </div>

              {/* AI Explanation */}
              <div className="bg-muted rounded-lg p-4 mt-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" /> AI Analysis
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{result.ai_explanation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Side-by-Side Images */}
          {result.matched_id && (
            <Card>
              <CardHeader>
                <CardTitle>Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground text-center">Target Image</p>
                  <div className="bg-muted rounded-md flex items-center justify-center p-2 h-[200px]">
                    <img 
                      src={`${API_URL}/media/${selectedId}`} 
                      alt="Target" 
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground text-center">Best Match ({result.matched_id.slice(0,8)}...)</p>
                  <div className="bg-muted rounded-md flex items-center justify-center p-2 h-[200px]">
                    <img 
                      src={`${API_URL}/media/${result.matched_id}`} 
                      alt="Match" 
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
