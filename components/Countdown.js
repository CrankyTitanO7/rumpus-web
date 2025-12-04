'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image'


export default function Countdown({ targetDate, html }) {
    const [timeLeft, setTimeLeft] = useState({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        });
        

        useEffect(() => {
            const calculateTimeLeft = () => {
                const target = new Date(targetDate).getTime();
                const now = new Date().getTime();
                const difference = target - now;

                if (difference > 0) {
                    setTimeLeft({
                        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60),
                    });
                }
            };

            calculateTimeLeft();
            const timer = setInterval(calculateTimeLeft, 1000);

            return () => clearInterval(timer);
        }, [targetDate]);


    if (html) {
        if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds <= 10 && timeLeft.seconds > 0) {
            return (
                <>
                    <div className="rumpus-countdown">
                        <div className="countdown-item-final">
                            <span className="countdown-value">{timeLeft.seconds}</span>
                            <span className="countdown-label">Seconds before the Rumpening</span>
                        </div>
                    </div>
                </>
            );
        } else if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
            return (
                <>
                    <div className="rumpus-countdown">
                        <a href="#section2" tarket="_blank" rel="noopener noreferrer"> {/*insert next issue link here*/}
                            <div className="countdown-item">
                                <span className="countdown-value">
                                    <Image
                                        src="/freaky-joker.jpeg"
                                        alt="click here..."
                                        width={500}
                                        height={500}
                                    />
                                </span>
                                <span className="countdown-label">... and may the Rumpening begin...</span>
                            </div>
                        </a>
                    </div>
                </>
            )
        } else {
            return (
                <>
                    <div className="rumpus-countdown">
                        <div className="countdown-item">
                            <span className="countdown-value">{timeLeft.days}</span>
                            <span className="countdown-label">Days</span>
                        </div>
                        <div className="countdown-item">
                            <span className="countdown-value">{timeLeft.hours}</span>
                            <span className="countdown-label">Hours</span>
                        </div>
                        <div className="countdown-item">
                            <span className="countdown-value">{timeLeft.minutes}</span>
                            <span className="countdown-label">Minutes</span>
                        </div>
                        <div className="countdown-item">
                            <span className="countdown-value">{timeLeft.seconds}</span>
                            <span className="countdown-label">Seconds</span>
                        </div>
                    </div>
                </>
            );
        }
    } else if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0){
        
        return (false);
    } else {
        return (true);
    }
}