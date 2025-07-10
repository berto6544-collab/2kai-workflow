const triggerHandler = async (node,setNodes,setIsExecuting,data) => {
await new Promise(resolve => setTimeout(resolve,1000));

return "trigger";
}

const scheduleHandler = async (node,setNodes,setIsExecuting,data) => {

return "schedule"
}

const timeOutHandler = async (node,setNodes,setIsExecuting,data) => {

  await new Promise(resolve => setTimeout(resolve, node?.function?node?.function.Timeout*1000:2000));
  return 'timeout handler'
}


const webHookHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'webHook handler'
}

const codeHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'code handler'
}


const functionHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'function'
}

const ifHandler = async (node,setNodes,setIsExecuting,data) => {
  if(node?.function && node?.function.status_type == "Failed"){
  return 'continue';
  }else{
  return data
  }
  
 
  
}

const switchHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Switch handler'
}

const EmailHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Email handler'
}

const SlackHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Slack handler'
}

const SMSHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Twilio SMS handler'
}

const DatabaseHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'MYSQL handler'
}

const PostgreSQLHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'PostgreSQL handler'
}

const MongoDBHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'MongoDB handler'
}

const HubSpotHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'HubSpot handler'
}

const MailChimpHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'MailChimp handler'
}


const AWSHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'AWS lambda handler'
}

const GitHubHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Github handler'
}


const OpenAIHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'OpenAI handler'
}

const StabilityAiHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Stability AI handler'
}

const GoogleDriveHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Google Drive handler'
}

const DropBoxHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Dropbox handler'
}

const VoiceHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Speach To Text handler'
}

const AnalyticsHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Analytics handler'
}

const AuthHandler = async (node,setNodes,setIsExecuting,data) => {

 
  return 'Auth Check handler'
}


const httpHandler = async (node,setNodes,setIsExecuting,data) => {
        let dat = null;
       if(node?.function && node?.function?.url ){
        try{
       

        const data = await fetch(node.function?.url,{
          method:node?.function?.method?node?.function?.method:'GET'
        });
        
        if(node.function.headers == "application/json"){
         dat = await data.json();
        }else{
         dat = await data.text();
        }
      await errorHandler('success',setIsExecuting,setNodes,node,dat)
      return dat;
      
      
        
     
      }catch(error){
        dat = error;
       await errorHandler('error',setIsExecuting,setNodes,node,dat)

        return dat
      }
      
    
    }
      
      else{
      return errorHandler('error',setIsExecuting,setNodes,node,dat)
     
      }
};

const errorHandler = (status,setIsExecuting,setNodes,node,dat)=>{
  
  if(status == "error"){
        setNodes(prev => prev.map(n =>
        n.id === node.id ? { ...n, status: 'error' } : n
        ));
        setIsExecuting(false);
        return dat;
      }else{

        setNodes(prev => prev.map(n =>
        n.id === node.id ? { ...n, status: 'success' } : n
        ));

        
      }

}

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