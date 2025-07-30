import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrucoCard, TrucoCardData } from '@/components/TrucoCard';
import { calculateTrucoValue } from '@/utils/trucoLogic';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface TrucoManualModeProps {
  onBack: () => void;
}

const TRUCO_DECK: TrucoCardData[] = [
  // Ouros
  { suit: 'diamonds', value: 'A', trucoValue: 0 },
  { suit: 'diamonds', value: '2', trucoValue: 0 },
  { suit: 'diamonds', value: '3', trucoValue: 0 },
  { suit: 'diamonds', value: '4', trucoValue: 0 },
  { suit: 'diamonds', value: '5', trucoValue: 0 },
  { suit: 'diamonds', value: '6', trucoValue: 0 },
  { suit: 'diamonds', value: '7', trucoValue: 0 },
  { suit: 'diamonds', value: 'Q', trucoValue: 0 },
  { suit: 'diamonds', value: 'J', trucoValue: 0 },
  { suit: 'diamonds', value: 'K', trucoValue: 0 },
  // Espadas
  { suit: 'spades', value: 'A', trucoValue: 0 },
  { suit: 'spades', value: '2', trucoValue: 0 },
  { suit: 'spades', value: '3', trucoValue: 0 },
  { suit: 'spades', value: '4', trucoValue: 0 },
  { suit: 'spades', value: '5', trucoValue: 0 },
  { suit: 'spades', value: '6', trucoValue: 0 },
  { suit: 'spades', value: '7', trucoValue: 0 },
  { suit: 'spades', value: 'Q', trucoValue: 0 },
  { suit: 'spades', value: 'J', trucoValue: 0 },
  { suit: 'spades', value: 'K', trucoValue: 0 },
  // Copas
  { suit: 'hearts', value: 'A', trucoValue: 0 },
  { suit: 'hearts', value: '2', trucoValue: 0 },
  { suit: 'hearts', value: '3', trucoValue: 0 },
  { suit: 'hearts', value: '4', trucoValue: 0 },
  { suit: 'hearts', value: '5', trucoValue: 0 },
  { suit: 'hearts', value: '6', trucoValue: 0 },
  { suit: 'hearts', value: '7', trucoValue: 0 },
  { suit: 'hearts', value: 'Q', trucoValue: 0 },
  { suit: 'hearts', value: 'J', trucoValue: 0 },
  { suit: 'hearts', value: 'K', trucoValue: 0 },
  // Paus
  { suit: 'clubs', value: 'A', trucoValue: 0 },
  { suit: 'clubs', value: '2', trucoValue: 0 },
  { suit: 'clubs', value: '3', trucoValue: 0 },
  { suit: 'clubs', value: '4', trucoValue: 0 },
  { suit: 'clubs', value: '5', trucoValue: 0 },
  { suit: 'clubs', value: '6', trucoValue: 0 },
  { suit: 'clubs', value: '7', trucoValue: 0 },
  { suit: 'clubs', value: 'Q', trucoValue: 0 },
  { suit: 'clubs', value: 'J', trucoValue: 0 },
  { suit: 'clubs', value: 'K', trucoValue: 0 },
];

const getNextValue = (value: string): string => {
  const sequence = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
  const index = sequence.indexOf(value);
  return sequence[(index + 1) % sequence.length];
};

const getManilhas = (viraCard: TrucoCardData): TrucoCardData[] => {
  const manilhaValue = getNextValue(viraCard.value);
  return TRUCO_DECK.filter(card => card.value === manilhaValue)
    .sort((a, b) => {
      // Ordem: ouros, espadas, copas, paus (do menor para o maior)
      const order = ['diamonds', 'spades', 'hearts', 'clubs'];
      return order.indexOf(a.suit) - order.indexOf(b.suit);
    });
};

export const TrucoManualMode = ({ onBack }: TrucoManualModeProps) => {
  const [viraCard, setViraCard] = useState<TrucoCardData | null>(null);
  const [playerCards, setPlayerCards] = useState<TrucoCardData[]>([]);
  const [opponentCards, setOpponentCards] = useState<TrucoCardData[]>([]);
  const [manilhas, setManilhas] = useState<TrucoCardData[]>([]);

  const handleViraSelect = (card: TrucoCardData) => {
    setViraCard(card);
    const newManilhas = getManilhas(card);
    setManilhas(newManilhas);
  };

  const handlePlayerCardSelect = (card: TrucoCardData) => {
    if (playerCards.length < 3) {
      if (!playerCards.some(c => c.suit === card.suit && c.value === card.value)) {
        setPlayerCards([...playerCards, card]);
      }
    } else {
      // Se já tem 3 cartas, substitui a última
      const newCards = [...playerCards];
      newCards[2] = card;
      setPlayerCards(newCards);
    }
  };

  const handleOpponentCardSelect = (card: TrucoCardData) => {
    if (opponentCards.length < 3) {
      if (!opponentCards.some(c => c.suit === card.suit && c.value === card.value)) {
        setOpponentCards([...opponentCards, card]);
      }
    }
  };

  const removePlayerCard = (index: number) => {
    const newCards = [...playerCards];
    newCards.splice(index, 1);
    setPlayerCards(newCards);
  };

  const removeOpponentCard = (index: number) => {
    const newCards = [...opponentCards];
    newCards.splice(index, 1);
    setOpponentCards(newCards);
  };

  const isCardSelected = (card: TrucoCardData, type: 'vira' | 'player' | 'opponent') => {
    if (type === 'vira') {
      return viraCard?.suit === card.suit && viraCard?.value === card.value;
    }
    if (type === 'player') {
      return playerCards.some(c => c.suit === card.suit && c.value === card.value);
    }
    if (type === 'opponent') {
      return opponentCards.some(c => c.suit === card.suit && c.value === card.value);
    }
    return false;
  };

  const isCardDisabled = (card: TrucoCardData, type: 'vira' | 'player' | 'opponent') => {
    // Uma carta não pode estar em mais de uma seleção
    if (type === 'vira') {
      return playerCards.some(c => c.suit === card.suit && c.value === card.value) ||
             opponentCards.some(c => c.suit === card.suit && c.value === card.value);
    }
    if (type === 'player') {
      return (viraCard?.suit === card.suit && viraCard?.value === card.value) ||
             opponentCards.some(c => c.suit === card.suit && c.value === card.value);
    }
    if (type === 'opponent') {
      return (viraCard?.suit === card.suit && viraCard?.value === card.value) ||
             playerCards.some(c => c.suit === card.suit && c.value === card.value);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-baize to-baize-dark p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            🃏 Modo Manual - Simulador de Partida
          </h1>
          <div />
        </div>

        {/* Manilhas Display */}
        {viraCard && (
          <Card className="mb-6 bg-gradient-to-r from-gold/10 to-gold-dark/10 border-gold">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-gold">
                <Sparkles className="w-5 h-5" />
                Manilhas da Rodada
                <Sparkles className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-2">
                {manilhas.map((manilha, index) => (
                  <div key={`${manilha.suit}-${manilha.value}`} className="text-center">
                    <TrucoCard 
                      card={manilha} 
                      isHighlighted={true}
                      className="mb-2"
                    />
                    <Badge variant="outline" className="text-xs border-gold text-gold">
                      {index + 1}ª Manilha
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* VIRA Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">VIRA</CardTitle>
            <p className="text-center text-muted-foreground text-sm">
              Selecione a carta virada (seleção única)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {TRUCO_DECK.map((card) => (
                <TrucoCard
                  key={`vira-${card.suit}-${card.value}`}
                  card={card}
                  isHighlighted={isCardSelected(card, 'vira')}
                  className={`cursor-pointer ${
                    isCardDisabled(card, 'vira') ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isCardDisabled(card, 'vira') && handleViraSelect(card)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MINHAS CARTAS Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">MINHAS CARTAS</CardTitle>
            <p className="text-center text-muted-foreground text-sm">
              Selecione até 3 cartas da sua mão (seleção múltipla)
            </p>
            {playerCards.length > 0 && (
              <div className="flex justify-center gap-2 mt-4">
                {playerCards.map((card, index) => (
                  <div key={`selected-player-${index}`} className="text-center">
                    <TrucoCard 
                      card={card} 
                      isHighlighted={true}
                      className="cursor-pointer"
                      onClick={() => removePlayerCard(index)}
                    />
                    <Badge variant="outline" className="mt-1 text-xs">
                      Carta {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {TRUCO_DECK.map((card) => (
                <TrucoCard
                  key={`player-${card.suit}-${card.value}`}
                  card={card}
                  isHighlighted={isCardSelected(card, 'player')}
                  className={`cursor-pointer ${
                    isCardDisabled(card, 'player') ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isCardDisabled(card, 'player') && handlePlayerCardSelect(card)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CARTAS DO ADVERSÁRIO Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">CARTAS DO ADVERSÁRIO</CardTitle>
            <p className="text-center text-muted-foreground text-sm">
              Selecione até 3 cartas jogadas pelo adversário (uma por vez)
            </p>
            {opponentCards.length > 0 && (
              <div className="flex justify-center gap-2 mt-4">
                {opponentCards.map((card, index) => (
                  <div key={`selected-opponent-${index}`} className="text-center">
                    <TrucoCard 
                      card={card} 
                      isHighlighted={true}
                      className="cursor-pointer"
                      onClick={() => removeOpponentCard(index)}
                    />
                    <Badge variant="outline" className="mt-1 text-xs">
                      Rodada {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {TRUCO_DECK.map((card) => (
                <TrucoCard
                  key={`opponent-${card.suit}-${card.value}`}
                  card={card}
                  isHighlighted={isCardSelected(card, 'opponent')}
                  className={`cursor-pointer ${
                    isCardDisabled(card, 'opponent') ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isCardDisabled(card, 'opponent') && handleOpponentCardSelect(card)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};