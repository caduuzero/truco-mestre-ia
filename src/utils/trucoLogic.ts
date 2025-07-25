import { TrucoCardData } from "@/components/TrucoCard";

// Hierarquia das cartas no truco (do menor para o maior valor)
export const TRUCO_HIERARCHY: Record<string, number> = {
  '4': 1, '5': 2, '6': 3, '7': 4, 'Q': 5, 'J': 6, 'K': 7, 'A': 8, '2': 9, '3': 10,
  // Manilhas (variam conforme a vira)
  'manilha_weak': 11, 'manilha_medium': 12, 'manilha_strong': 13, 'manilha_strongest': 14
};

// Ordem dos naipes para manilhas (da menor para a maior)
const SUIT_ORDER = ['diamonds', 'spades', 'hearts', 'clubs'];

export const calculateTrucoValue = (card: TrucoCardData, vira?: TrucoCardData): number => {
  if (!vira) return TRUCO_HIERARCHY[card.value] || 0;
  
  // Calcula qual carta é manilha
  const viraValue = vira.value;
  const manilhaValue = getNextValue(viraValue);
  
  if (card.value === manilhaValue) {
    // É uma manilha, o valor depende do naipe
    const suitIndex = SUIT_ORDER.indexOf(card.suit);
    return 11 + suitIndex; // 11-14 para as 4 manilhas
  }
  
  return TRUCO_HIERARCHY[card.value] || 0;
};

const getNextValue = (value: string): string => {
  const sequence = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
  const index = sequence.indexOf(value);
  return sequence[(index + 1) % sequence.length];
};

export interface TrucoGameState {
  playerCards: TrucoCardData[];
  opponentCards: TrucoCardData[];
  vira: TrucoCardData;
  currentRound: number;
  playerScore: number;
  opponentScore: number;
}

export interface TrucoDecision {
  action: 'play' | 'truco' | 'pass';
  cardToPlay?: TrucoCardData;
  confidence: number;
  reasoning: string;
}

export const analyzeHand = (cards: TrucoCardData[], vira: TrucoCardData): {
  strength: number;
  strongestCard: TrucoCardData;
  hasManilha: boolean;
} => {
  const cardValues = cards.map(card => ({
    card,
    value: calculateTrucoValue(card, vira)
  }));
  
  const sortedCards = cardValues.sort((a, b) => b.value - a.value);
  const hasManilha = sortedCards.some(c => c.value >= 11);
  
  // Calcula força da mão (0-100)
  const avgValue = cardValues.reduce((sum, c) => sum + c.value, 0) / cards.length;
  const strength = Math.min(100, (avgValue / 14) * 100);
  
  return {
    strength,
    strongestCard: sortedCards[0].card,
    hasManilha
  };
};

export const suggestPlay = (
  playerCards: TrucoCardData[],
  vira: TrucoCardData,
  opponentCard?: TrucoCardData,
  round: number = 1
): TrucoDecision => {
  const handAnalysis = analyzeHand(playerCards, vira);
  
  if (opponentCard) {
    // Oponente já jogou, precisa responder
    const opponentValue = calculateTrucoValue(opponentCard, vira);
    const winningCards = playerCards.filter(card => 
      calculateTrucoValue(card, vira) > opponentValue
    );
    
    if (winningCards.length > 0) {
      // Joga a carta mais fraca que ainda ganha
      const cardToPlay = winningCards.reduce((weakest, current) => 
        calculateTrucoValue(current, vira) < calculateTrucoValue(weakest, vira) 
          ? current : weakest
      );
      
      return {
        action: 'play',
        cardToPlay,
        confidence: 80,
        reasoning: `Jogando ${cardToPlay.value} de ${cardToPlay.suit} para ganhar a rodada com carta econômica.`
      };
    } else {
      // Não tem como ganhar, joga a carta mais fraca
      const weakestCard = playerCards.reduce((weakest, current) => 
        calculateTrucoValue(current, vira) < calculateTrucoValue(weakest, vira) 
          ? current : weakest
      );
      
      return {
        action: 'play',
        cardToPlay: weakestCard,
        confidence: 60,
        reasoning: `Não posso ganhar esta rodada. Jogando carta fraca (${weakestCard.value} de ${weakestCard.suit}) para economizar.`
      };
    }
  } else {
    // Primeiro a jogar
    if (handAnalysis.strength > 75 && round === 1) {
      return {
        action: 'truco',
        confidence: 90,
        reasoning: `Mão muito forte (${Math.round(handAnalysis.strength)}%). ${handAnalysis.hasManilha ? 'Tenho manilha!' : 'Cartas altas!'} Hora de trucar!`
      };
    }
    
    if (handAnalysis.strength > 60) {
      // Joga carta média-forte
      const sortedCards = playerCards
        .map(card => ({ card, value: calculateTrucoValue(card, vira) }))
        .sort((a, b) => b.value - a.value);
      
      const cardToPlay = sortedCards[Math.floor(sortedCards.length / 2)].card;
      
      return {
        action: 'play',
        cardToPlay,
        confidence: 70,
        reasoning: `Mão boa (${Math.round(handAnalysis.strength)}%). Jogando ${cardToPlay.value} de ${cardToPlay.suit} para testar o oponente.`
      };
    } else {
      // Mão fraca, joga defensivo
      const weakestCard = playerCards.reduce((weakest, current) => 
        calculateTrucoValue(current, vira) < calculateTrucoValue(weakest, vira) 
          ? current : weakest
      );
      
      return {
        action: 'play',
        cardToPlay: weakestCard,
        confidence: 50,
        reasoning: `Mão fraca (${Math.round(handAnalysis.strength)}%). Jogando defensivo com ${weakestCard.value} de ${weakestCard.suit}.`
      };
    }
  }
};