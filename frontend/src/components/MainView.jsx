import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

export const MainView = ({ tasks }) => {

    return (
        <div className="main">
            <Carousel showStatus={false}>
                {tasks.map((task) => (
                    <>
                        <div className="card-wrapper">
                            <div className="card">
                                <h2>{task.title}</h2>
                                <span><b>Created:</b> {task.created_at.split('T')[0]}</span>
                                <span><b>Priority:</b> {task.priority}</span>
                                <span><b>Deadline:</b> {task.due_date.split('T')[0]}</span>
                                <span><b>Status:</b> {task.status}</span>
                                <p>{task.description}</p>
                            </div>
                        </div>
                    </>
                ))}
            </Carousel>
        </div>
    )
}