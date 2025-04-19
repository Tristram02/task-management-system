import React, { useEffect, useState } from 'react';
import Clock from 'react-live-clock';
import './styles/style.css';
import { MainView } from './components/MainView';
import { CalendarView } from './components/CalendarView';

function App() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetch(`/tasks`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setTasks(data);
            })
            .catch((error) => console.error('Error fetching tasks:', error));
    }, []);

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
                            <div className='item'>All tasks</div>
                            <div className='item'>Calendar View</div>
                            <div className='item'>Progress View</div>
                            <div className='item'>Log out</div>
                        </div>
                    </div>
                    {/* <MainView /> */}
                    <CalendarView />
                </div>
            </div>
        </div>
    )
}

export default App;