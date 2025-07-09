import React, { useState, useRef, useCallback } from 'react';
import { 
  Play,Save, Search, MoreHorizontal, ChevronRight, RotateCcw,
} from 'lucide-react';
import NodeFunction  from './util/util';
import NodeComponent from './components/nodes';
import RenderFormField from './components/PanelField';
import { nodeTypes,getNodeConfig } from './util/nodeArrays';

const N8NWorkflowPlatform = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('nodes');
  const [selectedNodeType, setSelectedNodeType] = useState('trigger');
  const [formData, setFormData] = useState({});
  
  // Pan and zoom states
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  const canvasRef = useRef(null);
  const nodeIdCounter = useRef(0);


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

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!draggedNode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / scale - 75;
    const y = (e.clientY - rect.top - canvasOffset.y) / scale - 40;

    const newNode = {
      id: `node-${nodeIdCounter.current++}`,
      type: draggedNode.id,
      name: draggedNode.name,
      icon: draggedNode.icon,
      color: draggedNode.color,
      x,
      y,
      config: getNodeConfig(draggedNode.id),
      status: 'idle'
    };

    console.log(newNode)
    
    setNodes(prev => [...prev, newNode]);
    setDraggedNode(null);
  };

  const handleNodeClick = (node) => {
    if (isConnecting) {
      if (connectionStart && connectionStart.id !== node.id) {
        const newConnection = {
          id: `conn-${Date.now()}`,
          from: connectionStart.id,
          to: node.id,
          fromX: connectionStart.x + 200,
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

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  };

  
  const updateNodePosition = (nodeId, x, y) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, x, y } : node
    ));
    
    setConnections(prev => prev.map(conn => {
      if (conn.from === nodeId) {
        return { ...conn, fromX: x + 200, fromY: y + 50};
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
    return nodes.filter(node => hasConnections(node.id));
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
    const executionOrder = [];
    
    const traverse = (nodeId) => {
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        executionOrder.push(node);
      }
      
      // Find all nodes that this node connects to
      const outgoingConnections = connections.filter(conn => conn.from === nodeId);
      outgoingConnections.forEach(conn => {
        traverse(conn.to);
      });
    };
    
    // Start traversal from all starting nodes
    startingNodes.forEach(node => traverse(node.id));
    
    return executionOrder;
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);
    
    // Get only connected nodes in proper execution order
    const executionOrder = getExecutionOrder();
    
    if (executionOrder.length === 0) {
      console.log("No connected nodes to execute");
      setIsExecuting(false);
      return;
    }
    
    console.log(`Executing ${executionOrder.length} connected nodes out of ${nodes.length} total nodes`);
    
    for (let i = 0; i < executionOrder.length; i++) {
      const node = executionOrder[i];
      
      // Set node status to running
      setNodes(prev => prev.map(n =>
        n.id === node.id ? { ...n, status: 'running' } : n
      ));
      
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 1000));

      let data = await NodeFunction(node,setNodes);
      
      console.log(data)

      // Set node status to success
      setNodes(prev => prev.map(n =>
        n.id === node.id ? { ...n, status: 'success' } : n
      ));
    }
    
    setIsExecuting(false);
  };
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    //setScale(prev => Math.min(Math.max(prev * delta, 0.3), 3));
  }, []);

  

  const ConnectionLine = ({ connection }) => {
    const path = `M ${connection.fromX * scale + canvasOffset.x} ${connection.fromY * scale + canvasOffset.y} 
                  C ${(connection.fromX + 50) * scale + canvasOffset.x} ${connection.fromY * scale + canvasOffset.y} 
                    ${(connection.toX - 50) * scale + canvasOffset.x} ${connection.toY * scale + canvasOffset.y} 
                    ${connection.toX * scale + canvasOffset.x} ${connection.toY * scale + canvasOffset.y}`;
    
    return (
      <g>
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
      </g>
    );
  };

  const handleNodeDrag = (id, pos) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => (node.id === id ? { ...node, ...pos } : node))
    );
  };

 // Handle save button click
  const handleSave = () => {
    if (!selectedNode) return;
    
    // Update the nodes array with the new configuration
    
    
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === selectedNode.id 
          ? { ...node, config: selectedNode.config, function:formData[selectedNode.id] }
          : node
      ));
    console.log(nodes)
    
    
    //setFormData({})

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
    <div className="flex h-screen bg-black text-white">
      

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-[#131313] h-screen overflow-y-auto shadow-xl border-r border-gray-700 transition-all duration-300 relative`}>
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className={`w-full flex items-center gap-2`}>
                        <div
                          key={nodeType.id}
                          className="flex w-full items-center space-x-3 p-3 bg-[#1c1c1c] rounded-lg border-1 border-gray-600 cursor-grab hover:bg-[#2a2a2a] transition-all duration-200 hover:border-yellow-500 group"
                          draggable
                          onDragStart={() => handleNodeDragStart(nodeType)}
                          
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${nodeType.color} shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-4 h-4 text-black" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{nodeType.name}</div>
                            <div className="text-xs text-gray-400">{nodeType.id}</div>
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
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all duration-200"
          >
            {isExecuting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
          </button>
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
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
        >
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1,width:window.innerWidth / scale + canvasOffset.x ,height:window.innerHeight + 50 * scale + canvasOffset.y}}>
            {connections.map((connection) => (
              <ConnectionLine key={connection.id} connection={connection} />
            ))}
            
            {isConnecting && connectionStart && (
              <path
                d={`M ${(connectionStart.x + 100) * scale + canvasOffset.x} ${(connectionStart.y + 50) * scale + canvasOffset.y} 
                    C ${(connectionStart.x + 150) * scale + canvasOffset.x} ${(connectionStart.y + 50) * scale + canvasOffset.y} 
                      ${mousePosition.x - 50} ${mousePosition.y} 
                      ${mousePosition.x} ${mousePosition.y}`}
                stroke="#3b82f6"
                strokeWidth={7 * scale}
                fill="none"
                strokeDasharray={`${5 * scale},${5 * scale}`}
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
              />
            ))}
          </div>
        </div>
      </div>

{/* Properties Panel */}
      {selectedNode && (
        <div className="w-96 bg-[#131313] shadow-xl border-l border-gray-700 overflow-y-auto h-full">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Node Settings</h3>
          </div>
          
          <div className="p-2 border-b border-gray-700">
          
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

              
                
        </div>
        <div  className={`flex gap-2 w-full items-center p-3`}>
                <button onClick={()=>{handleSave();}} className={`w-full p-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded-md`}>Save </button>
              </div>
        </div>
      )}

    </div>
  );
};






export default N8NWorkflowPlatform;