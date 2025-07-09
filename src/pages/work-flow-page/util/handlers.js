const triggerHandler = async (node,setNodes) => {
await new Promise(resolve => setTimeout(resolve,1000));

return "trigger";
}

const scheduleHandler = async (node,setNodes) => {

return "schedule"
}

const timeOutHandler = async (node,setNodes) => {

  await new Promise(resolve => setTimeout(resolve, node?.function?node?.function.Timeout*1000:2000));
  return 'timeout handler'
}


const webHookHandler = async (node,setNodes) => {

 
  return 'webHook handler'
}

const codeHandler = async (node,setNodes) => {

 
  return 'code handler'
}


const functionHandler = async (node,setNodes) => {

 
  return 'function'
}

const ifHandler = async (node,setNodes) => {

 
  return 'if handler'
}

const switchHandler = async (node,setNodes) => {

 
  return 'Switch handler'
}

const EmailHandler = async (node,setNodes) => {

 
  return 'Email handler'
}

const SlackHandler = async (node,setNodes) => {

 
  return 'Slack handler'
}

const SMSHandler = async (node,setNodes) => {

 
  return 'Twilio SMS handler'
}

const DatabaseHandler = async (node,setNodes) => {

 
  return 'MYSQL handler'
}

const PostgreSQLHandler = async (node,setNodes) => {

 
  return 'PostgreSQL handler'
}

const MongoDBHandler = async (node,setNodes) => {

 
  return 'MongoDB handler'
}

const HubSpotHandler = async (node,setNodes) => {

 
  return 'HubSpot handler'
}

const MailChimpHandler = async (node,setNodes) => {

 
  return 'MailChimp handler'
}


const AWSHandler = async (node,setNodes) => {

 
  return 'AWS lambda handler'
}

const GitHubHandler = async (node,setNodes) => {

 
  return 'Github handler'
}


const OpenAIHandler = async (node,setNodes) => {

 
  return 'OpenAI handler'
}

const StabilityAiHandler = async (node,setNodes) => {

 
  return 'Stability AI handler'
}

const GoogleDriveHandler = async (node,setNodes) => {

 
  return 'Google Drive handler'
}

const DropBoxHandler = async (node,setNodes) => {

 
  return 'Dropbox handler'
}

const VoiceHandler = async (node,setNodes) => {

 
  return 'Speach To Text handler'
}

const AnalyticsHandler = async (node,setNodes) => {

 
  return 'Analytics handler'
}

const AuthHandler = async (node,setNodes) => {

 
  return 'Auth Check handler'
}

const httpHandler = async (node,setNodes) => {
        let dat = null;
       try{
        const data = await fetch(node.function?.url,{
          method:node?.function?.method
        });
        if(node.function.headers == "application/json"){
          
          dat = await data.json();
          
         return dat;
        }else{
         dat = await data.text();
        return dat;
        }

        
     
      }catch(error){
        dat = error;
        return dat
      }
};


export {
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
    AuthHandler



}