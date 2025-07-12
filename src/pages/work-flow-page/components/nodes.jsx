import React, { useState, useRef, useCallback } from 'react';
import { Play, Trash2} from 'lucide-react';

const NodeComponent = ({ node, onNodeClick, onStartConnection, onDelete,handleNodeDrag,canvasRef, selectedNode, canvasOffset, scale, updateNodePosition,handleNode,executeWorkflowFromNode }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [holdTimeout, setHoldTimeout] = useState(null);
    const Icon = node.icon;
    const nodeRef = React.useRef(null);

   // Mouse down: initiate drag
  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (e.target.classList.contains('node-action')) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const adjustedX = (e.clientX - rect.left - canvasOffset.x) / scale;
    const adjustedY = (e.clientY - rect.top - canvasOffset.y) / scale;

    setDragOffset({
      x: adjustedX - node.x,
      y: adjustedY - node.y,
    });
    setIsHolding(true)
    setIsDragging(true);
   
  };

  // Mouse move: update node position
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const adjustedX = (e.clientX - rect.left - canvasOffset.x) / scale;
    const adjustedY = (e.clientY - rect.top - canvasOffset.y) / scale;

    const x = adjustedX - dragOffset.x;
    const y = adjustedY - dragOffset.y;
     //handleNodeDrag(node.id, { x: x, y: y });
     updateNodePosition(node.id, x, y);
  }, [isDragging, dragOffset, node.id, canvasOffset, scale, updateNodePosition]);

  // Mouse up: stop dragging
 const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsHolding(false);

  }, []);
  
const onKeyDownNode = (e) =>{
if (e.key === "Delete" && selectedNode) {
  if(selectedNode.id == node.id){
    const confirmed = window.confirm("Are you sure you want to delete this?");
    if (confirmed) return onDelete(selectedNode.id,node);
  }
  }
}

  // Attach global mouse listeners while dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
     // window.removeEventListener('mousemove', handleMouseMove);
     // window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);



    const getStatusColor = (status) => {
      switch (status) {
        case 'running': return 'border-blue-400 shadow-blue-200';
        case 'success': return 'border-green-400 shadow-green-200';
        case 'Success': return 'border-green-400 shadow-green-200';
        case 'error': return 'border-red-400 shadow-red-200';
        default: return selectedNode?.id === node.id ? 'border-yellow-400 shadow-yellow-200' : 'border-gray-600';
      }
    };

   

    return (
      <div 
      className={`absolute ${selectedNode?.id == node?.id ?"start-node":''}`}
        ref={nodeRef}
        key={node.id}
        tabIndex={0}
        onMouseDown={handleMouseDown}
        
        style={{ 
          left: node.x, 
          top:  node.y, 
          width: 250, 
          height: 100,
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
        onKeyDown={onKeyDownNode}
        onClick={(e)=>{
            e.stopPropagation();
            onNodeClick(node)
            //handleNode(node)
        }}
      
      >

        {selectedNode?.id == node?.id ?<div className="flex absolute -top-8 left-0 gap-2 ">
            
            <button
              className="node-action cursor-pointer text-gray-400 hover:text-yellow-400 transition-colors"
              
              onClick={(e) => {
                e.stopPropagation();
                
                onDelete(node.id,node);
                
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              className="node-action cursor-pointer text-gray-400 hover:text-green-400 transition-colors"
              
              onClick={(e) => {
                e.stopPropagation();
                
                executeWorkflowFromNode(node.id)
                
              }}
            >
              <Play className="w-5 h-5" />
            </button>

             
          </div>:null}
      <div

        className={`absolute bg-[#131313] h-full w-full border-2 rounded-xl select-none ${getStatusColor(node.status)} ${isDragging ? 'opacity-75' : ''} ${isHolding ? 'cursor-grab' : 'cursor-grab'}`}
        
      >
        <div className="flex items-center justify-between p-4 h-full">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${node.color} shadow-lg`}>
              <Icon className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{node.name}</div>
              <div className="text-xs text-gray-400">{node.description}</div>
            </div>
          </div>
          
        </div>
        
        {/* Connection points */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-400"></div>
        <div 
         onClick={(e) => {
                e.stopPropagation();
                onStartConnection(node);
              }}
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-yellow-500 rounded-full border-2 border-gray-300 cursor-pointer"></div>
        
        {/* Status indicator */}
        {node.status !== 'idle' && (
          <div className="absolute -top-2 -right-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              node.status === 'running' ? 'bg-yellow-400 animate-pulse' :
              node.status === 'success' || node.status === 'Success'? 'bg-green-400' : 'bg-red-400'
            }`}>
              {node.status === 'running' && <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>}
              {node.status === 'success' || node.status === 'Success' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              {node.status === 'error' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </div>
        )}
      </div>
      </div>
    );
  };

  export default NodeComponent