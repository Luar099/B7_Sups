"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "guest" | "client" | "admin";
type View = "home" | "catalog" | "cart" | "client" | "admin";
type Product = { id:number; name:string; brand:string; category:string; description:string; size:string; price:number; oldPrice:number; stock:number; badge:string; imageUrl:string; active:boolean };
type Client = { id:number; email:string; name:string; phone:string; goal:string; status:string; createdAt:string };
type Order = { id:number; clientEmail:string; total:number; status:string; payment:string; itemsJson:string; createdAt:string };
type Assessment = { id:number; clientEmail:string; weight:number; height:number; waist:number; neck:number; hip:number; bodyFat:number; age?:number; sex?:string; activity?:number; measurementsJson?:string; notes:string; createdAt:string };
type Plan = { id:number; clientEmail:string; type:"nutrition"|"training"; title:string; contentJson:string; updatedAt:string };
type Data = { session:{ user:null|{ displayName:string; email:string; profilePictureUrl?:string }; role:Role }; products:Product[]; client?:Client; clients?:Client[]; orders?:Order[]; assessments?:Assessment[]; plans?:Plan[] };
type CartItem = { product:Product; quantity:number };

const money = (n:number) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const date = (value:string) => new Date(value).toLocaleDateString("pt-BR");
const parse = <T,>(value:string, fallback:T):T => { try { return JSON.parse(value) as T; } catch { return fallback; } };
const initials = (name:string) => name.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
const DEMO_KEY = "b7-sup-demo-v4";

type LibraryItem = { name:string; category:string; detail:string; value:string };
const FOOD_LIBRARY:LibraryItem[] = [
  ["Arroz branco","Carboidratos","100 g cozido","130"],["Arroz integral","Carboidratos","100 g cozido","124"],["Batata-doce","Carboidratos","100 g cozida","86"],["Batata inglesa","Carboidratos","100 g cozida","77"],["Mandioca","Carboidratos","100 g cozida","125"],["Macarrão integral","Carboidratos","100 g cozido","124"],["Aveia","Carboidratos","40 g","152"],["Pão integral","Carboidratos","2 fatias","138"],["Tapioca","Carboidratos","60 g","148"],["Cuscuz","Carboidratos","100 g","112"],
  ["Peito de frango","Proteínas","100 g grelhado","165"],["Patinho moído","Proteínas","100 g","219"],["Coxão mole","Proteínas","100 g","219"],["Tilápia","Proteínas","100 g","128"],["Salmão","Proteínas","100 g","208"],["Atum","Proteínas","1 lata","120"],["Ovo inteiro","Proteínas","2 unidades","144"],["Claras de ovo","Proteínas","4 unidades","68"],["Tofu","Proteínas","100 g","76"],["Lentilha","Proteínas","100 g cozida","116"],
  ["Feijão carioca","Leguminosas","100 g cozido","76"],["Feijão preto","Leguminosas","100 g cozido","77"],["Grão-de-bico","Leguminosas","100 g cozido","164"],["Ervilha","Leguminosas","100 g","81"],
  ["Banana","Frutas","1 unidade","89"],["Maçã","Frutas","1 unidade","72"],["Mamão","Frutas","200 g","86"],["Morango","Frutas","150 g","48"],["Laranja","Frutas","1 unidade","62"],["Manga","Frutas","150 g","90"],["Abacaxi","Frutas","150 g","75"],["Abacate","Frutas","100 g","160"],
  ["Brócolis","Vegetais","100 g","35"],["Cenoura","Vegetais","100 g","41"],["Abobrinha","Vegetais","100 g","17"],["Salada verde","Vegetais","1 prato","35"],["Espinafre","Vegetais","100 g","23"],
  ["Iogurte natural","Laticínios","170 g","105"],["Leite desnatado","Laticínios","200 ml","70"],["Queijo cottage","Laticínios","100 g","98"],["Queijo minas","Laticínios","50 g","132"],
  ["Pasta de amendoim","Gorduras","20 g","118"],["Castanhas","Gorduras","30 g","180"],["Azeite de oliva","Gorduras","1 colher","108"],["Chia","Gorduras","15 g","73"],["Whey protein","Suplementos","30 g","120"],["Creatina","Suplementos","5 g","0"]
].map(([name,category,detail,value])=>({name,category,detail,value}));

const EXERCISE_LIBRARY:LibraryItem[] = [
  ["Agachamento livre","Pernas","Quadríceps e glúteos","4 x 8-12"],["Leg press 45°","Pernas","Quadríceps","4 x 10-12"],["Cadeira extensora","Pernas","Quadríceps","3 x 12-15"],["Mesa flexora","Pernas","Posterior de coxa","4 x 10-12"],["Stiff","Pernas","Posterior e glúteos","4 x 8-12"],["Afundo com halteres","Pernas","Quadríceps e glúteos","3 x 10"],["Elevação pélvica","Glúteos","Glúteos","4 x 10-12"],["Cadeira abdutora","Glúteos","Glúteo médio","4 x 15"],["Panturrilha em pé","Panturrilhas","Gastrocnêmio","4 x 15-20"],["Panturrilha sentada","Panturrilhas","Sóleo","4 x 15-20"],
  ["Supino reto barra","Peito","Peitoral maior","4 x 8-12"],["Supino inclinado halteres","Peito","Peitoral superior","4 x 10"],["Crucifixo máquina","Peito","Peitoral","3 x 12"],["Crossover polia alta","Peito","Peitoral inferior","3 x 12-15"],["Flexão de braço","Peito","Peitoral e tríceps","3 x falha"],
  ["Puxada frontal","Costas","Grande dorsal","4 x 10-12"],["Remada curvada","Costas","Dorsal e romboides","4 x 8-10"],["Remada baixa","Costas","Meio das costas","4 x 10-12"],["Remada unilateral","Costas","Dorsal","3 x 10"],["Pulldown","Costas","Grande dorsal","3 x 12-15"],["Barra fixa","Costas","Dorsal e bíceps","3 x falha"],
  ["Desenvolvimento militar","Ombros","Deltoide anterior","4 x 8-12"],["Elevação lateral","Ombros","Deltoide lateral","4 x 12-15"],["Elevação frontal","Ombros","Deltoide anterior","3 x 12"],["Crucifixo inverso","Ombros","Deltoide posterior","4 x 12"],["Encolhimento","Trapézio","Trapézio superior","4 x 12"],
  ["Rosca direta","Bíceps","Bíceps braquial","4 x 10-12"],["Rosca alternada","Bíceps","Bíceps","3 x 10"],["Rosca martelo","Bíceps","Braquial e antebraço","3 x 12"],["Rosca Scott","Bíceps","Bíceps","3 x 10-12"],
  ["Tríceps corda","Tríceps","Tríceps","4 x 10-12"],["Tríceps francês","Tríceps","Cabeça longa","3 x 12"],["Tríceps testa","Tríceps","Tríceps","3 x 10"],["Mergulho em paralelas","Tríceps","Tríceps e peito","3 x falha"],
  ["Prancha abdominal","Abdômen","Core","3 x 45 s"],["Abdominal infra","Abdômen","Reto abdominal","3 x 15"],["Abdominal máquina","Abdômen","Reto abdominal","4 x 15"],["Prancha lateral","Abdômen","Oblíquos","3 x 30 s"],
  ["Esteira caminhada","Cardio","Baixa intensidade","30 min"],["Corrida intervalada","Cardio","HIIT","15 min"],["Bicicleta ergométrica","Cardio","Moderada intensidade","30 min"],["Escada","Cardio","Alta intensidade","20 min"],["Elíptico","Cardio","Baixo impacto","30 min"],
  ["Levantamento terra","Full body","Cadeia posterior","4 x 6-8"],["Burpee","Funcional","Corpo inteiro","4 x 12"],["Swing kettlebell","Funcional","Potência de quadril","4 x 15"],["Corda naval","Funcional","Condicionamento","6 x 30 s"]
].map(([name,category,detail,value])=>({name,category,detail,value}));

const MEASUREMENT_FIELDS = [
  ["neck","Pescoço"],["shoulders","Circunferência dos ombros"],["chestHigh","Peitoral acima do busto"],["chest","Busto / tórax"],["chestLow","Peitoral abaixo do busto"],
  ["armRelaxedLeft","Bíceps relaxado esquerdo"],["armRelaxedRight","Bíceps relaxado direito"],["armFlexedLeft","Bíceps ativado esquerdo"],["armFlexedRight","Bíceps ativado direito"],
  ["forearmLeft","Antebraço esquerdo"],["forearmRight","Antebraço direito"],["epigastric","Região epigástrica"],["waist","Cintura (2 dedos acima do umbigo)"],["abdomen","Abdômen na linha do umbigo"],["lowerAbdomen","Abdômen inferior"],
  ["hip","Quadril"],["glutes","Glúteos"],["thighProximalLeft","Coxa proximal esquerda"],["thighProximalRight","Coxa proximal direita"],["thighDistalLeft","Coxa distal esquerda"],["thighDistalRight","Coxa distal direita"],["calfLeft","Panturrilha esquerda"],["calfRight","Panturrilha direita"]
] as const;

const makeDemoData = (role:Role="admin"):Data => ({
  session:{user:{displayName:role==="admin"?"Raul · Administrador":"Cliente Teste",email:role==="admin"?"raul.soliveiraa@gmail.com":"cliente@b7.demo"},role},
  products:[
    {id:1,name:"Creatina Monohidratada",brand:"B7 PURE",category:"Creatina",description:"Força, potência e recuperação.",size:"300 g · sem sabor",price:89.9,oldPrice:129.9,stock:36,badge:"-31%",imageUrl:"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=85",active:true},
    {id:2,name:"Whey Protein 80%",brand:"B7 PERFORMANCE",category:"Proteína",description:"Proteína concentrada para recuperação muscular.",size:"900 g · chocolate",price:139.9,oldPrice:169.9,stock:28,badge:"MAIS VENDIDO",imageUrl:"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=85",active:true},
    {id:3,name:"Whey Protein Isolado",brand:"B7 PERFORMANCE",category:"Proteína",description:"Alta concentração proteica e rápida absorção.",size:"900 g · baunilha",price:189.9,oldPrice:229.9,stock:17,badge:"DESTAQUE",imageUrl:"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=85",active:true},
    {id:4,name:"Pré-Treino Black",brand:"B7 ENERGY",category:"Pré-treino",description:"Energia e foco para treinos intensos.",size:"300 g · frutas vermelhas",price:119.9,oldPrice:149.9,stock:22,badge:"NOVO",imageUrl:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85",active:true},
    {id:5,name:"Multivitamínico Daily",brand:"B7 HEALTH",category:"Vitaminas",description:"Vitaminas e minerais essenciais.",size:"60 cápsulas",price:59.9,oldPrice:74.9,stock:41,badge:"-20%",imageUrl:"",active:true},
    {id:6,name:"Combo Evolução",brand:"B7 PROTOCOL",category:"Combos",description:"Whey, creatina e pré-treino.",size:"3 produtos",price:299.9,oldPrice:369.7,stock:12,badge:"ECONOMIZE R$ 69",imageUrl:"",active:true},
  ],
  clients:[{id:1,email:"cliente@b7.demo",name:"Cliente Teste",phone:"(11) 99999-0707",goal:"Reduzir gordura para 14%",status:"ATIVO",createdAt:"2026-07-01T12:00:00Z"}],
  client:{id:1,email:"cliente@b7.demo",name:"Cliente Teste",phone:"(11) 99999-0707",goal:"Reduzir gordura para 14%",status:"ATIVO",createdAt:"2026-07-01T12:00:00Z"},
  orders:[{id:1042,clientEmail:"cliente@b7.demo",total:229.8,status:"PAGAMENTO APROVADO",payment:"PIX",itemsJson:JSON.stringify([{id:1,name:"Creatina Monohidratada",price:89.9,quantity:1},{id:2,name:"Whey Protein 80%",price:139.9,quantity:1}]),createdAt:"2026-08-15T14:30:00Z"}],
  assessments:[{id:1,clientEmail:"cliente@b7.demo",weight:82,height:178,waist:84,neck:39,hip:101,bodyFat:17.8,age:28,sex:"male",activity:1.55,measurementsJson:JSON.stringify({shoulders:113,chestHigh:101,chest:105,chestLow:94,armRelaxedLeft:32,armRelaxedRight:32,armFlexedLeft:33,armFlexedRight:33,forearmLeft:28.5,forearmRight:29.5,epigastric:97,abdomen:91,lowerAbdomen:88,glutes:104,thighProximalLeft:66,thighProximalRight:67,thighDistalLeft:58,thighDistalRight:57,calfLeft:44,calfRight:43}),notes:"Boa evolução. Manter consistência e repetir a avaliação em 30 dias.",createdAt:"2026-08-10T12:00:00Z"}],
  plans:[
    {id:1,clientEmail:"cliente@b7.demo",type:"nutrition",title:"Plano alimentar · definição",contentJson:JSON.stringify([{time:"07:00",name:"Café da manhã",foods:"3 ovos, pão integral, banana e leite",kcal:"550"},{time:"12:30",name:"Almoço",foods:"Arroz, feijão, frango e salada",kcal:"680"},{time:"16:30",name:"Pré-treino",foods:"Banana, aveia e café",kcal:"310"},{time:"20:00",name:"Jantar",foods:"Batata-doce, patinho e legumes",kcal:"480"}]),updatedAt:"2026-08-12T12:00:00Z"},
    {id:2,clientEmail:"cliente@b7.demo",type:"training",title:"Treino A · peito e tríceps",contentJson:JSON.stringify([{name:"Supino reto",sets:"4",reps:"10",load:"70"},{name:"Supino inclinado",sets:"4",reps:"10",load:"52"},{name:"Crossover",sets:"4",reps:"12",load:"25"},{name:"Tríceps corda",sets:"4",reps:"10",load:"30"}]),updatedAt:"2026-08-12T12:00:00Z"},
  ],
});

function Mark({ compact=false }:{ compact?:boolean }) {
  return <div className={compact ? "mark compact" : "mark"}><span>B7</span><small>SUPLEMENTOS</small></div>;
}

function ProductVisual({ product }:{ product:Product }) {
  // Product images are administrator-provided URLs and can come from different CDNs.
  // eslint-disable-next-line @next/next/no-img-element
  if (product.imageUrl) return <img src={product.imageUrl} alt={product.name}/>;
  return <div className="product-placeholder"><span>{product.brand}</span><b>{product.category}</b><small>{product.size || "IMAGEM DO PRODUTO"}</small></div>;
}

function Empty({ title, text }:{ title:string; text:string }) {
  return <div className="empty"><b>—</b><h3>{title}</h3><p>{text}</p></div>;
}

export default function Home() {
  const [data,setData] = useState<Data|null>(null);
  const [view,setView] = useState<View>("home");
  const [menu,setMenu] = useState(false);
  const [search,setSearch] = useState("");
  const [cart,setCart] = useState<Record<number,number>>({});
  const [toast,setToast] = useState("");
  const [busy,setBusy] = useState(false);
  const [intro,setIntro] = useState(true);
  const [demoMode,setDemoMode] = useState(false);

  const load = async () => {
    if (location.hostname.endsWith("github.io")) {
      setDemoMode(true);
      const stored=localStorage.getItem(DEMO_KEY);
      setData(stored?parse<Data>(stored,makeDemoData()):makeDemoData());
      return;
    }
    const response = await fetch("/api/b7", { cache:"no-store" });
    const result = await response.json() as Data & { error?:string };
    if (!response.ok) throw new Error(result.error || "Não foi possível carregar a B7");
    setData(result);
  };
  useEffect(()=>{ const start=setTimeout(()=>load().catch(e=>setToast(e.message)),0); const timer=setTimeout(()=>setIntro(false),2200); return ()=>{clearTimeout(start);clearTimeout(timer)}; },[]);
  const notify = (message:string) => { setToast(message); setTimeout(()=>setToast(""),2600); };
  const go = (next:View) => { setView(next); setMenu(false); window.scrollTo({top:0,behavior:"smooth"}); };
  const post = async (payload:unknown) => {
    setBusy(true);
    try {
      if(demoMode){
        const input=payload as Record<string,unknown>;
        const next=structuredClone(data||makeDemoData());
        const action=String(input.action||"");
        if(action==="checkout"){
          next.orders=[{id:Date.now(),clientEmail:next.session.user?.email||"cliente@b7.demo",total:Number(input.total),status:"PAGAMENTO PENDENTE",payment:String(input.payment||"PIX"),itemsJson:JSON.stringify(input.items||[]),createdAt:new Date().toISOString()},...(next.orders||[])];
        }
        if(action==="saveProduct"){
          const item=input.product as Product; const id=Number(item.id||0);
          const saved={...item,id:id||Math.max(0,...next.products.map(p=>p.id))+1,active:item.active!==false} as Product;
          next.products=id?next.products.map(p=>p.id===id?saved:p):[saved,...next.products];
        }
        if(action==="saveClient"){
          const item=input.client as Client; const existing=(next.clients||[]).find(c=>c.email===item.email);
          const saved={...item,id:existing?.id||Date.now(),createdAt:existing?.createdAt||new Date().toISOString()} as Client;
          next.clients=existing?(next.clients||[]).map(c=>c.email===saved.email?saved:c):[saved,...(next.clients||[])];
        }
        if(action==="updateOrder") next.orders=(next.orders||[]).map(o=>o.id===Number(input.id)?{...o,status:String(input.status)}:o);
        if(action==="saveAssessment"){
          const item=input.assessment as Record<string,unknown>; const height=Number(item.height),weight=Number(item.weight),waist=Number(item.waist),neck=Number(item.neck),hip=Number(item.hip),sex=String(item.sex||"male");
          const density=sex==="female"?1.29579-.35004*Math.log10(Math.max(waist+hip-neck,1))+.221*Math.log10(height):1.0324-.19077*Math.log10(Math.max(waist-neck,1))+.15456*Math.log10(height);
          const saved:Assessment={id:Date.now(),clientEmail:String(item.clientEmail),height,weight,waist,neck,hip,bodyFat:Math.min(55,Math.max(3,495/density-450)),age:Number(item.age||30),sex,activity:Number(item.activity||1.55),measurementsJson:JSON.stringify(item.measurements||{}),notes:String(item.notes||""),createdAt:new Date().toISOString()};
          next.assessments=[saved,...(next.assessments||[])];
        }
        if(action==="savePlan"){
          const item=input.plan as Record<string,unknown>; const type=String(item.type) as "nutrition"|"training"; const email=String(item.clientEmail);
          const saved:Plan={id:Date.now(),clientEmail:email,type,title:String(item.title),contentJson:JSON.stringify(item.content||[]),updatedAt:new Date().toISOString()};
          next.plans=[saved,...(next.plans||[]).filter(p=>!(p.clientEmail===email&&p.type===type))];
        }
        localStorage.setItem(DEMO_KEY,JSON.stringify(next)); setData(next); return {ok:true};
      }
      const response=await fetch("/api/b7",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json() as {error?:string};
      if(!response.ok) throw new Error(result.error || "Não foi possível salvar");
      await load(); return result;
    } finally { setBusy(false); }
  };
  const products=useMemo(()=>data?.products || [],[data?.products]);
  const filtered=useMemo(()=>products.filter(p=>`${p.name} ${p.category} ${p.brand}`.toLowerCase().includes(search.toLowerCase())),[products,search]);
  const cartItems=useMemo<CartItem[]>(()=>Object.entries(cart).map(([id,quantity])=>({product:products.find(p=>p.id===Number(id))!,quantity})).filter(x=>x.product),[cart,products]);
  const total=cartItems.reduce((sum,item)=>sum+item.product.price*item.quantity,0);
  const role=data?.session.role || "guest";
  const account = () => role==="guest" ? location.assign("/signin-with-chatgpt?return_to=/") : go(role==="admin"?"admin":"client");
  const switchDemo=(nextRole:"admin"|"client")=>{
    const next=structuredClone(data||makeDemoData(nextRole));
    next.session={role:nextRole,user:{displayName:nextRole==="admin"?"Raul · Administrador":"Cliente Teste",email:nextRole==="admin"?"raul.soliveiraa@gmail.com":"cliente@b7.demo"}};
    localStorage.setItem(DEMO_KEY,JSON.stringify(next)); setData(next); go(nextRole);
  };
  const add=(product:Product)=>{setCart(c=>({...c,[product.id]:(c[product.id]||0)+1}));notify(`${product.name} adicionado`)};

  return <main>
    {intro&&<div className="intro"><Mark/><p>PERFORMANCE · MÉTODO · EVOLUÇÃO</p></div>}
    <div className="benefit-bar"><span>FRETE GRÁTIS ACIMA DE R$ 199</span><span>5% OFF NO PIX</span><span>PRODUTOS SELECIONADOS</span></div>
    {demoMode&&<div className="demo-bar"><strong>MODO DE TESTE ONLINE</strong><span>Escolha o painel:</span><button className={role==="admin"?"active":""} onClick={()=>switchDemo("admin")}>ADMINISTRADOR</button><button className={role==="client"?"active":""} onClick={()=>switchDemo("client")}>CLIENTE</button><button onClick={()=>{const reset=makeDemoData("admin");localStorage.setItem(DEMO_KEY,JSON.stringify(reset));setData(reset);go("admin");notify("Demonstração restaurada")}}>RESTAURAR DADOS</button></div>}
    <header>
      <button className="mobile-menu" onClick={()=>setMenu(true)} aria-label="Abrir menu de três pontos"><i/><i/><i/></button>
      <button className="logo-button" onClick={()=>go("home")}><Mark compact/></button>
      <nav><button onClick={()=>go("home")}>INÍCIO</button><button onClick={()=>go("catalog")}>PRODUTOS</button><button onClick={()=>{go("catalog");setSearch("Creatina")}}>CREATINA</button><button onClick={()=>{go("catalog");setSearch("Proteína")}}>PROTEÍNAS</button></nav>
      <label className="search"><span>⌕</span><input value={search} onChange={e=>{setSearch(e.target.value);go("catalog")}} placeholder="O que você procura?"/></label>
      <div className="header-actions"><button onClick={account}>{role==="admin"?"PAINEL ADM":role==="client"?"MINHA CONTA":"ENTRAR"}</button><button className="cart-button" onClick={()=>go("cart")}>SACOLA <b>{Object.values(cart).reduce((a,b)=>a+b,0)}</b></button></div>
    </header>
    {menu&&<div className="drawer-layer" onClick={()=>setMenu(false)}><aside onClick={e=>e.stopPropagation()}><div><Mark compact/><button onClick={()=>setMenu(false)}>×</button></div>{[["Início","home"],["Produtos","catalog"],["Minha conta",role==="admin"?"admin":role==="client"?"client":"home"],["Carrinho","cart"]].map(x=><button key={x[0]} onClick={()=>x[0]==="Minha conta"&&role==="guest"?account():go(x[1] as View)}>{x[0]} <span>→</span></button>)}</aside></div>}

    {view==="home"&&<>
      <section className="hero"><div className="hero-copy"><p className="kicker">B7 PERFORMANCE SYSTEM</p><h1>RESULTADO<br/>NÃO É ACASO.</h1><p>Suplementação, avaliação corporal e acompanhamento personalizado em uma única experiência.</p><div><button className="solid" onClick={()=>go("catalog")}>COMPRAR AGORA</button><button className="outline" onClick={account}>ACESSAR MEU PAINEL</button></div><div className="hero-stats"><span><b>2.4K</b> CLIENTES</span><span><b>4,9</b> AVALIAÇÃO</span><span><b>100%</b> FOCO</span></div></div><div className="hero-art"><div className="hero-photo" style={{backgroundImage:"url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=88')"}}/><span>07</span><p>FORÇA. FOCO.<br/>CONSISTÊNCIA.</p></div></section>
      <section className="service-strip">{[["01","COMPRA SEGURA","Ambiente protegido e dados privados"],["02","ACOMPANHAMENTO","Avaliação e evolução no seu painel"],["03","PLANO INDIVIDUAL","Alimentação e treino enviados pelo profissional"],["04","ATENDIMENTO","Suporte humano quando você precisar"]].map(x=><article key={x[0]}><b>{x[0]}</b><div><strong>{x[1]}</strong><p>{x[2]}</p></div></article>)}</section>
      <section className="motion-strip" aria-label="Diferenciais B7"><div><span>PERFORMANCE</span><i>◆</i><span>QUALIDADE</span><i>◆</i><span>DISCIPLINA</span><i>◆</i><span>EVOLUÇÃO</span><i>◆</i><span>PERFORMANCE</span><i>◆</i><span>QUALIDADE</span><i>◆</i></div></section>
      <section className="section"><div className="section-head"><div><p className="kicker">ESCOLHAS DA B7</p><h2>MAIS VENDIDOS</h2></div><button onClick={()=>go("catalog")}>VER TODOS →</button></div><ProductGrid products={products.slice(0,4)} add={add}/></section>
      <section className="brand-story">
        <article className="story-card story-training" style={{backgroundImage:"linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.15)),url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=88')"}}><div><small>PERFORMANCE REAL</small><h2>TREINE COM<br/>PROPÓSITO.</h2><p>Energia, recuperação e método para sustentar cada etapa da evolução.</p><button onClick={()=>go("catalog")}>VER PERFORMANCE →</button></div></article>
        <article className="story-card story-lifestyle" style={{backgroundImage:"linear-gradient(0deg,rgba(0,0,0,.9),rgba(0,0,0,.08)),url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=88')"}}><div><small>ACOMPANHAMENTO B7</small><h2>VOCÊ NÃO<br/>TREINA SOZINHO.</h2><p>Avaliação, alimentação e treino no mesmo painel.</p><button onClick={account}>MEU PAINEL →</button></div></article>
      </section>
      <section className="categories"><div><p className="kicker">COMPRE POR OBJETIVO</p><h2>O QUE VOCÊ BUSCA?</h2></div>{[["GANHO DE MASSA","Proteínas e creatina"],["PERFORMANCE","Energia e intensidade"],["SAÚDE","Vitaminas e bem-estar"],["DEFINIÇÃO","Estratégia e consistência"]].map((x,i)=><button key={x[0]} onClick={()=>go("catalog")}><small>0{i+1}</small><b>{x[0]}</b><span>{x[1]}</span><em>↗</em></button>)}</section>
      <section className="ecosystem"><div><p className="kicker">MAIS QUE UMA LOJA</p><h2>SEU PROTOCOLO.<br/>SEU PROGRESSO.</h2><p>O administrador registra sua avaliação, prepara alimentação e treino. Você acompanha tudo com segurança no seu próprio painel.</p><button className="solid light" onClick={account}>ENTRAR NO PAINEL</button></div><div className="dashboard-preview"><span>PAINEL DO CLIENTE</span><article><small>COMPOSIÇÃO CORPORAL</small><b>EM EVOLUÇÃO</b><i>+12%</i></article><article><small>PLANO ATUAL</small><b>PERSONALIZADO</b><i>ATIVO</i></article></div></section>
      <section className="proof"><div className="proof-head"><p className="kicker">QUEM VIVE A EVOLUÇÃO</p><h2>RESULTADOS QUE<br/>FALAM POR NÓS.</h2></div><div className="proof-grid">{[["“A avaliação deixou claro o que eu precisava mudar. Em poucas semanas já senti diferença no treino.”","MARCOS R.","CLIENTE B7"],["“Ter alimentação, treino e medidas no mesmo lugar tornou minha rotina muito mais simples.”","ANA C.","CLIENTE B7"],["“Atendimento direto e indicação coerente, sem empurrar produto que eu não precisava.”","JOÃO M.","CLIENTE B7"]].map((x,i)=><article key={x[1]}><span>0{i+1}</span><div className="proof-stars">★★★★★</div><blockquote>{x[0]}</blockquote><b>{x[1]}</b><small>{x[2]}</small></article>)}</div></section>
      <section className="diamond"><div className="diamond-icon">◇</div><div><small>PROJETO DIAMANTE</small><h2>UMA NOVA EXPERIÊNCIA<br/>ESTÁ SENDO LAPIDADA.</h2><p>Benefícios exclusivos para quem transforma disciplina em estilo de vida.</p></div><b>EM BREVE</b></section>
    </>}

    {view==="catalog"&&<section className="section catalog"><div className="catalog-title"><p className="kicker">B7 STORE</p><h1>TODOS OS PRODUTOS</h1><p>Produtos selecionados para construir uma rotina mais forte.</p></div><div className="filter-row"><label>BUSCAR<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nome, categoria ou marca"/></label><span>{filtered.length} PRODUTOS</span><button onClick={()=>setSearch("")}>LIMPAR FILTROS</button></div><ProductGrid products={filtered} add={add}/></section>}

    {view==="cart"&&<Cart items={cartItems} total={total} setCart={setCart} checkout={async()=>{
      if(role==="guest"){account();return} try{await post({action:"checkout",items:cartItems.map(x=>({id:x.product.id,name:x.product.name,price:x.product.price,quantity:x.quantity})),total,payment:"PIX"});setCart({});notify("Pedido criado no seu painel");go(role==="admin"?"admin":"client")}catch(e){notify((e as Error).message)}
    }}/ >}
    {view==="client"&&data&&<ClientPanel data={data} goStore={()=>go("catalog")}/>} 
    {view==="admin"&&data&&role==="admin"&&<AdminPanel data={data} post={post} busy={busy} notify={notify}/>} 
    {view==="admin"&&role!=="admin"&&<section className="section"><Empty title="ACESSO RESTRITO" text="Entre com a conta administradora da B7 para acessar este painel."/><button className="solid centered" onClick={account}>ENTRAR COM CHATGPT</button></section>}

    <footer><Mark compact/><p>Suplementação e acompanhamento para construir sua melhor versão.</p><div><button onClick={()=>go("catalog")}>PRODUTOS</button><button onClick={account}>MINHA CONTA</button><span>PRIVACIDADE</span></div><small>© 2026 B7 SUPLEMENTOS · TODOS OS DIREITOS RESERVADOS</small></footer>
    <a className="whatsapp" href="https://wa.me/?text=Olá%2C%20quero%20falar%20com%20a%20B7%20Suplementos" target="_blank" rel="noreferrer" aria-label="Falar com a B7 pelo WhatsApp">ATENDIMENTO <b>↗</b></a>
    {toast&&<div className="toast">{toast}</div>}
  </main>;
}

function ProductGrid({products,add}:{products:Product[];add:(p:Product)=>void}){
  if(!products.length)return <Empty title="NENHUM PRODUTO ENCONTRADO" text="Tente outro termo na busca."/>;
  return <div className="product-grid">{products.map(p=><article className="product-card" key={p.id}><div className="product-image">{p.badge&&<span className="badge">{p.badge}</span>}<ProductVisual product={p}/></div><div className="product-copy"><small>{p.brand}</small><h3>{p.name}</h3><p>{p.size}</p><div className="rating">★★★★★ <span>4,9</span></div><del>{money(p.oldPrice)}</del><strong>{money(p.price)} <small>NO PIX</small></strong><p>ou 3x de {money(p.price/3)} sem juros</p><button onClick={()=>add(p)} disabled={!p.stock}>{p.stock?"ADICIONAR À SACOLA":"INDISPONÍVEL"}<span>+</span></button></div></article>)}</div>
}

function Cart({items,total,setCart,checkout}:{items:CartItem[];total:number;setCart:React.Dispatch<React.SetStateAction<Record<number,number>>>;checkout:()=>void}){
  return <section className="section cart-page"><div className="catalog-title"><p className="kicker">SEU PEDIDO</p><h1>SACOLA</h1></div>{!items.length?<Empty title="SUA SACOLA ESTÁ VAZIA" text="Escolha os produtos certos para o seu objetivo."/>:<div className="cart-layout"><div>{items.map(({product,quantity})=><article className="cart-item" key={product.id}><div className="cart-thumb"><ProductVisual product={product}/></div><div><small>{product.brand}</small><h3>{product.name}</h3><p>{product.size}</p><div className="quantity"><button onClick={()=>setCart(c=>({...c,[product.id]:Math.max(0,c[product.id]-1)}))}>−</button><b>{quantity}</b><button onClick={()=>setCart(c=>({...c,[product.id]:c[product.id]+1}))}>+</button></div></div><strong>{money(product.price*quantity)}</strong></article>)}</div><aside className="summary"><h3>RESUMO</h3><p>Subtotal <b>{money(total)}</b></p><p>Frete <b>GRÁTIS</b></p><hr/><p className="summary-total">TOTAL <b>{money(total)}</b></p><small>Pagamento demonstrativo por PIX</small><button className="solid" onClick={checkout}>FINALIZAR PEDIDO</button></aside></div>}</section>
}

function ClientPanel({data,goStore}:{data:Data;goStore:()=>void}){
  const [tab,setTab]=useState("overview"); const orders=data.orders||[]; const assessments=data.assessments||[]; const plans=data.plans||[]; const latest=assessments[0];
  return <section className="portal"><aside className="portal-nav"><div className="profile"><i>{initials(data.session.user?.displayName||"B7")}</i><div><small>CLIENTE B7</small><b>{data.session.user?.displayName}</b></div></div>{[["overview","VISÃO GERAL"],["assessment","MINHA AVALIAÇÃO"],["nutrition","ALIMENTAÇÃO"],["training","MEU TREINO"],["orders","MINHAS COMPRAS"]].map(x=><button key={x[0]} className={tab===x[0]?"active":""} onClick={()=>setTab(x[0])}>{x[1]}<span>→</span></button>)}<button onClick={goStore}>IR PARA A LOJA ↗</button></aside><div className="portal-content">
    <div className="portal-head"><div><p className="kicker">ÁREA DO CLIENTE</p><h1>{tab==="overview"?`OLÁ, ${(data.session.user?.displayName||"").split(" ")[0].toUpperCase()}`:tab==="assessment"?"MINHA AVALIAÇÃO":tab==="nutrition"?"PLANO ALIMENTAR":tab==="training"?"TREINO PERSONALIZADO":"MINHAS COMPRAS"}</h1></div><span>DADOS PRIVADOS</span></div>
    {tab==="overview"&&<><div className="metric-grid"><article><small>ÚLTIMO IMC</small><b>{latest?(latest.weight/((latest.height/100)**2)).toFixed(1):"—"}</b><span>{latest?date(latest.createdAt):"Aguardando avaliação"}</span></article><article><small>GORDURA CORPORAL</small><b>{latest?`${latest.bodyFat.toFixed(1)}%`:"—"}</b><span>Estimativa profissional</span></article><article><small>PLANO ALIMENTAR</small><b>{plans.some(p=>p.type==="nutrition")?"ATIVO":"—"}</b><span>Atualizado pelo ADM</span></article><article><small>PROGRAMA DE TREINO</small><b>{plans.some(p=>p.type==="training")?"ATIVO":"—"}</b><span>Feito para você</span></article></div><div className="panel-card"><h3>PRÓXIMO PASSO</h3><p>{latest?"Continue seguindo seu protocolo. Seus novos resultados aparecerão após a próxima avaliação.":"Seu profissional ainda não enviou uma avaliação corporal."}</p></div></>}
    {tab==="assessment"&&(!assessments.length?<Empty title="AVALIAÇÃO AINDA NÃO ENVIADA" text="Somente o administrador pode calcular e publicar seu laudo corporal."/>:<div className="records">{assessments.map(a=>{const measures=parse<Record<string,number>>(a.measurementsJson||"{}",{});const lean=a.weight*(1-a.bodyFat/100);return <article key={a.id}><div><small>AVALIAÇÃO · {date(a.createdAt)}</small><h3>COMPOSIÇÃO CORPORAL COMPLETA</h3></div><div className="record-metrics"><span>PESO <b>{a.weight} kg</b></span><span>IMC <b>{(a.weight/((a.height/100)**2)).toFixed(1)}</b></span><span>GORDURA <b>{a.bodyFat.toFixed(1)}%</b></span><span>MASSA MAGRA <b>{lean.toFixed(1)} kg</b></span><span>CINTURA / ALTURA <b>{(a.waist/a.height).toFixed(2)}</b></span><span>CINTURA / QUADRIL <b>{(a.waist/a.hip).toFixed(2)}</b></span></div>{Object.keys(measures).length>0&&<div className="client-measures">{MEASUREMENT_FIELDS.map(([key,label])=>{const value=key==="neck"?a.neck:key==="waist"?a.waist:key==="hip"?a.hip:measures[key];return value!=null?<span key={key}>{label}<b>{value} cm</b></span>:null})}</div>}<p>{a.notes||"Sem observações adicionais."}</p></article>})}</div>)}
    {(tab==="nutrition"||tab==="training")&&<PlanView plan={plans.find(p=>p.type===tab)}/>} 
    {tab==="orders"&&(!orders.length?<Empty title="NENHUM PEDIDO" text="Suas compras aparecerão aqui depois da finalização."/>:<div className="records">{orders.map(o=><article key={o.id}><div><small>PEDIDO #{String(o.id).padStart(5,"0")} · {date(o.createdAt)}</small><h3>{o.status}</h3></div><p>{parse<{name:string;quantity:number}[]>(o.itemsJson,[]).map(i=>`${i.quantity}× ${i.name}`).join(" · ")}</p><strong>{money(o.total)} · {o.payment}</strong></article>)}</div>)}
  </div></section>
}

function PlanView({plan}:{plan?:Plan}){
  if(!plan)return <Empty title="PLANO AINDA NÃO ENVIADO" text="Somente o administrador pode montar e publicar este conteúdo."/>;
  const items=parse<{time?:string;name:string;details?:string;foods?:string;kcal?:string;sets?:string;reps?:string;load?:string}[]>(plan.contentJson,[]);
  return <div className="plan-view"><div><small>ÚLTIMA ATUALIZAÇÃO · {date(plan.updatedAt)}</small><h2>{plan.title}</h2></div>{items.map((x,i)=><article key={i}><b>{x.time||String(i+1).padStart(2,"0")}</b><div><h3>{x.name}</h3><p>{x.details||x.foods||[x.sets&&`${x.sets} séries`,x.reps&&`${x.reps} repetições`,x.load&&`${x.load} kg`].filter(Boolean).join(" · ")}</p></div>{x.kcal&&<span>{x.kcal} KCAL</span>}</article>)}</div>
}

function PlanBuilder({clients,plans,busy,submit}:{clients:Client[];plans:Plan[];busy:boolean;submit:(payload:unknown,message:string)=>void}){
  const [clientEmail,setClientEmail]=useState("");
  const [type,setType]=useState<"nutrition"|"training">("nutrition");
  const [title,setTitle]=useState("Plano alimentar personalizado");
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("TODOS");
  const [items,setItems]=useState<Record<string,string>[]>([]);
  const library=type==="nutrition"?FOOD_LIBRARY:EXERCISE_LIBRARY;
  const categories=["TODOS",...Array.from(new Set(library.map(x=>x.category)))];
  const filtered=library.filter(x=>(category==="TODOS"||x.category===category)&&`${x.name} ${x.category} ${x.detail}`.toLowerCase().includes(query.toLowerCase())).slice(0,30);
  const changeType=(next:"nutrition"|"training")=>{setType(next);setTitle(next==="nutrition"?"Plano alimentar personalizado":"Treino personalizado");setItems([]);setQuery("");setCategory("TODOS")};
  const addItem=(item:LibraryItem)=>setItems(current=>[...current,type==="nutrition"?{time:"07:00",name:item.name,foods:item.detail,kcal:item.value}:{name:item.name,sets:item.value.split(" x ")[0]||"3",reps:item.value.split(" x ")[1]||"12",load:""}]);
  const updateItem=(index:number,key:string,value:string)=>setItems(current=>current.map((item,i)=>i===index?{...item,[key]:value}:item));
  const loadPlan=(saved:Plan)=>{setClientEmail(saved.clientEmail);setType(saved.type);setTitle(saved.title);setItems(parse<Record<string,string>[]>(saved.contentJson,[]));setQuery("");setCategory("TODOS")};
  return <div className="plan-builder">
    <form className="editor plan-editor" onSubmit={e=>{e.preventDefault();submit({action:"savePlan",plan:{clientEmail,type,title,content:items}},"Plano enviado ao cliente")}}>
      <h2>PLANO PERSONALIZADO</h2><p>Pesquise no catálogo, selecione os itens e ajuste os detalhes do cliente.</p>
      <div className="form-grid"><label>CLIENTE<select required value={clientEmail} onChange={e=>setClientEmail(e.target.value)}><option value="">Selecione</option>{clients.map(c=><option key={c.email} value={c.email}>{c.name}</option>)}</select></label><label>TIPO<select value={type} onChange={e=>changeType(e.target.value as "nutrition"|"training")}><option value="nutrition">ALIMENTAÇÃO</option><option value="training">TREINO</option></select></label><label className="wide">TÍTULO<input value={title} onChange={e=>setTitle(e.target.value)}/></label></div>
      <div className="library-search"><label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={type==="nutrition"?"Pesquisar alimento, grupo ou suplemento...":"Pesquisar exercício, músculo ou modalidade..."}/></label><div>{categories.map(x=><button type="button" key={x} className={category===x?"active":""} onClick={()=>setCategory(x)}>{x}</button>)}</div></div>
      <div className="library-results">{filtered.map(item=><button type="button" key={`${item.category}-${item.name}`} onClick={()=>addItem(item)}><span><small>{item.category}</small><b>{item.name}</b><em>{item.detail}</em></span><strong>{type==="nutrition"?`${item.value} kcal`:item.value}</strong><i>+</i></button>)}</div>
      <div className="selected-plan"><div><h3>{type==="nutrition"?"REFEIÇÕES SELECIONADAS":"EXERCÍCIOS SELECIONADOS"}</h3><span>{items.length} ITENS</span></div>{!items.length&&<p>Use a busca acima e pressione + para montar o plano.</p>}{items.map((item,index)=><article key={index}><b>{String(index+1).padStart(2,"0")}</b>{type==="nutrition"?<><input aria-label="Horário" value={item.time||""} onChange={e=>updateItem(index,"time",e.target.value)} placeholder="Horário"/><input aria-label="Alimento" value={item.name||""} onChange={e=>updateItem(index,"name",e.target.value)}/><input aria-label="Porção" value={item.foods||""} onChange={e=>updateItem(index,"foods",e.target.value)} placeholder="Porção"/><input aria-label="Calorias" value={item.kcal||""} onChange={e=>updateItem(index,"kcal",e.target.value)} placeholder="kcal"/></>:<><input aria-label="Exercício" value={item.name||""} onChange={e=>updateItem(index,"name",e.target.value)}/><input aria-label="Séries" value={item.sets||""} onChange={e=>updateItem(index,"sets",e.target.value)} placeholder="Séries"/><input aria-label="Repetições" value={item.reps||""} onChange={e=>updateItem(index,"reps",e.target.value)} placeholder="Reps/tempo"/><input aria-label="Carga" value={item.load||""} onChange={e=>updateItem(index,"load",e.target.value)} placeholder="Carga"/></>}<button type="button" onClick={()=>setItems(current=>current.filter((_,i)=>i!==index))} aria-label="Remover item">×</button></article>)}</div>
      <button className="solid" disabled={busy||!clientEmail||!items.length}>SALVAR E ENVIAR AO CLIENTE</button>
    </form>
    <aside className="saved-plans"><h3>PLANOS SALVOS</h3>{plans.map(p=><button key={p.id} onClick={()=>loadPlan(p)}><small>{p.type==="nutrition"?"ALIMENTAÇÃO":"TREINO"}</small><b>{p.title}</b><span>{p.clientEmail}</span><em>{date(p.updatedAt)} · EDITAR →</em></button>)}</aside>
  </div>
}

function AdminPanel({data,post,busy,notify}:{data:Data;post:(p:unknown)=>Promise<unknown>;busy:boolean;notify:(s:string)=>void}){
  const [tab,setTab]=useState("overview"); const clients=data.clients||[]; const orders=data.orders||[]; const assessments=data.assessments||[]; const plans=data.plans||[];
  const [product,setProduct]=useState<Partial<Product>>({brand:"B7 NUTRITION",category:"Creatina",active:true,stock:10});
  const [client,setClient]=useState<Partial<Client>>({status:"ATIVO",goal:"Evolução física"});
  const [assessment,setAssessment]=useState({clientEmail:"",age:30,sex:"male",activity:1.55,weight:80,height:175,notes:"",measurements:{neck:38,shoulders:110,chestHigh:98,chest:102,chestLow:94,armRelaxedLeft:32,armRelaxedRight:32,armFlexedLeft:34,armFlexedRight:34,forearmLeft:29,forearmRight:29,epigastric:88,waist:85,abdomen:90,lowerAbdomen:92,hip:100,glutes:103,thighProximalLeft:59,thighProximalRight:59,thighDistalLeft:52,thighDistalRight:52,calfLeft:38,calfRight:38}});
  const submit=async(payload:unknown,message:string)=>{try{await post(payload);notify(message)}catch(e){notify((e as Error).message)}};
  const predicted=useMemo(()=>{const {waist,neck,hip}=assessment.measurements;const d=assessment.sex==="female"?1.29579-.35004*Math.log10(Math.max(waist+hip-neck,1))+.221*Math.log10(assessment.height):1.0324-.19077*Math.log10(Math.max(waist-neck,1))+.15456*Math.log10(assessment.height);return Math.min(55,Math.max(3,495/d-450))},[assessment]);
  const bmi=assessment.weight/((assessment.height/100)**2); const leanMass=assessment.weight*(1-predicted/100); const fatMass=assessment.weight-leanMass; const bmr=10*assessment.weight+6.25*assessment.height-5*assessment.age+(assessment.sex==="male"?5:-161); const tdee=bmr*assessment.activity;
  return <section className="admin-shell"><aside className="admin-nav"><div><Mark compact/><small>CONTROLE CENTRAL</small></div>{[["overview","VISÃO GERAL"],["products","PRODUTOS"],["clients","CLIENTES"],["orders","PEDIDOS"],["assessments","AVALIAÇÕES"],["plans","ALIMENTAÇÃO E TREINO"]].map(x=><button key={x[0]} className={tab===x[0]?"active":""} onClick={()=>setTab(x[0])}>{x[1]}<span>→</span></button>)}</aside><div className="admin-content"><div className="admin-head"><div><p className="kicker">PAINEL ADMINISTRATIVO</p><h1>{tab.toUpperCase()}</h1></div><span>ACESSO DO PROPRIETÁRIO</span></div>
    {tab==="overview"&&<><div className="metric-grid dark"><article><small>CLIENTES</small><b>{clients.length}</b><span>Cadastros reais</span></article><article><small>PEDIDOS</small><b>{orders.length}</b><span>{orders.filter(o=>o.status!=="ENTREGUE").length} em andamento</span></article><article><small>FATURAMENTO</small><b>{money(orders.reduce((s,o)=>s+o.total,0))}</b><span>Total registrado</span></article><article><small>PRODUTOS ATIVOS</small><b>{data.products.filter(p=>p.active).length}</b><span>Na loja agora</span></article></div><div className="panel-card dark"><h3>CENTRAL B7 PRONTA</h3><p>Cadastre produtos, acompanhe compras, faça avaliações corporais e envie planos individuais. Cada cliente vê apenas os próprios dados.</p></div></>}
    {tab==="products"&&<div className="admin-grid"><form className="editor" onSubmit={e=>{e.preventDefault();submit({action:"saveProduct",product},"Produto salvo na loja")}}><h2>{product.id?"EDITAR PRODUTO":"NOVO PRODUTO"}</h2><div className="form-grid"><label>NOME<input required value={product.name||""} onChange={e=>setProduct({...product,name:e.target.value})}/></label><label>MARCA<input value={product.brand||""} onChange={e=>setProduct({...product,brand:e.target.value})}/></label><label>CATEGORIA<input required value={product.category||""} onChange={e=>setProduct({...product,category:e.target.value})}/></label><label>TAMANHO / SABOR<input value={product.size||""} onChange={e=>setProduct({...product,size:e.target.value})}/></label><label>PREÇO<input required type="number" step=".01" value={product.price||""} onChange={e=>setProduct({...product,price:+e.target.value})}/></label><label>PREÇO ANTERIOR<input type="number" step=".01" value={product.oldPrice||""} onChange={e=>setProduct({...product,oldPrice:+e.target.value})}/></label><label>ESTOQUE<input type="number" value={product.stock||0} onChange={e=>setProduct({...product,stock:+e.target.value})}/></label><label>SELO<input value={product.badge||""} onChange={e=>setProduct({...product,badge:e.target.value})}/></label><label className="wide">URL DA IMAGEM<input value={product.imageUrl||""} onChange={e=>setProduct({...product,imageUrl:e.target.value})} placeholder="https://..."/></label><label className="wide">DESCRIÇÃO<textarea value={product.description||""} onChange={e=>setProduct({...product,description:e.target.value})}/></label><label className="check"><input type="checkbox" checked={product.active!==false} onChange={e=>setProduct({...product,active:e.target.checked})}/> PRODUTO ATIVO NA LOJA</label></div><button className="solid" disabled={busy}>SALVAR PRODUTO</button></form><div className="admin-list">{data.products.map(p=><button key={p.id} onClick={()=>setProduct(p)}><div className="list-thumb"><ProductVisual product={p}/></div><span><small>{p.category} · ESTOQUE {p.stock}</small><b>{p.name}</b><em>{money(p.price)} · {p.active?"ATIVO":"OCULTO"}</em></span></button>)}</div></div>}
    {tab==="clients"&&<div className="admin-grid"><form className="editor" onSubmit={e=>{e.preventDefault();submit({action:"saveClient",client},"Cliente salvo")}}><h2>CADASTRAR / EDITAR CLIENTE</h2><div className="form-grid"><label>NOME<input required value={client.name||""} onChange={e=>setClient({...client,name:e.target.value})}/></label><label>E-MAIL<input required type="email" value={client.email||""} onChange={e=>setClient({...client,email:e.target.value})}/></label><label>TELEFONE<input value={client.phone||""} onChange={e=>setClient({...client,phone:e.target.value})}/></label><label>OBJETIVO<input value={client.goal||""} onChange={e=>setClient({...client,goal:e.target.value})}/></label><label>STATUS<select value={client.status||"ATIVO"} onChange={e=>setClient({...client,status:e.target.value})}><option>ATIVO</option><option>INATIVO</option></select></label></div><button className="solid" disabled={busy}>SALVAR CLIENTE</button></form><div className="admin-list text-list">{clients.map(c=><button key={c.email} onClick={()=>setClient(c)}><i>{initials(c.name)}</i><span><small>{c.email}</small><b>{c.name}</b><em>{c.goal} · {c.status}</em></span></button>)}</div></div>}
    {tab==="orders"&&(!orders.length?<Empty title="NENHUM PEDIDO" text="As compras dos clientes aparecerão aqui."/>:<div className="admin-table"><div className="table-head"><span>PEDIDO</span><span>CLIENTE</span><span>VALOR</span><span>DATA</span><span>STATUS</span></div>{orders.map(o=><div className="table-row" key={o.id}><span>#{String(o.id).padStart(5,"0")}</span><span>{o.clientEmail}</span><span>{money(o.total)}</span><span>{date(o.createdAt)}</span><select value={o.status} onChange={e=>submit({action:"updateOrder",id:o.id,status:e.target.value},"Status atualizado")}><option>PAGAMENTO PENDENTE</option><option>PAGAMENTO APROVADO</option><option>EM SEPARAÇÃO</option><option>ENVIADO</option><option>ENTREGUE</option><option>CANCELADO</option></select></div>)}</div>)}
    {tab==="assessments"&&<div className="assessment-layout"><form className="editor assessment-editor" onSubmit={e=>{e.preventDefault();submit({action:"saveAssessment",assessment:{...assessment,waist:assessment.measurements.waist,neck:assessment.measurements.neck,hip:assessment.measurements.hip}},"Laudo completo enviado ao cliente")}}><h2>AVALIAÇÃO CORPORAL COMPLETA</h2><p>Preencha os dados gerais e todas as circunferências. Os indicadores são calculados em tempo real.</p><div className="form-grid assessment-basics"><label className="wide">CLIENTE<select required value={assessment.clientEmail} onChange={e=>setAssessment({...assessment,clientEmail:e.target.value})}><option value="">Selecione</option>{clients.map(c=><option key={c.email} value={c.email}>{c.name} · {c.email}</option>)}</select></label><label>IDADE<input required type="number" value={assessment.age} onChange={e=>setAssessment({...assessment,age:+e.target.value})}/></label><label>SEXO<select value={assessment.sex} onChange={e=>setAssessment({...assessment,sex:e.target.value})}><option value="male">MASCULINO</option><option value="female">FEMININO</option></select></label><label>PESO (KG)<input required type="number" step=".1" value={assessment.weight} onChange={e=>setAssessment({...assessment,weight:+e.target.value})}/></label><label>ALTURA (CM)<input required type="number" step=".1" value={assessment.height} onChange={e=>setAssessment({...assessment,height:+e.target.value})}/></label><label className="wide">NÍVEL DE ATIVIDADE<select value={assessment.activity} onChange={e=>setAssessment({...assessment,activity:+e.target.value})}><option value="1.2">Sedentário</option><option value="1.375">1 a 3 treinos por semana</option><option value="1.55">3 a 5 treinos por semana</option><option value="1.725">5 a 6 treinos por semana</option><option value="1.9">Atividade intensa diária</option></select></label></div><div className="measurement-head"><span>CIRCUNFERÊNCIAS</span><small>TODAS AS MEDIDAS EM CENTÍMETROS</small></div><div className="measurement-grid">{MEASUREMENT_FIELDS.map(([key,label])=><label key={key}>{label}<input required type="number" step=".1" value={assessment.measurements[key]} onChange={e=>setAssessment({...assessment,measurements:{...assessment.measurements,[key]:+e.target.value}})}/></label>)}</div><div className="form-grid"><label className="wide">PARECER PROFISSIONAL<textarea value={assessment.notes} onChange={e=>setAssessment({...assessment,notes:e.target.value})} placeholder="Evolução observada, objetivos e orientações..."/></label></div><button className="solid" disabled={busy||!assessment.clientEmail}>SALVAR E ENVIAR LAUDO COMPLETO</button></form><aside className="result-card assessment-results"><small>INDICADORES EM TEMPO REAL</small><span>IMC <b>{bmi.toFixed(1)}</b></span><span>GORDURA ESTIMADA <b>{predicted.toFixed(1)}%</b></span><span>MASSA MAGRA <b>{leanMass.toFixed(1)} kg</b></span><span>MASSA GORDA <b>{fatMass.toFixed(1)} kg</b></span><span>RELAÇÃO CINTURA / ALTURA <b>{(assessment.measurements.waist/assessment.height).toFixed(2)}</b></span><span>RELAÇÃO CINTURA / QUADRIL <b>{(assessment.measurements.waist/assessment.measurements.hip).toFixed(2)}</b></span><span>METABOLISMO BASAL <b>{Math.round(bmr)} kcal</b></span><span>GASTO DIÁRIO ESTIMADO <b>{Math.round(tdee)} kcal</b></span><p>Cálculos são estimativas de apoio. O profissional deve validar o laudo e a conduta individual.</p><hr/><h3>HISTÓRICO</h3>{assessments.slice(0,6).map(a=><p key={a.id}>{a.clientEmail}<b>{date(a.createdAt)} · {a.bodyFat.toFixed(1)}%</b></p>)}</aside></div>}
    {tab==="plans"&&<PlanBuilder clients={clients} plans={plans} busy={busy} submit={submit}/>}
  </div></section>
}

