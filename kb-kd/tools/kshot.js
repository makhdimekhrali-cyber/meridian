const {chromium}=require('/home/claude/kb/scene/node_modules/playwright');
const shots = eval(process.argv[2]), out = process.argv[3];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:720}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300))});
await p.goto('http://localhost:8124/kdeck.html');await p.waitForFunction(()=>window.READY,null,{timeout:400000}); await p.waitForTimeout(1500);
let k=0; for(const s of shots){ await p.evaluate(s=>window.shot(...s),s); await p.screenshot({path:out+'_'+(k++)+'.jpg',type:'jpeg',quality:92}); }
await b.close();})();
