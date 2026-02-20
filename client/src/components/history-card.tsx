import { motion } from "framer-motion";
import { type Explanation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HistoryCardProps {
  item: Explanation;
  onClick: (item: Explanation) => void;
}

export function HistoryCard({ item, onClick }: HistoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(item)}
      className="group relative bg-white rounded-xl p-5 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Original
          </p>
          <p className="text-foreground/80 line-clamp-2 text-sm font-medium">
            {item.originalText}
          </p>
          
          <div className="mt-4 pt-3 border-t border-dashed border-border">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
              Simpler Version
            </p>
            <p className="text-foreground line-clamp-2 text-sm">
              {item.simplifiedText}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "flex flex-col items-end justify-between h-full gap-2 transition-transform duration-300",
          isHovered ? "translate-x-0" : "translate-x-2"
        )}>
          <span className="text-[10px] font-bold text-muted-foreground/60 bg-muted px-2 py-1 rounded-full whitespace-nowrap">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
          <div className={cn(
            "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all duration-300",
            isHovered ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-45"
          )}>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
