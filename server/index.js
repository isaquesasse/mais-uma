const ORIGINS=['https://isaquesasse.github.io','http://127.0.0.1:4173'];
export default {async fetch(request,env){
 const origin=request.headers.get('Origin')||'';
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Methods':'GET, PUT, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Notebook, If-Match, If-None-Match','Access-Control-Expose-Headers':'ETag'};
 if(ORIGINS.includes(origin))headers['Access-Control-Allow-Origin']=origin;
 const respond=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,...extra}});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(new URL(request.url).pathname!=='/api/notebook')return respond({service:'Mais uma',status:'ok'});
 if(origin&&!ORIGINS.includes(origin))return respond({error:'Origem não permitida.'},403);
 const key=request.headers.get('X-Notebook')||'';
 if(!/^[a-f0-9]{64}$/.test(key))return respond({error:'Abra o link de acesso do caderno.'},401);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key))),n=>n.toString(16).padStart(2,'0')).join('');
 if(hash!==env.NOTEBOOK_HASH)return respond({error:'Link de acesso inválido.'},403);
 try{
 if(request.method==='GET'){const obj=await env.BUCKET.get('notebook.json');return obj?respond(await obj.json(),200,{'ETag':obj.httpEtag}):respond(null);}
 if(request.method==='PUT'){
  if(Number(request.headers.get('Content-Length'))>4000000)return respond({error:'Caderno muito grande. Baixe um backup.'},413);
  const raw=await request.text();if(raw.length>4000000)return respond({error:'Caderno muito grande. Baixe um backup.'},413);
  let value;try{value=JSON.parse(raw);}catch{return respond({error:'Formato inválido.'},400);}
  if(value.format!=='mais-uma-v1'||typeof value.data!=='string'||typeof value.salt!=='string'||typeof value.iv!=='string')return respond({error:'Envie apenas dados criptografados.'},400);
  const conditional=new Headers();if(request.headers.has('If-Match'))conditional.set('If-Match',request.headers.get('If-Match'));else if(request.headers.get('If-None-Match')==='*')conditional.set('If-None-Match','*');else return respond({error:'Revisão obrigatória.'},428);
  const result=await env.BUCKET.put('notebook.json',raw,{onlyIf:conditional,httpMetadata:{contentType:'application/json'}});
  return result?respond({ok:true},200,{'ETag':result.httpEtag}):respond({error:'Outro aparelho atualizou o caderno. Tentando combinar.'},409);
 }
 return respond({error:'Método não permitido.'},405);
 }catch{return respond({error:'Armazenamento indisponível. Os registros continuam no aparelho.'},503);}
}};
