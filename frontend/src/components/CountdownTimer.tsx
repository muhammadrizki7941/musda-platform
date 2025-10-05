import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const total = target.getTime() - now.getTime();
  
  // Pastikan nilai tidak NaN
  if (isNaN(total)) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return { 
    total, 
    days: Math.max(0, days), 
    hours: Math.max(0, hours), 
    minutes: Math.max(0, minutes), 
    seconds: Math.max(0, seconds) 
  };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  // Validasi targetDate
  const getValidDate = (date: string | Date): Date => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      // Jika tanggal tidak valid, gunakan tanggal default (1 jam dari sekarang)
      return new Date(Date.now() + (60 * 60 * 1000));
    }
    return parsedDate;
  };

  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(getValidDate(targetDate)));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(getValidDate(targetDate)));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <h2 className="text-3xl font-bold text-yellow-500 mb-2">Acara Sudah Dimulai!</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
  <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Countdown Menuju Hari Acara</h2>
      <div className="flex gap-6 text-center">
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl shadow-lg px-6 py-4">
          <span className="text-4xl font-bold text-white drop-shadow">{timeLeft.days}</span>
          <div className="text-yellow-100 text-lg font-semibold mt-1">Hari</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl shadow-lg px-6 py-4">
          <span className="text-4xl font-bold text-white drop-shadow">{timeLeft.hours}</span>
          <div className="text-yellow-100 text-lg font-semibold mt-1">Jam</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl shadow-lg px-6 py-4">
          <span className="text-4xl font-bold text-white drop-shadow">{timeLeft.minutes}</span>
          <div className="text-yellow-100 text-lg font-semibold mt-1">Menit</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl shadow-lg px-6 py-4">
          <span className="text-4xl font-bold text-white drop-shadow">{timeLeft.seconds}</span>
          <div className="text-yellow-100 text-lg font-semibold mt-1">Detik</div>
        </div>
      </div>
      <div className="mt-6 text-gray-300 text-lg">Jangan lewatkan momen spesial MUSDA II HIMPERRA Lampung!</div>
    </div>
  );
};
