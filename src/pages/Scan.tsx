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
    <div className="max-w-4xl mx-auto space-y-10 py-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">
            <Search className="h-3 w-3" />
            <span>Detection Engine v2.4</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4">Attribution <span className="text-cyan-500 italic">Analysis</span></h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Execute a cross-reference scan using multimodal neural embeddings and structural fingerprinting.
        </p>
      </div>

      <Card className="bg-[#030712]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardContent className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Source Media Asset</label>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setResult(null); }}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-14">
                    <SelectValue placeholder={mediaLoading ? "Connecting to Archives..." : "Select from Vault"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 rounded-xl">
                    {readyMedia.map((item) => (
                      <SelectItem key={item.media_id} value={item.media_id} className="focus:bg-cyan-500/20">
                        <span className="font-mono text-xs text-cyan-500">[{item.media_id.slice(0, 8)}]</span>
                        <span className="ml-2 text-slate-300 text-xs font-medium">
                          {item.labels.slice(0, 2).join(" • ")}
                        </span>
                      </SelectItem>
                    ))}
                    {readyMedia.length === 0 && !mediaLoading && (
                      <SelectItem value="_none" disabled>
                        No assets found in vault
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedId && selectedId !== "_none" && (
                <div className="h-14 w-14 shrink-0 bg-slate-800 rounded-2xl overflow-hidden border border-cyan-500/30 p-1">
                  <img 
                    src={`${API_URL}/media/${selectedId}`} 
                    alt="Preview" 
                    className="h-full w-full object-cover rounded-xl" 
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-cyan-600/20 transition-all active:scale-95"
            onClick={() => mutation.mutate(selectedId)}
            disabled={!selectedId || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                Initializing Neural Scan...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-3" />
                Execute Attribution Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && config && StatusIcon && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className={`bg-[#030712]/40 backdrop-blur-3xl border rounded-[2.5rem] overflow-hidden shadow-2xl ${
            result.status === "Unauthorized" ? "border-red-500/30" : result.status === "Review" ? "border-amber-500/30" : "border-cyan-500/30"
          }`}>
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                  result.status === "Unauthorized" ? "bg-red-500/10 text-red-500" :
                  result.status === "Review" ? "bg-amber-500/10 text-amber-500" : "bg-cyan-500/10 text-cyan-500"
                }`}>
                  <StatusIcon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">{config.label}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className={`text-[9px] font-black tracking-widest uppercase border-white/10 ${
                      result.status === "Unauthorized" ? "text-red-400 bg-red-400/10" :
                      result.status === "Review" ? "text-amber-400 bg-amber-400/10" : "text-cyan-400 bg-cyan-400/10"
                    }`}>
                      {result.status}
                    </Badge>
                    {result.confidence && (
                      <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-white/10 text-slate-400">
                        {result.confidence} CONFIDENCE
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              {/* Score Breakdown */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-slate-500">Multimodal Integrity Score</span>
                    <span className="text-white">{(result.similarity_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${result.similarity_score * 100}%` }} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    {result.embedding_score !== undefined && result.embedding_score !== null && (
                        <div>
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1 text-slate-500">
                                <span>Semantic</span>
                                <span className="text-slate-300">{(result.embedding_score * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${result.embedding_score * 100}%` }} />
                            </div>
                        </div>
                    )}
                    {result.phash_score !== undefined && result.phash_score !== null && (
                        <div>
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1 text-slate-500">
                                <span>Structural</span>
                                <span className="text-slate-300">{(result.phash_score * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400" style={{ width: `${result.phash_score * 100}%` }} />
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* AI Explanation */}
              <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-4 flex items-center gap-2">
                  <Info className="h-3 w-3" /> Synthesis Log
                </p>
                <p className="text-xs text-slate-300 leading-relaxed italic font-medium">"{result.ai_explanation}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Side-by-Side Images */}
          {result.matched_id && (
            <Card className="bg-[#030712]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Attribution Match Matrix</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="bg-slate-900 rounded-[1.5rem] flex items-center justify-center p-2 h-[180px] border border-white/5">
                            <img 
                            src={`${API_URL}/media/${selectedId}`} 
                            alt="Target" 
                            className="max-h-full max-w-full object-contain rounded-xl"
                            />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 text-center">Reference Asset</p>
                    </div>
                    <div className="space-y-3">
                        <div className="bg-slate-900 rounded-[1.5rem] flex items-center justify-center p-2 h-[180px] border border-cyan-500/20">
                            <img 
                            src={`${API_URL}/media/${result.matched_id}`} 
                            alt="Match" 
                            className="max-h-full max-w-full object-contain rounded-xl"
                            />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-cyan-600 text-center">Detected Origin</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-white/5 text-center">
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tighter">Match ID: <span className="font-mono text-cyan-500">{result.matched_id.slice(0,16)}</span></p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {mutation.isError && (
        <Card className="bg-red-500/10 border border-red-500/30 rounded-2xl">
          <CardContent className="flex items-center gap-4 py-6">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-xs font-bold text-red-400">{mutation.error.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
