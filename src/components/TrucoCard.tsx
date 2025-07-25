import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TrucoCardData {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | 'J' | 'Q' | 'K';
  trucoValue: number; // Valor específico no truco
}

interface TrucoCardProps {
  card?: TrucoCardData;
  isRevealed?: boolean;
  isHighlighted?: boolean;
  className?: string;
  onClick?: () => void;
}

const getSuitSymbol = (suit: string) => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '';
  }
};

const getSuitColor = (suit: string) => {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-800';
};

export const TrucoCard = ({ 
  card, 
  isRevealed = true, 
  isHighlighted = false, 
  className,
  onClick 
}: TrucoCardProps) => {
  return (
    <Card 
      className={cn(
        "w-16 h-24 sm:w-20 sm:h-28 relative cursor-pointer transition-all duration-300",
        "bg-gradient-to-br from-parchment to-card border-2",
        "hover:scale-105 hover:shadow-lg",
        isHighlighted && "ring-2 ring-gold shadow-[var(--shadow-gold)]",
        !isRevealed && "bg-gradient-to-br from-accent to-accent-foreground",
        className
      )}
      onClick={onClick}
      style={{
        boxShadow: isHighlighted ? 'var(--shadow-gold)' : 'var(--shadow-card)'
      }}
    >
      <div className="absolute inset-1 flex flex-col justify-between">
        {isRevealed && card ? (
          <>
            {/* Canto superior esquerdo */}
            <div className={cn("text-xs sm:text-sm font-bold", getSuitColor(card.suit))}>
              <div>{card.value}</div>
              <div className="text-lg leading-none">{getSuitSymbol(card.suit)}</div>
            </div>
            
            {/* Centro da carta */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-bold",
              getSuitColor(card.suit)
            )}>
              {getSuitSymbol(card.suit)}
            </div>
            
            {/* Canto inferior direito (invertido) */}
            <div className={cn(
              "text-xs sm:text-sm font-bold self-end rotate-180",
              getSuitColor(card.suit)
            )}>
              <div>{card.value}</div>
              <div className="text-lg leading-none">{getSuitSymbol(card.suit)}</div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gold text-xl sm:text-2xl font-bold">?</div>
          </div>
        )}
      </div>
    </Card>
  );
};