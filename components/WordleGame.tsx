'use client';

import React, { useEffect, useState } from 'react';
import Countdown from "./Countdown";
import { getRandomYalie } from "./getRandomYalie";

const WORD_LENGTH = 6;
const MAX_GUESSES = 6;

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

const encouragingMessages = [
    "Congrats, you did it! You know this isn't going on your resume... even this guy ->",
    "You're almost as smart as",
    "Somewhere a crossword editor feels threatened. Anyway, it was",
    "nearly ivy league material, just like",
    "congrats! look them up on instagram ->",
    "ass-tute detective skills...",
    "congrats! you're getting head tonight! haha jk. unless... ",
    "excellent job, you alpha male. let out a howl for",
];

const consolationMessages = [
    "oof. better hope this poor schmuck doesn't see ->",
    "you didn't think of them? ->",
    "Bill ('Bubba?') Clinton is displeased with your loss. So is",
    "'nearly frat brother material,' said",
    "oof. better not put that on your resume, especially if you're",
];

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

const getRandomMessage = (messages: string[]): string => {
    return messages[Math.floor(Math.random() * messages.length)];
};

type LetterStatus = 'correct' | 'present' | 'absent' | '';

interface Letter {
    char: string;
    status: LetterStatus;
}

interface Guess {
    letters: Letter[];
}

const getTodayString = () => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
};

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
                const today = getTodayString();
                localStorage.setItem(`yalie-${today}`, JSON.stringify(yalie));
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
        const today = getTodayString();
        setLastGameDate(today);
        localStorage.setItem('yurdle-last-game', today);
    };

    useEffect(() => {
        const storedDate = localStorage.getItem('yurdle-last-game');
        const today = getTodayString();

        if (storedDate !== today) {
            resetGame();
        } else {
            const storedYalie = localStorage.getItem(`yalie-${today}`);
            if (storedYalie) {
                const yalie = JSON.parse(storedYalie);
                setYalieData(yalie);
                const target = getTargetWord(yalie);
                setTargetWord(target);
            } else {
                resetGame();
            }
        }
    }, []);

    const checkGuess = (guess: string): Guess => {
        const result: Guess = { letters: [] };
        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');

        guessLetters.forEach((char, index) => {
            if (char === targetLetters[index]) {
                result.letters.push({ char, status: 'correct' });
                targetLetters[index] = '';
            } else {
                result.letters.push({ char, status: '' });
            }
        });

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
                setRevealingRow(null);
                setRevealingIndex(0);

                if (currentGuess.toUpperCase() === targetWord) {
                    setGameStatus('won');
                    if (yalieData) {
                        setMessage(`${getRandomMessage(encouragingMessages)} ${yalieData.fname} ${yalieData.lname} in ${yalieData.college}, class of ${yalieData.year}`);
                    } else {
                        setMessage(getRandomMessage(encouragingMessages));
                    }
                } else if (newGuesses.length >= MAX_GUESSES) {
                    setGameStatus('lost');
                    if (yalieData) {
                        setMessage(`${getRandomMessage(consolationMessages)} ${yalieData.fname} ${yalieData.lname} in ${yalieData.college}, class of ${yalieData.year}`);
                    } else {
                        setMessage(getRandomMessage(consolationMessages));
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
        let shareText = `Yurdle ${guessCount}/6\n\n`;
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
        <div className="flex flex-col items-center p-2 sm:p-4 max-w-[95%] xs:max-w-sm sm:max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Yurdle</h1>
            <p className="text-xs sm:text-sm text-center mb-2">Guess the Yalie: Initials + Year + College</p>
            <p className="text-xs sm:text-sm text-center mb-2">college abbreviation if that wasnt clear</p>
            <p className="text-xs sm:text-sm text-center mb-2">if this doesnt work, try clearing your browser cache</p>

            <div className="flex mb-1 sm:mb-2 text-[10px] xs:text-xs sm:text-sm font-bold">
                <div className="flex-1 flex justify-center">Initials</div>
                <div className="w-1 sm:w-2"></div>
                <div className="flex-1 flex justify-center">Year</div>
                <div className="w-1 sm:w-2"></div>
                <div className="flex-1 flex justify-center">College</div>
            </div>

            <div className="flex flex-col gap-1 sm:gap-2 mb-2 sm:mb-4">
                {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1 sm:gap-2 justify-center">
                        {Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
                            const guess = guesses[rowIndex];
                            const letter = guess ? guess.letters[colIndex] : null;

                            let displayChar = '';
                            let className = 'w-7 h-7 xs:w-8 xs:h-8 sm:w-11 sm:h-11 md:w-13 md:h-13 flex items-center justify-center text-sm sm:text-lg font-bold border-2 border-gray-300';

                            if (rowIndex === guesses.length && gameStatus === 'playing') {
                                displayChar = currentGuess[colIndex] || '';
                            } else if (letter) {
                                displayChar = letter.char;
                                className += ` ${getLetterClass(letter.status)}`;
                            }

                            if (colIndex === 1 || colIndex === 3) {
                                className += ' mr-2 sm:mr-4';
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

            {message && (
                <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-sm">
                    {message}
                </div>
            )}

            {gameStatus !== 'playing' && (
                <div className="mb-4 flex flex-col items-center gap-2">
                    <button
                        onClick={shareResult}
                        className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded text-sm"
                    >
                        Share
                    </button>
                    <div className="text-center">
                        <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">Next Puzzle</h3>
                        <Countdown targetDate={new Date(new Date().setHours(24, 0, 0, 0)).toISOString()} html={true} />
                    </div>
                </div>
            )}

            {gameStatus === 'playing' && (
                <div className="mb-2 sm:mb-4 px-1">
                    <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                        {'1234567890'.split('').map(digit => {
                            const status = letterStatuses.get(digit) || '';
                            const baseClass = getLetterClass(status);
                            return (
                                <button
                                    key={digit}
                                    onClick={() => handleKeyPress(digit)}
                                    className={`w-6 h-7 sm:w-8 sm:h-9 ${baseClass} rounded text-xs sm:text-sm`}
                                >
                                    {digit}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                        {'QWERTYUIOP'.split('').map(letter => {
                            const status = letterStatuses.get(letter) || '';
                            const baseClass = getLetterClass(status);
                            return (
                                <button
                                    key={letter}
                                    onClick={() => handleKeyPress(letter)}
                                    className={`w-6 h-7 sm:w-8 sm:h-9 ${baseClass} rounded text-xs sm:text-sm`}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                        {'ASDFGHJKL'.split('').map(letter => {
                            const status = letterStatuses.get(letter) || '';
                            const baseClass = getLetterClass(status);
                            return (
                                <button
                                    key={letter}
                                    onClick={() => handleKeyPress(letter)}
                                    className={`w-6 h-7 sm:w-8 sm:h-9 ${baseClass} rounded text-xs sm:text-sm`}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1">
                        <button
                            onClick={() => handleKeyPress('ENTER')}
                            className="w-10 h-7 sm:w-12 sm:h-9 bg-green-500 text-white hover:bg-green-600 rounded text-xs sm:text-sm"
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
                                    className={`w-6 h-7 sm:w-8 sm:h-9 ${baseClass} rounded text-xs sm:text-sm`}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handleKeyPress('BACKSPACE')}
                            className="w-8 h-7 sm:w-10 sm:h-9 bg-red-500 text-white hover:bg-red-600 rounded text-xs sm:text-sm"
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
