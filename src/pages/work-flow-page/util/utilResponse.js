let response = null
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const setReponse = (resp) =>{
response = resp;
return
}
const getResponse = ()=>{
    return response;
}

export {
    setReponse,
    getResponse,
    sleep
}