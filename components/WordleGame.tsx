'use client';

import React, { useEffect, useState } from 'react';
import Countdown from "./Countdown";
import { getRandomYalie } from "./getRandomYalie";

const WORD_LENGTH = 6;
const MAX_GUESSES = 6;

// Simple phrase list - 4 letters + 1 letter + 2 digits
// const WORDS = [
//     'CODEA42', 'REACTS99', 'BUILDZ88', 'LEARNP77', 'THINKQ11', 'SMARTV22', 'QUICKW33', 'BRAVEX44',
//     'CLOUDY55', 'DREAMS66', 'FLAMEA77', 'GRAPEB88', 'HOUSEC99', 'IMAGED00', 'JUMBOF11', 'KNIFEG22',
//     'LIGHTH33', 'MOUSEI44', 'NIGHTJ55', 'OCEANK66', 'PLANEL77', 'QUEENM88', 'RIVERN99', 'STONEO00',
//     'TABLEP11', 'UNCLEQ22', 'VOICER33', 'WINDYS44', 'WORLDZ55', 'GAMESA66'
// ];

const collegeAbbreviations: { [key: string]: string } = {
    'Berkeley': 'BK',
    'Branford': 'BR',
    'Grace Hopper': 'GH',
    'Davenport': 'DA',
    'Ezra Stiles': 'ES',
    'Jonathan Edwards': 'JE',
    'Morse': 'MO',
    'Pauli Murray': 'PM',
    'Pierson': 'PC',
    'Saybrook': 'SY',
    'Silliman': 'SI',
    'Timothy Dwight': 'TD',
    'Trumbull': 'TR',
};

//using yalies API from YCS
interface YalieData {
    fname: string;
    lname: string;
    year: number | string;
    college: string;
    profile: string;
}

const getTargetWord = (yalie: YalieData): string => {
    const initials = yalie.fname.charAt(0).toUpperCase() + yalie.lname.charAt(0).toUpperCase();
    const yearLast2 = String(yalie.year).slice(-2);
    const collegeAbbrev = collegeAbbreviations[yalie.college] || 'XX';
    return initials + yearLast2 + collegeAbbrev;
};


type LetterStatus = 'correct' | 'present' | 'absent' | '';

interface Letter {
    char: string;
    status: LetterStatus;
}

interface Guess {
    letters: Letter[];
}

const WordleGame: React.FC = () => {
    const [yalieData, setYalieData] = useState<YalieData | null>(null);
    const [targetWord, setTargetWord] = useState('');
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [message, setMessage] = useState('');
    const [letterStatuses, setLetterStatuses] = useState<Map<string, LetterStatus>>(new Map());
    const [revealingRow, setRevealingRow] = useState<number | null>(null);
    const [revealingIndex, setRevealingIndex] = useState(0);
    const [lastGameDate, setLastGameDate] = useState<string>('');

    const resetGame = () => {
        const fetchYalie = async () => {
            try {
                const yalie = await getRandomYalie();
                setYalieData(yalie);
                const target = getTargetWord(yalie);
                setTargetWord(target);
                localStorage.setItem('wordle-yalie-data', JSON.stringify(yalie));
            } catch (error) {
                console.error('Failed to fetch Yalie:', error);
                setTargetWord('JD24TD');
            }
        };
        fetchYalie();
        setGuesses([]);
        setCurrentGuess('');
        setGameStatus('playing');
        setMessage('');
        setLetterStatuses(new Map());
        setRevealingRow(null);
        setRevealingIndex(0);
        setLastGameDate(new Date().toDateString());
        localStorage.setItem('wordle-last-game-date', new Date().toDateString());
    };

    useEffect(() => {
        const storedDate = localStorage.getItem('wordle-last-game-date');
        const today = new Date().toDateString();

        if (storedDate !== today) {
            // New day, reset game
            resetGame();
        } else {
            // Same day, load existing yalie data
            const storedYalie = localStorage.getItem('wordle-yalie-data');
            if (storedYalie) {
                const yalie = JSON.parse(storedYalie);
                setYalieData(yalie);
                const target = getTargetWord(yalie);
                setTargetWord(target);
            } else {
                // Fallback if no stored data
                resetGame();
            }
        }
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
            setMessage('Phrase must be 6 characters long');
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
                    if (yalieData) {
                        setMessage(`Congratulations! You won! The person was ${yalieData.fname} ${yalieData.lname} ${yalieData.year} ${yalieData.college}`);
                    } else {
                        setMessage('Congratulations! You won!');
                    }
                } else if (newGuesses.length >= MAX_GUESSES) {
                    setGameStatus('lost');
                    if (yalieData) {
                        setMessage(`${yalieData.fname} ${yalieData.lname} ${yalieData.year} ${yalieData.college}`);
                    } else {
                        setMessage(`Game over! The word was ${targetWord}`);
                    }
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
        } else if (currentGuess.length < WORD_LENGTH && /^[A-Z0-9]$/.test(key)) {
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



    return (
        <div className="flex flex-col items-center p-2 sm:p-4 max-w-sm sm:max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4">Yurdle</h1>
            <p>Welcome to the Yurdle by Rumpus! each day we select one randomly selected student from the Yalies API (by Y/CS) and we have you all guess who it is. Good luck!</p>

            {/* Column Descriptions */}
            <div className="flex mb-2 text-xs sm:text-sm font-bold">
                <div className="flex justify-center items-center" style={{ width: 'calc(2 * 2.5rem + 0.5rem)' }}>Initials</div>
                <div className="w-2 sm:w-4"></div>
                <div className="flex justify-center items-center" style={{ width: 'calc(2 * 2.5rem + 0.5rem)' }}>Year</div>
                <div className="w-2 sm:w-4"></div>
                <div className="flex justify-center items-center" style={{ width: 'calc(2 * 2.5rem + 0.5rem)' }}>College</div>
            </div>

            {/* Game Grid */}
            <div className="flex flex-col gap-2 mb-4">
                {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                        {Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
                            const guess = guesses[rowIndex];
                            const letter = guess ? guess.letters[colIndex] : null;

                            let displayChar = '';
                            let className = 'w-10 h-10 sm:w-14 sm:h-14 md:w-12 md:h-12 flex items-center justify-center text-lg sm:text-xl font-bold border-2 border-gray-300';

                            if (rowIndex === guesses.length && gameStatus === 'playing') {
                                displayChar = currentGuess[colIndex] || '';
                            } else if (letter) {
                                displayChar = letter.char;
                                className += ` ${getLetterClass(letter.status)}`;
                            }

                            // Add breaks after 2nd and 4th characters
                            if (colIndex === 1 || colIndex === 3) {
                                className += ' mr-4';
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
                <div className="mb-4 flex flex-col items-center gap-2">
                    <button
                        onClick={shareResult}
                        className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
                    >
                        Share
                    </button>
                    {/* <button
                        onClick={resetGame}
                        className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
                    >
                        New Game
                    </button> */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Next Puzzle</h3>
                        <Countdown targetDate={new Date(new Date().setHours(24, 0, 0, 0)).toISOString()} html={true} />
                    </div>
                </div>
            )}

            {/* Virtual Keyboard */}
            {gameStatus === 'playing' && (
                <div className="mb-4">
                    <div className="flex justify-center mb-2">
                        {'1234567890'.split('').map(digit => {
                            const status = letterStatuses.get(digit) || '';
                            const baseClass = getLetterClass(status);
                            return (
                                <button
                                    key={digit}
                                    onClick={() => handleKeyPress(digit)}
                                    className={`m-1 px-3 py-2 sm:px-2 sm:py-1 ${baseClass} rounded text-lg sm:text-base`}
                                    disabled={gameStatus !== 'playing'}
                                >
                                    {digit}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex justify-center mb-2">
                        {'QWERTYUIOP'.split('').map(letter => {
                            const status = letterStatuses.get(letter) || '';
                            const baseClass = getLetterClass(status);
                            return (
                                <button
                                    key={letter}
                                    onClick={() => handleKeyPress(letter)}
                                    className={`m-1 px-3 py-2 sm:px-2 sm:py-1 ${baseClass} rounded text-lg sm:text-base`}
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
                                    className={`m-1 px-3 py-2 sm:px-2 sm:py-1 ${baseClass} rounded text-lg sm:text-base`}
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
                                    className={`m-1 px-3 py-2 sm:px-2 sm:py-1 ${baseClass} rounded text-lg sm:text-base`}
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
            )}


        </div>
    );
};

export default WordleGame;
