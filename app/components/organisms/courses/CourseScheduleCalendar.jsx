'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateLabel = (key, options) =>
  new Date(`${key}T12:00:00`).toLocaleDateString(undefined, options);

const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

export default function CourseScheduleCalendar({
  courses = [],
  title = 'Academy Class Calendar',
  emptyMessage = 'There are no classes scheduled for this date.',
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));

  const sessions = useMemo(
    () =>
      courses
        .flatMap((course) =>
          (course.classSessions ?? []).map((session, index) => ({
            ...session,
            key: `${course.id}-${session.date}-${index}`,
            courseTitle: course.title,
            courseSlug: course.slug,
          }))
        )
        .filter((session) => /^\d{4}-\d{2}-\d{2}$/.test(session.date ?? ''))
        .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [courses]
  );

  const sessionsByDate = useMemo(
    () =>
      sessions.reduce((grouped, session) => {
        grouped[session.date] ??= [];
        grouped[session.date].push(session);
        return grouped;
      }, {}),
    [sessions]
  );

  const calendarDays = useMemo(() => {
    const first = monthStart(visibleMonth);
    const offset = first.getDay();
    return Array.from({ length: 42 }, (_, index) => new Date(first.getFullYear(), first.getMonth(), index - offset + 1));
  }, [visibleMonth]);

  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const selectedSessions = sessionsByDate[selectedDate] ?? [];
  const changeMonth = (amount) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(dateKey(nextMonth));
  };

  return (
    <section className="mt-12 rounded-2xl border border-border-light glass p-5 sm:p-7" aria-label={title}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text">{title}</h2>
          <p className="text-sm text-text-muted mt-1">Select a date to see its scheduled classes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="w-9 h-9 rounded-lg border border-border-light text-text hover:border-primary hover:text-primary transition-colors"
          >
            ‹
          </button>
          <span className="w-32 text-center text-sm font-semibold text-text">{monthLabel}</span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="w-9 h-9 rounded-lg border border-border-light text-text hover:border-primary hover:text-primary transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-l border-border-light">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-text-muted border-r border-b border-border-light"
          >
            {day}
          </div>
        ))}
        {calendarDays.map((day) => {
          const key = dateKey(day);
          const hasSessions = Boolean(sessionsByDate[key]?.length);
          const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
          const isSelected = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedDate(key);
                if (!isCurrentMonth) setVisibleMonth(monthStart(day));
              }}
              aria-label={`${dateLabel(key, { month: 'long', day: 'numeric', year: 'numeric' })}${hasSessions ? `, ${sessionsByDate[key].length} classes` : ''}`}
              aria-pressed={isSelected}
              className={`min-h-12 sm:min-h-16 p-1 sm:p-2 flex flex-col items-center justify-center gap-1 border-r border-b border-border-light transition-colors ${
                isSelected ? 'bg-primary/15 text-primary' : 'hover:bg-primary/5'
              } ${isCurrentMonth ? 'text-text' : 'text-text-muted/50'}`}
            >
              <span className="text-sm">{day.getDate()}</span>
              <span className="h-1.5 flex items-center gap-0.5">
                {hasSessions &&
                  sessionsByDate[key].slice(0, 3).map((session) => (
                    <span key={session.key} className="w-1.5 h-1.5 rounded-full bg-primary" />
                  ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-text mb-3">
          {dateLabel(selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        {selectedSessions.length ? (
          <ul className="flex flex-col gap-3">
            {selectedSessions.map((session) => (
              <li key={session.key} className="rounded-xl border border-border-light p-4">
                <Link
                  href={`/academy/courses/${session.courseSlug}`}
                  className="font-semibold text-text hover:text-primary transition-colors"
                >
                  {session.title || session.courseTitle}
                </Link>
                <p className="text-sm text-text-secondary mt-1">{session.courseTitle}</p>
                {(session.startTime || session.endTime) && (
                  <p className="text-sm text-text-muted mt-2">
                    {[session.startTime, session.endTime].filter(Boolean).join(' – ')}
                  </p>
                )}
                {session.location && <p className="text-sm text-text-muted mt-1">{session.location}</p>}
                {session.notes && <p className="text-sm text-text-secondary mt-2">{session.notes}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">{sessions.length ? emptyMessage : 'Class dates will be announced soon.'}</p>
        )}
      </div>
    </section>
  );
}