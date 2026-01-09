'use client';

import React, { useEffect, useState } from 'react';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

// Simple word list - in a real app, you'd have a larger list
const WORDS = [
    'REACT', 'WORLD', 'GAMES', 'CODE', 'BUILD', 'LEARN', 'THINK', 'SMART', 'QUICK', 'BRAVE',
    'CLOUD', 'DREAM', 'FLAME', 'GRAPE', 'HOUSE', 'IMAGE', 'JUMBO', 'KNIFE', 'LIGHT', 'MOUSE',
    'NIGHT', 'OCEAN', 'PLANE', 'QUEEN', 'RIVER', 'STONE', 'TABLE', 'UNCLE', 'VOICE', 'WINDY'
];

type LetterStatus = 'correct' | 'present' | 'absent' | '';

interface Letter {
    char: string;
    status: LetterStatus;
}

interface Guess {
    letters: Letter[];
}

const WordleGame: React.FC = () => {
    const [targetWord, setTargetWord] = useState('');
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [message, setMessage] = useState('');
    const [letterStatuses, setLetterStatuses] = useState<Map<string, LetterStatus>>(new Map());
    const [revealingRow, setRevealingRow] = useState<number | null>(null);
    const [revealingIndex, setRevealingIndex] = useState(0);

    useEffect(() => {
        // Select random word
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(randomWord);
    }, []);

    const checkGuess = (guess: string): Guess => {
        const result: Guess = { letters: [] };
        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');

        // First pass: mark correct letters
        guessLetters.forEach((char, index) => {
            if (char === targetLetters[index]) {
                result.letters.push({ char, status: 'correct' });
                targetLetters[index] = ''; // Remove from consideration
            } else {
                result.letters.push({ char, status: '' });
            }
        });

        // Second pass: mark present/absent
        result.letters.forEach((letter, index) => {
            if (letter.status === 'correct') return;

            const targetIndex = targetLetters.indexOf(letter.char);
            if (targetIndex !== -1) {
                result.letters[index].status = 'present';
                targetLetters[targetIndex] = '';
            } else {
                result.letters[index].status = 'absent';
            }
        });

        return result;
    };

    const updateLetterStatuses = (guessResult: Guess) => {
        const newStatuses = new Map(letterStatuses);
        const statusPriority = { 'correct': 3, 'present': 2, 'absent': 1, '': 0 };

        guessResult.letters.forEach(letter => {
            const currentStatus = newStatuses.get(letter.char) || '';
            if (statusPriority[letter.status] > statusPriority[currentStatus]) {
                newStatuses.set(letter.char, letter.status);
            }
        });

        setLetterStatuses(newStatuses);
    };

    const submitGuess = () => {
        if (currentGuess.length !== WORD_LENGTH) {
            setMessage('Word must be 5 letters long');
            return;
        }

        const guessResult = checkGuess(currentGuess.toUpperCase());
        updateLetterStatuses(guessResult);
        const newGuesses = [...guesses, { letters: guessResult.letters.map(l => ({ char: l.char, status: '' as LetterStatus })) }];
        setGuesses(newGuesses);
        setCurrentGuess('');
        setRevealingRow(guesses.length);
        setRevealingIndex(0);

        // Start revealing animation
        const revealNext = (index: number) => {
            if (index < WORD_LENGTH) {
                setTimeout(() => {
                    setGuesses(prev => {
                        const updated = [...prev];
                        updated[guesses.length].letters[index].status = guessResult.letters[index].status;
                        return updated;
                    });
                    setRevealingIndex(index + 1);
                    revealNext(index + 1);
                }, 300);
            } else {
                // Finished revealing
                setRevealingRow(null);
                setRevealingIndex(0);

                if (currentGuess.toUpperCase() === targetWord) {
                    setGameStatus('won');
                    setMessage('Congratulations! You won!');
                } else if (newGuesses.length >= MAX_GUESSES) {
                    setGameStatus('lost');
                    setMessage(`Game over! The word was ${targetWord}`);
                } else {
                    setMessage('');
                }
            }
        };
        revealNext(0);
    };

    const handleKeyPress = (key: string) => {
        if (gameStatus !== 'playing') return;

        if (key === 'ENTER') {
            submitGuess();
        } else if (key === 'BACKSPACE') {
            setCurrentGuess(currentGuess.slice(0, -1));
        } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
            setCurrentGuess(currentGuess + key);
        }
    };

    const handleKeyboardEvent = (event: KeyboardEvent) => {
        const key = event.key.toUpperCase();
        handleKeyPress(key);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyboardEvent);
        return () => window.removeEventListener('keydown', handleKeyboardEvent);
    }, [currentGuess, guesses, gameStatus]);

    // const resetGame = () => {
    //     const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    //     setTargetWord(randomWord);
    //     setGuesses([]);
    //     setCurrentGuess('');
    //     setGameStatus('playing');
    //     setMessage('');
    //     setLetterStatuses(new Map());
    // };

    const getLetterClass = (status: LetterStatus) => {
        switch (status) {
            case 'correct': return 'bg-green-500 text-white transition-all duration-300';
            case 'present': return 'bg-yellow-500 text-white transition-all duration-300';
            case 'absent': return 'bg-gray-500 text-white transition-all duration-300';
            default: return 'bg-white border-2 border-gray-300 transition-all duration-300';
        }
    };

    const generateShareText = () => {
        const guessCount = guesses.length;
        let shareText = `Wordle ${guessCount}/6\n\n`;
        guesses.forEach(guess => {
            guess.letters.forEach(letter => {
                switch (letter.status) {
                    case 'correct': shareText += '🟩'; break;
                    case 'present': shareText += '🟨'; break;
                    case 'absent': shareText += '⬜'; break;
                    default: shareText += '⬜';
                }
            });
            shareText += '\n';
        });
        return shareText;
    };

    const shareResult = async () => {
        const shareText = generateShareText();
        try {
            await navigator.clipboard.writeText(shareText);
            setMessage('Result copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            setMessage('Failed to copy to clipboard');
        }
    };

    const resetGame = () => {
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(randomWord);
        setGuesses([]);
        setCurrentGuess('');
        setGameStatus('playing');
        setMessage('');
        setLetterStatuses(new Map());
        setRevealingRow(null);
        setRevealingIndex(0);
    };

    return (
        <div className="flex flex-col items-center p-4 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4">Wordle</h1>

            {/* Game Grid */}
            <div className="grid grid-rows-6 gap-2 mb-4">
                {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-5 gap-2">
                        {Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
                            const guess = guesses[rowIndex];
                            const letter = guess ? guess.letters[colIndex] : null;

                            let displayChar = '';
                            let className = 'w-12 h-12 flex items-center justify-center text-xl font-bold border-2 border-gray-300';

                            if (rowIndex === guesses.length && gameStatus === 'playing') {
                                displayChar = currentGuess[colIndex] || '';
                            } else if (letter) {
                                displayChar = letter.char;
                                className += ` ${getLetterClass(letter.status)}`;
                            }

                            return (
                                <div key={colIndex} className={className}>
                                    {displayChar}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Message */}
            {message && (
                <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
                    {message}
                </div>
            )}

            {/* Share and Reset Buttons */}
            {gameStatus !== 'playing' && (
                <div className="mb-4 flex gap-2">
                    <button
                        onClick={shareResult}
                        className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
                    >
                        Share
                    </button>
                    <button
                        onClick={resetGame}
                        className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
                    >
                        New Game
                    </button>
                </div>
            )}

            {/* Virtual Keyboard */}
            <div className="mb-4">
                <div className="flex justify-center mb-2">
                    {'QWERTYUIOP'.split('').map(letter => {
                        const status = letterStatuses.get(letter) || '';
                        const baseClass = getLetterClass(status);
                        return (
                            <button
                                key={letter}
                                onClick={() => handleKeyPress(letter)}
                                className={`m-1 px-2 py-1 ${baseClass} rounded`}
                                disabled={gameStatus !== 'playing'}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-center mb-2">
                    {'ASDFGHJKL'.split('').map(letter => {
                        const status = letterStatuses.get(letter) || '';
                        const baseClass = getLetterClass(status);
                        return (
                            <button
                                key={letter}
                                onClick={() => handleKeyPress(letter)}
                                className={`m-1 px-2 py-1 ${baseClass} rounded`}
                                disabled={gameStatus !== 'playing'}
                            >
                                {letter}
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={() => handleKeyPress('ENTER')}
                        className="m-1 px-4 py-1 bg-green-500 text-white hover:bg-green-600 rounded"
                        disabled={gameStatus !== 'playing'}
                    >
                        ENTER
                    </button>
                    {'ZXCVBNM'.split('').map(letter => {
                        const status = letterStatuses.get(letter) || '';
                        const baseClass = getLetterClass(status);
                        return (
                            <button
                                key={letter}
                                onClick={() => handleKeyPress(letter)}
                                className={`m-1 px-2 py-1 ${baseClass} rounded`}
                                disabled={gameStatus !== 'playing'}
                            >
                                {letter}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => handleKeyPress('BACKSPACE')}
                        className="m-1 px-2 py-1 bg-red-500 text-white hover:bg-red-600 rounded"
                        disabled={gameStatus !== 'playing'}
                    >
                        ⌫
                    </button>
                </div>
            </div>


        </div>
    );
};

export default WordleGame;
