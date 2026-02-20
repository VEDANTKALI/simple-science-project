import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExplanations, useSimplify } from "@/hooks/use-explanations";
import { BlobBackground } from "@/components/ui/blob-background";
import { HistoryCard } from "@/components/history-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, History, ArrowRight, Wand2, RefreshCcw, Quote } from "lucide-react";
import { type Explanation } from "@shared/schema";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [activeExplanation, setActiveExplanation] = useState<Explanation | null>(null);
  const { toast } = useToast();
  
  const { data: history, isLoading: isLoadingHistory } = useExplanations();
  const simplifyMutation = useSimplify();

  const handleSimplify = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Hey there!",
        description: "Please enter some text to simplify first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await simplifyMutation.mutateAsync({ text: inputText });
      setActiveExplanation({
        id: -1, // Temporary ID
        originalText: result.originalText,
        simplifiedText: result.simplifiedText,
        createdAt: new Date(),
      });
      setInputText(""); // Clear input on success
      toast({
        title: "Magic complete! ✨",
        description: "Your text has been successfully simplified.",
      });
    } catch (error) {
      toast({
        title: "Oops!",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const loadHistoryItem = (item: Explanation) => {
    setActiveExplanation(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setActiveExplanation(null);
    setInputText("");
  };

  return (
    <div className="min-h-screen w-full relative">
      <BlobBackground />

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary/20 shadow-sm text-sm font-bold text-primary mb-2"
          >
            <Sparkles className="w-4 h-4 fill-primary" />
            <span>AI-Powered Simplifier</span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-black text-foreground tracking-tight"
          >
            Explain Like I'm <span className="text-primary relative inline-block">
              Five
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary fill-current -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" />
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-medium"
          >
            Paste complex jargon, legal mumbo-jumbo, or scientific papers, and we'll rewrite it so a child can understand.
          </motion.p>
        </div>

        {/* Main Interaction Area */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 relative">
          {/* Input Side */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-primary/5 border border-white/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">1</span>
                  Paste Text
                </h3>
                {inputText.length > 0 && (
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {inputText.length} chars
                  </span>
                )}
              </div>

              <Textarea 
                placeholder="Paste your complex text here..."
                className="min-h-[280px] resize-none border-2 border-dashed border-border bg-muted/20 focus:bg-white focus:border-primary/50 text-base md:text-lg rounded-xl p-4 transition-all"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="mt-6 flex justify-end">
                <Button 
                  size="lg"
                  onClick={handleSimplify}
                  disabled={simplifyMutation.isPending || !inputText.trim()}
                  className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                  {simplifyMutation.isPending ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Simplifying...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Simplify Magic
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Desktop Arrow Indicator */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-primary/30">
            <ArrowRight className="w-12 h-12" />
          </div>

          {/* Result Side */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <AnimatePresence mode="wait">
              {activeExplanation ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 shadow-2xl shadow-primary/20 text-white relative flex flex-col"
                >
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleReset}
                      className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </Button>
                  </div>

                  <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">2</span>
                    Simple Version
                  </h3>

                  <div className="flex-1 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10 relative">
                    <Quote className="absolute top-4 left-4 w-8 h-8 text-white/10 rotate-180" />
                    <p className="text-lg md:text-xl leading-relaxed font-medium relative z-10">
                      {activeExplanation.simplifiedText}
                    </p>
                    <Quote className="absolute bottom-4 right-4 w-8 h-8 text-white/10" />
                  </div>

                  <div className="mt-6 flex justify-between items-center text-primary-foreground/70 text-sm font-medium">
                    <span>Explain Like I'm Five</span>
                    <span>AI Generated</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[300px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white/50 backdrop-blur-sm"
                >
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Ready to Simplify</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Your simplified text will appear here. It's like magic, but with algorithms!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* History Section */}
        <div className="w-full max-w-5xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded-lg">
              <History className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Recent Simplifications</h2>
          </div>

          {isLoadingHistory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <HistoryCard 
                  key={item.id} 
                  item={item} 
                  onClick={loadHistoryItem}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-3xl border border-border">
              <p className="text-muted-foreground font-medium">No history yet. Be the first to simplify something!</p>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full py-8 text-center text-muted-foreground/60 text-sm font-medium">
        <p>© 2024 ELI5 Tool. Making the complex simple.</p>
      </footer>
    </div>
  );
}
