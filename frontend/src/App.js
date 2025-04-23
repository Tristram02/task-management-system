import React, { useEffect, useState } from 'react';
import Clock from 'react-live-clock';
import './styles/style.css';
import { MainView } from './components/MainView';
import { CalendarView } from './components/CalendarView';
import { ProgressView } from './components/ProgressView';

function App() {
    const [tasks, setTasks] = useState([]);
    const [activeView, setActiveView] = useState('all');

    useEffect(() => {
        fetch(`/tasks`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setTasks(data);
            })
            .catch((error) => console.error('Error fetching tasks:', error));
    }, []);

    const handleUpdateTaskStatus = (taskId, newStatus) => {

        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );

        // --- Here you would typically make an API call ---
        // fetch(`/api/tasks/${taskId}`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ status: newStatus })
        // })
        // .then(response => {
        //   if (!response.ok) {
        //      // Handle error - maybe revert the state change
        //      console.error("Failed to update task status");
        //      // Revert state change if API call failed (optional but good practice)
        //      setTasks(prevTasks); // Revert to previous state
        //   }
        // })
        // .catch(error => {
        //     console.error("Error updating task:", error);
        //     setTasks(prevTasks); // Revert state change on error
        // });
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'all':
                return <MainView tasks={tasks} />;
            case 'calendar':
                return <CalendarView tasks={tasks} />;
            case 'progress':
                return <ProgressView tasks={tasks} onUpdateTaskStatus={handleUpdateTaskStatus} />;
            default:
                return <MainView tasks={tasks} />;
        }
    };

    return (
        <div>
            <div className='background'>
                <div className='blur'></div>
            </div>
            <div className='content'>
                <div className="row">
                    <div className="header">
                        <h1>TMS</h1>
                        <Clock className='clock' ticking={true} format={'HH:mm'} />
                    </div>
                </div>
                <div className="row">
                    <div className="sidebar">
                        <div className='menu'>
                            <div className='item' onClick={() => setActiveView('all')}>All tasks</div>
                            <div className='item' onClick={() => setActiveView('calendar')}>Calendar View</div>
                            <div className='item' onClick={() => setActiveView('progress')}>Progress View</div>
                            <div className='item'>Log out</div>
                        </div>
                    </div>
                    {renderActiveView()}
                </div>
            </div>
        </div>
    )
}

export default App;