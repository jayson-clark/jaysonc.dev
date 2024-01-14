import React, { useRef, useEffect } from 'react';

// Define constants for velocity, number of points, and other parameters
const MIN_VELOCITY_X = -50;
const MAX_VELOCITY_X = 50;
const MIN_VELOCITY_Y = -50;
const MAX_VELOCITY_Y = 50;

const NUM_POINTS = 150;
const CIRCLE_RADIUS = 2;
const LINE_THRESHOLD_DISTANCE = 80;

// Function to generate random coordinates with velocities
const generateRandomCoordinates = (numPoints, minX, maxX, minY, maxY) => {
    const points = [];

    for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;
        const vx = MIN_VELOCITY_X + Math.random() * (MAX_VELOCITY_X - MIN_VELOCITY_X);
        const vy = MIN_VELOCITY_Y + Math.random() * (MAX_VELOCITY_Y - MIN_VELOCITY_Y);

        points.push({ x, y, vx, vy });
    }

    return points;
};

// Function to draw a circle at given coordinates
const drawCircle = (context, x, y) => {
    context.beginPath();
    context.arc(x, y, CIRCLE_RADIUS, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
};

// Function to draw a line between two points
const drawLine = (context, x1, y1, x2, y2) => {
    context.strokeStyle = '#950740';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
};

// Function to update and draw the animation frame
const updateAndDraw = (context, points, lastTimestamp) => {
    const currentTimestamp = performance.now();
    const deltaTime = (currentTimestamp - lastTimestamp) / 1000; // Convert to seconds

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Check for proximity and draw lines
    points.forEach((point1, index1) => {
        points.slice(index1 + 1).forEach(point2 => {
            const distance = Math.hypot(point1.x - point2.x, point1.y - point2.y);

            if (distance < LINE_THRESHOLD_DISTANCE) {
                drawLine(context, point1.x, point1.y, point2.x, point2.y);
            }
        });
    });

    // Update and draw circles
    points.forEach(point => {
        point.x += point.vx * deltaTime;
        point.y += point.vy * deltaTime;

        if (point.x >= context.canvas.width || point.x <= 0) point.vx = -1 * point.vx;
        if (point.y >= context.canvas.height || point.y <= 0) point.vy = -1 * point.vy;

        drawCircle(context, point.x, point.y);
    });

    // Request the next animation frame
    requestAnimationFrame(() => updateAndDraw(context, points, currentTimestamp));
};

// Main component for the background canvas
const BackgroundCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Set up canvas and context
        const canvas = canvasRef.current;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const context = canvas.getContext('2d');

        // Generate random initial points
        const randomPoints = generateRandomCoordinates(NUM_POINTS, 0, canvas.width, 0, canvas.height);

        // Get the start timestamp for animation
        const startTimestamp = performance.now();

        // Request the first animation frame
        const animationId = requestAnimationFrame(() =>
            updateAndDraw(context, randomPoints, startTimestamp)
        );

        // Cleanup function to cancel animation frame on component unmount
        return () => cancelAnimationFrame(animationId);
    }, []);

    return <canvas ref={canvasRef} width={400} height={400} />;
};

export default BackgroundCanvas;
