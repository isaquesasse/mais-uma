export const blank = () => ({version:2, people:[], entries:[],plans:[]});
export const live = list => list.filter(item => !item.deleted);
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export function validData(d) {
  if (!d || ![1,2].includes(d.version) || !Array.isArray(d.people) || !Array.isArray(d.entries) || d.people.length > 100 || d.entries.length > 30000) return false;
  const base = x => x && typeof x.id === 'string' && x.id.length < 100 && Number.isFinite(x.updatedAt) && (x.deleted === undefined || typeof x.deleted === 'boolean');
  const validDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
  if(d.plans!==undefined&&(!Array.isArray(d.plans)||d.plans.length>1000||!d.plans.every(p=>base(p)&&d.people.some(x=>x.id===p.personId)&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=40&&Array.isArray(p.exercises)&&p.exercises.length>0&&p.exercises.length<=50&&p.exercises.every(x=>typeof x==='string'&&x.trim().length>0&&x.length<=80))))return false;
  if(d.entries.some(e=>!e||e.series!==undefined&&(!Array.isArray(e.series)||!e.series.length||e.series.length>100||e.series.some(s=>!s||!Number.isFinite(s.weight)||s.weight<0||s.weight>2000||!Number.isInteger(s.reps)||s.reps<1||s.reps>500))))return false;
  if(d.people.some(p=>!p||p.color!==undefined&&(typeof p.color!=='string'||!/^#[0-9a-f]{6}$/i.test(p.color))))return false;
  return d.people.every(p => base(p) && typeof p.name === 'string' && p.name.trim().length > 0 && p.name.length <= 32) &&
    d.entries.every(e => base(e) && typeof e.personId === 'string' && d.people.some(p => p.id === e.personId) && ['training','body'].includes(e.type) && validDate(e.date) && typeof e.exercise === 'string' && e.exercise.length <= 80 && typeof e.note === 'string' && e.note.length <= 180 && Number.isFinite(e.weight) && e.weight >= (e.type === 'body' ? 1 : 0) && e.weight <= 2000 && (e.type === 'body' || (Number.isInteger(e.sets) && e.sets >= 1 && e.sets <= 100 && Number.isInteger(e.reps) && e.reps >= 1 && e.reps <= 500)));
}
export function merge(a,b) {
  const combine = (x,y) => { const m = new Map(); for (const item of [...x,...y]) { const old = m.get(item.id); if (!old || item.updatedAt > old.updatedAt || (item.updatedAt === old.updatedAt && JSON.stringify(item) > JSON.stringify(old))) m.set(item.id,item); } return [...m.values()].sort((x,y)=>x.id.localeCompare(y.id)); };
  return {version:2,people:combine(a.people,b.people),entries:combine(a.entries,b.entries),plans:combine(a.plans||[],b.plans||[])};
}
const b64 = a => btoa(String.fromCharCode(...a));
const bytes = s => Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(password,salt) {
  const material = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function seal(data,password) {
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(password,salt),new TextEncoder().encode(JSON.stringify(data))));
  let payload=''; for(let n=0;n<encrypted.length;n+=8192) payload+=String.fromCharCode(...encrypted.slice(n,n+8192));
  return {format:'mais-uma-v1',salt:b64(salt),iv:b64(iv),data:btoa(payload)};
}
export async function unseal(envelope,password) {
  if (envelope?.format !== 'mais-uma-v1' || typeof envelope.data !== 'string') throw new Error('Este arquivo não é um backup criptografado do Mais uma.');
  let plain;
  try { plain = await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(envelope.iv)},await key(password,bytes(envelope.salt)),bytes(envelope.data)); }
  catch { throw new Error('A senha do caderno está incorreta ou o arquivo foi alterado.'); }
  const data=JSON.parse(new TextDecoder().decode(plain));
  if(!validData(data)) throw new Error('O arquivo contém dados incompatíveis.');
  return data;
}

