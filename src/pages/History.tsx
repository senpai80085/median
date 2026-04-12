import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle, Clock } from "lucide-react";

interface HistoryItem {
  id: number;
  target_id: string;
  matched_id: string | null;
  status: string;
  confidence: string | null;
  combined_score: number | null;
  embedding_score: number | null;
  phash_score: number | null;
  ai_explanation: string | null;
  scanned_at: string;
}

const statusIcon = (status: string) => {
  if (status === "Unauthorized") return <ShieldAlert className="h-4 w-4 text-destructive" />;
  if (status === "Review") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  if (status === "Safe") return <ShieldCheck className="h-4 w-4 text-primary" />;
  return <ShieldQuestion className="h-4 w-4 text-muted-foreground" />;
};

const statusVariant = (status: string): "destructive" | "secondary" | "default" | "outline" => {
  if (status === "Unauthorized") return "destructive";
  if (status === "Review") return "secondary";
  if (status === "Safe") return "default";
  return "outline";
};

async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch("/history");
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export default function HistoryPage() {
  const { data: history = [], isLoading, isError } = useQuery({
    queryKey: ["scan-history"],
    queryFn: fetchHistory,
    refetchInterval: 10000,
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-4">
          <History className="h-4 w-4 text-primary" />
          <span>Scan History</span>
        </div>
        <h1 className="text-4xl font-bold">
          Past <span className="gradient-text">Scans</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Review all previous AI-powered scan results and their analysis.
        </p>
      </div>

      {isLoading && (
        <div className="text-center text-muted-foreground py-20">Loading history...</div>
      )}

      {isError && (
        <div className="text-center text-destructive py-20">Failed to load scan history.</div>
      )}

      {!isLoading && !isError && history.length === 0 && (
        <Card className="glass border-white/10 text-center py-16">
          <CardContent>
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No scans yet. Run your first scan to see results here.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id} className="glass border-white/10 hover-glow animate-fade-in-up">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {statusIcon(item.status)}
                  <CardTitle className="text-base font-semibold">{item.status}</CardTitle>
                  <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  {item.confidence && (
                    <Badge variant="outline" className="text-xs">{item.confidence} Confidence</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(item.scanned_at).toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="glass rounded-lg px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-1">Target Image</p>
                  <p className="font-mono text-xs truncate">{item.target_id}</p>
                </div>
                {item.matched_id ? (
                  <div className="glass rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-1">Matched Image</p>
                    <p className="font-mono text-xs truncate">{item.matched_id}</p>
                  </div>
                ) : (
                  <div className="glass rounded-lg px-3 py-2 opacity-50">
                    <p className="text-xs text-muted-foreground mb-1">Matched Image</p>
                    <p className="text-xs">No match found</p>
                  </div>
                )}
              </div>

              {/* Scores */}
              {(item.combined_score !== null || item.embedding_score !== null || item.phash_score !== null) && (
                <div className="flex flex-wrap gap-3 text-xs">
                  {item.combined_score !== null && (
                    <span className="px-2 py-1 rounded-full glass border border-white/10">
                      Combined: <strong>{(item.combined_score * 100).toFixed(1)}%</strong>
                    </span>
                  )}
                  {item.embedding_score !== null && (
                    <span className="px-2 py-1 rounded-full glass border border-white/10">
                      Semantic: <strong>{(item.embedding_score * 100).toFixed(1)}%</strong>
                    </span>
                  )}
                  {item.phash_score !== null && (
                    <span className="px-2 py-1 rounded-full glass border border-white/10">
                      Structural: <strong>{(item.phash_score * 100).toFixed(1)}%</strong>
                    </span>
                  )}
                </div>
              )}

              {/* AI Explanation */}
              {item.ai_explanation && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.ai_explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
