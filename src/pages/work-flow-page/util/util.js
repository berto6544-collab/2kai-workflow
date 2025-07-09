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




const NodeFunction = async (node,setNodes)=>{
var data = null

    const {type} = node;
    
   switch  (type) {
  case 'http': return await httpHandler(node, setNodes);
  break;
  case 'trigger': return await triggerHandler(node,setNodes)
  break;
  case 'schedule': return await scheduleHandler(node,setNodes)
  break;
  case 'webhook': return await webHookHandler(node,setNodes)
  break;
  case 'code': return await codeHandler(node,setNodes)
  break;
  case 'function': return await functionHandler(node,setNodes)
  break;
  case 'timeout': return await timeOutHandler(node,setNodes)
  break;
  case 'if': return await ifHandler(node,setNodes)
  break;
  case 'switch': return await switchHandler(node,setNodes)
  break;
  case 'email': return await EmailHandler(node,setNodes)
  break;
  case 'slack': return await SlackHandler(node,setNodes)
  break;
  case 'sms': return await SMSHandler(node,setNodes)
  break;
  case 'database': return await DatabaseHandler(node,setNodes)
  break;
  case 'postgres': return await PostgreSQLHandler(node,setNodes)
  break;
  case 'mongo': return await MongoDBHandler(node,setNodes)
  break;
  case 'hubspot': return await HubSpotHandler(node,setNodes)
  break;
  case 'mailchimp': return await MailChimpHandler(node,setNodes)
  break;
  case 'aws': return await AWSHandler(node,setNodes)
  break;
  case 'github': return await GitHubHandler(node,setNodes)
  break;
  case 'openai': return await OpenAIHandler(node,setNodes)
  break;
  case 'stabilityai': return await StabilityAiHandler(node,setNodes)
  break;
  case 'googleDrive': return await GoogleDriveHandler(node,setNodes)
  break;
  case 'dropbox': return await DropBoxHandler(node,setNodes)
  break;
  case 'voice': return await VoiceHandler(node,setNodes)
  break;
  case 'analytics': return await AnalyticsHandler(node,setNodes)
  break;
  case 'auth': return await AuthHandler(node,setNodes)
  break;

 }


};


  export default NodeFunction