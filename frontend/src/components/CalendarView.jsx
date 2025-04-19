import React, { useState, useEffect } from 'react';
import '../styles/calendarview.css';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([
    { date: '2025-06-05', title: 'Project Deadline' },
    { date: '2025-10-12', title: 'Team Meeting' },
    { date: '2025-10-15', title: 'Client Call' },
    { date: '2025-10-20', title: 'Design Review' },
  ]);

  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getTasksForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => task.date === dateStr);
  };

  return (
    <div className="calendar">
      <div className="header">
        <button onClick={handlePrevMonth}>&#10094;</button>
        <h2>{new Date(currentYear, currentMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={handleNextMonth}>&#10095;</button>
      </div>
      <div className="days">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>
      <div className="dates">
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={`empty-${index}`} className="date empty"></div>
        ))}
        {days.map(day => {
          const tasksForDay = getTasksForDay(day);
          const isToday = currentDate.getDate() === day && 
                          currentDate.getMonth() === currentMonth &&
                          currentDate.getFullYear() === currentYear;
                          
          return (
            <div key={day} className={`date ${isToday ? 'today' : ''}`}>
              <span>{day}</span>
              {tasksForDay.map(task => (
                <div key={task.title} className="task">
                  {task.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
