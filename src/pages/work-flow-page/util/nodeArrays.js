 import { 
  Play, Database, Mail, Globe, Settings, GitBranch, Code, FileText, Zap, Clock, User, Download, Upload,
  MessageSquare, Camera, Mic, Layers,Brain,
  ThumbsUp, BarChart3, Cloud, GitPullRequest, Cpu, ShieldCheck
} from 'lucide-react';
 
 export const nodeTypes = [
    // Core
    { id: 'trigger', name: 'Manual Trigger', icon: Play, color: 'bg-yellow-500 text-black', category: 'Core' },
    { id: 'schedule', name: 'Schedule Trigger', icon: Clock, color: 'bg-yellow-500 text-black', category: 'Core' },
    { id: 'webhook', name: 'Webhook', icon: Globe, color: 'bg-yellow-500 text-black', category: 'Core' },
    { id: 'http', name: 'HTTP Request', icon: Zap, color: 'bg-yellow-500 text-black', category: 'Core' },
    { id: 'code', name: 'Code', icon: Code, color: 'bg-yellow-500 text-black', category: 'Core' },
    { id: 'function', name: 'Function', icon: Settings, color: 'bg-yellow-500 text-black', category: 'Core' },
    { id: 'timeout', name: 'TimeOut', icon: Settings, color: 'bg-yellow-500 text-black', category: 'Core' },

    // Logic
    { id: 'if', name: 'IF', icon: GitBranch, color: 'bg-yellow-500 text-black', category: 'Logic' },
    { id: 'switch', name: 'Switch', icon: GitPullRequest, color: 'bg-yellow-500 text-black', category: 'Logic' },

    // Communication
    { id: 'email', name: 'Gmail', icon: Mail, color: 'bg-yellow-500 text-black', category: 'Communication' },
    { id: 'slack', name: 'Slack', icon: FileText, color: 'bg-yellow-500 text-black', category: 'Communication' },
    { id: 'sms', name: 'Twilio SMS', icon: MessageSquare, color: 'bg-yellow-500 text-black', category: 'Communication' },

    // Database
    { id: 'database', name: 'MySQL', icon: Database, color: 'bg-yellow-500 text-black', category: 'Database' },
    { id: 'postgres', name: 'PostgreSQL', icon: Layers, color: 'bg-yellow-500 text-black', category: 'Database' },
    { id: 'mongo', name: 'MongoDB', icon: Cpu, color: 'bg-yellow-500 text-black', category: 'Database' },

    // CRM / Marketing
    { id: 'hubspot', name: 'HubSpot', icon: User, color: 'bg-yellow-500 text-black', category: 'CRM' },
    { id: 'mailchimp', name: 'Mailchimp', icon: ThumbsUp, color: 'bg-yellow-500 text-black', category: 'CRM' },

    // DevOps / Infra
    { id: 'aws', name: 'AWS Lambda', icon: Cloud, color: 'bg-yellow-500 text-black', category: 'DevOps' },
    { id: 'github', name: 'GitHub', icon: GitBranch, color: 'bg-yellow-500 text-black', category: 'DevOps' },

    // AI / ML
    { id: 'openai', name: 'OpenAI', icon: Brain, color: 'bg-yellow-500 text-black', category: 'AI' },
    { id: 'stabilityai', name: 'Stability AI', icon: Camera, color: 'bg-yellow-500 text-black', category: 'AI' },

    // Files
    { id: 'googleDrive', name: 'Google Drive', icon: Upload, color: 'bg-yellow-500 text-black', category: 'Files' },
    { id: 'dropbox', name: 'Dropbox', icon: Download, color: 'bg-yellow-500 text-black', category: 'Files' },

    // Utilities
    { id: 'voice', name: 'Speech to Text', icon: Mic, color: 'bg-yellow-500 text-black', category: 'Utility' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'bg-yellow-500 text-black', category: 'Utility' },
    { id: 'auth', name: 'Auth Check', icon: ShieldCheck, color: 'bg-yellow-500 text-black', category: 'Utility' },
  ];
 
 export const getNodeConfig = (nodeType,randomstring) => {
    const configs = {
      trigger: [
        { name: 'triggerName', label: 'Trigger Name', type: 'text',value:"", placeholder: 'My Trigger', required: true },
        { name: 'description', label: 'Description', type: 'textarea',value:"", placeholder: 'What does this trigger do?' }
      ],
      timeout: [
        { name: 'Timeout', label: 'SetTimeout', type: 'number',value:"", placeholder: '30', required: true },
      ],
      schedule: [
        { name: 'interval', label: 'Interval', type: 'select',value:"", options: ['Every minute', 'Every 5 minutes', 'Every 15 minutes', 'Every hour', 'Every day', 'Every week'], required: true },
        { name: 'startTime', label: 'Start Time', type: 'time',value:"" },
        { name: 'timezone', label: 'Timezone', type: 'select',value:"", options: ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'] },
        { name: 'active', label: 'Active', type: 'checkbox',value:"", defaultValue: true }
      ],
      webhook: [
        { name: 'path', label: 'Path', type: 'text', placeholder: '/webhook',value:""+randomstring, required: true },
        { name: 'httpMethod', label: 'HTTP Method', type: 'select',value:'', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], required: true },
        { name: 'authentication', label: 'Authentication', type: 'select',value:"", options: ['None', 'API Key', 'Bearer', 'Basic Auth'] },
        { name: 'token', label: 'Auth Token', type: 'text', placeholder: 'Token',value:"", required: true },
        { name: 'responseFormat', label: 'Response Format', type: 'select',value:"", options: ['JSON', 'XML', 'Plain Text'] }
      ],
      http: [
        { name: 'url', label: 'URL', type: 'text',value:"", placeholder: 'https://example.com', required: true },
        { name: 'method', label: 'Method', type: 'select',value:"", options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], required: true },
        { name: 'headers', label: 'Headers', type: 'textarea',value:"", placeholder: 'Content-Type: application/json' },
        { name: 'bodyType', label: 'body', type: 'selectBody',value:"", options: ['Form_Urlencoded', 'JSON'], required: true,
        body:{ name: 'body', label: 'Request Body',placeholder:'{"key":"value"}', type: 'textarea',value:"" }
        }, 
        
        { name: 'timeout', label: 'Timeout (seconds)', type: 'number',value:"", placeholder: '30' }
      ],
      email: [
        { name: 'to', label: 'To', type: 'text',value:"", placeholder: 'recipient@example.com', required: true },
        { name: 'cc', label: 'CC', type: 'text',value:"", placeholder: 'cc@example.com' },
        { name: 'bcc', label: 'BCC', type: 'text',value:"", placeholder: 'bcc@example.com' },
        { name: 'subject', label: 'Subject', type: 'text',value:"", required: true },
        { name: 'body', label: 'Message', type: 'textarea',value:"", required: true },
        { name: 'priority', label: 'Priority', type: 'select',value:"", options: ['Low', 'Normal', 'High'] }
      ],
      slack: [
        { name: 'channel', label: 'Channel', type: 'text',value:"", placeholder: '#general', required: true },
        { name: 'message', label: 'Message', type: 'textarea',value:"", required: true },
        { name: 'username', label: 'Username', type: 'text',value:"", placeholder: 'Bot Name' },
        { name: 'emoji', label: 'Emoji', type: 'text',value:"", placeholder: ':robot_face:' }
      ],
      sms: [
        { name: 'to', label: 'To Phone Number', type: 'text',value:"", placeholder: '+1234567890', required: true },
        { name: 'from', label: 'From Phone Number', type: 'text',value:"", placeholder: '+0987654321' },
        { name: 'message', label: 'Message', type: 'textarea',value:"", required: true },
        { name: 'mediaUrl', label: 'Media URL', type: 'text',value:"", placeholder: 'https://example.com/image.jpg' }
      ],
      database: [
        { name: 'query', label: 'SQL Query', type: 'textarea',value:"", placeholder: 'SELECT * FROM users', required: true },
        { name: 'connection', label: 'Connection', type: 'select',value:"", options: ['Default', 'Production', 'Development', 'Testing'], required: true },
        { name: 'parameters', label: 'Parameters', type: 'textarea',value:"", placeholder: 'param1=value1\nparam2=value2' }
      ],
      postgres: [
        { name: 'query', label: 'PostgreSQL Query', type: 'textarea',value:"", placeholder: 'SELECT * FROM users', required: true },
        { name: 'connection', label: 'Connection', type: 'select',value:"", options: ['Default', 'Production', 'Development', 'Testing'], required: true },
        { name: 'parameters', label: 'Parameters', type: 'textarea',value:"", placeholder: 'param1=value1\nparam2=value2' }
      ],
      mongo: [
        { name: 'collection', label: 'Collection', type: 'text',value:"", placeholder: 'users', required: true },
        { name: 'operation', label: 'Operation', type: 'select',value:"", options: ['find', 'findOne', 'insert', 'update', 'delete'], required: true },
        { name: 'query', label: 'Query', type: 'textarea',value:"", placeholder: '{"status": "active"}' },
        { name: 'options', label: 'Options', type: 'textarea',value:"", placeholder: '{"limit": 10}' }
      ],
      if: [
        { name: 'status_type', label: 'Status Type', type: 'select',value:"", options: ['Failed', 'Success'], required: true },
        { name: 'condition', label: 'Condition', type: 'text',value:"", placeholder: '{{$json.status}} === "active"', required: true },
        { name: 'trueOutput', label: 'True Output', type: 'text',value:"", placeholder: 'Continue to next node' },
        { name: 'falseOutput', label: 'False Output', type: 'text',value:"", placeholder: 'Stop workflow' }
      ],
      switch: [
        { name: 'expression', label: 'Switch Expression', type: 'text',value:"", placeholder: '{{$json.type}}', required: true },
        { name: 'cases', label: 'Cases', type: 'textarea',value:"", placeholder: 'case1=value1\ncase2=value2\ndefault=defaultValue' }
      ],
      code: [
        { name: 'code', label: 'JavaScript Code', type: 'code',value:"", required: true },
        { name: 'timeout', label: 'Timeout (seconds)', type: 'number',value:"", placeholder: '30' }
      ],
      function: [
        { name: 'functionName', label: 'Function Name', type: 'text',value:"", placeholder: 'myFunction', required: true },
        { name: 'parameters', label: 'Parameters', type: 'textarea',value:"", placeholder: 'param1, param2, param3' },
        { name: 'description', label: 'Description', type: 'textarea',value:"", placeholder: 'What does this function do?' }
      ],
      openai: [
        { name: 'model', label: 'Model', type: 'select',value:"", options: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'], required: true },
        { name: 'prompt', label: 'Prompt', type: 'textarea',value:"", required: true },
        { name: 'maxTokens', label: 'Max Tokens', type: 'number',value:"", placeholder: '1000' },
        { name: 'temperature', label: 'Temperature', type: 'number',value:"", placeholder: '0.7' },
        { name: 'systemMessage', label: 'System Message', type: 'textarea',value:"", placeholder: 'You are a helpful assistant' }
      ],
      stabilityai: [
        { name: 'prompt', label: 'Image Prompt', type: 'textarea',value:"", required: true },
        { name: 'negativePrompt', label: 'Negative Prompt',value:"", type: 'textarea' },
        { name: 'width', label: 'Width', type: 'number',value:"", placeholder: '1024' },
        { name: 'height', label: 'Height', type: 'number',value:"", placeholder: '1024' },
        { name: 'steps', label: 'Steps', type: 'number',value:"", placeholder: '20' }
      ],
      hubspot: [
        { name: 'objectType', label: 'Object Type', type: 'select',value:"", options: ['Contact', 'Company', 'Deal', 'Ticket'], required: true },
        { name: 'action', label: 'Action', type: 'select',value:"", options: ['Create', 'Update', 'Get', 'Delete'], required: true },
        { name: 'properties', label: 'Properties', type: 'textarea',value:"", placeholder: 'email=john@example.com\nfirstname=John' }
      ],
      mailchimp: [
        { name: 'listId', label: 'List ID', type: 'text',value:"", required: true },
        { name: 'action', label: 'Action', type: 'select',value:"", options: ['Subscribe', 'Unsubscribe', 'Update'], required: true },
        { name: 'email', label: 'Email', type: 'text',value:"", placeholder: 'user@example.com', required: true },
        { name: 'mergeFields', label: 'Merge Fields',value:"", type: 'textarea', placeholder: 'FNAME=John\nLNAME=Doe' }
      ],
      aws: [
        { name: 'functionName', label: 'Function Name',value:"", type: 'text', required: true },
        { name: 'region', label: 'Region', type: 'select',value:"", options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'], required: true },
        { name: 'payload', label: 'Payload', type: 'textarea',value:"", placeholder: '{"key": "value"}' },
        { name: 'invocationType', label: 'Invocation Type',value:"", type: 'select', options: ['RequestResponse', 'Event', 'DryRun'] }
      ],
      github: [
        { name: 'repository', label: 'Repository', type: 'text',value:"", placeholder: 'owner/repo', required: true },
        { name: 'action', label: 'Action', type: 'select',value:"", options: ['Create Issue', 'Create PR', 'Get Commits', 'Create Release'], required: true },
        { name: 'branch', label: 'Branch',value:"", type: 'text', placeholder: 'main' },
        { name: 'title', label: 'Title',value:"", type: 'text' },
        { name: 'body', label: 'Body',value:"", type: 'textarea' }
      ],
      googleDrive: [
        { name: 'action', label: 'Action', type: 'select',value:"", options: ['Upload', 'Download', 'List', 'Delete'], required: true },
        { name: 'fileName', label: 'File Name', type: 'text',value:"" },
        { name: 'folderId', label: 'Folder ID', type: 'text',value:"" },
        { name: 'mimeType', label: 'MIME Type', type: 'text',value:"", placeholder: 'application/pdf' }
      ],
      dropbox: [
        { name: 'action', label: 'Action', type: 'select',value:"", options: ['Upload', 'Download', 'List', 'Delete'], required: true },
        { name: 'path', label: 'Path', type: 'text',value:"", placeholder: '/folder/file.txt' },
        { name: 'autorename', label: 'Auto Rename', type: 'checkbox',value:"" }
      ],
      voice: [
        { name: 'language', label: 'Language', type: 'select',value:"", options: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'], required: true },
        { name: 'audioFormat', label: 'Audio Format', type: 'select',value:"", options: ['mp3', 'wav', 'flac'] },
        { name: 'model', label: 'Model', type: 'select',value:"", options: ['whisper-1', 'nova-2', 'enhanced'] }
      ],
      analytics: [
        { name: 'metric', label: 'Metric', type: 'select',value:"", options: ['Page Views', 'Users', 'Sessions', 'Bounce Rate'], required: true },
        { name: 'dateRange', label: 'Date Range', type: 'select',value:"", options: ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'] },
        { name: 'dimensions', label: 'Dimensions', type: 'text',value:"", placeholder: 'country, device' }
      ],
      auth: [
        { name: 'method', label: 'Auth Method', type: 'select',value:"", options: ['JWT', 'OAuth2', 'API Key', 'Basic Auth'], required: true },
        { name: 'requiredRoles', label: 'Required Roles', type: 'text',value:"", placeholder: 'admin, user' },
        { name: 'failureAction', label: 'Failure Action', type: 'select',value:"", options: ['Stop Workflow', 'Continue', 'Redirect'] }
      ]
    };
    return configs[nodeType] || [];
  };