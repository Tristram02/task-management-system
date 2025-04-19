import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

export const MainView = () => {

    return (
        <div className="main">
            <Carousel showStatus={false}>
                <div className="card-wrapper">
                    <div className="card">
                        <h2>Title</h2>
                        <span>Created</span>
                        <p>Description</p>
                    </div>
                </div>
                <div className="card-wrapper">
                    <div className="card">
                        <h2>Title</h2>
                        <span>Created</span>
                        <p>Description</p>
                    </div>
                </div>
                <div className="card-wrapper">
                    <div className="card">
                        <h2>Title</h2>
                        <span>Created</span>
                        <p>Description</p>
                    </div>
                </div>
            </Carousel>
        </div>
    )
}