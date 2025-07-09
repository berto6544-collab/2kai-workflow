import React, { useState, useRef, useCallback } from 'react';
import { 
  Play,Save, Search, MoreHorizontal, ChevronRight, RotateCcw,Trash
} from 'lucide-react';

// Helper function to check if a line segment intersects with a rectangle
function lineIntersectsRect(line, rect) {
    const { x1, y1, x2, y2 } = line;
    const { x, y, width, height } = rect;
    
    // Check if line intersects any of the four rectangle edges
    const edges = [
        { x1: x, y1: y, x2: x + width, y2: y }, // top
        { x1: x + width, y1: y, x2: x + width, y2: y + height }, // right
        { x1: x + width, y1: y + height, x2: x, y2: y + height }, // bottom
        { x1: x, y1: y + height, x2: x, y2: y } // left
    ];
    
    return edges.some(edge => lineIntersectsLine(line, edge));
}

// Check if two line segments intersect
function lineIntersectsLine(line1, line2) {
    const { x1: x1, y1: y1, x2: x2, y2: y2 } = line1;
    const { x1: x3, y1: y3, x2: x4, y2: y4 } = line2;
    
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return false; // parallel lines
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// Find nodes that intersect with the connection line
function findIntersectingNodes(connection, nodes) {
    const line = {
        x1: connection.fromX,
        y1: connection.fromY,
        x2: connection.toX,
        y2: connection.toY
    };
    
    return nodes.filter(node => {
        // Skip source and target nodes
        if (node.id === connection.from || node.id === connection.to) return false;
        
        // Create expanded bounds with padding
        const padding = 30; // Extra space around node
        const bounds = {
            x: node.x - node.width/2 - padding,
            y: node.y - node.height/2 - padding,
            width: node.width + padding * 2,
            height: node.height + padding * 2
        };
        
        return lineIntersectsRect(line, bounds);
    });
}

// Calculate waypoints to avoid obstacles
function calculateWaypoints(connection, obstacles) {
    const waypoints = [];
    
    for (const obstacle of obstacles) {
        const fromX = connection.fromX;
        const fromY = connection.fromY;
        const toX = connection.toX;
        const toY = connection.toY;
        
        // Determine which side to route around based on relative positions
        const dx = toX - fromX;
        const dy = toY - fromY;
        
        // Calculate offset distance
        const offset = Math.max(obstacle.width, obstacle.height) / 2 + 40;
        
        // Choose routing direction based on line angle and obstacle position
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal routing - go around top or bottom
            if (fromY < obstacle.y) {
                // Route around top
                waypoints.push({
                    x: obstacle.x,
                    y: obstacle.y - offset
                });
            } else {
                // Route around bottom
                waypoints.push({
                    x: obstacle.x,
                    y: obstacle.y + offset
                });
            }
        } else {
            // Vertical routing - go around left or right
            if (fromX < obstacle.x) {
                // Route around left
                waypoints.push({
                    x: obstacle.x - offset,
                    y: obstacle.y
                });
            } else {
                // Route around right
                waypoints.push({
                    x: obstacle.x + offset,
                    y: obstacle.y
                });
            }
        }
    }
    
    return waypoints;
}

// Create path with node avoidance
function createAvoidingPath(connection, nodes, scale, canvasOffset) {
    const fromX = connection.fromX * scale + canvasOffset.x;
    const fromY = connection.fromY * scale + canvasOffset.y;
    const toX = connection.toX * scale + canvasOffset.x;
    const toY = connection.toY * scale + canvasOffset.y;
    
    // Check if direct path intersects any nodes
    const intersectingNodes = findIntersectingNodes(connection, nodes);
    
    if (intersectingNodes.length === 0) {
        // Use original bezier curve for direct path
        return `M ${fromX} ${fromY}
                C ${(connection.fromX + connection.toX) * scale + canvasOffset.x} ${fromY}
                  ${(connection.toX - connection.toY) * scale + canvasOffset.x} ${toY}
                  ${toX} ${toY}`;
    }
    
    // Create waypoints around obstacles
    const waypoints = calculateWaypoints(connection, intersectingNodes);
    
    // Build path with smooth curves through waypoints
    let path = `M ${fromX} ${fromY}`;
    
    if (waypoints.length > 0) {
        for (let i = 0; i < waypoints.length; i++) {
            const wp = waypoints[i];
            const wpX = wp.x * scale + canvasOffset.x;
            const wpY = wp.y * scale + canvasOffset.y;
            
            if (i === 0) {
                // First waypoint - curve from start
                const controlX = (fromX + wpX) / 2;
                const controlY = fromY;
                path += ` Q ${controlX} ${controlY} ${wpX} ${wpY}`;
            } else {
                // Subsequent waypoints - smooth curve
                const prevWp = waypoints[i - 1];
                const prevX = prevWp.x * scale + canvasOffset.x;
                const prevY = prevWp.y * scale + canvasOffset.y;
                const controlX = (prevX + wpX) / 2;
                const controlY = (prevY + wpY) / 2;
                path += ` Q ${controlX} ${controlY} ${wpX} ${wpY}`;
            }
        }
        
        // Final curve to destination
        const lastWp = waypoints[waypoints.length - 1];
        const lastX = lastWp.x * scale + canvasOffset.x;
        const lastY = lastWp.y * scale + canvasOffset.y;
        const controlX = (lastX + toX) / 2;
        const controlY = toY;
        path += ` Q ${controlX} ${controlY} ${toX} ${toY}`;
    } else {
        // Fallback to direct line if no waypoints
        path += ` L ${toX} ${toY}`;
    }
    
    return path;
}

// Modified ConnectionLine component
const ConnectionLine = ({ connection, nodes, onDelete }) => {
    // Create path with node avoidance
    const path = createAvoidingPath(connection, nodes, scale, canvasOffset);
    
    // Calculate the midpoint of the connection line (for delete button)
    const midX = ((connection.fromX + connection.toX) / 2) * scale + canvasOffset.x;
    const midY = ((connection.fromY + connection.toY) / 2) * scale + canvasOffset.y;
    
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(connection);
        }
    };
    
    return (
        <g>
            {/* Connection line with avoidance */}
            <path
                d={path}
                stroke="#4b5563"
                strokeWidth={2 * scale}
                fill="none"
                className="pointer-events-none"
            />
            
            {/* Arrow at the end */}
            <circle
                cx={connection.toX * scale + canvasOffset.x}
                cy={connection.toY * scale + canvasOffset.y}
                r={4 * scale}
                fill="#3b5f6d"
                className="pointer-events-none"
            />
            
            {/* Delete button background circle */}
            <circle
                cx={midX}
                cy={midY}
                r={12 * scale}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2 * scale}
                className="cursor-pointer hover:fill-red-600 transition-colors"
                onClick={handleDeleteClick}
            />
            
            {/* Trash/bin icon */}
            <g onClick={handleDeleteClick} transform={`translate(${midX - 7 * scale}, ${midY - 10 * scale}) scale(${scale})`}>
                <path
                    d="M3 6v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V6H3zm2.5 9c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5zm2 0c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5zm2 0c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5zM10.5 4L10 3.5C9.89 3.39 9.78 3.33 9.67 3.29L9.33 3.29C9.26 3.33 9.11 3.39 9 3.5L8.5 4H5.5C5.22 4 5 4.22 5 4.5S5.22 5 5.5 5H12.5C12.78 5 13 4.78 13 4.5S12.78 4 12.5 4H10.5z"
                    fill="white"
                    className="pointer-events-none"
                />
            </g>
        </g>
    );
};

export {ConnectionLine};