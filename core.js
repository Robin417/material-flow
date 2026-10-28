export const stock=(s,id)=>s.items.find(i=>i.id===id).opening+s.movements.filter(m=>m.itemId===id).reduce((n,m)=>n+(m.type==='out'?-m.qty:m.qty),0);
export const level=(q,min)=>q===0?'품절':q<=min?'부족':'정상';
const text=(x,n=150)=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
export function validate(s){
 if(!s||s.version!==1||!Array.isArray(s.items)||!Array.isArray(s.movements)||s.items.length>5000||s.movements.length>30000)throw Error('지원하지 않는 JSON 형식입니다. version: 1과 items, movements 배열이 필요합니다.');
 const ids=new Set(),codes=new Set(),mids=new Set();
 for(const i of s.items){if(!['id','code','name','category','unit','warehouse','location','supplier'].every(k=>text(i[k]))||(i.spec!==undefined&&(typeof i.spec!=='string'||i.spec.length>150))||ids.has(i.id)||codes.has(i.code.toLowerCase())||![i.opening,i.min,i.price].every(n=>Number.isFinite(n)&&n>=0&&n<=1e12)||!Number.isInteger(i.opening)||!Number.isInteger(i.min))throw Error('자재 필드, 중복 코드 또는 수량/단가를 확인해 주세요.');ids.add(i.id);codes.add(i.code.toLowerCase());}
 for(const m of s.movements){if(!text(m.id)||mids.has(m.id)||!ids.has(m.itemId)||!['in','out','adjust'].includes(m.type)||!Number.isSafeInteger(m.qty)||Math.abs(m.qty)>1e9||(m.type!=='adjust'&&m.qty<=0)||!/^\d{4}-\d{2}-\d{2}$/.test(m.date)||!Number.isFinite(Date.parse(m.date))||new Date(m.date+'T00:00:00Z').toISOString().slice(0,10)!==m.date||typeof m.note!=='string'||m.note.length>1000)throw Error('입출고 기록의 자재, 날짜, 수량을 확인해 주세요.');mids.add(m.id);}
 for(const i of s.items){if(stock(s,i.id)<0)throw Error(i.name+': 처리 후 재고가 음수가 됩니다. 수량을 확인해 주세요.');}
 return s;
}
export function change(s,fn){const next=JSON.parse(JSON.stringify(s));fn(next);return validate(next);}
