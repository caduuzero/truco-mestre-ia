import { TrucoCardData } from "@/components/TrucoCard";
import { calculateTrucoValue, TrucoDecision, analyzeHand } from "./trucoLogic";

// ============= TIPOS E INTERFACES =============

export interface OpponentProfile {
  id: string;
  name: string;
  aggressiveness: number; // 0-100
  bluffFrequency: number; // 0-100
  conservativeness: number; // 0-100
  patterns: GamePattern[];
  winRate: number;
  totalGames: number;
}

export interface GamePattern {
  situation: string;
  action: string;
  frequency: number;
  success_rate: number;
}

export interface ProbabilityMatrix {
  winProbability: number;
  trucoProbability: number;
  bluffProbability: number;
  cardDistribution: Record<string, number>;
}

export interface AdvancedGameState {
  playerCards: TrucoCardData[];
  vira: TrucoCardData;
  currentRound: number;
  playerScore: number;
  opponentScore: number;
  trucoCalls: number;
  gameHistory: GameHistory[];
  opponentProfile: OpponentProfile;
  tableCards: TrucoCardData[];
}

export interface GameHistory {
  round: number;
  playerCard: TrucoCardData;
  opponentCard: TrucoCardData;
  winner: 'player' | 'opponent';
  trucoCalled: boolean;
  timestamp: number;
}

// ============= ANÁLISE PROBABILÍSTICA =============

export class TrucoProbabilityEngine {
  
  static calculateWinProbability(
    playerCards: TrucoCardData[], 
    vira: TrucoCardData,
    opponentProfile: OpponentProfile,
    gameState: AdvancedGameState
  ): ProbabilityMatrix {
    
    const handStrength = analyzeHand(playerCards, vira);
    const remainingCards = this.getRemainingCards(playerCards, gameState.tableCards, vira);
    
    // Probabilidade base baseada na força da mão
    let baseProbability = handStrength.strength / 100;
    
    // Ajuste baseado no perfil do oponente
    const opponentAdjustment = this.calculateOpponentAdjustment(opponentProfile, gameState);
    baseProbability *= opponentAdjustment;
    
    // Análise de cartas restantes
    const cardDistribution = this.analyzeCardDistribution(remainingCards, vira);
    
    // Probabilidade de o oponente ter cartas fortes
    const opponentStrongCardProbability = this.calculateOpponentCardProbability(
      remainingCards, vira, opponentProfile
    );
    
    baseProbability *= (1 - opponentStrongCardProbability * 0.4);
    
    return {
      winProbability: Math.max(0.05, Math.min(0.95, baseProbability)),
      trucoProbability: this.calculateTrucoProbability(handStrength, opponentProfile, gameState),
      bluffProbability: this.calculateBluffProbability(opponentProfile, gameState),
      cardDistribution
    };
  }
  
  private static calculateOpponentAdjustment(
    profile: OpponentProfile, 
    gameState: AdvancedGameState
  ): number {
    let adjustment = 1.0;
    
    // Jogador agressivo tende a trucar mais, mas pode blefar
    if (profile.aggressiveness > 70) {
      adjustment *= 0.9; // Seja mais cauteloso
    }
    
    // Jogador conservador é mais previsível
    if (profile.conservativeness > 70) {
      adjustment *= 1.1; // Pode aproveitar
    }
    
    // Consideração do histórico de vitórias
    if (profile.winRate > 0.7) {
      adjustment *= 0.95; // Oponente experiente
    }
    
    return adjustment;
  }
  
  private static getRemainingCards(
    playerCards: TrucoCardData[], 
    tableCards: TrucoCardData[], 
    vira: TrucoCardData
  ): TrucoCardData[] {
    const allCards = this.generateFullDeck();
    const usedCards = [...playerCards, ...tableCards, vira];
    
    return allCards.filter(card => 
      !usedCards.some(used => 
        used.value === card.value && used.suit === card.suit
      )
    );
  }
  
  private static generateFullDeck(): TrucoCardData[] {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const values = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'] as const;
    
    return suits.flatMap(suit =>
      values.map(value => ({
        suit,
        value,
        trucoValue: 0 // Will be calculated when needed
      } as TrucoCardData))
    );
  }
  
  private static analyzeCardDistribution(
    remainingCards: TrucoCardData[], 
    vira: TrucoCardData
  ): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    remainingCards.forEach(card => {
      const value = calculateTrucoValue(card, vira);
      const category = value >= 11 ? 'manilha' : 
                      value >= 8 ? 'alta' : 
                      value >= 5 ? 'media' : 'baixa';
      
      distribution[category] = (distribution[category] || 0) + 1;
    });
    
    return distribution;
  }
  
  private static calculateOpponentCardProbability(
    remainingCards: TrucoCardData[], 
    vira: TrucoCardData,
    profile: OpponentProfile
  ): number {
    const strongCards = remainingCards.filter(card => 
      calculateTrucoValue(card, vira) >= 8
    );
    
    const baseProbability = strongCards.length / remainingCards.length;
    
    // Ajuste baseado no perfil
    return baseProbability * (1 + profile.aggressiveness / 200);
  }
  
  private static calculateTrucoProbability(
    handStrength: any,
    profile: OpponentProfile,
    gameState: AdvancedGameState
  ): number {
    let trucoProbability = handStrength.strength / 100;
    
    // Ajuste baseado na pontuação
    const scoreDiff = gameState.playerScore - gameState.opponentScore;
    if (scoreDiff < 0) trucoProbability *= 1.2; // Mais agressivo quando perdendo
    
    // Ajuste baseado no perfil do oponente
    if (profile.aggressiveness < 30) trucoProbability *= 1.3; // Aproveita oponente passivo
    
    return Math.min(0.9, trucoProbability);
  }
  
  private static calculateBluffProbability(
    profile: OpponentProfile,
    gameState: AdvancedGameState
  ): number {
    // Probabilidade de o oponente estar blefando
    let bluffProb = profile.bluffFrequency / 100;
    
    // Ajuste baseado na situação do jogo
    const scoreDiff = gameState.opponentScore - gameState.playerScore;
    if (scoreDiff < 0) bluffProb *= 1.4; // Mais propenso a blefar quando perdendo
    
    return Math.min(0.8, bluffProb);
  }
}

// ============= SISTEMA DE APRENDIZAGEM =============

export class TrucoLearningSystem {
  private static profiles: Map<string, OpponentProfile> = new Map();
  
  static updateOpponentProfile(
    opponentId: string,
    gameResult: GameHistory,
    decision: TrucoDecision
  ): OpponentProfile {
    let profile = this.profiles.get(opponentId) || this.createDefaultProfile(opponentId);
    
    // Atualiza estatísticas básicas
    profile.totalGames += 1;
    if (gameResult.winner === 'opponent') {
      profile.winRate = (profile.winRate * (profile.totalGames - 1) + 1) / profile.totalGames;
    } else {
      profile.winRate = (profile.winRate * (profile.totalGames - 1)) / profile.totalGames;
    }
    
    // Analisa agressividade baseada nas ações
    if (gameResult.trucoCalled) {
      profile.aggressiveness = Math.min(100, profile.aggressiveness + 2);
    }
    
    // Atualiza padrões de jogo
    this.updateGamePatterns(profile, gameResult, decision);
    
    this.profiles.set(opponentId, profile);
    return profile;
  }
  
  private static createDefaultProfile(opponentId: string): OpponentProfile {
    return {
      id: opponentId,
      name: `Oponente ${opponentId}`,
      aggressiveness: 50,
      bluffFrequency: 30,
      conservativeness: 50,
      patterns: [],
      winRate: 0.5,
      totalGames: 0
    };
  }
  
  private static updateGamePatterns(
    profile: OpponentProfile,
    gameResult: GameHistory,
    decision: TrucoDecision
  ): void {
    const situation = this.categorizeSituation(gameResult);
    const action = decision.action;
    
    const existingPattern = profile.patterns.find(p => 
      p.situation === situation && p.action === action
    );
    
    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.success_rate = 
        (existingPattern.success_rate + (gameResult.winner === 'opponent' ? 1 : 0)) / 2;
    } else {
      profile.patterns.push({
        situation,
        action,
        frequency: 1,
        success_rate: gameResult.winner === 'opponent' ? 1 : 0
      });
    }
  }
  
  private static categorizeSituation(gameResult: GameHistory): string {
    const playerCardValue = calculateTrucoValue(gameResult.playerCard);
    const opponentCardValue = calculateTrucoValue(gameResult.opponentCard);
    
    if (opponentCardValue > playerCardValue) return 'strong_position';
    if (opponentCardValue < playerCardValue) return 'weak_position';
    return 'equal_position';
  }
  
  static getOpponentProfile(opponentId: string): OpponentProfile {
    return this.profiles.get(opponentId) || this.createDefaultProfile(opponentId);
  }
}

// ============= ESTRATÉGIAS ADAPTATIVAS =============

export class AdaptiveStrategyEngine {
  
  static generateAdvancedDecision(
    gameState: AdvancedGameState,
    opponentCard?: TrucoCardData
  ): TrucoDecision {
    
    const probabilities = TrucoProbabilityEngine.calculateWinProbability(
      gameState.playerCards,
      gameState.vira,
      gameState.opponentProfile,
      gameState
    );
    
    // Estratégia baseada em múltiplos fatores
    const strategy = this.selectOptimalStrategy(gameState, probabilities);
    
    return this.executeStrategy(strategy, gameState, probabilities, opponentCard);
  }
  
  private static selectOptimalStrategy(
    gameState: AdvancedGameState,
    probabilities: ProbabilityMatrix
  ): 'aggressive' | 'defensive' | 'adaptive' | 'bluff' {
    
    const winProb = probabilities.winProbability;
    const scoreDiff = gameState.playerScore - gameState.opponentScore;
    const opponentAggression = gameState.opponentProfile.aggressiveness;
    
    // Estratégia agressiva: boa mão + oponente passivo
    if (winProb > 0.7 && opponentAggression < 40) {
      return 'aggressive';
    }
    
    // Estratégia defensiva: mão fraca + oponente agressivo
    if (winProb < 0.4 && opponentAggression > 70) {
      return 'defensive';
    }
    
    // Estratégia de blefe: perdendo por muito + oponente conservador
    if (scoreDiff < -6 && gameState.opponentProfile.conservativeness > 60) {
      return 'bluff';
    }
    
    // Estratégia adaptativa para outras situações
    return 'adaptive';
  }
  
  private static executeStrategy(
    strategy: string,
    gameState: AdvancedGameState,
    probabilities: ProbabilityMatrix,
    opponentCard?: TrucoCardData
  ): TrucoDecision {
    
    const handAnalysis = analyzeHand(gameState.playerCards, gameState.vira);
    
    switch (strategy) {
      case 'aggressive':
        return this.executeAggressiveStrategy(gameState, handAnalysis, probabilities);
      
      case 'defensive':
        return this.executeDefensiveStrategy(gameState, handAnalysis, opponentCard);
      
      case 'bluff':
        return this.executeBluffStrategy(gameState, handAnalysis);
      
      default:
        return this.executeAdaptiveStrategy(gameState, handAnalysis, probabilities, opponentCard);
    }
  }
  
  private static executeAggressiveStrategy(
    gameState: AdvancedGameState,
    handAnalysis: any,
    probabilities: ProbabilityMatrix
  ): TrucoDecision {
    
    if (probabilities.trucoProbability > 0.6 && gameState.trucoCalls < 2) {
      return {
        action: 'truco',
        confidence: 85,
        reasoning: `Estratégia agressiva ativada! Mão forte (${Math.round(handAnalysis.strength)}%) contra oponente passivo. Hora de pressionar!`
      };
    }
    
    // Joga carta forte para mostrar força
    const strongestCard = handAnalysis.strongestCard;
    return {
      action: 'play',
      cardToPlay: strongestCard,
      confidence: 80,
      reasoning: `Jogando carta forte (${strongestCard.value} de ${strongestCard.suit}) para demonstrar superioridade.`
    };
  }
  
  private static executeDefensiveStrategy(
    gameState: AdvancedGameState,
    handAnalysis: any,
    opponentCard?: TrucoCardData
  ): TrucoDecision {
    
    // Sempre joga a carta mais fraca possível
    const weakestCard = gameState.playerCards.reduce((weakest, current) => 
      calculateTrucoValue(current, gameState.vira) < calculateTrucoValue(weakest, gameState.vira) 
        ? current : weakest
    );
    
    return {
      action: 'play',
      cardToPlay: weakestCard,
      confidence: 60,
      reasoning: `Estratégia defensiva: mão fraca contra oponente agressivo. Economizando cartas com ${weakestCard.value} de ${weakestCard.suit}.`
    };
  }
  
  private static executeBluffStrategy(
    gameState: AdvancedGameState,
    handAnalysis: any
  ): TrucoDecision {
    
    // Blefe calculado quando perdendo
    if (Math.random() < 0.3) { // 30% chance de blefe
      return {
        action: 'truco',
        confidence: 70,
        reasoning: `Blefe estratégico! Perdendo no placar, tentando intimidar oponente conservador com truco arriscado.`
      };
    }
    
    // Caso contrário, joga normal
    const mediumCard = gameState.playerCards[Math.floor(gameState.playerCards.length / 2)];
    return {
      action: 'play',
      cardToPlay: mediumCard,
      confidence: 55,
      reasoning: `Preparando terreno para possível blefe futuro. Jogando ${mediumCard.value} de ${mediumCard.suit}.`
    };
  }
  
  private static executeAdaptiveStrategy(
    gameState: AdvancedGameState,
    handAnalysis: any,
    probabilities: ProbabilityMatrix,
    opponentCard?: TrucoCardData
  ): TrucoDecision {
    
    // Estratégia que se adapta às múltiplas variáveis do jogo
    const winProb = probabilities.winProbability;
    const trucoPro = probabilities.trucoProbability;
    
    if (winProb > 0.65 && trucoPro > 0.5) {
      return {
        action: 'truco',
        confidence: Math.round(winProb * 100),
        reasoning: `Análise adaptativa indica ${Math.round(winProb * 100)}% de chance de vitória. Truco calculado baseado em múltiplos fatores.`
      };
    }
    
    // Seleciona carta baseada na situação
    const optimalCard = this.selectOptimalCard(gameState, opponentCard);
    
    return {
      action: 'play',
      cardToPlay: optimalCard,
      confidence: Math.round(winProb * 100),
      reasoning: `Estratégia adaptativa: considerando perfil do oponente, probabilidades e contexto do jogo para jogar ${optimalCard.value} de ${optimalCard.suit}.`
    };
  }
  
  private static selectOptimalCard(
    gameState: AdvancedGameState,
    opponentCard?: TrucoCardData
  ): TrucoCardData {
    
    if (opponentCard) {
      // Responde ao oponente com a carta ótima
      const opponentValue = calculateTrucoValue(opponentCard, gameState.vira);
      const winningCards = gameState.playerCards.filter(card => 
        calculateTrucoValue(card, gameState.vira) > opponentValue
      );
      
      if (winningCards.length > 0) {
        return winningCards.reduce((optimal, current) => 
          calculateTrucoValue(current, gameState.vira) < calculateTrucoValue(optimal, gameState.vira) 
            ? current : optimal
        );
      }
    }
    
    // Estratégia de abertura baseada no perfil do oponente
    const sortedCards = gameState.playerCards
      .map(card => ({ card, value: calculateTrucoValue(card, gameState.vira) }))
      .sort((a, b) => b.value - a.value);
    
    // Contra oponente agressivo: carta média
    if (gameState.opponentProfile.aggressiveness > 60) {
      return sortedCards[Math.floor(sortedCards.length / 2)].card;
    }
    
    // Contra oponente conservador: carta forte
    if (gameState.opponentProfile.conservativeness > 60) {
      return sortedCards[Math.floor(sortedCards.length / 3)].card;
    }
    
    // Padrão: carta equilibrada
    return sortedCards[Math.floor(sortedCards.length / 2)].card;
  }
}

// ============= EXPORTAÇÕES PRINCIPAIS =============

export const createAdvancedGameState = (
  playerCards: TrucoCardData[],
  vira: TrucoCardData,
  opponentId: string = 'default'
): AdvancedGameState => ({
  playerCards,
  vira,
  currentRound: 1,
  playerScore: 0,
  opponentScore: 0,
  trucoCalls: 0,
  gameHistory: [],
  opponentProfile: TrucoLearningSystem.getOpponentProfile(opponentId),
  tableCards: []
});

export const getAdvancedDecision = (
  gameState: AdvancedGameState,
  opponentCard?: TrucoCardData
): TrucoDecision => {
  return AdaptiveStrategyEngine.generateAdvancedDecision(gameState, opponentCard);
};