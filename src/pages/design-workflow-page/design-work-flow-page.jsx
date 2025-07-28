import React, { useState, useRef, useCallback, useEffect } from 'react';
import {  
  Settings, 
  FileCode, 
  Zap,
  Trash2,
  Copy,
  Download,
  Workflow,
  GitBranch,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

import * as Icons from "lucide-react";

const AppBuilderWorkflow = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionMode, setConnectionMode] = useState(false);
  const [sourceNode, setSourceNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [generationSteps, setGenerationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const canvasRef = useRef(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [appMetadata, setAppMetadata] = useState({
    name: '',
    description: '',
    techStack: [],
    estimatedTime: '',
    complexity: ''
  });
  
  // Canvas panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Enhanced node types with more detailed configurations
  const nodeTypes = {
    // Frontend Nodes
    frontend: {
      icon: 'Monitor',
      color: 'bg-blue-500',
      name: 'Frontend App',
      category: 'Frontend',
      description: 'User interface and client-side logic',
      inputs: ['api_data', 'auth_state', 'user_events'],
      outputs: ['user_actions', 'form_data', 'navigation'],
      ports: { input: 2, output: 3 }
    },
    mobile: {
      icon: 'Smartphone',
      color: 'bg-purple-500',
      name: 'Mobile App',
      category: 'Frontend',
      description: 'Native or hybrid mobile application',
      inputs: ['api_data', 'push_notifications'],
      outputs: ['user_actions', 'device_data'],
      ports: { input: 2, output: 2 }
    },
    
    // Backend Nodes
    api: {
      icon: 'Server',
      color: 'bg-green-500',
      name: 'API Gateway',
      category: 'Backend',
      description: 'REST/GraphQL API endpoints',
      inputs: ['requests', 'auth_tokens'],
      outputs: ['responses', 'logs', 'metrics'],
      ports: { input: 2, output: 3 }
    },
    microservice: {
      icon: 'Layers',
      color: 'bg-indigo-500',
      name: 'Microservice',
      category: 'Backend',
      description: 'Isolated service component',
      inputs: ['service_requests', 'config'],
      outputs: ['service_response', 'events'],
      ports: { input: 2, output: 2 }
    },
    
    // Database Nodes
    database: {
      icon: 'Database',
      color: 'bg-orange-500',
      name: 'Database',
      category: 'Data',
      description: 'Data storage and management',
      inputs: ['queries', 'transactions'],
      outputs: ['data', 'status', 'metrics'],
      ports: { input: 2, output: 3 }
    },
    cache: {
      icon: 'Cpu',
      color: 'bg-red-500',
      name: 'Cache Layer',
      category: 'Data',
      description: 'In-memory data caching',
      inputs: ['cache_keys', 'data'],
      outputs: ['cached_data', 'cache_stats'],
      ports: { input: 2, output: 2 }
    },
    
    // Auth & Security
    auth: {
      icon: 'Shield',
      color: 'bg-emerald-500',
      name: 'Authentication',
      category: 'Security',
      description: 'User authentication and authorization',
      inputs: ['credentials', 'tokens'],
      outputs: ['auth_state', 'user_profile', 'permissions'],
      ports: { input: 2, output: 3 }
    },
    security: {
      icon: 'Lock',
      color: 'bg-gray-700',
      name: 'Security Layer',
      category: 'Security',
      description: 'Security monitoring and protection',
      inputs: ['requests', 'user_actions'],
      outputs: ['security_events', 'blocked_requests'],
      ports: { input: 2, output: 2 }
    },
    
    // External Services
    payment: {
      icon: 'CreditCard',
      color: 'bg-yellow-500',
      name: 'Payment Gateway',
      category: 'External',
      description: 'Payment processing service',
      inputs: ['payment_data', 'webhooks'],
      outputs: ['transactions', 'receipts', 'refunds'],
      ports: { input: 2, output: 3 }
    },
    email: {
      icon: 'Mail',
      color: 'bg-pink-500',
      name: 'Email Service',
      category: 'External',
      description: 'Email notifications and communication',
      inputs: ['templates', 'recipients', 'triggers'],
      outputs: ['sent_emails', 'delivery_status'],
      ports: { input: 3, output: 2 }
    },
    storage: {
      icon: "HardDrive",
      color: 'bg-teal-500',
      name: 'File Storage',
      category: 'External',
      description: 'Cloud file storage service',
      inputs: ['files', 'metadata'],
      outputs: ['file_urls', 'storage_metrics'],
      ports: { input: 2, output: 2 }
    },
    
    // Analytics & Monitoring
    analytics: {
      icon: "BarChart3",
      color: 'bg-violet-500',
      name: 'Analytics Engine',
      category: 'Analytics',
      description: 'Data analytics and insights',
      inputs: ['events', 'user_data', 'metrics'],
      outputs: ['reports', 'insights', 'alerts'],
      ports: { input: 3, output: 3 }
    },
    monitoring: {
      icon: "Eye",
      color: 'bg-cyan-500',
      name: 'Monitoring',
      category: 'Analytics',
      description: 'System monitoring and alerting',
      inputs: ['system_metrics', 'logs'],
      outputs: ['alerts', 'dashboards'],
      ports: { input: 2, output: 2 }
    },
    
    // Communication
    notifications: {
      icon: "Bell",
      color: 'bg-amber-500',
      name: 'Notification Hub',
      category: 'Communication',
      description: 'Multi-channel notifications',
      inputs: ['messages', 'user_preferences'],
      outputs: ['delivered_notifications', 'engagement_metrics'],
      ports: { input: 2, output: 2 }
    },
    websocket: {
      icon: "Network",
      color: 'bg-lime-500',
      name: 'Real-time Engine',
      category: 'Communication',
      description: 'WebSocket real-time communication',
      inputs: ['events', 'client_connections'],
      outputs: ['real_time_updates', 'connection_status'],
      ports: { input: 2, output: 2 }
    },
    
    // AI & ML
    ai_service: {
      icon: "Zap",
      color: 'bg-fuchsia-500',
      name: 'AI Service',
      category: 'AI/ML',
      description: 'Machine learning and AI processing',
      inputs: ['training_data', 'inference_requests'],
      outputs: ['predictions', 'model_metrics'],
      ports: { input: 2, output: 2 }
    },
    
    // DevOps
    deployment: {
      icon: "Cloud",
      color: 'bg-slate-500',
      name: 'Deployment',
      category: 'DevOps',
      description: 'Application deployment and hosting',
      inputs: ['build_artifacts', 'config'],
      outputs: ['deployment_status', 'health_checks'],
      ports: { input: 2, output: 2 }
    }
  };

  // Canvas panning handlers
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.closest('.canvas-background')) {
      const rect = canvasRef.current.getBoundingClientRect();
      setIsPanning(true);
      setPanStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanning) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      setPanOffset({
        x: panOffset.x + (currentX - panStart.x),
        y: panOffset.y + (currentY - panStart.y)
      });
      
      setPanStart({ x: currentX, y: currentY });
    }
  }, [isPanning, panStart, panOffset]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Add canvas event listeners
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  // Enhanced prompt parsing with more sophisticated logic
  const generateNodesFromPrompt = (userPrompt) => {
    const generatedNodes = [];
    const generatedConnections = [];
    let nodeId = 1;
    
    const promptLower = userPrompt.toLowerCase();
    
    // Determine app metadata
    const metadata = analyzePrompt(promptLower);
    setAppMetadata(metadata);
    
    // Generation steps for better UX
    const steps = [
      'Analyzing requirements...',
      'Designing architecture...',
      'Creating core services...',
      'Setting up data layer...',
      'Configuring security...',
      'Adding integrations...',
      'Optimizing connections...',
      'Finalizing workflow...'
    ];
    setGenerationSteps(steps);
    
    // Smart node positioning with better layout
    const layout = calculateOptimalLayout(promptLower);
    
    // Always include core architectural components
    const coreNodes = createCoreNodes(promptLower, nodeId, layout);
    generatedNodes.push(...coreNodes.nodes);
    nodeId = coreNodes.nextId;
    
    // Add feature-specific nodes based on prompt analysis
    const featureNodes = createFeatureNodes(promptLower, nodeId, layout);
    generatedNodes.push(...featureNodes.nodes);
    nodeId = featureNodes.nextId;
    
    // Add integration nodes
    const integrationNodes = createIntegrationNodes(promptLower, nodeId, layout);
    generatedNodes.push(...integrationNodes.nodes);
    
    // Generate intelligent connections
    const intelligentConnections = createIntelligentConnections(generatedNodes);
    generatedConnections.push(...intelligentConnections);
    
    return { nodes: generatedNodes, connections: generatedConnections };
  };

  const analyzePrompt = (prompt) => {
    let name = 'My App';
    let description = 'A custom application';
    let techStack = ['React', 'Node.js', 'PostgreSQL'];
    let estimatedTime = '4-6 weeks';
    let complexity = 'Medium';
    
    // Extract app name from common patterns
    const namePatterns = [
      /create (?:a |an )?(.+?) (?:app|application|platform|system)/i,
      /build (?:a |an )?(.+?) (?:app|application|platform|system)/i,
      /develop (?:a |an )?(.+?) (?:app|application|platform|system)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = prompt.match(pattern);
      if (match) {
        name = match[1].charAt(0).toUpperCase() + match[1].slice(1) + ' App';
        break;
      }
    }
    
    // Determine tech stack based on requirements
    if (prompt.includes('react native') || prompt.includes('mobile')) {
      techStack.push('React Native');
    }
    if (prompt.includes('graphql')) {
      techStack.push('GraphQL');
    }
    if (prompt.includes('mongodb') || prompt.includes('nosql')) {
      techStack = techStack.filter(t => t !== 'PostgreSQL');
      techStack.push('MongoDB');
    }
    if (prompt.includes('ai') || prompt.includes('ml') || prompt.includes('machine learning')) {
      techStack.push('TensorFlow', 'Python');
    }
    
    // Estimate complexity
    const complexityFactors = [
      prompt.includes('real-time'),
      prompt.includes('payment'),
      prompt.includes('ai') || prompt.includes('ml'),
      prompt.includes('analytics'),
      prompt.includes('social'),
      prompt.includes('multi-tenant'),
      prompt.includes('scale') || prompt.includes('enterprise')
    ];
    
    const complexityScore = complexityFactors.filter(Boolean).length;
    if (complexityScore <= 2) {
      complexity = 'Simple';
      estimatedTime = '2-4 weeks';
    } else if (complexityScore <= 4) {
      complexity = 'Medium';
      estimatedTime = '4-8 weeks';
    } else {
      complexity = 'Complex';
      estimatedTime = '8-16 weeks';
    }
    
    return { name, description: prompt, techStack, estimatedTime, complexity };
  };

  const calculateOptimalLayout = (prompt) => {
    // Create a more sophisticated layout based on app type
    const basePositions = {
      // Frontend layer
      frontend: { x: 100, y: 100 },
      mobile: { x: 100, y: 300 },
      
      // API Gateway layer
      api: { x: 400, y: 200 },
      
      // Business logic layer
      microservice: { x: 700, y: 150 },
      ai_service: { x: 700, y: 350 },
      
      // Data layer
      database: { x: 1000, y: 200 },
      cache: { x: 1000, y: 350 },
      
      // Security layer
      auth: { x: 400, y: 50 },
      security: { x: 700, y: 50 },
      
      // External services
      payment: { x: 400, y: 450 },
      email: { x: 700, y: 450 },
      storage: { x: 1000, y: 450 },
      
      // Analytics & monitoring
      analytics: { x: 1300, y: 150 },
      monitoring: { x: 1300, y: 300 },
      
      // Communication
      notifications: { x: 400, y: 350 },
      websocket: { x: 700, y: 250 },
      
      // DevOps
      deployment: { x: 100, y: 500 }
    };
    
    return basePositions;
  };

  const createCoreNodes = (prompt, startId, layout) => {
    const nodes = [];
    let nodeId = startId;
    
    // Always include frontend
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'frontend',
      position: layout.frontend,
      data: {
        label: 'Web Application',
        config: {
          framework: prompt.includes('vue') ? 'Vue.js' : prompt.includes('angular') ? 'Angular' : 'React',
          styling: prompt.includes('bootstrap') ? 'Bootstrap' : 'Tailwind CSS',
          features: extractUIFeatures(prompt),
          routing: 'React Router',
          state: 'Redux Toolkit'
        }
      }
    });
    
    // API Gateway
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'api',
      position: layout.api,
      data: {
        label: 'API Gateway',
        config: {
          type: prompt.includes('graphql') ? 'GraphQL' : 'REST API',
          framework: 'Express.js',
          middleware: 'CORS, Rate limiting, Compression',
          documentation: 'Auto-generated OpenAPI/Swagger',
          endpoints: extractEndpoints(prompt),
          validation: 'Joi/Yup schemas'
        }
      }
    });
    
    // Database
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'database',
      position: layout.database,
      data: {
        label: 'Primary Database',
        config: {
          type: prompt.includes('mongodb') || prompt.includes('nosql') ? 'MongoDB' : 'PostgreSQL',
          orm: prompt.includes('mongodb') ? 'Mongoose' : 'Prisma',
          schema: extractDatabaseSchema(prompt),
          indexing: 'Optimized for queries',
          backup: 'Daily automated backups',
          clustering: prompt.includes('scale') ? 'Master-Slave' : 'Single instance'
        }
      }
    });
    
    return { nodes, nextId: nodeId };
  };

  const createFeatureNodes = (prompt, startId, layout) => {
    const nodes = [];
    let nodeId = startId;
    
    // Authentication
    if (prompt.includes('auth') || prompt.includes('login') || prompt.includes('user') || prompt.includes('account')) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'auth',
        position: layout.auth,
        data: {
          label: 'Authentication Service',
          config: {
            strategy: 'JWT + Refresh Tokens',
            providers: extractAuthProviders(prompt),
            security: 'bcrypt hashing, Rate limiting',
            sessions: 'Redis session store',
            oauth: prompt.includes('google') || prompt.includes('facebook') ? 'Google, Facebook' : 'None',
            mfa: prompt.includes('2fa') || prompt.includes('security') ? '2FA Support' : 'Optional'
          }
        }
      });
    }
    
    // Mobile app
    if (prompt.includes('mobile') || prompt.includes('ios') || prompt.includes('android')) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'mobile',
        position: layout.mobile,
        data: {
          label: 'Mobile Application',
          config: {
            platform: prompt.includes('native') ? 'Native (iOS/Android)' : 'React Native',
            features: 'Push notifications, Offline support',
            deployment: 'App Store, Google Play',
            apis: 'REST API integration'
          }
        }
      });
    }
    
    // Real-time features
    if (prompt.includes('real-time') || prompt.includes('live') || prompt.includes('chat') || prompt.includes('instant')) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'websocket',
        position: layout.websocket,
        data: {
          label: 'Real-time Engine',
          config: {
            transport: 'WebSocket (Socket.io)',
            features: 'Live updates, Chat, Notifications',
            scaling: 'Redis Adapter for clustering',
            rooms: 'Dynamic room management'
          }
        }
      });
    }
    
    // AI/ML Services
    if (prompt.includes('ai') || prompt.includes('ml') || prompt.includes('machine learning') || prompt.includes('recommendation')) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'ai_service',
        position: layout.ai_service,
        data: {
          label: 'AI/ML Service',
          config: {
            framework: 'TensorFlow/PyTorch',
            models: extractAIFeatures(prompt),
            apis: 'OpenAI, Google AI Platform',
            processing: 'Async job queue',
            training: 'Continuous learning pipeline'
          }
        }
      });
    }
    
    return { nodes, nextId: nodeId };
  };

  const createIntegrationNodes = (prompt, startId, layout) => {
    const nodes = [];
    let nodeId = startId;
    
    // Payment processing
    if (prompt.includes('payment') || prompt.includes('pay') || prompt.includes('commerce') || prompt.includes('subscription')) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'payment',
        position: layout.payment,
        data: {
          label: 'Payment Gateway',
          config: {
            provider: 'Stripe',
            methods: 'Card, PayPal, Apple Pay, Google Pay',
            features: 'Subscriptions, Invoicing, Refunds',
            webhooks: 'Event-driven processing',
            compliance: 'PCI DSS compliant',
            currencies: 'Multi-currency support'
          }
        }
      });
    }
    
    // Email services
    if (prompt.includes('email') || prompt.includes('notification') || prompt.includes('mail')) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'email',
        position: layout.email,
        data: {
          label: 'Email Service',
          config: {
            provider: 'SendGrid/AWS SES',
            templates: 'Welcome, Reset, Updates, Marketing',
            automation: 'Drip campaigns, Triggers',
            analytics: 'Open/Click tracking',
            compliance: 'GDPR, CAN-SPAM compliant'
          }
        }
      });
    }
    
    // File storage
    if (prompt.includes('upload') || prompt.includes('file') || prompt.includes('image') || prompt.includes('document')) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'storage',
        position: layout.storage,
        data: {
          label: 'Cloud Storage',
          config: {
            provider: 'AWS S3/Google Cloud Storage',
            types: 'Images, Documents, Videos, Audio',
            processing: 'Image optimization, Video transcoding',
            cdn: 'CloudFront distribution',
            security: 'Signed URLs, Access control'
          }
        }
      });
    }
    
    // Analytics
    if (prompt.includes('analytics') || prompt.includes('tracking') || prompt.includes('metrics') || prompt.includes('dashboard')) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'analytics',
        position: layout.analytics,
        data: {
          label: 'Analytics Engine',
          config: {
            platform: 'Google Analytics, Mixpanel',
            events: 'User actions, Performance, Business metrics',
            dashboards: 'Real-time insights, Custom reports',
            retention: 'User cohort analysis',
            privacy: 'GDPR compliant tracking'
          }
        }
      });
    }
    
    // Caching layer
    if (prompt.includes('performance') || prompt.includes('scale') || nodes.length > 5) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'cache',
        position: layout.cache,
        data: {
          label: 'Cache Layer',
          config: {
            type: 'Redis',
            strategy: 'LRU eviction, TTL-based',
            features: 'Session store, API caching, Rate limiting',
            clustering: 'Redis Cluster for HA'
          }
        }
      });
    }
    
    // Monitoring
    if (nodes.length > 4) {
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'monitoring',
        position: layout.monitoring,
        data: {
          label: 'Monitoring & Alerts',
          config: {
            platform: 'DataDog, New Relic',
            metrics: 'Performance, Errors, Business KPIs',
            alerting: 'Slack, Email, PagerDuty',
            logging: 'Centralized log aggregation'
          }
        }
      });
    }
    
    return { nodes, nextId: nodeId };
  };

  const createIntelligentConnections = (nodes) => {
    const connections = [];
    
    // Create logical connections based on node types and relationships
    const nodeMap = new Map(nodes.map(node => [node.type, node]));
    
    // Frontend connections
    const frontend = nodeMap.get('frontend');
    const mobile = nodeMap.get('mobile');
    const api = nodeMap.get('api');
    const websocket = nodeMap.get('websocket');
    
    if (frontend && api) {
      connections.push(createConnection(api.id, frontend.id, 'api'));
    }
    
    if (mobile && api) {
      connections.push(createConnection(api.id, mobile.id, 'api'));
    }
    
    if (websocket && frontend) {
      connections.push(createConnection(websocket.id, frontend.id, 'realtime'));
    }
    
    // Backend connections
    const database = nodeMap.get('database');
    const cache = nodeMap.get('cache');
    const auth = nodeMap.get('auth');
    
    if (api && database) {
      connections.push(createConnection(database.id, api.id, 'data'));
    }
    
    if (cache && api) {
      connections.push(createConnection(cache.id, api.id, 'cache'));
    }
    
    if (auth && api) {
      connections.push(createConnection(auth.id, api.id, 'auth'));
    }
    
    // External service connections
    const payment = nodeMap.get('payment');
    const email = nodeMap.get('email');
    const storage = nodeMap.get('storage');
    const analytics = nodeMap.get('analytics');
    
    if (payment && api) {
      connections.push(createConnection(api.id, payment.id, 'payment'));
    }
    
    if (email && api) {
      connections.push(createConnection(api.id, email.id, 'notification'));
    }
    
    if (storage && api) {
      connections.push(createConnection(api.id, storage.id, 'file'));
    }
    
    if (analytics && frontend) {
      connections.push(createConnection(frontend.id, analytics.id, 'events'));
    }
    
    return connections;
  };

  const createConnection = (sourceId, targetId, type) => ({
    id: `conn-${Math.random().toString(36).substr(2, 9)}`,
    sourceId: sourceId,
    targetId: targetId,
    type
  });

  // Helper functions for extracting features from prompts
  const extractUIFeatures = (prompt) => {
    const features = ['Dashboard', 'Navigation'];
    if (prompt.includes('form')) features.push('Forms');
    if (prompt.includes('table') || prompt.includes('list')) features.push('Data Tables');
    if (prompt.includes('chart') || prompt.includes('graph')) features.push('Charts');
    if (prompt.includes('calendar')) features.push('Calendar');
    if (prompt.includes('map')) features.push('Maps');
    return features;
  };

  const extractEndpoints = (prompt) => {
    const endpoints = ['/api/health', '/api/auth/login'];
    if (prompt.includes('user')) endpoints.push('/api/users', '/api/profile');
    if (prompt.includes('post') || prompt.includes('content')) endpoints.push('/api/posts');
    if (prompt.includes('product')) endpoints.push('/api/products');
    if (prompt.includes('order')) endpoints.push('/api/orders');
    if (prompt.includes('message') || prompt.includes('chat')) endpoints.push('/api/messages');
    return endpoints;
  };

  const extractDatabaseSchema = (prompt) => {
    const tables = ['users'];
    if (prompt.includes('post') || prompt.includes('content')) tables.push('posts', 'comments');
    if (prompt.includes('product')) tables.push('products', 'categories');
    if (prompt.includes('order')) tables.push('orders', 'order_items');
    if (prompt.includes('message')) tables.push('messages', 'conversations');
    if (prompt.includes('task')) tables.push('tasks', 'projects');
    return tables;
  };

  const extractAuthProviders = (prompt) => {
    const providers = ['Email/Password'];
    if (prompt.includes('google')) providers.push('Google OAuth');
    if (prompt.includes('facebook')) providers.push('Facebook OAuth');
    if (prompt.includes('github')) providers.push('GitHub OAuth');
    if (prompt.includes('social')) providers.push('Social Login');
    return providers;
  };

  const extractAIFeatures = (prompt) => {
    const features = [];
    if (prompt.includes('recommendation')) features.push('Recommendation Engine');
    if (prompt.includes('sentiment')) features.push('Sentiment Analysis');
    if (prompt.includes('nlp') || prompt.includes('text')) features.push('Natural Language Processing');
    if (prompt.includes('image') && prompt.includes('ai')) features.push('Computer Vision');
    if (prompt.includes('chatbot')) features.push('Conversational AI');
    return features.length > 0 ? features : ['Custom ML Models'];
  };

  const handleGenerateApp = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setShowPromptModal(false);
    setCurrentStep(0);
    
    // Simulate step-by-step generation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= generationSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    
    fetch('http://localhost:5000/workflow/generate',{
      method:'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"prompt":prompt}),
     
    }).then(res=>res.json())
    .then(response=>{
      

      
    

    

    
    
      setNodes(response.nodes);
      setConnections(response.connections);
      setIsGenerating(false);
      setPrompt('');
      clearInterval(stepInterval);
      

    }).catch((error)=>{

if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setShowPromptModal(false);
    setCurrentStep(0);
    
    // Simulate step-by-step generation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= generationSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);


       setTimeout(() => {
        const { nodes: newNodes, connections: newConnections } = generateNodesFromPrompt(prompt);

        setNodes(newNodes);
      setConnections(newConnections);
      setIsGenerating(false);
      setPrompt('');
      clearInterval(stepInterval);
       }, generationSteps.length * 300 + 500);

    })

    
    
    


  };

  const handleNodeDrag = useCallback((nodeId, position) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId ? { ...node, position } : node
      )
    );
  }, []);

  const handleNodeMouseDown = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (connectionMode) {
      if (!sourceNode) {
        setSourceNode(node.id);
      } else if (sourceNode !== node.id) {
        // Create connection
        const newConnection = createConnection(sourceNode, node.id, 'custom');
        setConnections(prev => [...prev, newConnection]);
        setSourceNode(null);
        setConnectionMode(false);
      }
      return;
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - (node.position.x + panOffset.x);
    const offsetY = e.clientY - rect.top - (node.position.y + panOffset.y);
    
    setDraggedNode(node.id);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggedNode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragOffset.x - panOffset.x) / scale;
    const y = (e.clientY - rect.top - dragOffset.y - panOffset.y) / scale;
    
    handleNodeDrag(draggedNode, { x, y });
  }, [draggedNode, dragOffset, scale, handleNodeDrag, panOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, handleMouseMove, handleMouseUp]);

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.sourceId !== nodeId && conn.targetId !== nodeId));
    setSelectedNode(null);
  };

  const duplicateNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const newNode = {
        ...node,
        id: `node-${Date.now()}`,
        position: { x: node.position.x + 50, y: node.position.y + 50 }
      };
      setNodes(prev => [...prev, newNode]);
    }
  };

  const generateCode = () => {
    const techStack = appMetadata.techStack.join(', ');
    const nodesList = nodes.map(node => `- ${node.data.label} (${nodeTypes[node.type].name})`).join('\n');
    
    return `# ${appMetadata.name}

## Description
${appMetadata.description}

## Architecture Overview
This application consists of ${nodes.length} components with ${connections.length} connections.

## Tech Stack
${techStack}

## Components
${nodesList}

## Estimated Development Time
${appMetadata.estimatedTime}

## Complexity Level
${appMetadata.complexity}

## Generated Architecture
The system follows a microservices architecture with the following layers:
- Frontend Layer: User interfaces and client applications
- API Layer: REST/GraphQL endpoints and business logic
- Data Layer: Database and caching solutions
- Security Layer: Authentication and authorization services
- External Services: Third-party integrations and services

## Deployment Strategy
- Containerized services with Docker
- Kubernetes orchestration for scaling
- CI/CD pipeline with automated testing
- Multi-environment deployment (dev, staging, prod)

## Next Steps
1. Set up development environment
2. Initialize project structure
3. Implement core services
4. Add authentication layer
5. Integrate external services
6. Set up monitoring and analytics
7. Deploy to production`;
  };

  const ConnectionLine = ({ connection }) => {
    const sourceNode = nodes.find(n => n.id === connection.sourceId);
    const targetNode = nodes.find(n => n.id === connection.targetId);
    
    if (!sourceNode || !targetNode) return null;
    
    const sourceX = sourceNode.position.x + 200 + panOffset.x;
    const sourceY = sourceNode.position.y + 50 + panOffset.y;
    const targetX = targetNode.position.x + panOffset.x;
    const targetY = targetNode.position.y + 50 + panOffset.y;
    
    const midX = (sourceX + targetX) / 2;
    
    const connectionColors = {
      api: '#3b82f6',
      data: '#10b981',
      auth: '#f59e0b',
      payment: '#ef4444',
      notification: '#8b5cf6',
      realtime: '#06b6d4',
      file: '#84cc16',
      events: '#ec4899',
      cache: '#f97316',
      custom: '#6b7280'
    };
    
    return (
      <g>
        <path
          d={`M${sourceX},${sourceY} C${midX},${sourceY} ${midX},${targetY} ${targetX},${targetY}`}
          stroke={connectionColors[connection.type] || '#6b7280'}
          strokeWidth="3"
          fill="none"
          strokeDasharray={connection.type === 'auth' ? '8,4' : 'none'}
          opacity="0.8"
        />
        <circle
          cx={midX}
          cy={(sourceY + targetY) / 2}
          r="4"
          fill={connectionColors[connection.type] || '#6b7280'}
          opacity="0.8"
        />
      </g>
    );
  };

  const ConnectionPort = ({ node, type, index, total }) => {
    const nodeType = nodeTypes[node.type];
    const portCount = type === 'input' ? nodeType.ports.input : nodeType.ports.output;
    const spacing = 60 / Math.max(portCount, 1);
    const startY = 20 + (60 - (portCount - 1) * spacing) / 2;
    const y = startY + index * spacing;
    
    return (
      <circle
        cx={type === 'input' ? -8 : 208}
        cy={y}
        r="6"
        fill={type === 'input' ? '#ef4444' : '#10b981'}
        stroke="#ffffff"
        strokeWidth="2"
        className="cursor-pointer hover:r-8 transition-all"
        onClick={(e) => {
          e.stopPropagation();
          if (connectionMode) {
            // Handle connection logic
          }
        }}
      />
    );
  };

  const Node = ({ node }) => {
    const nodeType = nodeTypes[node.type];
    const IconComponent = Icons[node.icon] || null;
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode === node.id;
    const isConnectionSource = sourceNode === node.id;
    
    return (
      <div
        className={`absolute bg-white rounded-xl shadow-lg border-2 cursor-move transition-all transform ${
          isSelected ? 'border-indigo-500 shadow-2xl scale-105 z-10' : 
          isConnectionSource ? 'border-yellow-500 shadow-xl' :
          isHovered ? 'border-gray-400 shadow-xl' : 'border-gray-200 hover:border-gray-300'
        }`}
        style={{
          left: node.position.x + panOffset.x,
          top: node.position.y + panOffset.y,
          width: '200px',
          zIndex: isSelected ? 20 : isConnectionSource ? 15 : 1
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(node);
        }}
      >
        {/* Node Header */}
        <div style={{flexWrap:'wrap'}} className={` text-black p-3 rounded-t-xl flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            {IconComponent?<IconComponent className="h-5 w-5" />:null}
            <span style={{textWrap:'wrap'}} className="font-medium text-sm truncate">{node.data.label}</span>
          </div>
          <div className="text-xs opacity-75">{node.type}</div>
        </div>
        
        {/* Node Body */}
        <div className="p-3">
          <p className="text-xs text-gray-600 mb-2">{node.data.description}</p>
          {node.data.config && (
            <div className="space-y-1">
              {Object.entries(node.data.config).slice(0, 2).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="font-medium text-gray-700 capitalize">{key}:</span>
                  <span className="text-gray-600 ml-1">
                    {Array.isArray(value) ? 
                      value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : '') : 
                      String(value).length > 20 ? String(value).substring(0, 20) + '...' : value
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Connection Ports */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
          {/* Input ports */}
          {Array.from({ length: nodeType.ports.input }).map((_, i) => (
            <ConnectionPort key={`input-${i}`} node={node} type="input" index={i} total={nodeType.ports.input} />
          ))}
          {/* Output ports */}
          {Array.from({ length: nodeType.ports.output }).map((_, i) => (
            <ConnectionPort key={`output-${i}`} node={node} type="output" index={i} total={nodeType.ports.output} />
          ))}
        </svg>
        
        {/* Node Status Indicator */}
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  };

  const NodePalette = () => {
    const categories = [...new Set(Object.values(nodeTypes).map(type => type.category))];
    
    return (
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 mb-2 text-sm">{category}</h4>
            <div className="space-y-1">
              {Object.entries(nodeTypes)
                .filter(([, config]) => config.category === category)
                .map(([type, config]) => {
                  const IconComponent = Icons[config.icon];
                  return (
                    <div
                      key={type}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        // Add node to canvas
                        const newNode = {
                          id: `node-${Date.now()}`,
                          type,
                          position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
                          data: {
                            label: config.name,
                            config: {
                              status: 'Configured',
                              environment: 'Development'
                            }
                          }
                        };
                        setNodes(prev => [...prev, newNode]);
                      }}
                    >
                      <div className={` p-2 rounded-lg flex-shrink-0`}>
                        {<IconComponent className="h-4 w-4 text-black" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{config.name}</p>
                        <p className="text-xs text-gray-500 truncate">{config.description}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Enhanced Header */}
      <header className="bg-white border-b fixed w-full z-30 border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl">
                <Workflow className="h-6 w-6 text-black" />
              </div>
              
            </div>
            
           
          </div>
          
          <div className="flex items-center space-x-3">
            
            
            <button
              onClick={() => setConnectionMode(!connectionMode)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                connectionMode ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <GitBranch className="h-4 w-4" />
              <span>{connectionMode ? 'Cancel Connect' : 'Connect Nodes'}</span>
            </button>
            
            <button
              onClick={() => setShowCode(!showCode)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <FileCode className="h-4 w-4" />
              <span>View Code</span>
            </button>
            
            <button
              onClick={() => setShowPromptModal(true)}
              className="bg-black text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <Zap className="h-4 w-4" />
              <span>Generate App</span>
            </button>
            
            {/*<button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <Play className="h-4 w-4" />
              <span>Deploy</span>
            </button>
            
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>*/}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-20">
        {/* Enhanced Sidebar */}
        <div className="w-80 h-screen overflow-auto bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Node Palette</h3>
            <p className="text-xs text-gray-600">Click components to add them to your architecture</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <NodePalette />
          </div>
          
          {/* Enhanced Statistics */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Project Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Components</div>
                  <div className="font-semibold text-gray-900">{nodes.length}</div>
                </div>
                <div>
                  <div className="text-gray-600">Connections</div>
                  <div className="font-semibold text-gray-900">{connections.length}</div>
                </div>
                <div>
                  <div className="text-gray-600">Complexity</div>
                  <div className="font-semibold text-gray-900">{appMetadata.complexity || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Status</div>
                  <div className="font-semibold text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {nodes.length > 0 ? 'Ready' : 'Empty'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Canvas */}
        <div className="flex-1 h-screen relative overflow-hidden">
          {/* Generation Loading */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Building Your App</h3>
                  <p className="text-gray-600 mb-6">AI is analyzing your requirements...</p>
                  
                  <div className="space-y-2">
                    {generationSteps.map((step, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                          index <= currentStep ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : index === currentStep ? (
                          <Clock className="h-4 w-4 animate-spin text-indigo-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                        )}
                        <span className="text-sm font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            ref={canvasRef}
            className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 canvas-background cursor-grab active:cursor-grabbing"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
            }}
            onMouseDown={handleCanvasMouseDown}
            onClick={(e) => {
              if (e.target === canvasRef.current || e.target.closest('.canvas-background')) {
                setSelectedNode(null);
              }
            }}
          >
            {/* Enhanced Grid Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect 
                width="100%" 
                height="100%" 
                fill="url(#grid)" 
                transform={`translate(${panOffset.x % 30}, ${panOffset.y % 30})`}
              />
            </svg>

            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {connections.map((connection) => (
                <ConnectionLine key={connection.id} connection={connection} />
              ))}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <Node key={node.id} node={node} />
            ))}

            {/* Empty State */}
            {nodes.length === 0 && !isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center max-w-md">
                  <div className="relative mb-8">
                    <div className="p-12 rounded-full w-48 h-48 mx-auto flex items-center justify-center">
                      <Workflow className="h-20 w-20 text-black" />
                    </div>
                    
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Build Something Amazing?</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Describe your app idea in plain English and watch our AI transform it into a complete fullstack architecture with connected components, just like n8n workflows.
                  </p>
                  <button
                    onClick={() => setShowPromptModal(true)}
                    className="bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg pointer-events-auto"
                  >
                    🚀 Start Building Now
                  </button>
                  
                  <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      AI-Powered
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Visual Builder
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Production Ready
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Properties Panel */}
        {selectedNode && (
          <div className="w-96 bg-white border-l h-screen overflow-y-auto border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Node Configuration</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => duplicateNode(selectedNode.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Duplicate Node"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Node"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Close Panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                {React.createElement(nodeTypes[selectedNode.type].icon, { 
                  className: `h-8 w-8 text-white p-1 rounded-lg ${nodeTypes[selectedNode.type].color}` 
                })}
                <div>
                  <h4 className="font-medium text-gray-900">{nodeTypes[selectedNode.type].name}</h4>
                  <p className="text-sm text-gray-500">{nodeTypes[selectedNode.type].category}</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Node Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Node Name</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes(prev =>
                      prev.map(node =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, label: e.target.value } }
                          : node
                      )
                    );
                    setSelectedNode(prev => ({
                      ...prev,
                      data: { ...prev.data, label: e.target.value }
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter node name..."
                />
              </div>

              {/* Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Configuration</label>
                <div className="space-y-3">
                  {selectedNode.data.config && Object.entries(selectedNode.data.config).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <div className="font-medium text-sm text-gray-700 mb-2 capitalize flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-gray-500" />
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                        {Array.isArray(value) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {value.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>{value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Connection Ports</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <div className="font-medium text-sm text-red-700 mb-2 flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      Inputs ({nodeTypes[selectedNode.type]?.ports?.input || 0})
                    </div>
                    <div className="text-xs text-red-600 space-y-1">
                      {nodeTypes[selectedNode.type]?.inputs?.map((input, index) => (
                        <div key={index}>• {input}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="font-medium text-sm text-green-700 mb-2 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Outputs ({nodeTypes[selectedNode.type]?.ports?.output || 0})
                    </div>
                    <div className="text-xs text-green-600 space-y-1">
                      {nodeTypes[selectedNode.type]?.outputs?.map((output, index) => (
                        <div key={index}>• {output}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Connections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Active Connections</label>
                <div className="space-y-2">
                  {connections
                    .filter(conn => conn.sourceId === selectedNode.id || conn.targetId === selectedNode.id)
                    .map((conn, index) => {
                      const isSource = conn.sourceId === selectedNode.id;
                      const otherNodeId = isSource ? conn.targetId : conn.sourceId;
                      const otherNode = nodes.find(n => n.id === otherNodeId);
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isSource ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            <span className="text-sm text-gray-700">
                              {isSource ? 'To' : 'From'}: {otherNode?.data.label || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
                              {conn.type}
                            </span>
                            <button
                              onClick={() => {
                                setConnections(prev => prev.filter(c => c.id !== conn.id));
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  {connections.filter(conn => conn.sourceId === selectedNode.id || conn.targetId === selectedNode.id).length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">No connections</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Generation Modal */}
        {showCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Generated Architecture Documentation</h3>
                  <button
                    onClick={() => setShowCode(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                  {generateCode()}
                </pre>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateCode());
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([generateCode()], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${appMetadata.name.replace(/\s+/g, '-').toLowerCase()}-architecture.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="p-6 border-b border-gray-200 bg-white sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Describe Your App Vision</h3>
                  <p className="text-gray-600">Our AI will analyze your description and generate a complete fullstack architecture</p>
                </div>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: Create a social media platform for photographers with image sharing, real-time comments, user profiles, payment integration for premium features, AI-powered image enhancement, email notifications, and analytics dashboard for content creators..."
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm leading-relaxed"
                />
              </div>
              
              {/* Quick Examples */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Examples (Click to use)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    {
                      title: "E-commerce Platform",
                      description: "Build an e-commerce platform with product catalog, shopping cart, payment processing, user accounts, order management, inventory tracking, and admin dashboard"
                    },
                    {
                      title: "Task Management App",
                      description: "Create a task management app with team collaboration, real-time updates, file sharing, calendar integration, notifications, and analytics"
                    },
                    {
                      title: "Social Media App",
                      description: "Develop a social media platform with user profiles, posts, comments, likes, real-time chat, image sharing, and content moderation"
                    },
                    {
                      title: "Learning Platform",
                      description: "Build an online learning platform with course management, video streaming, quizzes, progress tracking, certificates, and payment integration"
                    }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example.description)}
                      className="text-left p-2 border border-gray-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center justify-center flex items-center"
                    >
                      <div className="font-medium text-sm text-gray-900">{example.title}</div>
                      
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Features Checklist */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Common Features (Check what you need)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'User Authentication',
                    'Real-time Updates',
                    'Payment Processing',
                    'File Uploads',
                    'Email Notifications',
                    'Mobile App',
                    'Analytics Dashboard',
                    'Admin Panel',
                    'Search Functionality',
                    'Social Login',
                    'Push Notifications',
                    'AI/ML Features'
                  ].map((feature, index) => (
                    <label key={index} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        onChange={(e) => {
                          if (e.target.checked && !prompt.toLowerCase().includes(feature.toLowerCase())) {
                            setPrompt(prev => prev + (prev ? ', ' : '') + feature.toLowerCase());
                          }
                        }}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl sticky bottom-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                 
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPromptModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateApp}
                    disabled={!prompt.trim() || prompt.length < 20}
                    className="bg-black hover:bg-gray-700 disabled:bg-gray-300 disabled:bg-gray-400 text-white px-8 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Generate Architecture</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Mode Overlay */}
      {connectionMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-3">
            <GitBranch className="h-5 w-5" />
            <span className="font-medium">
              {sourceNode ? 'Click target node to connect' : 'Click source node to start connection'}
            </span>
            <button
              onClick={() => {
                setConnectionMode(false);
                setSourceNode(null);
              }}
              className="ml-2 hover:bg-yellow-600 p-1 rounded"
            >
              <span className="sr-only">Cancel</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppBuilderWorkflow;