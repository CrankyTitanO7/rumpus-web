// 'use client';

export function reverseTimer(targetDate: Date) {
    const timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference > 0) {
        timeLeft.days = Math.floor(difference / (1000 * 60 * 60 * 24));
        timeLeft.hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        timeLeft.minutes = Math.floor((difference / 1000 / 60) % 60);
        timeLeft.seconds = Math.floor((difference / 1000) % 60);
    }
    return timeLeft;
}
