import { 
    triggerHandler,
    httpHandler,
    scheduleHandler,
    timeOutHandler,
    webHookHandler,
    codeHandler,
    functionHandler,
    ifHandler,
    switchHandler,
    EmailHandler,
    SlackHandler,
    SMSHandler,
    DatabaseHandler,
    PostgreSQLHandler,
    MongoDBHandler,
    HubSpotHandler,
    MailChimpHandler,
    AWSHandler,
    GitHubHandler,
    OpenAIHandler,
    StabilityAiHandler,
    GoogleDriveHandler,
    DropBoxHandler,
    VoiceHandler,
    AnalyticsHandler,
    AuthHandler,
    loopHandler
} from "./handlers";

const NodeFunction = async (node,setNodes,setIsExecuting,data)=>{
var data = null

    const {type} = node;
    
   switch  (type) {
  case 'http': return await httpHandler(node, setNodes,setIsExecuting,data);
  break;
  case 'trigger': return await triggerHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'schedule': return await scheduleHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'webhook': return await webHookHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'code': return await codeHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'function': return await functionHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'timeout': return await timeOutHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'loop': return await loopHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'if': return await ifHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'switch': return await switchHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'email': return await EmailHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'slack': return await SlackHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'sms': return await SMSHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'database': return await DatabaseHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'postgres': return await PostgreSQLHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'mongo': return await MongoDBHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'hubspot': return await HubSpotHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'mailchimp': return await MailChimpHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'aws': return await AWSHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'github': return await GitHubHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'openai': return await OpenAIHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'stabilityai': return await StabilityAiHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'googleDrive': return await GoogleDriveHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'dropbox': return await DropBoxHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'voice': return await VoiceHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'analytics': return await AnalyticsHandler(node,setNodes,setIsExecuting,data)
  break;
  case 'auth': return await AuthHandler(node,setNodes,setIsExecuting,data)
  break;

 }


};


  export default NodeFunction