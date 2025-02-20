import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export const TypingAnimation = ({ 
  content, 
  onComplete
}: { 
  content: string; 
  onComplete?: () => void 
}) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    if (isSkipped) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      setIsTyping(false);
      return;
    }

    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [currentIndex, content, isSkipped, onComplete]);

  const handleSkip = () => {
    setIsSkipped(true);
  };

  return (
    <div className="relative">
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
      
      <AnimatePresence>
        {isTyping && (
          <div className="flex items-center gap-2 mt-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center ml-2"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-500"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2,
              }}
            />
                ))}
              </div>
            </motion.div>
            
            <button
        onClick={handleSkip}
        className="ml-3 px-3 py-1.5 text-sm font-medium rounded-full bg-transparent text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-purple-500/20"
      >
        Skip
      </button>
          </div>
        )}
      </AnimatePresence>

      <motion.span
        className="absolute bottom-0 left-0 w-full h-full bg-purple-100 dark:bg-purple-900/20 rounded-lg"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: currentIndex / content.length }}
        transition={{ duration: 0.1 }}
        style={{
          originX: 0,
          opacity: 0.1,
          zIndex: -1,
        }}
      />
    </div>
  );
};