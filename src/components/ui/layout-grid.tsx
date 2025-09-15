
"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Snippet } from "@/lib/types";
import SnippetCard from "../snippet-card";

type Card = {
  id: string;
  className: string;
  thumbnail: React.ReactNode;
  snippet: Snippet;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  max-w-7xl mx-auto gap-4 ">
      {cards.map((card, i) => (
        <div key={i} className={cn(card.className, "")}>
          <motion.div
            className={cn(
              "relative overflow-hidden bg-card border rounded-xl h-full w-full",
               selected?.id === card.id && "fixed inset-0 h-full w-full m-auto z-50 flex justify-center items-center",
               lastSelected?.id === card.id && "z-40 bg-background rounded-xl h-full w-full",
            )}
            layoutId={`card-${card.id}`}
            onClick={() => handleClick(card)}
          >
            {selected?.id === card.id ? (
              <SelectedCard selected={selected} />
            ) : (
              card.thumbnail
            )}
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "fixed h-full w-full left-0 top-0 bg-black/80 backdrop-blur-sm z-40",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 1 : 0 }}
      />
    </div>
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  if (!selected) {
    return null;
  }
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-center items-center rounded-lg relative z-[60]">
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-2xl"
        >
            <SnippetCard snippet={selected.snippet} />
        </motion.div>
    </div>
  );
};
