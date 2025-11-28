
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getActors, UI_TEXT } from './constants';
import { GameMode, GameState, Position, ActorData, Language } from './types';
import { Pucio } from './components/Pucio';
import { ActorEntity } from './components/ActorEntity';
import { Confetti } from './components/Confetti';
import { ControlPad } from './components/ControlPad';
import { StickerBook } from './components/StickerBook';
import { LanguageMenu } from './components/LanguageMenu';

const MOVEMENT_SPEED = 0.8;
const INTERACTION_RADIUS = 15;
const DEFAULT_COLLISION_RADIUS = 10;

// --- Scenery / Decorations ---
const DECORATIONS = [
  { id: 1, emoji: '☁️', x: 10, y: 10, size: 'text-8xl', anim: 'animate-float opacity-80' },
  { id: 2, emoji: '☁️', x: 80, y: 5, size: 'text-9xl', anim: 'animate-float opacity-90 delay-700' },
  { id: 3, emoji: '☁️', x: 45, y: 8, size: 'text-7xl', anim: 'animate-float opacity-70 delay-300' },
  { id: 4, emoji: '🌷', x: 5, y: 85, size: 'text-3xl', anim: 'opacity-60' },
  { id: 5, emoji: '🌾', x: 92, y: 60, size: 'text-5xl', anim: 'opacity-50' },
];

// --- Grammar Utilities (Visual Text Only) ---
const getArticle = (name: string, gender: 'M' | 'F' | undefined, lang: Language) => {
  if (lang === 'en') return `the ${name}`;
  if (lang === 'pl') return name; // Polish has no articles usually for this context

  // French Logic
  const firstLetter = name.charAt(0).toLowerCase();
  const isVowel = ['a', 'e', 'i', 'o', 'u', 'y', 'h'].includes(firstLetter);
  if (isVowel) return `l'${name}`;
  return gender === 'M' ? `le ${name}` : `la ${name}`;
};

const getIndefinite = (name: string, gender: 'M' | 'F' | undefined, lang: Language) => {
  if (lang === 'en') {
    const firstLetter = name.charAt(0).toLowerCase();
    const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
    return isVowel ? `an ${name}` : `a ${name}`;
  }
  if (lang === 'pl') return name;

  // French Logic
  return gender === 'M' ? `un ${name}` : `une ${name}`;
};

export default function App() {
  // -- Language State --
  const [language, setLanguage] = useState<Language | null>(null);

  // -- Derived State from Language --
  const actors = useMemo(() => language ? getActors(language) : [], [language]);
  const ui = useMemo(() => language ? UI_TEXT[language] : UI_TEXT['en'], [language]);

  // -- Game State --
  const [pucioPos, setPucioPos] = useState<Position>({ x: 50, y: 60 });
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const [gameState, setGameState] = useState<GameState>({
    mode: GameMode.FIND,
    targetId: null,
    score: 0,
    message: '',
    messageColor: 'neutral',
  });

  // Progression State
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(new Set());
  const [showStickerBook, setShowStickerBook] = useState(false);
  const [showCopyright, setShowCopyright] = useState(false);

  const [activeSoundActor, setActiveSoundActor] = useState<string | null>(null);
  const [nearbyActorId, setNearbyActorId] = useState<string | null>(null);
  const [celebratingActorId, setCelebratingActorId] = useState<string | null>(null);
  const [confettiPos, setConfettiPos] = useState<{ x: number, y: number } | null>(null);
  const [pucioHappy, setPucioHappy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // -- Web Audio API State --
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentSequenceIdRef = useRef<number>(0);

  // Hint System
  const [showHintArrow, setShowHintArrow] = useState<{ rotation: number, visible: boolean }>({ rotation: 0, visible: false });
  const lastInteractionTime = useRef<number>(Date.now());

  // Refs for movement loop
  const keysPressed = useRef<Set<string>>(new Set());
  const requestRef = useRef<number | null>(null);
  const moveVector = useRef<{ dx: number, dy: number }>({ dx: 0, dy: 0 });
  const prevLangRef = useRef<Language | null>(null);

  // -- Audio System Initialization --
  const initAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const stopAudio = useCallback(() => {
    // Cancel any pending sequence
    currentSequenceIdRef.current++;

    // Stop currently playing source
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      currentSourceRef.current = null;
    }
  }, []);

  const playSingleFile = useCallback(async (filename: string, sequenceId: number): Promise<void> => {
    if (!audioCtxRef.current) initAudioContext();
    const ctx = audioCtxRef.current!;

    // Relative path avoids issues with root/subpath deployments
    const path = `audio/${filename}`;

    try {
      // 1. Fetch the file
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // 2. Decode the audio
      let audioBuffer: AudioBuffer;
      try {
        // Try standard decoding first (works for WAV with headers, MP3, etc.)
        // We clone the buffer because decodeAudioData detaches it
        audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeError) {
        // Fallback: If decode fails, assume it's Raw PCM (Gemini 2.5 TTS default)
        // Format: 24kHz, 16-bit Mono, Little Endian
        // console.log(`Standard decode failed for ${filename}, trying Raw PCM 24kHz...`);

        const dataInt16 = new Int16Array(arrayBuffer);
        const float32 = new Float32Array(dataInt16.length);
        for (let i = 0; i < dataInt16.length; i++) {
          float32[i] = dataInt16[i] / 32768.0;
        }

        // Create buffer: 1 channel, proper length, 24000 sample rate
        audioBuffer = ctx.createBuffer(1, float32.length, 24000);
        audioBuffer.copyToChannel(float32, 0);
      }

      // Check if sequence was cancelled while loading
      if (currentSequenceIdRef.current !== sequenceId) return;

      // 3. Play the audio
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      currentSourceRef.current = source;
      source.start();

      return new Promise<void>((resolve) => {
        source.onended = () => {
          if (currentSourceRef.current === source) {
            currentSourceRef.current = null;
          }
          resolve();
        };
      });

    } catch (e) {
      console.warn(`Error playing ${filename}:`, e);
      // Return resolve to allow sequence to continue skipping this file
      return Promise.resolve();
    }
  }, [initAudioContext]);

  const playAudioSequence = useCallback(async (filenames: string[]) => {
    if (!soundEnabled) return;

    // Stop previous sounds and invalidate old sequences
    stopAudio();

    const mySequenceId = currentSequenceIdRef.current;

    // Initialize context (needs user interaction first usually, assuming click triggered this)
    initAudioContext();

    // Process queue
    for (const filename of filenames) {
      if (currentSequenceIdRef.current !== mySequenceId) break;
      await playSingleFile(filename, mySequenceId);
    }
  }, [soundEnabled, stopAudio, initAudioContext, playSingleFile]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  // -- Game Logic Helpers --
  const pickNewTarget = useCallback(() => {
    if (!language) return;

    const validTargets = actors.filter(a => !a.isObstacle);

    const available = validTargets.length > 1
      ? validTargets.filter(a => a.id !== gameState.targetId)
      : validTargets;
    const randomActor = available[Math.floor(Math.random() * available.length)];

    if (!randomActor) return;

    const nameWithArticle = getArticle(randomActor.name, randomActor.gender, language);

    setGameState(prev => ({
      ...prev,
      targetId: randomActor.id,
      message: `${ui.find} ${nameWithArticle}`,
      messageColor: 'neutral'
    }));

    lastInteractionTime.current = Date.now();

    // Audio: "Where is the [Actor]?"
    if (soundEnabled) {
      setTimeout(() => {
        playAudioSequence([`${language}_${randomActor.id}_question.wav`]);
      }, 500);
    }
  }, [gameState.targetId, soundEnabled, playAudioSequence, actors, language, ui]);

  // Initialize game when language is selected or changed
  useEffect(() => {
    if (!language) return;

    // Initial game start
    if (gameState.mode === GameMode.FIND && !gameState.targetId) {
      setGameState(prev => ({
        ...prev,
        message: ui.welcome,
        messageColor: 'neutral'
      }));

      // Audio: "Welcome"
      playAudioSequence([`${language}_ui_welcome.wav`]);

      setTimeout(() => pickNewTarget(), 2500);
      prevLangRef.current = language;
      return;
    }

    // Handle Language Switch mid-game
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;

      if (gameState.mode === GameMode.FREE) {
        setGameState(prev => ({ ...prev, message: ui.freeModeMsg }));
      } else if (gameState.mode === GameMode.FIND && gameState.targetId) {
        // Update current objective text
        const target = actors.find(a => a.id === gameState.targetId);
        if (target) {
          const name = getArticle(target.name, target.gender, language);
          setGameState(prev => ({
            ...prev,
            message: `${ui.find} ${name}`
          }));
        }
      }
    }

  }, [language, pickNewTarget, gameState.mode, gameState.targetId, ui, actors, playAudioSequence]);

  const toggleMode = () => {
    if (!language) return;
    setGameState(prev => {
      const newMode = prev.mode === GameMode.FIND ? GameMode.FREE : GameMode.FIND;
      if (newMode === GameMode.FREE) {
        playAudioSequence([`${language}_ui_mode_free.wav`]);
        return {
          ...prev,
          mode: newMode,
          targetId: null,
          message: ui.modeFree,
          messageColor: 'neutral'
        };
      } else {
        playAudioSequence([`${language}_ui_mode_play.wav`]);
        return {
          ...prev,
          mode: newMode,
          score: 0
        };
      }
    });

    if (gameState.mode === GameMode.FREE) { // Switching TO find mode
      setTimeout(pickNewTarget, 2000);
    }
  };

  const handleInteraction = useCallback((actor: ActorData) => {
    if (actor.isObstacle || !language) return;

    // Initialize/Resume audio context on user interaction
    initAudioContext();

    // Play sound visualization
    setActiveSoundActor(actor.id);
    setTimeout(() => setActiveSoundActor(null), 2000);
    lastInteractionTime.current = Date.now();

    const definiteName = getArticle(actor.name, actor.gender, language);
    const indefiniteName = getIndefinite(actor.name, actor.gender, language);

    if (!discoveredIds.has(actor.id)) {
      setDiscoveredIds(prev => new Set(prev).add(actor.id));
    }

    if (gameState.mode === GameMode.FIND && gameState.targetId) {
      if (actor.id === gameState.targetId) {
        // Correct!
        setPucioHappy(true);
        setCelebratingActorId(actor.id);

        setTimeout(() => {
          setPucioHappy(false);
          setCelebratingActorId(null);
        }, 2000);

        setGameState(prev => ({
          ...prev,
          score: prev.score + 1,
          message: `${ui.bravo} ${actor.sound}`,
          messageColor: 'success'
        }));

        playAudioSequence([`${language}_${actor.id}_success.wav`]);

        const x = (window.innerWidth * actor.defaultPos.x) / 100;
        const y = (window.innerHeight * actor.defaultPos.y) / 100;
        setConfettiPos({ x, y });
        setTimeout(() => setConfettiPos(null), 2000);

        setTimeout(pickNewTarget, 3000);
      } else {
        // Wrong
        const target = actors.find(a => a.id === gameState.targetId);
        const targetName = target ? getArticle(target.name, target.gender, language) : '...';

        setGameState(prev => ({
          ...prev,
          message: `${ui.wrong} ${indefiniteName}...`,
          messageColor: 'error'
        }));

        if (target) {
          playAudioSequence([
            `${language}_${actor.id}_wrong_id.wav`,
            `${language}_${target.id}_target_hint.wav`
          ]);
        }

        setTimeout(() => {
          if (target) {
            setGameState(prev => ({
              ...prev,
              message: `${ui.find} ${targetName}`,
              messageColor: 'neutral'
            }));
          }
        }, 3500);
      }
    } else {
      // Free mode interaction
      setGameState(prev => ({
        ...prev,
        message: `${definiteName} : ${actor.sound}`,
        messageColor: 'neutral'
      }));
      playAudioSequence([`${language}_${actor.id}_free.wav`]);
    }
  }, [gameState.mode, gameState.targetId, pickNewTarget, playAudioSequence, discoveredIds, language, actors, ui, initAudioContext]);

  // -- Movement Logic --
  const checkCollision = useCallback((x: number, y: number) => {
    if (x < 2 || x > 98 || y < 5 || y > 95) return true;

    for (const actor of actors) {
      const distX = x - actor.defaultPos.x;
      const distY = y - actor.defaultPos.y;
      const dist = Math.sqrt(distX * distX + distY * distY);

      const radius = actor.collisionRadius || DEFAULT_COLLISION_RADIUS;
      if (actor.isObstacle && dist < radius) {
        return true;
      }
    }
    return false;
  }, [actors]);

  const updatePosition = useCallback(() => {
    if (!language) return;

    let dx = moveVector.current.dx;
    let dy = moveVector.current.dy;

    const isFr = language === 'fr';
    const upKey = isFr ? 'z' : 'w';
    const leftKey = isFr ? 'q' : 'a';
    const downKey = 's';
    const rightKey = 'd';

    const hasKey = (k: string) => keysPressed.current.has(k) || keysPressed.current.has(k.toUpperCase());

    if (hasKey('ArrowUp') || hasKey(upKey)) dy = -1;
    if (hasKey('ArrowDown') || hasKey(downKey)) dy = 1;
    if (hasKey('ArrowLeft') || hasKey(leftKey)) dx = -1;
    if (hasKey('ArrowRight') || hasKey(rightKey) || (!isFr && hasKey('h'))) dx = 1;

    if (dx !== 0 || dy !== 0) {
      setIsMoving(true);
      if (dx !== 0) setDirection(dx > 0 ? 'right' : 'left');

      setPucioPos(prev => {
        const speed = (dx !== 0 && dy !== 0) ? MOVEMENT_SPEED * 0.7 : MOVEMENT_SPEED;

        let nextX = prev.x + (dx * speed);
        let nextY = prev.y + (dy * speed);

        const collidesX = checkCollision(nextX, prev.y);
        const collidesY = checkCollision(collidesX ? prev.x : nextX, nextY);

        return {
          x: collidesX ? prev.x : nextX,
          y: collidesY ? prev.y : nextY
        };
      });
    } else {
      setIsMoving(false);
    }

    // Hint logic
    if (gameState.mode === GameMode.FIND && gameState.targetId) {
      const timeSince = Date.now() - lastInteractionTime.current;
      if (timeSince > 8000) {
        const target = actors.find(a => a.id === gameState.targetId);
        if (target) {
          const dx = target.defaultPos.x - pucioPos.x;
          const dy = target.defaultPos.y - pucioPos.y;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          setShowHintArrow({ rotation: angle, visible: true });
        }
      } else {
        setShowHintArrow(prev => ({ ...prev, visible: false }));
      }
    } else {
      setShowHintArrow(prev => ({ ...prev, visible: false }));
    }

    requestRef.current = requestAnimationFrame(updatePosition);
  }, [gameState.mode, gameState.targetId, pucioPos, checkCollision, actors, language]);

  useEffect(() => {
    if (!language) return;

    let closestId: string | null = null;
    let minDist = INTERACTION_RADIUS;

    actors.forEach(actor => {
      if (actor.isObstacle) return;

      const dist = Math.sqrt(
        Math.pow(pucioPos.x - actor.defaultPos.x, 2) +
        Math.pow(pucioPos.y - actor.defaultPos.y, 2)
      );

      if (dist < minDist) {
        minDist = dist;
        closestId = actor.id;
      }
    });
    setNearbyActorId(closestId);
  }, [pucioPos, actors, language]);

  useEffect(() => {
    if (language) {
      requestRef.current = requestAnimationFrame(updatePosition);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updatePosition, language]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!language) return;

      // Ensure AudioContext is ready on any interaction
      initAudioContext();

      keysPressed.current.add(e.key);
      lastInteractionTime.current = Date.now();

      if (e.code === 'Space') {
        e.preventDefault();
        if (nearbyActorId) {
          const actor = actors.find(a => a.id === nearbyActorId);
          if (actor) handleInteraction(actor);
        } else {
          setPucioHappy(true);
          setTimeout(() => setPucioHappy(false), 500);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [language, nearbyActorId, handleInteraction, actors, initAudioContext]);

  const handleTouchMove = (dx: number, dy: number) => {
    moveVector.current = { dx, dy };
    lastInteractionTime.current = Date.now();
    initAudioContext();
  };
  const handleTouchStop = () => {
    moveVector.current = { dx: 0, dy: 0 };
  };

  const handleActorClick = (actor: ActorData) => {
    if (!language) return;
    initAudioContext();
    lastInteractionTime.current = Date.now();
    if (actor.isObstacle) return;

    if (nearbyActorId === actor.id) {
      handleInteraction(actor);
    } else {
      // Audio: "Come Closer!"
      playAudioSequence([`${language}_ui_come_closer.wav`]);
    }
  };

  // Render Language Menu if no language selected
  if (!language) {
    return <LanguageMenu onSelect={(l) => {
      setLanguage(l);
      // Try to init audio context on language selection click
      initAudioContext();
    }} />;
  }

  const targetActor = actors.find(a => a.id === gameState.targetId);

  return (
    <div className="h-screen w-screen flex flex-col items-center relative overflow-hidden font-hand text-dark-text select-none">

      {/* --- Background Layer with Organic Shapes --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-sky-blue/20 to-sage-light">

        {/* Sky Elements */}
        {DECORATIONS.map(dec => (
          <div
            key={dec.id}
            className={`absolute ${dec.size} ${dec.anim || ''}`}
            style={{ left: `${dec.x}%`, top: `${dec.y}%` }}
          >
            {dec.emoji}
          </div>
        ))}

        {/* Distant Hill - Right */}
        <div className="absolute top-[38%] right-[-20%] w-[80%] h-[60%] bg-[#D4E09B] rounded-[40%_60%_20%_80%/50%_50%_20%_20%] z-0 transform -rotate-6" />

        {/* Distant Hill - Left */}
        <div className="absolute top-[35%] left-[-10%] w-[70%] h-[60%] bg-[#C8D1A0] rounded-[60%_40%_70%_30%/50%_60%_20%_20%] z-0" />

        {/* Road Path - Straight continuous road with parallel lines */}
        <div className="absolute top-[28%] -left-[5%] w-[110%] h-[20%] bg-road-gray z-0 transform -rotate-1 border-y-[8px] border-road-line shadow-md flex items-center justify-center">
          <div className="w-full border-t-[6px] border-dashed border-road-line/80" />
        </div>

        {/* Foreground Hills */}
        <div className="absolute bottom-[-10%] left-[-20%] w-[90%] h-[50%] bg-[#C8D1A0] rounded-[50%] z-0 opacity-90" />

        {/* Pond - Organic Blob Shape */}
        <div
          className="absolute bottom-[5%] right-[5%] w-[35%] h-[28%] bg-water-blue z-0 opacity-90 border-4 border-[#5BA9A7] shadow-inner"
          style={{ borderRadius: '56% 44% 68% 32% / 55% 35% 65% 45%' }}
        />

      </div>

      {/* --- Floating HUD UI --- */}
      <div className="absolute top-4 left-0 w-full p-4 z-[200] flex flex-col md:flex-row justify-between items-start md:items-center pointer-events-none gap-3">

        {/* Top Left: Title & Controls */}
        <div className="flex gap-3 items-center pointer-events-auto flex-wrap">
          {/* Title Pill (Clickable for Copyright) */}
          <button
            onClick={() => setShowCopyright(true)}
            className="bg-white/60 backdrop-blur-md border-2 border-white/50 px-5 py-2 rounded-full shadow-lg flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-2xl font-heading text-accent-red drop-shadow-sm">PUCIO</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              initAudioContext();
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg backdrop-blur-md transition-all active:scale-95 ${soundEnabled ? 'bg-sage-green/80 text-white border-sage-green' : 'bg-white/50 text-gray-400 border-white'}`}
            aria-label={soundEnabled ? ui.soundOn : ui.soundOff}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Book Toggle */}
          <button
            onClick={() => setShowStickerBook(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/60 bg-skin/90 backdrop-blur-md text-2xl shadow-lg hover:scale-110 active:scale-95 transition-transform"
            title={ui.stickerTitle}
          >
            📖
          </button>

          {/* Language Settings (Resets to Menu) */}
          <button
            onClick={() => {
              setLanguage(null);
              setShowStickerBook(false);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/60 bg-sky-blue/30 backdrop-blur-md text-2xl shadow-lg hover:scale-110 active:scale-95 transition-transform"
            title="Language / Langue / Język"
          >
            🌍
          </button>
        </div>

        {/* Top Right: Game Status Pill */}
        <div className="bg-white/60 backdrop-blur-md border-2 border-white/50 pl-6 pr-2 py-2 rounded-full shadow-lg flex items-center gap-4 pointer-events-auto transition-all hover:scale-105 max-w-[90vw] md:ml-auto">
          <div className="flex flex-col">
            <div className={`text-lg md:text-xl font-bold leading-none ${gameState.messageColor === 'success' ? 'text-green-600' :
              gameState.messageColor === 'error' ? 'text-accent-red' : 'text-dark-text'
              }`}>
              {gameState.mode === GameMode.FIND && targetActor && gameState.messageColor === 'neutral' ? (
                <span className="flex items-center gap-2">
                  {ui.findQuestion}
                  <span className="font-heading text-accent-red underline decoration-wavy decoration-2 underline-offset-4">{targetActor.emoji}</span>
                  ?
                </span>
              ) : (
                gameState.message
              )}
            </div>
          </div>

          {/* Mode Switch Button */}
          <button
            onClick={toggleMode}
            className={`ml-4 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-colors ${gameState.mode === GameMode.FIND ? 'bg-sky-blue text-white' : 'bg-sage-green text-white'
              }`}
          >
            {gameState.mode === GameMode.FIND ? ui.modeFree : ui.modePlay}
          </button>

          {/* Score */}
          {gameState.mode === GameMode.FIND && (
            <div className="bg-white px-3 py-1 rounded-full text-lg font-bold text-dark-text shadow-sm border border-gray-100">
              ⭐ {gameState.score}
            </div>
          )}
        </div>
      </div>

      {/* --- Hint Arrow --- */}
      {showHintArrow.visible && (
        <div
          className="absolute w-16 h-16 pointer-events-none z-[150] opacity-80 animate-pulse"
          style={{
            left: `${pucioPos.x}%`,
            top: `${pucioPos.y - 12}%`,
            transform: `translate(-50%, -50%) rotate(${showHintArrow.rotation}deg) translateX(60px)`
          }}
        >
          <div className="text-6xl filter drop-shadow-md">➡️</div>
        </div>
      )}

      {/* --- Game Area Actors --- */}
      {actors.map((actor) => (
        <ActorEntity
          key={actor.id}
          data={actor}
          isActive={activeSoundActor === actor.id}
          isNear={nearbyActorId === actor.id}
          isCelebrating={celebratingActorId === actor.id}
          onClick={() => handleActorClick(actor)}
        />
      ))}

      {/* --- Pucio Character --- */}
      <Pucio
        position={pucioPos}
        isMoving={isMoving}
        direction={direction}
        isJumping={pucioHappy}
      />

      {/* --- Confetti --- */}
      {confettiPos && <Confetti x={confettiPos.x} y={confettiPos.y} />}

      {/* --- Mobile Controls --- */}
      <ControlPad onMove={handleTouchMove} onStop={handleTouchStop} />

      {/* --- Copyright Footer Button --- */}
      <button
        onClick={() => setShowCopyright(true)}
        className="absolute bottom-4 right-4 z-[200] opacity-50 hover:opacity-100 text-dark-text font-bold p-2 text-7xl transition-opacity"
        aria-label="Copyright Info"
      >
        ©
      </button>

      {/* --- Modals --- */}
      <StickerBook
        isOpen={showStickerBook}
        onClose={() => setShowStickerBook(false)}
        actors={actors}
        discoveredIds={discoveredIds}
        language={language}
      />

      {/* Copyright Modal */}
      {showCopyright && (
        <div className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md text-center border-4 border-sage-green">
            <h3 className="text-xl font-heading mb-4 text-accent-red">Information</h3>
            <p className="mb-6 font-hand text-lg leading-relaxed">
              {ui.credits}
              <br />
              <a
                href="https://nk.com.pl/oferta-specjalna/pucio.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 underline hover:text-sky-800 block mt-2"
              >
                https://nk.com.pl/oferta-specjalna/pucio.html
              </a>
              <br />
              <span className="block mb-2">
                {ui.createdBy} <a href="https://github.com/lorenzoalali" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline hover:text-sky-800">https://github.com/lorenzoalali</a>
              </span>
              {ui.copyrightNotice}
            </p>
            <button
              onClick={() => setShowCopyright(false)}
              className="bg-sage-green text-white px-6 py-2 rounded-full font-bold hover:bg-sage-green/80 transition-colors shadow-md"
            >
              {ui.close}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}