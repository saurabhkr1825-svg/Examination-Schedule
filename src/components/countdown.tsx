"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CountdownProps {
  dates: string[];
}

interface ExamSession {
  name: string;
  dateStr: string;
  start: Date;
  end: Date;
}

const emptySubscribe = () => () => {};

export function ExamCountdown({ dates }: CountdownProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [sessionBadge, setSessionBadge] = useState<string>("Upcoming");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    // Build timeline of all 18 sessions
    // Morning: 9:30 AM - 12:30 PM IST (UTC+05:30)
    // Evening: 3:00 PM - 6:00 PM IST (UTC+05:30)
    const sessions: ExamSession[] = [];

    const examDates = [
      "21 November 2026",
      "22 November 2026",
      "23 November 2026",
      "25 November 2026",
      "26 November 2026",
      "27 November 2026",
      "28 November 2026",
      "29 November 2026",
      "30 November 2026",
    ];

    for (const d of examDates) {
      const day = parseInt(d.split(" ")[0], 10);
      const morningStart = new Date(2026, 10, day, 9, 30, 0);
      const morningEnd = new Date(2026, 10, day, 12, 30, 0);
      const eveningStart = new Date(2026, 10, day, 15, 0, 0);
      const eveningEnd = new Date(2026, 10, day, 18, 0, 0);

      sessions.push({
        name: `Morning Session (${d})`,
        dateStr: d,
        start: morningStart,
        end: morningEnd,
      });

      sessions.push({
        name: `Evening Session (${d})`,
        dateStr: d,
        start: eveningStart,
        end: eveningEnd,
      });
    }

    const updateTimer = () => {
      const now = new Date();
      const firstSession = sessions[0];
      const lastSession = sessions[sessions.length - 1];

      if (now < firstSession.start) {
        const diff = firstSession.start.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setStatusMessage("until Autumn 2026 End-Semester Examinations commence");
        setSessionBadge("Next: 21 Nov, 9:30 AM");
        setIsLive(false);
        return;
      }

      if (now > lastSession.end) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setStatusMessage("Autumn 2026 End-Semester Examinations have concluded.");
        setSessionBadge("Concluded");
        setIsLive(false);
        return;
      }

      let activeSession: ExamSession | null = null;
      let nextSession: ExamSession | null = null;

      for (const s of sessions) {
        if (now >= s.start && now <= s.end) {
          activeSession = s;
          break;
        }
        if (now < s.start) {
          nextSession = s;
          break;
        }
      }

      if (activeSession) {
        const diff = activeSession.end.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft({ days: 0, hours, minutes, seconds });
        setStatusMessage(`${activeSession.name} in progress (remaining)`);
        setSessionBadge("In Progress");
        setIsLive(true);
      } else if (nextSession) {
        const diff = nextSession.start.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setStatusMessage(`until ${nextSession.name}`);
        setSessionBadge(`Next: ${nextSession.dateStr}`);
        setIsLive(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dates, isClient]);

  if (!isClient) {
    return (
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-blue-200" />
          <span className="font-medium text-lg">Autumn 2026 End-Semester Examination Schedule</span>
        </div>
        <Badge className="bg-blue-600/80 text-white border-0">21 Nov – 30 Nov 2026</Badge>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded-xl p-6 shadow-lg border border-blue-600">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
              Autumn 2026 End-Semester Exam Portal
            </span>
            <Badge className={`${isLive ? "bg-amber-500" : "bg-blue-600"} text-white border-0 text-xs ml-2`}>
              {sessionBadge}
            </Badge>
          </div>
          <p className="text-sm text-blue-100 font-medium">
            {statusMessage}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center bg-black/25 rounded-lg px-3 py-2 min-w-[60px] border border-white/10">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-blue-200 font-medium">Days</span>
          </div>
          <span className="text-2xl font-bold text-blue-300">:</span>
          <div className="flex flex-col items-center bg-black/25 rounded-lg px-3 py-2 min-w-[60px] border border-white/10">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-blue-200 font-medium">Hours</span>
          </div>
          <span className="text-2xl font-bold text-blue-300">:</span>
          <div className="flex flex-col items-center bg-black/25 rounded-lg px-3 py-2 min-w-[60px] border border-white/10">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-blue-200 font-medium">Mins</span>
          </div>
          <span className="text-2xl font-bold text-blue-300">:</span>
          <div className="flex flex-col items-center bg-black/25 rounded-lg px-3 py-2 min-w-[60px] border border-white/10">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-emerald-300">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-blue-200 font-medium">Secs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
