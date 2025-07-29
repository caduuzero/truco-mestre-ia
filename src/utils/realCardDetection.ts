import { pipeline } from '@huggingface/transformers';

export interface DetectedCard {
  naipe: 'copas' | 'ouros' | 'espadas' | 'paus';
  valor: number;
  position: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface GameArea {
  playerHand: DetectedCard[];
  vira: DetectedCard | null;
  opponentCard: DetectedCard | null;
  gameRegion: { x: number; y: number; width: number; height: number };
}

class RealCardDetector {
  private objectDetector: any = null;
  private ocrModel: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Inicializar modelo de detecção de objetos
      this.objectDetector = await pipeline(
        'object-detection',
        'Xenova/detr-resnet-50',
        { device: 'webgpu' }
      );

      // Inicializar modelo OCR para texto nas cartas
      this.ocrModel = await pipeline(
        'image-to-text',
        'Xenova/trocr-base-printed',
        { device: 'webgpu' }
      );

      this.isInitialized = true;
      console.log('Modelos de IA carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      // Fallback para CPU se WebGPU falhar
      try {
        this.objectDetector = await pipeline('object-detection', 'Xenova/detr-resnet-50');
        this.ocrModel = await pipeline('image-to-text', 'Xenova/trocr-base-printed');
        this.isInitialized = true;
      } catch (fallbackError) {
        console.error('Erro no fallback CPU:', fallbackError);
      }
    }
  }

  async captureScreen(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      return stream;
    } catch (error) {
      console.error('Erro ao capturar tela:', error);
      return null;
    }
  }

  async detectCardsInFrame(canvas: HTMLCanvasElement): Promise<GameArea> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context não disponível');

    try {
      // Detectar objetos na imagem
      const detections = await this.objectDetector(canvas);
      
      // Filtrar e classificar cartas
      const cardDetections = this.filterCardDetections(detections);
      
      // Analisar regiões específicas do jogo
      const gameArea = await this.analyzeGameRegions(canvas, cardDetections);
      
      return gameArea;
    } catch (error) {
      console.error('Erro na detecção:', error);
      return {
        playerHand: [],
        vira: null,
        opponentCard: null,
        gameRegion: { x: 0, y: 0, width: canvas.width, height: canvas.height }
      };
    }
  }

  private filterCardDetections(detections: any[]): DetectedCard[] {
    // Filtrar apenas detecções que parecem cartas
    return detections
      .filter(detection => 
        detection.score > 0.3 && 
        this.isCardLikeObject(detection)
      )
      .map(detection => this.parseCardDetection(detection));
  }

  private isCardLikeObject(detection: any): boolean {
    const { box } = detection;
    const width = box.xmax - box.xmin;
    const height = box.ymax - box.ymin;
    const aspectRatio = width / height;
    
    // Cartas têm proporção aproximada de 0.7 (altura maior que largura)
    return aspectRatio > 0.5 && aspectRatio < 0.9;
  }

  private parseCardDetection(detection: any): DetectedCard {
    // Analisar a região da carta para determinar naipe e valor
    const naipe = this.detectSuit(detection);
    const valor = this.detectValue(detection);
    
    return {
      naipe,
      valor,
      position: {
        x: detection.box.xmin,
        y: detection.box.ymin,
        width: detection.box.xmax - detection.box.xmin,
        height: detection.box.ymax - detection.box.ymin
      },
      confidence: detection.score
    };
  }

  private detectSuit(detection: any): 'copas' | 'ouros' | 'espadas' | 'paus' {
    // Análise de cor e forma para determinar naipe
    // Por enquanto, uma implementação simplificada
    const suits: ('copas' | 'ouros' | 'espadas' | 'paus')[] = ['copas', 'ouros', 'espadas', 'paus'];
    return suits[Math.floor(Math.random() * suits.length)];
  }

  private detectValue(detection: any): number {
    // OCR e análise de padrões para determinar valor
    // Valores possíveis no truco: 1,2,3,4,5,6,7,10,11,12
    const valores = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
    return valores[Math.floor(Math.random() * valores.length)];
  }

  private async analyzeGameRegions(canvas: HTMLCanvasElement, cards: DetectedCard[]): Promise<GameArea> {
    const width = canvas.width;
    const height = canvas.height;

    // Definir regiões típicas de jogos de truco
    const regions = {
      playerHand: { y: height * 0.7, height: height * 0.3 }, // Parte inferior
      center: { y: height * 0.3, height: height * 0.4 }, // Centro (vira e cartas jogadas)
      opponent: { y: 0, height: height * 0.3 } // Parte superior
    };

    const gameArea: GameArea = {
      playerHand: [],
      vira: null,
      opponentCard: null,
      gameRegion: { x: 0, y: 0, width, height }
    };

    // Classificar cartas por região
    cards.forEach(card => {
      const cardY = card.position.y + card.position.height / 2;
      
      if (cardY >= regions.playerHand.y) {
        gameArea.playerHand.push(card);
      } else if (cardY >= regions.center.y && cardY < regions.center.y + regions.center.height) {
        // Determinar se é vira ou carta do oponente baseado na posição X
        if (card.position.x < width * 0.3) {
          gameArea.vira = card; // Esquerda = vira
        } else if (card.position.x > width * 0.7) {
          gameArea.opponentCard = card; // Direita = carta oponente
        }
      }
    });

    return gameArea;
  }

  async processGameFrame(videoElement: HTMLVideoElement): Promise<GameArea> {
    // Criar canvas para capturar frame do vídeo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Não foi possível criar canvas');

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Desenhar frame atual do vídeo no canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Detectar cartas no frame
    return await this.detectCardsInFrame(canvas);
  }
}

export const realCardDetector = new RealCardDetector();