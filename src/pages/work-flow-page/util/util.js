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
    AuthHandler} from "./handlers";




const NodeFunction = async (node,setNodes,setIsExecuting)=>{
var data = null

    const {type} = node;
    
   switch  (type) {
  case 'http': return await httpHandler(node, setNodes,setIsExecuting);
  break;
  case 'trigger': return await triggerHandler(node,setNodes,setIsExecuting)
  break;
  case 'schedule': return await scheduleHandler(node,setNodes,setIsExecuting)
  break;
  case 'webhook': return await webHookHandler(node,setNodes,setIsExecuting)
  break;
  case 'code': return await codeHandler(node,setNodes,setIsExecuting)
  break;
  case 'function': return await functionHandler(node,setNodes,setIsExecuting)
  break;
  case 'timeout': return await timeOutHandler(node,setNodes,setIsExecuting)
  break;
  case 'if': return await ifHandler(node,setNodes,setIsExecuting)
  break;
  case 'switch': return await switchHandler(node,setNodes,setIsExecuting)
  break;
  case 'email': return await EmailHandler(node,setNodes,setIsExecuting)
  break;
  case 'slack': return await SlackHandler(node,setNodes,setIsExecuting)
  break;
  case 'sms': return await SMSHandler(node,setNodes,setIsExecuting)
  break;
  case 'database': return await DatabaseHandler(node,setNodes,setIsExecuting)
  break;
  case 'postgres': return await PostgreSQLHandler(node,setNodes,setIsExecuting)
  break;
  case 'mongo': return await MongoDBHandler(node,setNodes,setIsExecuting)
  break;
  case 'hubspot': return await HubSpotHandler(node,setNodes,setIsExecuting)
  break;
  case 'mailchimp': return await MailChimpHandler(node,setNodes,setIsExecuting)
  break;
  case 'aws': return await AWSHandler(node,setNodes,setIsExecuting)
  break;
  case 'github': return await GitHubHandler(node,setNodes,setIsExecuting)
  break;
  case 'openai': return await OpenAIHandler(node,setNodes,setIsExecuting)
  break;
  case 'stabilityai': return await StabilityAiHandler(node,setNodes,setIsExecuting)
  break;
  case 'googleDrive': return await GoogleDriveHandler(node,setNodes,setIsExecuting)
  break;
  case 'dropbox': return await DropBoxHandler(node,setNodes,setIsExecuting)
  break;
  case 'voice': return await VoiceHandler(node,setNodes,setIsExecuting)
  break;
  case 'analytics': return await AnalyticsHandler(node,setNodes,setIsExecuting)
  break;
  case 'auth': return await AuthHandler(node,setNodes,setIsExecuting)
  break;

 }


};


  export default NodeFunction