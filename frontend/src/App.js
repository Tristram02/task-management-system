import React, { useEffect, useState } from 'react';
import Clock from 'react-live-clock';
import './styles/style.css';
import './styles/auth.css';
import { MainView } from './components/MainView';
import { CalendarView } from './components/CalendarView';
import { ProgressView } from './components/ProgressView';
import { Modal } from './components/Modal';
import { NewTaskForm } from './components/NewTaskForm';
import { EditTaskForm } from './components/EditTaskForm';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';

function App() {
    const [tasks, setTasks] = useState([]);
    const [activeView, setActiveView] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [jwtToken, setJwtToken] = useState(() => localStorage.getItem('jwt_token'));
    const [authMode, setAuthMode] = useState('login');
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        if (!jwtToken) return;
        fetch(`/tasks`, {
            headers: { Authorization: `Bearer ${jwtToken}` }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setTasks(data);
            })
            .catch((error) => console.error('Error fetching tasks:', error));
    }, [jwtToken]);

    useEffect(() => {
        if (jwtToken) {
            localStorage.setItem('jwt_token', jwtToken);
        } else {
            localStorage.removeItem('jwt_token');
        }
    }, [jwtToken]);

    const handleUpdateTaskStatus = (taskId, newStatus) => {
        const originalTasks = [...tasks];

        setTasks(currentTasks =>
            currentTasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );

        fetch(`/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                ...(jwtToken && { Authorization: `Bearer ${jwtToken}` })
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => {
            if (!response.ok) {
                 throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
             console.log(`Task ${taskId} status updated to ${newStatus} on server.`);
        })
        .catch(error => {
            console.error("Error updating task status:", error);
            alert(`Failed to update task: ${error.message}. Reverting.`);
            setTasks(originalTasks);
        });
    };

    const handleCreateTask = async (newTaskData) => {
        try {
            const response = await fetch(`/tasks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(jwtToken && { Authorization: `Bearer ${jwtToken}` })
                },
                body: JSON.stringify(newTaskData),
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
            }

            const createdTask = await response.json();

            setTasks(prevTasks => [...prevTasks, createdTask]);

            setIsModalOpen(false);

        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
        }
    };
    
    const handleDeleteTask = (taskId) => {
        if (!window.confirm(`Are you sure you want to delete this task?`)) {
            return;
        }

        console.log('Deleting task:', taskId);
        const originalTasks = [...tasks];

        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

        fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                ...(jwtToken && { Authorization: `Bearer ${jwtToken}` })
            },
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                        console.warn(`Task ${taskId} not found on server (maybe already deleted?).`);
                        return;
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        })
        .catch(error => {
            console.error("Error deleting task:", error);
            alert(`Failed to delete task: ${error.message}. Reverting.`);
            setTasks(originalTasks);
        });
    };

    const openEditModal = (task) => {
        setTaskToEdit(task);
        setIsEditModalOpen(true);
    };

    const handleUpdateTask = async (taskId, updatedTaskData) => {
        const originalTasks = [...tasks];

        const taskIndex = originalTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            console.error("Cannot update task, ID not found in current state:", taskId);
            throw new Error("Task not found locally.");
        }

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(jwtToken && { Authorization: `Bearer ${jwtToken}` })
                },
                body: JSON.stringify(updatedTaskData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
            }

            const updatedTaskFromServer = await response.json();

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === updatedTaskFromServer.id ? updatedTaskFromServer : task
                )
            );

            setIsEditModalOpen(false);
            setTaskToEdit(null);

            console.log("WORKS!");

        } catch (error) {
            console.error("Error updating task:", error);
            throw error;
        }
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'all':
                return <MainView tasks={tasks} onDeleteTask={handleDeleteTask} onEditTask={openEditModal} />;
            case 'calendar':
                return <CalendarView tasks={tasks} />;
            case 'progress':
                return <ProgressView tasks={tasks} onUpdateTaskStatus={handleUpdateTaskStatus} />;
            default:
                return <MainView tasks={tasks} />;
        }
    };

    const handleLogin = async ({email, password}) => {
        setAuthError('');
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');
            setJwtToken(data.token);
        } catch (err) {
            setAuthError(err.message);
        }
    }

    const handleRegister = async ({ email, password }) => {
        setAuthError('');
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Register failed');
            setAuthMode('login');
        } catch (err) {
            setAuthError(err.message);
        }
    };

    const handleLogout = () => {
        setJwtToken(null);
        setTasks([]);
    };

    if (!jwtToken) {
        return (
            <div>
                <div className='background'>
                    <div className='blur'></div>
                </div>
                <div className='auth-content'>
                    {authMode === 'login' ? (
                        <>
                            <LoginForm onLogin={handleLogin} error={authError} />
                            <p className='auth-p'>
                                Don't have an account?{' '}
                                <span className='auth-span' onClick={() => { setAuthMode('register'); setAuthError(''); }}>
                                    Register
                                </span>
                            </p>
                        </>
                    ) : (
                        <>
                            <RegisterForm onRegister={handleRegister} error={authError} />
                            <p className='auth-p'>
                                Already have an account?{' '}
                                <span className='auth-span' onClick={() => { setAuthMode('login'); setAuthError(''); }}>
                                    Login
                                </span>
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='background'>
                <div className='blur'></div>
            </div>
            <div className='content'>
                <div className="row">
                    <div className="header">
                        <h1>TMS</h1>
                        <div className='newTask' onClick={() => setIsModalOpen(true)}>+ New Task</div>
                        <Clock className='clock' ticking={true} format={'HH:mm'} />
                    </div>
                </div>
                <div className="row">
                    <div className="sidebar">
                        <div className='menu'>
                            <div className='item' onClick={() => setActiveView('all')}>All tasks</div>
                            <div className='item' onClick={() => setActiveView('calendar')}>Calendar View</div>
                            <div className='item' onClick={() => setActiveView('progress')}>Progress View</div>
                            <div className='item' onClick={handleLogout}>Log out</div>
                        </div>
                    </div>
                    {renderActiveView()}
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <NewTaskForm
                    onSubmitTask={handleCreateTask}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setTaskToEdit(null); }}>
                {taskToEdit && (
                    <EditTaskForm
                        initialTaskData={taskToEdit}
                        onSubmitTask={(updatedData) => handleUpdateTask(taskToEdit.id, updatedData)}
                        onClose={() => { setIsEditModalOpen(false); setTaskToEdit(null); }}
                    />
                )}
            </Modal>
        </div>
    )
}

export default App;