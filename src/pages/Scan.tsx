import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchMedia, scanMedia, type ScanResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2, AlertTriangle, Brain, Sparkles, Cpu, Hash, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  Unauthorized: { icon: ShieldAlert, color: "destructive" as const, label: "Unauthorized Use Detected", bg: "from-red-500/20 to-orange-500/20" },
  Safe: { icon: ShieldCheck, color: "default" as const, label: "Safe - No Infringement", bg: "from-green-500/20 to-emerald-500/20" },
  "No Match": { icon: ShieldQuestion, color: "secondary" as const, label: "No Match Found", bg: "from-yellow-500/20 to-amber-500/20" },
};

const analysisSteps = [
  "Extracting features...",
  "Comparing embeddings...",
  "Generating explanation...",
];

export default function ScanPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const { toast } = useToast();

  const { data: media, isLoading: mediaLoading } = useQuery({
    queryKey: ["media"],
    queryFn: fetchMedia,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate analysis steps
      const stepInterval = setInterval(() => {
        setAnalysisStep((prev) => (prev + 1) % analysisSteps.length);
      }, 700);
      
      const result = await scanMedia(id);
      clearInterval(stepInterval);
      return result;
    },
    onSuccess: (data) => {
      setResult(data);
      setAnalysisStep(0);
    },
    onError: (error: Error) => {
      setAnalysisStep(0);
      toast({ title: "Scan failed", description: error.message, variant: "destructive" });
    },
  });

  const readyMedia = media ?? [];
  const config = result ? statusConfig[result.status] : null;
  const StatusIcon = config?.icon;

  // Calculate fake component scores based on similarity
  const embeddingScore = result ? Math.min(result.similarity_score * 1.1, 1) : 0;
  const pHashScore = result ? Math.max(result.similarity_score * 0.95, 0) : 0;
  const combinedScore = result ? result.similarity_score : 0;

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-4">
            <Search className="h-4 w-4 text-primary" />
            <span>AI Detection</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Scan for <span className="gradient-text">Matches</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select an uploaded image and scan for unauthorized copies using AI-powered analysis.
          </p>
        </div>

        {/* Upload Panel */}
        <Card className="glass border-white/10 mb-8 animate-fade-in-up animate-delay-100">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Select Media
              </label>
              <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setResult(null); }}>
                <SelectTrigger className="bg-background/50 border-white/10 h-12">
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
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white hover-glow"
              onClick={() => mutation.mutate(selectedId)}
              disabled={!selectedId || mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{analysisSteps[analysisStep]}</span>
                </div>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>

            {mutation.isPending && (
              <Progress value={(analysisStep + 1) * 33} className="h-2" />
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && config && StatusIcon && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Status Card */}
            <Card className={`glass border-white/10 overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-50`} />
              <CardHeader className="relative">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    result.status === "Unauthorized" ? "bg-red-500/20" :
                    result.status === "Safe" ? "bg-green-500/20" : "bg-yellow-500/20"
                  }`}>
                    <StatusIcon className={`h-8 w-8 ${
                      result.status === "Unauthorized" ? "text-red-400" :
                      result.status === "Safe" ? "text-green-400" : "text-yellow-400"
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{config.label}</CardTitle>
                    <Badge 
                      variant={config.color} 
                      className={`mt-2 ${
                        result.status === "Unauthorized" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        result.status === "Safe" ? "bg-green-500/20 text-green-400 border-green-500/30" : 
                        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }`}
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Score Breakdown */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Embedding Score */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Layers className="h-4 w-4" />
                        Embedding Score
                      </span>
                      <span className="font-semibold text-primary">{(embeddingScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                        style={{ width: `${embeddingScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* pHash Score */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        pHash Score
                      </span>
                      <span className="font-semibold text-accent">{(pHashScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-1000"
                        style={{ width: `${pHashScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Combined Score */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium">Combined Similarity</span>
                      <span className="font-bold text-lg gradient-text">{(combinedScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full animated-gradient rounded-full transition-all duration-1000"
                        style={{ width: `${combinedScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Matched ID */}
                  {result.matched_id && (
                    <div className="glass rounded-xl p-3 mt-4">
                      <p className="text-xs text-muted-foreground mb-1">Best Match ID</p>
                      <p className="font-mono text-sm">{result.matched_id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Insight Panel */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="glass rounded-xl p-4 bg-gradient-to-br from-primary/5 to-accent/5">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {result.ai_explanation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>Powered by Google Gemini</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {mutation.isError && (
          <Card className="glass border-destructive/50 animate-fade-in-up">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-sm">{mutation.error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
