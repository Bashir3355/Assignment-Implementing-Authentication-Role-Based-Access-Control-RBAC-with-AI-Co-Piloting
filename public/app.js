const output=document.querySelector('#output');
async function call(endpoint,method='GET',body){try{const response=await fetch('/api/'+endpoint,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await response.json();output.textContent=`HTTP ${response.status}\n${JSON.stringify(data,null,2)}`;}catch(e){output.textContent='Network error: '+e.message;}}
const credentials=()=>({username:document.querySelector('#username').value,password:document.querySelector('#password').value});
document.querySelector('#register').onclick=()=>{const c=credentials();if(!c.username||!c.password){output.textContent='Username and password required';return;}call('register','POST',c)};
document.querySelector('#login').onclick=()=>{const c=credentials();if(!c.username||!c.password){output.textContent='Username and password required';return;}call('login','POST',c)};
document.querySelector('#logout').onclick=()=>call('logout','POST');
for(const route of ['public','user','admin'])document.querySelector('#'+route).onclick=()=>call(route);
