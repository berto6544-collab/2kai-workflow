import React, { useState, useRef, useCallback } from 'react';
import { 
  Play,Save, Search, MoreHorizontal, ChevronRight, RotateCcw,Trash,
  Pause
} from 'lucide-react';
import NodeFunction  from './util/util';
import NodeComponent from './components/nodes';
import RenderFormField from './components/PanelField';
import { nodeTypes,getNodeConfig } from './util/nodeArrays';
import { sleep } from './util/utilResponse';


const N8NWorkflowPlatform = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [panelStatus, setPanelStatus] = useState('parameter');
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('nodes');
  //const[executionOrder,setExecutionOrder] = useState([]);
  const [selectedNodeType, setSelectedNodeType] = useState('trigger');
  const [formData, setFormData] = useState({});
  const [isSavingg,setIsSaving] = useState(false);
  
  // Pan and zoom states
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  const canvasRef = useRef(null);
  const nodeIdCounter = useRef(0);
  let responses = null;
  let globalLoops = 0;
  let maxGlobalLoops = 3;
  let executionOrder = [];
  let shouldStop = false;
  const categories = [...new Set(nodeTypes.map(node => node.category))];

 



  const handleCanvasMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });

    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, panStart]);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedNode(null);
    }
  }, []);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleNodeDragStart = (nodeType) => {
    setDraggedNode(nodeType);
  };

  const handleCanvasDrop = async(e) => {
    e.preventDefault();
    if (!draggedNode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / scale - 75;
    const y = (e.clientY - rect.top - canvasOffset.y) / scale - 40;
    const randomString = Math.random().toString(36).substring(2, 10);
    if(draggedNode.id == "webhook"){
     

      const newNode = {
      id: `node-${nodeIdCounter.current++}`,
      type: draggedNode.id,
      name: draggedNode.name,
      icon: draggedNode.icon,
      color: draggedNode.color,
      path:randomString,
      x,
      y,
      config: getNodeConfig(draggedNode.id,randomString),
      description:draggedNode.description,
      status: 'idle'
    };
  

    console.log(newNode)
    
    setNodes(prev => [...prev, newNode]);
    
    const reg = await fetch("https://2kai-agent.com/app/register-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: randomString }),
    }).then(res=>res.json())
    console.log(reg);

    }else{
    const newNode = {
      id: `node-${nodeIdCounter.current++}`,
      type: draggedNode.id,
      name: draggedNode.name,
      icon: draggedNode.icon,
      color: draggedNode.color,
      path:null,
      x,
      y,
      config: getNodeConfig(draggedNode.id,randomString),
      description:draggedNode.description,
      status: 'idle'
    };
  

    console.log(newNode)
    
    setNodes(prev => [...prev, newNode]);
  }
    setDraggedNode(null);
  };

  const handleNodeClick = (node) => {
    if (isConnecting) {
      if (connectionStart && connectionStart.id !== node.id) {

        const newConnection = {
          id: `conn-${Date.now()}`,
          from: connectionStart.id,
          to: node.id,
          fromX: connectionStart.x + 250,
          fromY: connectionStart.y + 50,
          toX: node.x,
          toY: node.y + 50
        };
        setConnections(prev => [...prev, newConnection]);
        setIsConnecting(false);
        setConnectionStart(null);
        
      }
    } else {
      setSelectedNode(node);
     
    }
  };

  const startConnection = (node) => {
    setIsConnecting(true);
    setConnectionStart(node);
  };

  const deleteNode = async(nodeId,node) => {
    executionOrder.filter(n => n.id !== nodeId);
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    //executionOrder = await getExecutionOrder();
    setSelectedNode(null);
    const path = node.path;
    if(path != null){
     const data = await fetch('https://2kai-agent.com/app/webhook/'+path,{
        method:'DELETE'
      }).then(res =>res.json())
      console.log(data)
    }
    
    console.log(`Deleted ${nodeId} - ${executionOrder}`)
   
  };

  
  const updateNodePosition = (nodeId, x, y) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, x, y } : node
    ));
    
    setConnections(prev => prev.map(conn => {
      if (conn.from === nodeId) {
        return { ...conn, fromX: x + 250, fromY: y + 50};
      }
      if (conn.to === nodeId) {
        return { ...conn, toX: x, toY: y + 50 };
      }
      return conn;
    }));
  };

  
   // function to check if a node has any connections
  const hasConnections = (nodeId) => {
    return connections.some(conn => conn.from === nodeId || conn.to === nodeId);
  };

  // Get only nodes that are part of connections
  const getConnectedNodes = () => {
    const data = nodes.filter(node => hasConnections(node.id));
    console.log(data)
    return data
  };

  // Get execution order based on connections
  const getExecutionOrder = () => {
    const connectedNodes = getConnectedNodes();
    
    if (connectedNodes.length === 0) {
      return [];
    }

    // Find starting nodes (nodes with no incoming connections)
    const nodesWithIncoming = new Set(connections.map(conn => conn.to));
    const startingNodes = connectedNodes.filter(node => !nodesWithIncoming.has(node.id));
    
    const visited = new Set();
    const executionOrdder = [];
    
    const traverse = (nodeId) => {
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        executionOrdder.push(node);
        
 
      }
      
      // Find all nodes that this node connects to
      const outgoingConnections = connections.filter(conn => conn.from === nodeId);
      outgoingConnections.forEach(conn => {
        traverse(conn.to);
      });
    };
    
    // Start traversal from all starting nodes
    startingNodes.forEach(node => traverse(node.id));
    //executionOrder = executionOrdder;
    return executionOrdder;
  };





async function handleLoopNode(node, data, connections, executionOrder, setNodes) {
  console.log(`Node ${node.id} is a loop node`);
  
  // Find what this loop node is connected to
  const loopConnection = connections.find(conn => conn.from === node.id);
  
  if (!loopConnection) {
    console.log(`Loop node ${node.id} has no valid loop connection, continuing normally`);
    return { shouldLoop: false, targetIndex: -1 };
  }
  
  const loopTargetNodeId = loopConnection.to;
  const loopTargetIndex = executionOrder.findIndex(nodeId => nodeId.id == loopTargetNodeId);
  console.log('loop: ',loopTargetNodeId)
  
  if (loopTargetIndex === -1) {
    console.log(`Loop target node ${loopTargetNodeId} not found in execution order`);
    return { shouldLoop: false, targetIndex: -1 };
  }
  
  // Handle loop counter logic
  let shouldContinueLoop = false;
  // Initialize max loops if not set
    if (data.iterations) {
      maxGlobalLoops = data.iterations;
    }else{
     maxGlobalLoops = 3;
    }


  if (maxGlobalLoops) {
    
    
    // Check if we should continue looping
    if (globalLoops < maxGlobalLoops) {
      globalLoops++;
      shouldContinueLoop = true;

      console.log(`Loop ${node.id}: iteration ${globalLoops}/${maxGlobalLoops}`);
    } else {
      // Reset counters when loop is complete
      shouldContinueLoop = false;
      globalLoops = 0;
      //maxGlobalLoops = 0;
      
      console.log(`Loop ${node.id}: completed all iterations`);
    }
  } else {
    // If no iterations specified, loop indefinitely (be careful with this!)
    maxGlobalLoops = 3;
    shouldContinueLoop = true;
    console.log(`Loop ${node.id}: no iteration limit specified`);
  }
  
  // Set loop node status
  const status = shouldContinueLoop ? 'success' : 'completed';
  setNodes(prev =>
    prev.map(n => (n.id === node.id ? { ...n, status } : n))
  );
  
  if (shouldContinueLoop) {
    console.log(`Loop node ${node.id} jumping back to ${loopTargetNodeId} at index ${loopTargetIndex}`);
    return { shouldLoop: true, targetIndex: loopTargetIndex };
  } else {
    console.log(`Loop node ${node.id} has completed, continuing to next node`);
    return { shouldLoop: false, targetIndex: -1 };
  }
}


  
// Helper function to find connections to Success/Failed nodes
const findConditionalConnections = (node, connections,data,isNodeFailure) => {
  const nodeConnections = connections.filter(conn => conn.from === node.id);
  
const successConnection = nodeConnections.find(conn => {
  const targetNode = nodes.find(n => n.id === conn.to);
  return targetNode && (
    // Node has Success status
    (targetNode.function && targetNode.function.status_type === "Success") ||
    // Node is complete (not failed) and not an "if" type
    (!isNodeFailure && targetNode.type !== "if")
  );
});

const failedConnection = nodeConnections.find(conn => {
  const targetNode = nodes.find(n => n.id === conn.to);
  return targetNode && (
    // Node has Failed status
    (targetNode.function && targetNode.function.status_type === "Failed") ||
    // Node is failed and is an "if" type
    (isNodeFailure && targetNode.type === "if")
  );
});
  
  return { successConnection, failedConnection };
};

// Helper function to check if node should route to success (is "green")
const isNodeGreen = (node, data) => {
  // Multiple conditions to determine if node is "green"/successful
  return (
    data?.success === true ||
    data?.completed === true ||
    data?.status === 'success'
  );
};




// Helper function to get next node based on conditional routing
const getConditionalNextNode = (currentNode, data, connections, executionOrder,isNodeFailure) => {
  const { successConnection, failedConnection } = findConditionalConnections(currentNode, connections,data,isNodeFailure);
  
  if (!successConnection && !failedConnection) {
    return null; // No conditional routing needed
  }
  
  const isGreen = isNodeGreen(currentNode, data);
  const targetConnection = isGreen ? successConnection : failedConnection;
  console.log('success: ',JSON.stringify(successConnection)+' else error: '+JSON.stringify(failedConnection))
  if (targetConnection) {
    // Find the target node in execution order
    const targetNodeIndex = executionOrder.findIndex(node => node.id === targetConnection.to);
    return targetNodeIndex !== -1 ? targetNodeIndex : null;
  }
  
  return null;
};

const executeWorkflow = async () => {
  shouldStop = false;
  await setIsExecuting(true);
  
  setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
  executionOrder = await getExecutionOrder();
  
  //await sleep(1000)
  //console.log('execution: ', executionOrder)
  
  if (executionOrder.length === 0) {
    console.log("No connected nodes to execute");
    setIsExecuting(false);
    return;
  }
 
  let i = 0;
 
  let executionContext = {};
 
  while (i < executionOrder.length && globalLoops < maxGlobalLoops) {
    
    
   

    
    
    const node = executionOrder[i];
   


    setNodes(prev =>
      prev.map(n => (n.id === node.id ? { ...n, status: 'running' } : n))
    );
   
    
   await sleep(1000)
    // Execute the node function
    const data = await NodeFunction(node, setNodes, setIsExecuting);
    console.log(`Node ${node.id} returned:`, data);
   
    // Store the result in execution context
    executionContext[node.id] = data;
   
    // Check if node failed
    const isNodeFailure = data?.success === false || data?.completed == false || data == null || data === "failed";
    
   
  if (isNodeFailure) {
     
    } else {
       setNodes(prev =>
        prev.map(n => (n.id === node.id ? { ...n, status: 'success' } : n))
      );
    }

    if (shouldStop) {
        i = executionOrder.length; // or globalLoops = maxGlobalLoops;
        //i++;
        //globalLoops++;
        break; 
    }

    

    // Check for conditional routing first
const conditionalNextIndex = getConditionalNextNode(node, data, connections, executionOrder, isNodeFailure);

if (conditionalNextIndex !== null) {
  console.log(`Node ${node.id} has conditional routing, jumping to index ${conditionalNextIndex}`);
 
  // Set current node status based on condition
  const finalStatus = isNodeGreen(node, data) ? 'success' : 'error';
  setNodes(prev =>
    prev.map(n => (n.id === node.id ? { ...n, status: finalStatus } : n))
  );
 
  // Jump to the conditional target
  i = conditionalNextIndex;
  continue;
}



// Usage in your main execution loop:
//if (node.type === 'loop') {
  const loopResult = await handleLoopNode(node, data, connections, executionOrder, setNodes);
  
  if (loopResult.shouldLoop) {
    // Jump back to the loop target
    i = loopResult.targetIndex;
    continue;
  }else{
  // If not looping, continue with normal execution flow
//}else{


  
   

    // Check if current node has outgoing connections
    const hasOutgoingConnections = connections.some(conn => conn.from === node.id);
    
    if (!hasOutgoingConnections) {
      console.log(`Node ${node.id} has no outgoing connections, stopping execution`);
      
      // Set final status for the current node
      const finalStatus = isNodeFailure ? 'error' : 'success';
      setNodes(prev =>
        prev.map(n => (n.id === node.id ? { ...n, status: finalStatus } : n))
      );
      
      // Stop execution here
      break;
    }
   
    // Set final status based on result
    const finalStatus = isNodeFailure ? 'error' : 'success';
    setNodes(prev =>
      prev.map(n => (n.id === node.id ? { ...n, status: finalStatus } : n))
    );
   
    i++;
  }


  
}
 

  setIsExecuting(false);
  //shouldStop = true;
};

const stopExecution = () => {
  shouldStop = true;
  executionOrder = [];
  setIsExecuting(false);
  return shouldStop;
};

const executeWorkflowFromNode = async (selectedNodeId = null) => {
   shouldStop = false;
  setIsExecuting(true);
  
  setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
  executionOrder = await getExecutionOrder();
 
 
  if (executionOrder.length === 0) {
    console.log("No connected nodes to execute");
    setIsExecuting(false);
    return;
  }

  // Find starting index based on selected node
  let startIndex = 0;
  if (selectedNodeId) {
    const nodeIndex = executionOrder.findIndex(node => node.id === selectedNodeId);
    if (nodeIndex !== -1) {
      startIndex = nodeIndex;
      console.log(`Starting execution from node ${selectedNodeId} at index ${startIndex}`);
    } else {
      console.log(`Selected node ${selectedNodeId} not found in execution order`);
      setIsExecuting(false);
      return;
    }
  }
 
  let i = startIndex; // Start from selected node
  let executionContext = {};
 
  while (i < executionOrder.length && globalLoops < maxGlobalLoops) {
    const node = executionOrder[i];
   
    setNodes(prev =>
      prev.map(n => (n.id === node.id ? { ...n, status: 'running' } : n))
    );

    if (shouldStop) {
   // i = executionOrder.length; // or globalLoops = maxGlobalLoops;
    break; // optional, but cleaner
   }
    
   
    await sleep(1000)
   
    // Execute the node function
    const data = await NodeFunction(node, setNodes, setIsExecuting);
    console.log(`Node ${node.id} returned:`, data);
   
    // Store the result in execution context
    executionContext[node.id] = data;
   
    // Check if node failed
    const isNodeFailure = data?.success === false || data?.completed == false || data?.triggered == false || data == null || data === "failed";
   
    
   
    // Check for conditional routing first
    const conditionalNextIndex = getConditionalNextNode(node, data, connections, executionOrder,isNodeFailure);
   
    if (conditionalNextIndex !== null) {
      console.log(`Node ${node.id} has conditional routing, jumping to index ${conditionalNextIndex}`);
     
      // Set current node status based on condition
      const finalStatus = isNodeGreen(node, data) ? 'success' : 'error';
      setNodes(prev =>
        prev.map(n => (n.id === node.id ? { ...n, status: finalStatus } : n))
      );
     
      // Jump to the conditional target
      i = conditionalNextIndex;
      continue;
    }
   
 // Usage in your main execution loop:
//if (node.type === 'loop') {
  const loopResult = await handleLoopNode(node, data, connections, executionOrder, setNodes);
  
  if (loopResult.shouldLoop) {
    // Jump back to the loop target
    i = loopResult.targetIndex;
    continue;
  //}
  // If not looping, continue with normal execution flow
}else{

    
   
    // Check if current node has outgoing connections
    const hasOutgoingConnections = connections.some(conn => conn.from === node.id);
   
    if (!hasOutgoingConnections) {
      console.log(`Node ${node.id} has no outgoing connections, stopping execution`);
     
      // Set final status for the current node
      const finalStatus = isNodeFailure ? 'error' : 'success';
      setNodes(prev =>
        prev.map(n => (n.id === node.id ? { ...n, status: finalStatus } : n))
      );
     
      // Stop execution here
      break;
    }
   
    // Set final status based on result
    const finalStatus = isNodeFailure ? 'error' : 'success';
    setNodes(prev =>
      prev.map(n => (n.id === node.id ? { ...n, status: finalStatus } : n))
    );
   
    i++;
  }
}
 
  setIsExecuting(false);
  //shouldStop = true
};




  const deleteConnection = (connectionToDelete) => {
  // Remove the connection from the connections array
  setConnections(prev => prev.filter(conn => 
    !(conn.fromX === connectionToDelete.fromX && 
      conn.fromY === connectionToDelete.fromY && 
      conn.toX === connectionToDelete.toX && 
      conn.toY === connectionToDelete.toY)
  ));
  
  //Updating node statuses back to 'idle' if they were part of execution chain
 setNodes(prev => prev.map(node => ({
    ...node,
   status: 'idle'
  })));
  
  
};






  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    //setScale(prev => Math.min(Math.max(prev * delta, 0.3), 3));
  }, []);

  

  const ConnectionLine = ({ connection, onDelete }) => {
    const path = `M ${connection.fromX * scale + canvasOffset.x} ${connection.fromY * scale + canvasOffset.y}
                  C ${(connection.fromX + 50) * scale + canvasOffset.x} ${connection.fromY * scale + canvasOffset.y}
                    ${(connection.toX - 50) * scale + canvasOffset.x} ${connection.toY * scale + canvasOffset.y}
                    ${connection.toX * scale + canvasOffset.x} ${connection.toY * scale + canvasOffset.y}`;
   
    // Calculate the midpoint of the connection line
    const midX = ((connection.fromX + connection.toX) / 2) * scale + canvasOffset.x;
    const midY = ((connection.fromY + connection.toY) / 2) * scale + canvasOffset.y;
    
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(connection);
        }
    };
   
    return (
        <g >
          
            <path
                d={path}
                stroke="#4b5563"
                strokeWidth={2 * scale}
                fill="none"
                className="pointer-events-none"
            />
           
            <circle
                cx={connection.toX * scale + canvasOffset.x}
                cy={connection.toY * scale + canvasOffset.y}
                r={4 * scale}
                fill="#3b82f6"
                className="pointer-events-none"
            />
            
            {/* Delete button background circle */}
            
            <circle
                cx={midX}
                cy={midY}
                r={12 * scale}
                fill="#ef4444"
                stroke="#4b5563"
                className="cursor-pointer hover:fill-red-600 transition-colors"
                style={{ pointerEvents: "all" }}
                onClick={(e)=>{handleDeleteClick(e)}}
            />
            
            {/* Trash/bin icon */}
            <g transform={`translate(${midX - 7 * scale}, ${midY - 10 * scale}) scale(${scale})`}>
                <path
                    d="M3 6v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V6H3zm2.5 9c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5zm2 0c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5zm2 0c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5zM10.5 4L10 3.5C9.89 3.39 9.78 3.33 9.67 3.29L9.33 3.29C9.22 3.33 9.11 3.39 9 3.5L8.5 4H5.5C5.22 4 5 4.22 5 4.5S5.22 5 5.5 5H12.5C12.78 5 13 4.78 13 4.5S12.78 4 12.5 4H10.5z"
                    fill="white"
                    style={{ pointerEvents: "none" }}
                />
            </g>
        </g>
    );
};

  const handleNodeDrag = (id, pos) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => (node.id === id ? { ...node, ...pos } : node))
    );
  };



 // Handle save button click
  const handleSave = async(e) => {
    e.preventDefault();
    if (!selectedNode) return;
    
    setIsSaving(true)
    
    // Update the nodes array with the new configuration
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === selectedNode.id 
          ? { ...node, config: selectedNode.config, function:formData[selectedNode.id] }
          : node
      ));
    console.log(nodes)

    await sleep(400)
    
 setIsSaving(false)
    

    // Optional: Show success message or close panel
    //alert('Configuration saved successfully!');
  };


    const handleFieldChange = (fieldKey, value) => {
    if (!selectedNode) return;
    
    setFormData(prev => ({
      ...prev,
      [selectedNode.id]: {
        ...prev[selectedNode.id],
        [fieldKey]: value
      }
    }));
  };


  const handleOnChange = (fieldKey, value) => {
    if (!selectedNode) return;
    
   setNodes((prevNodes) =>
   prevNodes.map((node) => 
    node.id === selectedNode.id 
      ? { ...node, [fieldKey]: value } 
      : node 
  )); 
  };


    const handleNode = (node) => {
    setSelectedNode(node);
    
    // Initialize form data with existing values or defaults
    const initialFormData = {};
    node.config.forEach(field => {
      initialFormData[field.name] = formData[node.id]?.[field.name] || field.value || '';
    });
    
    setFormData(prev => ({
      ...prev,
      [node.id]: node.config
    }));
  };

  return (
    <div className="flex h-screen w-full bg-black text-white">
      

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-[#131313] h-screen overflow-y-auto shadow-xl border-r border-gray-700 relative`}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute right-2 top-4 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
        </button>
        
        {!sidebarCollapsed && (
          <>
            <div className="p-4 border-b border-gray-700">
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setActiveTab('nodes')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'nodes' ? 'bg-yellow-600 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Nodes
                </button>
                <button
                  onClick={() => setActiveTab('credentials')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'credentials' ? 'bg-yellow-600 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  Credentials
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  className="w-full pl-10 pr-4 py-2 bg-[#242121] border-1 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {nodeTypes.filter(node => node.category === category).map((nodeType) => {
                      const Icon = nodeType.icon;
                      return (
                        <div className={`w-full flex items-center gap-2 group`}>
                        <div
                          key={nodeType.id}
                          className="flex w-full items-center space-x-3 p-3  rounded-lg  cursor-grab hover:bg-[#2a2a2a] transition-all duration-200 hover:border-yellow-500"
                          draggable
                          onDragStart={() => handleNodeDragStart(nodeType)}
                          
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${nodeType.color} shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-4 h-4 text-black" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{nodeType.name}</div>
                            <div className="text-xs text-gray-400">{nodeType.description}</div>
                          </div>
                        
                        {/*<button className={'text-gray-50 hover:text-yellow-500'} onClick={(e)=>{
                          e.stopPropagation()
                          handleNodeDragStart(nodeType)

                        }}><Plus /></button>*/}
                        </div>
                      

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Header */}
      <div className="sticky top-0 left-0 right-0 h-16 bg-black flex items-center justify-between px-6 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            
            <span className="text-xl font-bold">2kai</span>
          </div>
          <div className="h-6 w-px bg-gray-600"></div>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent text-lg font-medium focus:outline-none focus:bg-gray-700 px-2 py-1 rounded"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Zoom: {Math.round(scale * 100)}%
          </div>
          <button
            onClick={executeWorkflow}
            disabled={isExecuting || nodes.length === 0}
            className="flex items-center cursor-pointer space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all duration-200"
          >
            {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
          </button>
          {isExecuting?<button
            tabIndex={0}
            onClick={()=>{
            executionOrder = [];
            shouldStop = true;
            setIsExecuting(false)
            stopExecution()
            
            
            }}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 cursor-pointer  px-4 py-2 rounded-lg transition-all duration-200"
          >
            {<Pause className="w-4 h-4" />}
            
          </button>:null}
          
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Save className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
        <div className="absolute top-20 left-4 z-10">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                isConnecting 
                  ? 'bg-yellow-600 text-black shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
              onClick={() => {
                setIsConnecting(!isConnecting);
                setConnectionStart(null);
              }}
            >
              {isConnecting ? 'Cancel Connection' : 'Connect Nodes'}
            </button>
            <button
              className="px-3 py-2 text-sm rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              onClick={() => {
                setNodes([]);
                setConnections([]);
                setSelectedNode(null);
              }}
            >
              Clear Canvas
            </button>
            <button
              className="px-3 py-2 text-sm rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              onClick={() => {
                setCanvasOffset({ x: 0, y: 0 });
                setScale(1);
              }}
            >
              Reset View
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-50 rounded-lg p-2 text-xs text-gray-300">
          <div>Mouse: Pan canvas</div>
          <div>Hold + Drag: Move nodes</div>
          <div>Scroll: Zoom in/out</div>
        </div>

        <div
          ref={canvasRef}
          className="w-full h-full relative bg-black cursor-grab"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(17, 17, 17) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(17, 17, 17) 1px, transparent 1px)
            `,
            backgroundSize: `${25}px ${25}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
            cursor: isPanning ? 'grabbing' : 'grab',
            width:'100%'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}

        >
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1,width:window.innerWidth + 50 * scale ,height:window.innerHeight + 50 * scale}}>
            {connections.map((connection) => (
              <ConnectionLine key={connection.id} onDelete={deleteConnection} connection={connection} />
            ))}
            
            {isConnecting && connectionStart && (
              <path
                d={`M ${(connectionStart.x + 250) * scale + canvasOffset.x} ${(connectionStart.y + 50) * scale + canvasOffset.y} 
                    C ${(connectionStart.x + 150) * scale + canvasOffset.x} ${(connectionStart.y + 50) * scale + canvasOffset.y} 
                      ${mousePosition.x - 50} ${mousePosition.y} 
                      ${mousePosition.x} ${mousePosition.y}`}
                stroke="#f0b100"
                strokeWidth={3 * scale}
                fill="none"
                className="pointer-events-none"
              />
            )}
          </svg>

          <div
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
              transformOrigin: 'top left'
            }}
          >
            {nodes.map((node) => (
              <NodeComponent
                key={node.id}
                node={node}
                canvasRef={canvasRef}
                canvasOffset={canvasOffset}
                scale={scale}
                updateNodePosition={updateNodePosition}
                selectedNode={selectedNode}
                handleNodeDrag={handleNodeDrag}
                onNodeClick={handleNodeClick}
                handleNode={handleNode}
                onStartConnection={startConnection}
                onDelete={deleteNode}
                executeWorkflowFromNode={executeWorkflowFromNode}
              />
            ))}
          </div>
        </div>
      </div>

{/* Properties Panel */}
      {selectedNode && (
        <div className="w-96 bg-[#131313] shadow-xl border-l border-gray-700 overflow-y-auto h-full">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Node Settings</h3>
          <div className="flex w-full gap-2">
            <button onClick={()=>{setPanelStatus('parameter')}} className={`p-2 px-4 rounded-md w-full cursor-pointer ${panelStatus == "parameter"?'bg-yellow-600 text-black':'hover:bg-yellow-500 bg-transparent text-gray-400 hover:text-black'}`}>Parameters</button>
            <button onClick={()=>{setPanelStatus('settings')}} className={`p-2 px-4 rounded-md w-full cursor-pointer ${panelStatus == "settings"?'bg-yellow-600 text-black':'hover:bg-yellow-500 bg-transparent text-gray-400 hover:text-black'}`}>Settings</button>
          
          </div>
          
          </div>
          

          {panelStatus == "parameter"?<div className="p-2">
          
          {selectedNode!= null && selectedNode?.config.map((field)=>(<RenderFormField selectedNode={selectedNode != null?selectedNode:null} handleFieldChange={handleFieldChange} field={field} formData={formData} />))}
          


          {formData[selectedNode.id] && Object.keys(formData[selectedNode.id]).length > 0 && (
                  <div className="border-t border-gray-800 p-2 pt-6">
                    <h3 className="text-lg font-medium text-gray-100 mb-4">Current Configuration</h3>
                    <div className="bg-[#242121] rounded-md p-4">
                      <pre className="text-sm text-gray-200 overflow-x-auto">
                        {JSON.stringify(formData[selectedNode.id], null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

              
                
        </div>:null}

         {panelStatus == "settings"?<div className="p-2">

          <div className="py-2 px-2 flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">Node name</label>
            <input
              type="text"
              value={selectedNode.name}
              onChange={(e) => {
                handleOnChange('name', e.target.value)
                selectedNode.name = e.target.value
                //console.log('selected',selectedNode.name)
              }}
              
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
         
         <div  className="py-2 px-2 flex flex-col items-start gap-2">
            <label className="block text-sm font-medium text-gray-100">Notes</label>
            <textarea
              value={selectedNode.note}
              onChange={(e) =>{
                handleOnChange('note', e.target.value)
                selectedNode.note = e.target.value
                //console.log('selected',selectedNode.description)
              }}
              placeholder={'write notes'}
              rows={4}
              className="w-full px-3 py-2 border-1 border-gray-800 bg-[#242121] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

         </div>:null}

        <div tabIndex={0} className={`flex gap-2 w-full items-center p-3`}>
                <button tabIndex={0} onClick={handleSave} className={`w-full p-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-md cursor-pointer disabled:bg-yellow-700`}>{isSavingg?'Saving...':'Save'}</button>
              </div>
        </div>
      )}

    </div>
  );
};






export default N8NWorkflowPlatform;