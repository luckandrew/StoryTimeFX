import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

const EmojiSoundListener = () => {
  const [isListening, setIsListening] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState(null);
  const [recentWords, setRecentWords] = useState([]);
  const [status, setStatus] = useState('Click microphone to start');
  const timeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const emojiData = {
    // Animals with sounds
    bull: { emoji: '🐂', sound: '/animalsounds/bull.mp3' },
    cat: { emoji: '🐈', sound: '/animalsounds/cat.mp3' },
    chicken: { emoji: '🐔', sound: '/animalsounds/chicken.mp3' },
    cow: { emoji: '🐄', sound: '/animalsounds/cow.mp3' },
    dog: { emoji: '🐕', sound: '/animalsounds/dog.mp3' },
    donkey: { emoji: '🫏', sound: '/animalsounds/donkey.mp3' },
    duck: { emoji: '🦆', sound: '/animalsounds/duck.mp3' },
    geese: { emoji: '🦢', sound: '/animalsounds/geese.mp3' },
    goat: { emoji: '🐐', sound: '/animalsounds/goat.mp3' },
    horse: { emoji: '🐎', sound: '/animalsounds/horse.mp3' },
    horse2: { emoji: '🐎', sound: '/animalsounds/horse2.mp3' },
    lamb: { emoji: '🐑', sound: '/animalsounds/lamb.mp3' },
    pig: { emoji: '🐷', sound: '/animalsounds/pig.mp3' },
    sheep: { emoji: '🐑', sound: '/animalsounds/sheep.mp3' },
    truthahn: { emoji: '🦃', sound: '/animalsounds/truthahn.mp3' },
    turkey: { emoji: '🦃', sound: '/animalsounds/turkey.mp3' },

    // Rest of emojis without sounds
    puppy: { emoji: '🐶' },
    kitty: { emoji: '🐱' },
    lion: { emoji: '🦁' },
    tiger: { emoji: '🐯' },
    leopard: { emoji: '🐆' },
    unicorn: { emoji: '🦄' },
    zebra: { emoji: '🦓' },
    deer: { emoji: '🦌' },
    buffalo: { emoji: '🦬' },
    boar: { emoji: '🐗' },
    ram: { emoji: '🐏' },
    camel: { emoji: '🐪' },
    llama: { emoji: '🦙' },
    giraffe: { emoji: '🦒' },
    elephant: { emoji: '🐘' },
    mammoth: { emoji: '🦣' },
    rhinoceros: { emoji: '🦏' },
    hippopotamus: { emoji: '🦛' },
    mouse: { emoji: '🐁' },
    rat: { emoji: '🐀' },
    hamster: { emoji: '🐹' },
    rabbit: { emoji: '🐰' },
    chipmunk: { emoji: '🐿️' },
    beaver: { emoji: '🦫' },
    hedgehog: { emoji: '🦔' },
    bat: { emoji: '🦇' },
    bear: { emoji: '🐻' },
    koala: { emoji: '🐨' },
    panda: { emoji: '🐼' },
    sloth: { emoji: '🦥' },
    otter: { emoji: '🦦' },
    skunk: { emoji: '🦨' },
    kangaroo: { emoji: '🦘' },
    badger: { emoji: '🦡' },
    fox: { emoji: '🦊' },
    raccoon: { emoji: '🦝' },
    monkey: { emoji: '🐒' },
    gorilla: { emoji: '🦍' },
    orangutan: { emoji: '🦧' },
    rooster: { emoji: '🐓' },
    dove: { emoji: '🕊️' },
    eagle: { emoji: '🦅' },
    swan: { emoji: '🦢' },
    owl: { emoji: '🦉' },
    flamingo: { emoji: '🦩' },
    peacock: { emoji: '🦚' },
    parrot: { emoji: '🦜' },
    penguin: { emoji: '🐧' },
    frog: { emoji: '🐸' },
    crocodile: { emoji: '🐊' },
    turtle: { emoji: '🐢' },
    lizard: { emoji: '🦎' },
    snake: { emoji: '🐍' },
    dragon: { emoji: '🐉' },
    whale: { emoji: '🐋' },
    dolphin: { emoji: '🐬' },
    seal: { emoji: '🦭' },
    fish: { emoji: '🐟' },
    blowfish: { emoji: '🐡' },
    shark: { emoji: '🦈' },
    octopus: { emoji: '🐙' },
    squid: { emoji: '🦑' },
    shrimp: { emoji: '🦐' },
    crab: { emoji: '🦀' },
    lobster: { emoji: '🦞' },
    oyster: { emoji: '🦪' },
    snail: { emoji: '🐌' },
    butterfly: { emoji: '🦋' },
    bug: { emoji: '🐛' },
    ant: { emoji: '🐜' },
    bee: { emoji: '🐝' },
    beetle: { emoji: '🪲' },
    ladybug: { emoji: '🐞' },
    cricket: { emoji: '🦗' },
    cockroach: { emoji: '🪳' },
    spider: { emoji: '🕷️' },
    scorpion: { emoji: '🦂' },
    mosquito: { emoji: '🦟' },
    fly: { emoji: '🪰' },
    worm: { emoji: '🪱' },
    microbe: { emoji: '🦠' },
  };

  const requestMicrophonePermission = async () => {
    try {
      setStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we just needed the permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setStatus('Microphone access denied');
      return false;
    }
  };

  const playSound = (soundPath) => {
    if (!soundPath) return;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(soundPath);
      audioRef.current = audio;
      audio.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    } catch (error) {
      console.error('Error in playSound:', error);
    }
  };

  const startRecognition = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      setStatus('Please use Chrome browser');
      setIsListening(false);
      return;
    }

    // First, request microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      setIsListening(false);
      setIsInitializing(false);
      return;
    }

    try {
      // Create new recognition instance
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      const recognition = new window.webkitSpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log('Recognition started');
        setIsInitializing(false);
        setStatus('Listening...');
      };

      recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setStatus('Microphone access denied');
        } else {
          setStatus('Error occurred, please try again');
        }
        setIsListening(false);
        setIsInitializing(false);
      };

      recognition.onend = () => {
        console.log('Recognition ended');
        if (isListening) {
          console.log('Attempting to restart...');
          setTimeout(() => {
            try {
              recognition.start();
            } catch (error) {
              console.error('Failed to restart recognition:', error);
              setIsListening(false);
              setStatus('Error, please try again');
            }
          }, 1000);
        } else {
          setStatus('Click microphone to start');
        }
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript.toLowerCase())
          .join('');

        const words = transcript.split(' ').slice(-3);
        setRecentWords(words);

        Object.entries(emojiData).forEach(([keyword, data]) => {
          if (transcript.includes(keyword)) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            setCurrentEmoji(data.emoji);
            if (data.sound) {
              playSound(data.sound);
            }
            timeoutRef.current = setTimeout(() => {
              setCurrentEmoji(null);
              timeoutRef.current = null;
            }, 3000);
          }
        });
      };

      await recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setStatus('Error starting microphone');
      setIsListening(false);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isListening) {
      setStatus('Starting microphone...');
      startRecognition();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setStatus('Click microphone to start');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!isListening) {
      setIsInitializing(true);
      setRecentWords([]);
    }
    setIsListening(!isListening);
  };

  return (
    <div className="App">
      <div className="text-center">
        <h1 className="title">Speech to Emoji</h1>
        <p className="subtitle">Click the microphone and say an animal name!</p>
        <p className="hint">Try: dog, cat, lion, bird, and more...</p>
      </div>

      <button
        onClick={toggleListening}
        className={`button button-mic ${isListening ? 'active' : ''}`}
        disabled={isInitializing}
      >
        {isInitializing ? (
          <Loader className="animate-spin" size={32} />
        ) : isListening ? (
          <MicOff size={32} />
        ) : (
          <Mic size={32} />
        )}
      </button>

      <div className="text-center">
        <div className="emoji-display">
          {currentEmoji || ' '}
        </div>

        <div className="speech-monitor">
          {recentWords.join(' ')}
        </div>

        <p className="status">
          {status}
        </p>
      </div>
    </div>
  );
};

export default EmojiSoundListener;