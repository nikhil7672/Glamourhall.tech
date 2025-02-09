import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export const TypingAnimation = ({ content }: { content: string }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const characters = content.split("");

  useEffect(() => {
    if (currentIndex < characters.length) {
      const timer = setTimeout(() => {
        setDisplayedContent((prev) => prev + characters[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30); // Slightly faster typing speed

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, characters]);

  return (
    <div className="relative">
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
      
      <AnimatePresence>
        {isTyping && (
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
                  className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"
                  animate={{
                    y: ["0%", "-50%", "0%"],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlight effect for new text */}
      <motion.span
        className="absolute bottom-0 left-0 w-full h-full bg-purple-100 dark:bg-purple-900/20 rounded-lg"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: currentIndex / characters.length }}
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