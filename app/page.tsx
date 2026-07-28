"use client";

import { useEffect, useMemo, useState } from "react";

type View = "inicio" | "produtos" | "progresso" | "avaliacao" | "alimentacao" | "treinos" | "digitais" | "fotos" | "diamante" | "carrinho" | "admin";
type AdminView = "geral" | "clientes" | "avaliacoes" | "planos" | "produtos" | "pedidos" | "acessos";

const products = [
  { id: 1, tag: "-31%", brand: "B7 LABS", name: "Creatina Monohidratada", size: "300 G • SEM SABOR", old: 129.9, price: 89.9, score: "4,9", type: "creatina", tone: "lime" },
  { id: 2, tag: "MAIS VENDIDO", brand: "B7 PERFORMANCE", name: "Whey Protein Isolado", size: "900 G • CHOCOLATE", old: 219.9, price: 179.9, score: "4,8", type: "whey", tone: "white" },
  { id: 3, tag: "NOVO", brand: "B7 ENERGY", name: "Pré-Treino Insane", size: "300 G • FRUTAS VERMELHAS", old: 149.9, price: 119.9, score: "4,9", type: "pre", tone: "red" },
  { id: 4, tag: "-20%", brand: "B7 HEALTH", name: "Multivitamínico Daily", size: "60 CÁPSULAS", old: 79.9, price: 63.9, score: "4,7", type: "vitamina", tone: "smoke" },
];

const categories = [
  ["01", "Whey", "Proteína e recuperação"], ["02", "Creatina", "Força e performance"],
  ["03", "Pré-treino", "Energia e foco"], ["04", "Vitaminas", "Saúde e bem-estar"],
  ["05", "Termogênicos", "Definição e controle"], ["06", "Combos", "Protocolos completos"],
];

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Logo() {
  return <button className="logo" aria-label="Ir para o início"><span>B</span><b>7</b><em>SUPLEMENTOS</em></button>;
}

function ProductArt({ type, tone }: { type: string; tone: string }) {
  return <div className={`product-photo-slot ${tone}`} aria-label={`Espaço para imagem de ${type}`}>
    <span>IMAGEM</span><strong>{type.toUpperCase()}</strong><small>CADASTRADA PELO ADM</small>
  </div>;
}

function DiamondIcon(){return <span className="diamond-icon" aria-hidden="true"><i/><i/><i/></span>}

export default function Home() {
  const [view, setView] = useState<View>("inicio");
  const [cart, setCart] = useState<number[]>([]);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [body, setBody] = useState({ name: "Raul", age: 29, sex: "masculino", weight: 90, height: 178, waist: 90, neck: 40, hip: 102, arm: 40, thigh: 64 });
  const [savedAssessment, setSavedAssessment] = useState(false);
  const [adminView, setAdminView] = useState<AdminView>("geral");
  const [productImages, setProductImages] = useState<Record<number,string>>({});
  const [intro, setIntro] = useState(true);
  const [calcMethod, setCalcMethod] = useState("jp7");
  const [folds, setFolds] = useState({ chest:12, midaxillary:14, triceps:18, subscapular:16, abdomen:24, suprailiac:17, thigh:22, biceps:10 });
  const [extra, setExtra] = useState({ initialWeight:96, relaxedLeft:32, relaxedRight:32, flexedLeft:33, flexedRight:33, forearmLeft:28.5, forearmRight:29.5, chestUpper:101, bust:105, chestLower:94, shoulders:113, distalLeft:58, distalRight:57, proximalLeft:66, proximalRight:67, calfLeft:44, calfRight:43, glutes:113, epigastric:97, abdomenLine:116, lowerAbdomen:112 });
  const [mealPlan, setMealPlan] = useState([
    {time:"07:00",name:"Café da manhã",foods:"3 ovos, 2 fatias de pão, banana e 200 ml de leite",kcal:"550"},
    {time:"10:30",name:"Lanche da manhã",foods:"Iogurte natural, granola e morangos",kcal:"280"},
    {time:"13:00",name:"Almoço",foods:"Arroz, feijão, frango grelhado e salada",kcal:"680"},
    {time:"16:30",name:"Pré-treino",foods:"Banana, pasta de amendoim e café",kcal:"310"},
    {time:"20:00",name:"Jantar",foods:"Batata-doce, patinho moído e legumes",kcal:"480"},
  ]);
  const [trainingPlan, setTrainingPlan] = useState([
    {name:"Supino reto",sets:"4",reps:"10",load:"70"},
    {name:"Supino inclinado",sets:"4",reps:"10",load:"52"},
    {name:"Crucifixo máquina",sets:"4",reps:"12",load:"45"},
    {name:"Crossover",sets:"4",reps:"12",load:"25"},
    {name:"Tríceps corda",sets:"4",reps:"10",load:"30"},
  ]);

  useEffect(() => { const timer = window.setTimeout(() => setIntro(false), 2800); return () => window.clearTimeout(timer); }, []);

  const visibleProducts = useMemo(() => products.filter(p => `${p.name} ${p.brand} ${p.type}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const total = cart.reduce((sum, id) => sum + (products.find(p => p.id === id)?.price || 0), 0);
  const bodyResult = useMemo(() => {
    const meters = body.height / 100;
    const bmi = body.weight / (meters * meters);
    const sum7 = folds.chest + folds.midaxillary + folds.triceps + folds.subscapular + folds.abdomen + folds.suprailiac + folds.thigh;
    const sum3 = body.sex === "masculino" ? folds.chest + folds.abdomen + folds.thigh : folds.triceps + folds.suprailiac + folds.thigh;
    const sum4 = folds.abdomen + folds.thigh + folds.triceps + folds.suprailiac;
    const dwSum = folds.biceps + folds.triceps + folds.subscapular + folds.suprailiac;
    const jp7Density = body.sex === "masculino"
      ? 1.112 - .00043499 * sum7 + .00000055 * sum7 * sum7 - .00028826 * body.age
      : 1.097 - .00046971 * sum7 + .00000056 * sum7 * sum7 - .00012828 * body.age;
    const jp3Density = body.sex === "masculino"
      ? 1.10938 - .0008267 * sum3 + .0000016 * sum3 * sum3 - .0002574 * body.age
      : 1.0994921 - .0009929 * sum3 + .0000023 * sum3 * sum3 - .0001392 * body.age;
    const jp4Fat = body.sex === "masculino"
      ? .29288 * sum4 - .0005 * sum4 * sum4 + .15845 * body.age - 5.76377
      : .29669 * sum4 - .00043 * sum4 * sum4 + .02963 * body.age + 1.4072;
    const dwCoefficients = body.sex === "masculino"
      ? body.age < 20 ? [1.162,.063] : body.age < 30 ? [1.1631,.0632] : body.age < 40 ? [1.1422,.0544] : body.age < 50 ? [1.162,.07] : [1.1715,.0779]
      : body.age < 20 ? [1.1549,.0678] : body.age < 30 ? [1.1599,.0717] : body.age < 40 ? [1.1423,.0632] : body.age < 50 ? [1.1333,.0612] : [1.1339,.0645];
    const dwDensity = dwCoefficients[0] - dwCoefficients[1] * Math.log10(Math.max(dwSum,1));
    const navyDensity = body.sex === "masculino"
      ? 1.0324 - .19077 * Math.log10(Math.max(body.waist - body.neck, 1)) + .15456 * Math.log10(body.height)
      : 1.29579 - .35004 * Math.log10(Math.max(body.waist + body.hip - body.neck, 1)) + .221 * Math.log10(body.height);
    const fatByMethod:Record<string,number> = { jp7:495/jp7Density-450, jp3:495/jp3Density-450, jp4:jp4Fat, durnin:495/dwDensity-450, circ:495/navyDensity-450 };
    const fat = fatByMethod[calcMethod] ?? fatByMethod.jp7;
    const safeFat = Math.min(Math.max(fat, 3), 55);
    const fatMass = body.weight * safeFat / 100;
    const lean = body.weight - fatMass;
    return { bmi, fat: safeFat, fatMass, lean, ffmi:lean/(meters*meters), fmi:fatMass/(meters*meters), whtr:body.waist/body.height, whr:body.waist/body.hip, conicity:(body.waist/100)/(.109*Math.sqrt(body.weight/meters)), weightLoss:(extra.initialWeight-body.weight)/extra.initialWeight*100 };
  }, [body, folds, calcMethod, extra.initialWeight]);
  function navigate(next: View) { setView(next); setMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function add(id: number) { setCart(c => [...c, id]); setToast("Produto adicionado ao carrinho"); window.setTimeout(() => setToast(""), 1800); }

  return <main>
    {intro && <div className="brand-intro"><div className="intro-mark"><span>B</span><b>7</b><em>SUPLEMENTOS</em><small>FORÇA · MÉTODO · EVOLUÇÃO</small></div></div>}
    <div className="topline"><span>FRETE GRÁTIS ACIMA DE R$ 199</span><span>•</span><span>5% OFF NO PIX</span><span>•</span><span>PRODUTOS 100% ORIGINAIS</span></div>
    <header>
      <button className="menu-button" onClick={() => setMenu(true)} aria-label="Abrir menu"><i/><i/><i/></button>
      <div className="header-logo-panel" onClick={() => navigate("inicio")}><Logo /></div>
      <nav aria-label="Navegação principal">
        <button className={view === "inicio" ? "active" : ""} onClick={() => navigate("inicio")}>Início</button>
        <button className={view === "produtos" ? "active" : ""} onClick={() => navigate("produtos")}>Produtos</button>
        <button onClick={() => navigate("produtos")}>Categorias</button><button onClick={() => navigate("produtos")}>Promoções</button>
      </nav>
      <button className="admin-shortcut" onClick={() => navigate("admin")}><span>◆</span> ADM</button>
      <div className="header-actions">
        <label className="search"><span>⌕</span><input value={search} onChange={e => { setSearch(e.target.value); if(e.target.value) setView("produtos"); }} placeholder="Buscar produto" aria-label="Buscar produto" /></label>
        <button className="icon-action" onClick={() => navigate("progresso")} aria-label="Minha conta">◯<small>CONTA</small></button>
        <button className="icon-action bag" onClick={() => navigate("carrinho")} aria-label="Carrinho">▱<b>{cart.length}</b><small>CARRINHO</small></button>
      </div>
    </header>

    {menu && <div className="drawer-backdrop" onClick={() => setMenu(false)}><aside className="drawer" onClick={e => e.stopPropagation()}>
      <div className="drawer-head"><Logo/><button onClick={() => setMenu(false)}>×</button></div>
      <p>MENU</p>
      {[['Início','inicio'],['Produtos','produtos'],['Categorias','produtos'],['Promoções','produtos'],['Minha conta','progresso'],['Minha avaliação','avaliacao'],['Minha alimentação','alimentacao'],['Meus treinos','treinos'],['Minhas compras','carrinho'],['Produtos digitais','digitais'],['Fotos de evolução','fotos'],['Projeto Diamante','diamante'],['Painel ADM','admin']].map(([label,dest]) => <button key={label} className={dest === 'admin' ? 'drawer-admin' : ''} onClick={() => navigate(dest as View)}>{dest==='diamante'?<DiamondIcon/>:null}{label}<span>{dest==='diamante'?'EM BREVE':'›'}</span></button>)}
      <div className="drawer-foot">Atendimento · Sobre a B7</div>
    </aside></div>}

    {view === "inicio" && <>
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span/> SUA MELHOR VERSÃO COMEÇA AQUI</p><h1>EVOLUÇÃO<br/>NÃO É SORTE.<br/><em>É MÉTODO.</em></h1><p>Suplementos selecionados, orientação profissional e acompanhamento real para você ir além.</p><div className="hero-buttons"><button className="primary" onClick={() => navigate("produtos")}>COMPRAR AGORA <span>→</span></button><button className="secondary" onClick={() => navigate("progresso")}>FAZER AVALIAÇÃO</button></div>
        <div className="mini-rating"><div className="avatars"><i>RM</i><i>AS</i><i>JP</i></div><strong>★★★★★ <small>+2.400 clientes em evolução</small></strong></div></div>
        <div className="hero-visual"><div className="halo"/><div className="diagonal-word">PERFORMANCE</div><ProductArt type="whey" tone="white"/><div className="float-card fc-one"><b>+12%</b><span>MASSA MAGRA</span><small>nos últimos 90 dias</small></div><div className="float-card fc-two"><span>QUALIDADE</span><b>TESTADA</b><small>✓ Laudos aprovados</small></div></div>
      </section>
      <section className="trust"><div><b>✓</b><span><strong>PRODUTOS ORIGINAIS</strong><small>Procedência garantida</small></span></div><div><b>⚡</b><span><strong>ENTREGA RÁPIDA</strong><small>Para todo o Brasil</small></span></div><div><b>◇</b><span><strong>COMPRA SEGURA</strong><small>Seus dados protegidos</small></span></div><div><b>◉</b><span><strong>ATENDIMENTO ESPECIALIZADO</strong><small>Fale com quem entende</small></span></div></section>

      <section className="section categories"><div className="section-title"><div><p className="eyebrow"><span/> ENCONTRE O QUE VOCÊ PRECISA</p><h2>ESCOLHA POR <em>CATEGORIA</em></h2></div><button onClick={() => navigate("produtos")}>VER TODAS →</button></div><div className="category-grid">{categories.map(([icon,name,desc]) => <button key={name} onClick={() => navigate("produtos")}><i>{icon}</i><strong>{name}</strong><small>{desc}</small><span>→</span></button>)}</div></section>

      <section className="section offers"><div className="section-title"><div><p className="eyebrow"><span/> PREÇOS QUE DÃO RESULTADO</p><h2>OFERTAS DA <em>SEMANA</em></h2></div><div className="arrows"><button>←</button><button>→</button></div></div><ProductGrid products={products} add={add} images={productImages}/></section>

      <section className="assessment"><div><p className="eyebrow light"><span/> ACOMPANHAMENTO B7</p><h2>DESCUBRA SEU<br/><em>PONTO DE PARTIDA.</em></h2><p>Dados reais. Metas claras. Evolução visível. Receba uma avaliação corporal profissional e acompanhe cada conquista.</p><button className="primary" onClick={() => navigate("avaliacao")}>FAZER CÁLCULO CORPORAL →</button></div><div className="progress-card"><div className="pc-head"><span>SEU PROGRESSO</span><b>ÚLTIMOS 90 DIAS</b></div><div className="ring"><strong>18<small>%</small></strong><span>GORDURA CORPORAL</span></div><div className="metrics"><span><small>PESO ATUAL</small><b>90,0 kg</b><i>↓ 4,2 kg</i></span><span><small>MASSA MAGRA</small><b>73,8 kg</b><i>↑ 2,1 kg</i></span><span><small>META</small><b>14%</b><i>4% restante</i></span></div></div></section>

      <section className="section combos"><div className="section-title"><div><p className="eyebrow"><span/> RESULTADOS MAIS RÁPIDOS</p><h2>COMBOS PARA <em>SEU OBJETIVO</em></h2></div></div><div className="combo-grid"><article><span>01</span><h3>GANHO DE<br/>MASSA</h3><p>Whey + Creatina + Hipercalórico</p><button onClick={() => navigate("produtos")}>VER COMBO →</button></article><article><span>02</span><h3>FORÇA &<br/>PERFORMANCE</h3><p>Creatina + Pré-treino + Beta Alanina</p><button onClick={() => navigate("produtos")}>VER COMBO →</button></article><article><span>03</span><h3>DEFINIÇÃO<br/>TOTAL</h3><p>Whey Isolado + Termogênico + Ômega 3</p><button onClick={() => navigate("produtos")}>VER COMBO →</button></article></div></section>
    </>}

    {view === "produtos" && <section className="catalog section"><div className="catalog-head"><p className="eyebrow"><span/> PERFORMANCE STORE</p><h1>PRODUTOS <em>B7</em></h1><p>Fórmulas de alta qualidade para cada etapa da sua evolução.</p></div><div className="catalog-tools"><button className="filter">FILTRAR PRODUTOS</button><span>{visibleProducts.length} PRODUTOS ENCONTRADOS</span><select aria-label="Ordenar produtos"><option>Mais vendidos</option><option>Menor preço</option><option>Maior desconto</option></select></div><ProductGrid products={visibleProducts} add={add} images={productImages}/>{visibleProducts.length === 0 && <div className="empty">Nenhum produto encontrado. Tente outro termo.</div>}</section>}

    {view === "progresso" && <section className="dashboard section page-enter"><div className="dash-welcome"><div><p className="eyebrow"><span/> ÁREA DO CLIENTE</p><h1>OLÁ, <em>RAUL.</em></h1><p>Você está a 4% da sua meta. Continue consistente.</p></div><button className="primary" onClick={() => navigate("avaliacao")}>VER AVALIAÇÃO →</button></div><div className="dash-grid"><article className="score-card"><span>SEU PROGRESSO ATUAL</span><div className="score-ring"><strong>72</strong><small>SCORE B7</small></div><p>Você evoluiu <b>+8 pontos</b> desde a última avaliação.</p></article><article className="measure-card"><span>ÚLTIMA AVALIAÇÃO • 10/07/2026</span><div><b>90,0<small> kg</small><em>PESO</em></b><b>18<small>%</small><em>GORDURA</em></b><b>73,8<small> kg</small><em>MASSA MAGRA</em></b><b>14<small>%</small><em>META</em></b></div><div className="chart"><i/><i/><i/><i/><i/><i/><i/><span>ABR</span><span>MAI</span><span>JUN</span><span>JUL</span></div></article></div><h2>ACESSO <em>RÁPIDO</em></h2><div className="quick-grid">{[['01','Minha avaliação','Laudo enviado pelo profissional','avaliacao'],['02','Minha alimentação','Plano personalizado recebido','alimentacao'],['03','Meus treinos','Ficha personalizada recebida','treinos'],['04','Fotos de evolução','Compare seus resultados','fotos'],['05','Meus pedidos','Acompanhe suas compras','carrinho'],['06','Produtos digitais','Materiais e cursos','digitais']].map(([i,t,d,dest]) => <button key={t} onClick={() => navigate(dest as View)}><i>{i}</i><strong>{t}</strong><small>{d}</small><span>→</span></button>)}</div><p className="disclaimer">Os resultados apresentados são informativos e dependem das medições e do método utilizado pelo profissional responsável.</p></section>}

    {view === "avaliacao" && <section className="assessment-page section page-enter client-report">
      <div className="workspace-heading"><div><p className="eyebrow"><span/> LAUDO ENVIADO PELO PROFISSIONAL</p><h1>MINHA <em>AVALIAÇÃO</em></h1><p>Consulta protegida. Somente o administrador pode cadastrar ou alterar estes dados.</p></div><div className="read-only-badge"><span>VISUALIZAÇÃO DO CLIENTE</span><b>SOMENTE LEITURA</b></div></div>
      <div className="client-report-grid">
        <article className="report-summary"><div className="report-person"><i>{body.name.slice(0,2).toUpperCase()}</i><div><small>CLIENTE</small><h2>{body.name}</h2><span>{body.age} anos · {body.sex}</span></div></div><div className="report-date"><small>ÚLTIMA AVALIAÇÃO</small><b>10/07/2026</b><span>Profissional B7</span></div><div className="report-main-number"><small>PERCENTUAL DE GORDURA</small><strong>{bodyResult.fat.toFixed(1).replace('.',',')}<em>%</em></strong><span>Método {calcMethod.toUpperCase()}</span></div></article>
        <article className="report-indicators"><div><small>IMC</small><b>{bodyResult.bmi.toFixed(1).replace('.',',')}</b><span>{bodyResult.bmi<25?'ADEQUADO':bodyResult.bmi<30?'SOBREPESO':'ELEVADO'}</span></div><div><small>MASSA MAGRA</small><b>{bodyResult.lean.toFixed(1).replace('.',',')} kg</b><span>ESTIMADA</span></div><div><small>FFMI</small><b>{bodyResult.ffmi.toFixed(1).replace('.',',')}</b><span>ÍNDICE DE MASSA MAGRA</span></div><div><small>FMI</small><b>{bodyResult.fmi.toFixed(1).replace('.',',')}</b><span>ÍNDICE DE MASSA GORDA</span></div><div><small>RCE</small><b>{bodyResult.whtr.toFixed(2).replace('.',',')}</b><span>CINTURA / ALTURA</span></div><div><small>RCQ</small><b>{bodyResult.whr.toFixed(2).replace('.',',')}</b><span>CINTURA / QUADRIL</span></div><div><small>CONICIDADE</small><b>{bodyResult.conicity.toFixed(2).replace('.',',')}</b><span>ÍNDICE CORPORAL</span></div><div><small>PERDA DE PESO</small><b>{bodyResult.weightLoss.toFixed(1).replace('.',',')}%</b><span>DESDE A 1ª AVALIAÇÃO</span></div></article>
      </div>
      <div className="report-measures"><div className="report-section-title"><span>CIRCUNFERÊNCIAS CADASTRADAS</span><small>Valores em centímetros</small></div><div className="measure-read-grid">{[['Peso',body.weight+' kg'],['Altura',body.height+' cm'],['Pescoço',body.neck],['Ombros',extra.shoulders],['Peitoral superior',extra.chestUpper],['Busto',extra.bust],['Peitoral inferior',extra.chestLower],['Cintura',body.waist],['Abdômen linha do umbigo',extra.abdomenLine],['Abdômen inferior',extra.lowerAbdomen],['Quadril',body.hip],['Glúteos',extra.glutes],['Bíceps relaxado E/D',`${extra.relaxedLeft} / ${extra.relaxedRight}`],['Bíceps ativado E/D',`${extra.flexedLeft} / ${extra.flexedRight}`],['Antebraço E/D',`${extra.forearmLeft} / ${extra.forearmRight}`],['Coxa proximal E/D',`${extra.proximalLeft} / ${extra.proximalRight}`],['Coxa distal E/D',`${extra.distalLeft} / ${extra.distalRight}`],['Panturrilha E/D',`${extra.calfLeft} / ${extra.calfRight}`]].map(m=><div key={m[0]}><small>{m[0]}</small><b>{m[1]}</b></div>)}</div></div>
      <div className="history-strip"><div><span>HISTÓRICO DE AVALIAÇÕES</span><b>3 registros disponíveis</b></div>{[['10 JUL','90,0 kg',bodyResult.fat.toFixed(1).replace('.',',')+'%'],['12 ABR','92,2 kg','20,4%'],['08 JAN','96,0 kg','22,1%']].map(x=><article key={x[0]}><small>{x[0]}</small><b>{x[1]}</b><span>{x[2]} gordura</span></article>)}<button>COMPARAR</button></div>
      <p className="result-note">Resultados informativos derivados das medições e do método selecionado pelo profissional responsável. Não substituem diagnóstico médico.</p>
    </section>}

    {view === "alimentacao" && <section className="wellness-page section page-enter"><div className="workspace-heading"><div><p className="eyebrow"><span/> PLANO PERSONALIZADO</p><h1>MINHA <em>ALIMENTAÇÃO</em></h1><p>Plano enviado pelo profissional B7. O cliente pode acompanhar, mas não alterar a prescrição.</p></div><div className="read-only-badge"><span>PLANO DO CLIENTE</span><b>SOMENTE O ADM EDITA</b></div></div><div className="macro-cards"><article><span>CALORIAS</span><b>2.300<small> kcal</small></b><i><em style={{width:'84%'}}/></i></article><article><span>PROTEÍNAS</span><b>180<small> g</small></b><i><em style={{width:'82%'}}/></i></article><article><span>CARBOIDRATOS</span><b>250<small> g</small></b><i><em style={{width:'86%'}}/></i></article><article><span>GORDURAS</span><b>65<small> g</small></b><i><em style={{width:'70%'}}/></i></article></div><div className="meal-list">{mealPlan.map((m,index)=><article key={m.time} className={index<3?'done':index===3?'active':''}><time>{m.time}</time><div><small>REFEIÇÃO {String(index+1).padStart(2,'0')}</small><h3>{m.name.toUpperCase()}</h3><p>{m.foods}</p></div><b>{m.kcal} kcal</b><button>{index<3?'CONCLUÍDA':'MARCAR COMO CONCLUÍDA'}</button><button className="swap">VER SUBSTITUIÇÕES</button></article>)}</div></section>}

    {view === "treinos" && <section className="wellness-page section page-enter"><div className="workspace-heading"><div><p className="eyebrow"><span/> TREINO PERSONALIZADO · PEITO + TRÍCEPS</p><h1>MEU <em>TREINO</em></h1><p>Treino enviado pelo profissional B7. Alterações são exclusivas do ADM.</p></div><div className="read-only-badge"><span>FICHA DO CLIENTE</span><b>SOMENTE O ADM EDITA</b></div></div><div className="workout-grid"><article className="active-workout"><div className="exercise-index">01</div><div><small>EXERCÍCIO ATUAL</small><h2>{trainingPlan[0].name.toUpperCase()}</h2><p>{trainingPlan[0].sets} séries de {trainingPlan[0].reps} repetições · Carga anterior: {trainingPlan[0].load} kg</p></div><div className="rest-timer"><small>DESCANSO</small><strong>00:60</strong><button>INICIAR CRONÔMETRO</button></div><div className="sets">{Array.from({length:+trainingPlan[0].sets},(_,i)=><button key={i}><span>SÉRIE {i+1}</span><b>{trainingPlan[0].reps} REP</b><i>CONCLUIR</i></button>)}</div></article><aside className="exercise-list"><span>PRÓXIMOS EXERCÍCIOS</span>{trainingPlan.slice(1).map((x,i)=><button key={x.name}><small>{String(i+2).padStart(2,'0')}</small><b>{x.name}</b><span>{x.sets} × {x.reps} · {x.load} kg</span></button>)}</aside></div></section>}

    {view === "digitais" && <section className="wellness-page section page-enter"><div className="workspace-heading"><div><p className="eyebrow"><span/> BIBLIOTECA B7</p><h1>PRODUTOS <em>DIGITAIS</em></h1><p>Seus materiais, guias e cursos em um só lugar.</p></div></div><div className="digital-grid">{[['E-BOOK','Guia da Hipertrofia','68 páginas • Atualizado'],['PLANILHA','Controle de Cargas','Excel • 12 semanas'],['CURSO','Nutrição na Prática','18 aulas • 6 módulos'],['GUIA','Suplementação Essencial','42 páginas • PDF']].map((d,i)=><article key={d[1]}><div className={`digital-cover d${i}`}><span>B7</span><small>{d[0]}</small></div><div><small>{d[0]}</small><h3>{d[1]}</h3><p>{d[2]}</p><button>VISUALIZAR MATERIAL →</button></div></article>)}</div></section>}

    {view === "fotos" && <section className="wellness-page section page-enter"><div className="workspace-heading"><div><p className="eyebrow"><span/> ÁREA PRIVADA</p><h1>FOTOS DE <em>EVOLUÇÃO</em></h1><p>Compare sua jornada com segurança. Acesso exclusivo do cliente e profissional.</p></div><button className="primary">＋ ADICIONAR FOTOS</button></div><div className="photo-compare"><div><span>10/01/2026</span><div className="silhouette"><i/><i/><i/></div><small>INÍCIO • 94,2 KG</small></div><div className="compare-line"><b>−4,2</b><small>KG EM 6 MESES</small><i/></div><div><span>10/07/2026</span><div className="silhouette improved"><i/><i/><i/></div><small>ATUAL • 90,0 KG</small></div></div></section>}

    {view === "diamante" && <section className="diamond-future page-enter"><div className="diamond-stage"><DiamondIcon/><small>PROJETO B7</small><h1>DIAMANTE</h1><p>Uma nova experiência de evolução está sendo lapidada.</p><span>EM BREVE</span><i/></div></section>}

    {view === "admin" && <section className="admin-shell page-enter">
      <aside className="admin-nav">
        <div className="admin-brand"><Logo/><span>PAINEL ADMINISTRATIVO</span></div>
        <small>NAVEGAÇÃO</small>
        {([['geral','01','Visão geral'],['clientes','02','Clientes'],['avaliacoes','03','Avaliações'],['planos','04','Planos personalizados'],['produtos','05','Produtos'],['pedidos','06','Pedidos'],['acessos','07','Acessos e logins']] as [AdminView,string,string][]).map(([id,icon,label])=><button key={id} className={adminView===id?'active':''} onClick={()=>setAdminView(id)}><i>{icon}</i>{label}<span>›</span></button>)}
        <div className="admin-user"><i>RS</i><div><b>Administrador B7</b><small>ACESSO TOTAL</small></div><span>•••</span></div>
      </aside>
      <div className="admin-main">
        <header className="admin-top"><div><small>PAINEL B7 / {adminView.toUpperCase()}</small><h1>{adminView === 'geral' ? 'VISÃO GERAL' : adminView.toUpperCase()}</h1></div><div className="admin-top-actions"><button>⌕</button><button>♢<i>3</i></button><button className="live"><i/> LOJA ONLINE</button></div></header>

        {adminView === "geral" && <div className="admin-content"><div className="admin-kpis">{[['FATURAMENTO DO MÊS','R$ 48.760','+18,4%','lime'],['PEDIDOS HOJE','27','+6 desde ontem',''],['CLIENTES ATIVOS','1.248','+42 este mês',''],['AVALIAÇÕES PENDENTES','08','Requer atenção','alert']].map(k=><article key={k[0]} className={k[3]}><span>{k[0]}</span><b>{k[1]}</b><small>{k[2]}</small><i/></article>)}</div><div className="admin-dashboard-grid"><article className="revenue-card"><div className="admin-card-head"><div><span>FATURAMENTO</span><b>Últimos 7 dias</b></div><button>Este mês⌄</button></div><div className="revenue-chart"><span style={{height:'38%'}}/><span style={{height:'52%'}}/><span style={{height:'44%'}}/><span style={{height:'68%'}}/><span style={{height:'57%'}}/><span style={{height:'83%'}}/><span className="today" style={{height:'73%'}}/></div><div className="chart-labels"><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span><span>DOM</span></div></article><article className="stock-alert"><div className="admin-card-head"><div><span>ALERTAS DE ESTOQUE</span><b>4 produtos críticos</b></div><button onClick={()=>setAdminView('produtos')}>VER TODOS</button></div>{products.slice(0,3).map((p,i)=><div className="stock-row" key={p.id}><ProductArt type={p.type} tone={p.tone}/><div><b>{p.name}</b><small>{p.size}</small></div><strong>{[3,5,8][i]} un.</strong></div>)}</article></div><div className="admin-lower-grid"><RecentOrders/><RecentClients onAssessment={()=>setAdminView('avaliacoes')}/></div></div>}

        {adminView === "clientes" && <div className="admin-content"><div className="module-toolbar"><div><input placeholder="Buscar por nome, CPF ou e-mail"/><button>⌕</button></div><select><option>Todos os clientes</option><option>Ativos</option><option>Com avaliação</option></select><button className="primary">＋ NOVO CLIENTE</button></div><div className="admin-table"><div className="table-head"><span>CLIENTE</span><span>CONTATO</span><span>ÚLTIMA COMPRA</span><span>AVALIAÇÃO</span><span>STATUS</span><span>AÇÕES</span></div>{[['Raul Santos','raul@email.com','R$ 269,80','10/07/2026','ATIVO'],['Mariana Costa','mariana@email.com','R$ 179,90','08/07/2026','ATIVO'],['João Mendes','joao@email.com','R$ 89,90','PENDENTE','ATIVO'],['Ana Oliveira','ana@email.com','R$ 389,70','02/07/2026','INATIVO'],['Pedro Lima','pedro@email.com','R$ 119,90','30/06/2026','ATIVO']].map((c,i)=><div className="table-row" key={c[0]}><span className="client-cell"><i>{c[0].split(' ').map(x=>x[0]).join('')}</i><b>{c[0]}<small>Cliente #{1248-i}</small></b></span><span>{c[1]}<small>(11) 9999-{2200+i}</small></span><span><b>{c[2]}</b><small>{12-i}/07/2026</small></span><span>{c[3]}</span><span><em className={c[4]==='ATIVO'?'status-active':'status-off'}>{c[4]}</em></span><span><button onClick={()=>{setBody({...body,name:c[0]});setAdminView('avaliacoes')}}>AVALIAR</button><button>•••</button></span></div>)}</div></div>}

        {adminView === "avaliacoes" && <div className="admin-content"><div className="admin-assessment-head"><div><p className="eyebrow"><span/> COMPOSIÇÃO CORPORAL</p><h2>CALCULADORA DO <em>CLIENTE</em></h2><p>Preencha altura, peso e medidas. Todos os resultados são atualizados automaticamente.</p></div><div className="selected-client"><i>{body.name.slice(0,2).toUpperCase()}</i><div><small>CLIENTE SELECIONADO</small><b>{body.name}</b><span>Última avaliação: 10/07/2026</span></div><button onClick={()=>setAdminView('clientes')}>TROCAR</button></div></div><div className="adm-calc-grid"><form className="adm-measures" onSubmit={e=>{e.preventDefault();setSavedAssessment(true);setToast('Avaliação enviada ao perfil do cliente');setTimeout(()=>setToast(''),2200)}}><div className="form-title"><span>01</span><div><b>DADOS E MEDIDAS</b><small>Campos utilizados no cálculo</small></div></div><div className="form-grid"><label className="wide">Nome completo<input value={body.name} onChange={e=>setBody({...body,name:e.target.value})}/></label><label>Sexo<select value={body.sex} onChange={e=>setBody({...body,sex:e.target.value})}><option value="masculino">Masculino</option><option value="feminino">Feminino</option></select></label><label>Idade<input type="number" value={body.age} onChange={e=>setBody({...body,age:+e.target.value})}/></label><label>Peso <span>kg</span><input type="number" step="0.1" value={body.weight} onChange={e=>setBody({...body,weight:+e.target.value})}/></label><label>Altura <span>cm</span><input type="number" value={body.height} onChange={e=>setBody({...body,height:+e.target.value})}/></label><label>Cintura <span>cm</span><input type="number" step="0.1" value={body.waist} onChange={e=>setBody({...body,waist:+e.target.value})}/></label><label>Pescoço <span>cm</span><input type="number" step="0.1" value={body.neck} onChange={e=>setBody({...body,neck:+e.target.value})}/></label><label>Quadril <span>cm</span><input type="number" step="0.1" value={body.hip} onChange={e=>setBody({...body,hip:+e.target.value})}/></label><label>Braço <span>cm</span><input type="number" step="0.1" value={body.arm} onChange={e=>setBody({...body,arm:+e.target.value})}/></label><label>Coxa <span>cm</span><input type="number" step="0.1" value={body.thigh} onChange={e=>setBody({...body,thigh:+e.target.value})}/></label></div><label className="notes">Parecer do profissional<textarea placeholder="Metas, conduta e observações para o cliente..."/></label><button className="primary save-assessment">SALVAR E ENVIAR AO CLIENTE →</button></form><aside className="adm-results"><div className="result-top"><span>LAUDO CORPORAL</span><b>{savedAssessment?'SALVO':'TEMPO REAL'}</b></div><div className="adm-result-hero"><div><small>IMC CALCULADO</small><strong>{bodyResult.bmi.toFixed(1).replace('.',',')}</strong><span>{bodyResult.bmi<18.5?'ABAIXO DO PESO':bodyResult.bmi<25?'FAIXA ADEQUADA':bodyResult.bmi<30?'SOBREPESO':'OBESIDADE'}</span></div><div className="mini-body"><i/><i/><i/></div></div><div className="adm-result-cards"><article><small>GORDURA ESTIMADA</small><b>{bodyResult.fat.toFixed(1).replace('.',',')}<em>%</em></b></article><article><small>MASSA MAGRA</small><b>{bodyResult.lean.toFixed(1).replace('.',',')}<em>kg</em></b></article><article><small>MASSA DE GORDURA</small><b>{bodyResult.fatMass.toFixed(1).replace('.',',')}<em>kg</em></b></article><article><small>CINTURA / ALTURA</small><b>{(body.waist/body.height).toFixed(2).replace('.',',')}</b></article></div><div className="adm-interpretation"><span>INTERPRETAÇÃO RÁPIDA</span><p>O IMC relaciona peso e altura. A composição corporal utiliza também cintura, pescoço e quadril. O resultado deve ser validado pelo profissional responsável.</p><div><b>META SUGERIDA</b><strong>14% gordura</strong></div></div></aside></div></div>}

        {adminView === "avaliacoes" && <div className="admin-content assessment-details">
          <div className="detail-panel">
            <div className="detail-title"><span>02</span><div><b>CIRCUNFERÊNCIAS COMPLETAS</b><small>Ficha antropométrica conforme a planilha de avaliação</small></div></div>
            <div className="measure-editor-grid">
              {([
                ['relaxedLeft','Bíceps relaxado esquerdo'],['relaxedRight','Bíceps relaxado direito'],['flexedLeft','Bíceps ativado esquerdo'],['flexedRight','Bíceps ativado direito'],
                ['forearmLeft','Antebraço esquerdo'],['forearmRight','Antebraço direito'],['chestUpper','Peitoral acima do busto'],['bust','Busto / tórax'],
                ['chestLower','Peitoral abaixo do busto'],['shoulders','Circunferência dos ombros'],['distalLeft','Coxa distal esquerda'],['distalRight','Coxa distal direita'],
                ['proximalLeft','Coxa proximal esquerda'],['proximalRight','Coxa proximal direita'],['calfLeft','Panturrilha esquerda'],['calfRight','Panturrilha direita'],
                ['glutes','Glúteos'],['epigastric','Região epigástrica'],['abdomenLine','Abdômen linha do umbigo'],['lowerAbdomen','Abdômen inferior']
              ] as [keyof typeof extra,string][]).map(([key,label])=><label key={key}>{label}<span>cm</span><input type="number" step="0.1" value={extra[key]} onChange={e=>setExtra({...extra,[key]:+e.target.value})}/></label>)}
            </div>
          </div>
          <div className="detail-panel">
            <div className="detail-title"><span>03</span><div><b>DOBRAS CUTÂNEAS</b><small>Valores em milímetros medidos pelo profissional</small></div></div>
            <div className="folds-layout"><div className="fold-editor">{([
              ['chest','Peitoral'],['midaxillary','Axilar média'],['triceps','Tríceps'],['subscapular','Subescapular'],['abdomen','Abdominal'],['suprailiac','Supra-ilíaca'],['thigh','Coxa'],['biceps','Bíceps']
            ] as [keyof typeof folds,string][]).map(([key,label])=><label key={key}>{label}<input type="number" step="0.1" value={folds[key]} onChange={e=>setFolds({...folds,[key]:+e.target.value})}/><span>mm</span></label>)}</div>
            <div className="method-selector"><small>MÉTODO PARA O LAUDO</small>{[['jp7','Jackson & Pollock · 7 dobras'],['jp3','Jackson & Pollock · 3 dobras'],['jp4','Jackson & Pollock · 4 dobras'],['durnin','Durnin & Womersley · 4 dobras'],['circ','Circunferências · sem dobras']].map(m=><button key={m[0]} className={calcMethod===m[0]?'active':''} onClick={()=>setCalcMethod(m[0])}><i/>{m[1]}</button>)}</div></div>
          </div>
          <div className="advanced-results">
            <div className="detail-title"><span>04</span><div><b>INDICADORES E RETORNO</b><small>Atualizados automaticamente pelo método escolhido</small></div></div>
            <div className="advanced-grid">{[
              ['IMC',bodyResult.bmi.toFixed(1),'kg/m²'],['Gordura corporal',bodyResult.fat.toFixed(1),'%'],['Massa magra',bodyResult.lean.toFixed(1),'kg'],['Massa gorda',bodyResult.fatMass.toFixed(1),'kg'],
              ['FFMI',bodyResult.ffmi.toFixed(1),'massa magra / altura²'],['FMI',bodyResult.fmi.toFixed(1),'massa gorda / altura²'],['RCE',bodyResult.whtr.toFixed(2),'cintura / estatura'],['RCQ',bodyResult.whr.toFixed(2),'cintura / quadril'],
              ['Conicidade',bodyResult.conicity.toFixed(2),'índice'],['Perda percentual',bodyResult.weightLoss.toFixed(1),'% do peso inicial']
            ].map(x=><article key={x[0]}><small>{x[0]}</small><b>{x[1].replace('.',',')}</b><span>{x[2]}</span></article>)}</div>
            <div className="initial-weight"><label>Peso da primeira avaliação <input type="number" step="0.1" value={extra.initialWeight} onChange={e=>setExtra({...extra,initialWeight:+e.target.value})}/><span>kg</span></label><p>O cliente verá apenas o laudo final após o administrador salvar e enviar.</p><button className="primary" onClick={()=>{setSavedAssessment(true);setToast('Laudo completo enviado para '+body.name);setTimeout(()=>setToast(''),2200)}}>SALVAR E ENVIAR LAUDO AO CLIENTE</button></div>
          </div>
        </div>}

        {adminView === "planos" && <div className="admin-content">
          <div className="admin-assessment-head"><div><p className="eyebrow"><span/> PRESCRIÇÃO INDIVIDUAL</p><h2>PLANOS DO <em>CLIENTE</em></h2><p>Somente o administrador edita. O cliente recebe a versão final em sua área.</p></div><div className="selected-client"><i>{body.name.slice(0,2).toUpperCase()}</i><div><small>CLIENTE SELECIONADO</small><b>{body.name}</b><span>Plano ativo</span></div><button onClick={()=>setAdminView('clientes')}>TROCAR</button></div></div>
          <div className="plan-editor-grid">
            <section className="plan-editor"><div className="detail-title"><span>A</span><div><b>PLANO ALIMENTAR</b><small>Horários, alimentos e calorias</small></div></div>{mealPlan.map((m,index)=><div className="editable-plan-row" key={index}><input value={m.time} onChange={e=>setMealPlan(mealPlan.map((x,i)=>i===index?{...x,time:e.target.value}:x))}/><input value={m.name} onChange={e=>setMealPlan(mealPlan.map((x,i)=>i===index?{...x,name:e.target.value}:x))}/><input className="wide" value={m.foods} onChange={e=>setMealPlan(mealPlan.map((x,i)=>i===index?{...x,foods:e.target.value}:x))}/><input value={m.kcal} onChange={e=>setMealPlan(mealPlan.map((x,i)=>i===index?{...x,kcal:e.target.value}:x))}/></div>)}<button className="add-plan-row" onClick={()=>setMealPlan([...mealPlan,{time:'',name:'Nova refeição',foods:'',kcal:''}])}>ADICIONAR REFEIÇÃO</button><button className="primary" onClick={()=>{setToast('Plano alimentar enviado ao cliente');setTimeout(()=>setToast(''),1800)}}>SALVAR E ENVIAR ALIMENTAÇÃO</button></section>
            <section className="plan-editor"><div className="detail-title"><span>T</span><div><b>TREINO PERSONALIZADO</b><small>Exercício, séries, repetições e carga</small></div></div>{trainingPlan.map((t,index)=><div className="editable-workout-row" key={index}><input className="wide" value={t.name} onChange={e=>setTrainingPlan(trainingPlan.map((x,i)=>i===index?{...x,name:e.target.value}:x))}/><input value={t.sets} onChange={e=>setTrainingPlan(trainingPlan.map((x,i)=>i===index?{...x,sets:e.target.value}:x))}/><input value={t.reps} onChange={e=>setTrainingPlan(trainingPlan.map((x,i)=>i===index?{...x,reps:e.target.value}:x))}/><input value={t.load} onChange={e=>setTrainingPlan(trainingPlan.map((x,i)=>i===index?{...x,load:e.target.value}:x))}/></div>)}<button className="add-plan-row" onClick={()=>setTrainingPlan([...trainingPlan,{name:'Novo exercício',sets:'3',reps:'12',load:'0'}])}>ADICIONAR EXERCÍCIO</button><button className="primary" onClick={()=>{setToast('Treino enviado ao cliente');setTimeout(()=>setToast(''),1800)}}>SALVAR E ENVIAR TREINO</button></section>
          </div>
        </div>}

        {adminView === "produtos" && <div className="admin-content"><div className="module-toolbar"><div><input placeholder="Buscar produto ou SKU"/><button>⌕</button></div><select><option>Todas as categorias</option><option>Whey</option><option>Creatina</option></select><button className="primary">＋ NOVO PRODUTO</button></div><div className="admin-product-grid">{products.map(p=><article key={p.id}><div className="editable-image">{productImages[p.id]?<img src={productImages[p.id]} alt={p.name}/>:<ProductArt type={p.type} tone={p.tone}/>}<label>ALTERAR IMAGEM<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)setProductImages({...productImages,[p.id]:URL.createObjectURL(f)})}}/></label></div><div className="admin-product-info"><small>{p.brand} • SKU B7-00{p.id}</small><h3>{p.name}</h3><p>{p.size}</p><div><label>PREÇO<input defaultValue={p.price.toFixed(2).replace('.',',')}/></label><label>ESTOQUE<input defaultValue={p.id*7}/></label></div><span><em>ATIVO</em><button onClick={()=>{setToast('Alterações do produto salvas');setTimeout(()=>setToast(''),1800)}}>SALVAR</button></span></div></article>)}</div></div>}

        {adminView === "pedidos" && <div className="admin-content"><div className="module-toolbar"><div><input placeholder="Buscar pedido ou cliente"/><button>⌕</button></div><select><option>Todos os status</option><option>Pagamento aprovado</option><option>Enviado</option></select><button>EXPORTAR RELATÓRIO</button></div><div className="admin-table orders-table"><div className="table-head"><span>PEDIDO</span><span>CLIENTE</span><span>PRODUTOS</span><span>VALOR</span><span>PAGAMENTO</span><span>STATUS</span></div>{[['#B71042','Raul Santos','Creatina + Whey','R$ 269,80','PIX','PAGAMENTO APROVADO'],['#B71041','Mariana Costa','Whey Isolado','R$ 179,90','CARTÃO','EM SEPARAÇÃO'],['#B71040','João Mendes','Creatina 300g','R$ 89,90','PIX','ENVIADO'],['#B71039','Ana Oliveira','Combo Definição','R$ 389,70','CARTÃO','ENTREGUE'],['#B71038','Pedro Lima','Pré-treino','R$ 119,90','PIX','AGUARDANDO']].map(o=><div className="table-row" key={o[0]}>{o.map((x,i)=><span key={x}>{i===0?<b>{x}</b>:i===5?<em className="order-status">{x}</em>:x}</span>)}</div>)}</div></div>}

        {adminView === "acessos" && <div className="admin-content"><div className="access-summary"><article><span>USUÁRIOS CADASTRADOS</span><b>1.248</b><small>1.102 ativos nos últimos 30 dias</small></article><article><span>ACESSOS HOJE</span><b>384</b><small>Pico às 19:32</small></article><article><span>NOVOS CADASTROS</span><b>18</b><small>Hoje</small></article></div><div className="admin-table access-table"><div className="table-head"><span>USUÁRIO</span><span>E-MAIL</span><span>ÚLTIMO LOGIN</span><span>DISPOSITIVO</span><span>IP / LOCAL</span><span>STATUS</span></div>{[['Raul Santos','raul@email.com','Agora','Chrome • Windows','São Paulo, SP','ONLINE'],['Mariana Costa','mariana@email.com','Há 12 min','Safari • iPhone','Campinas, SP','OFFLINE'],['João Mendes','joao@email.com','Há 48 min','Chrome • Android','Santos, SP','OFFLINE'],['Ana Oliveira','ana@email.com','Ontem, 21:04','Safari • macOS','São Paulo, SP','OFFLINE'],['Pedro Lima','pedro@email.com','Ontem, 18:22','Chrome • Windows','Osasco, SP','OFFLINE']].map(a=><div className="table-row" key={a[0]}>{a.map((x,i)=><span key={x}>{i===0?<b>{x}</b>:i===5?<em className={x==='ONLINE'?'status-active':'status-off'}>{x}</em>:x}</span>)}</div>)}</div><p className="privacy-note">Dados de acesso devem ser utilizados somente para segurança, suporte e auditoria, respeitando a privacidade dos clientes.</p></div>}
      </div>
    </section>}

    {view === "carrinho" && <section className="cart-page section"><p className="eyebrow"><span/> FINALIZE SUA EVOLUÇÃO</p><h1>SEU <em>CARRINHO</em></h1>{cart.length === 0 ? <div className="empty-cart"><b>▱</b><h2>SEU CARRINHO ESTÁ VAZIO</h2><p>Escolha os produtos certos para o seu objetivo.</p><button className="primary" onClick={() => navigate("produtos")}>EXPLORAR PRODUTOS →</button></div> : <div className="cart-layout"><div className="cart-items">{cart.map((id,index) => { const p=products.find(x=>x.id===id)!; return <article key={`${id}-${index}`}><ProductArt type={p.type} tone={p.tone}/><div><small>{p.brand}</small><h3>{p.name}</h3><p>{p.size}</p><button onClick={() => setCart(c => c.filter((_,i) => i!==index))}>REMOVER</button></div><b>{money(p.price)}</b></article>})}</div><aside className="summary"><span>RESUMO DO PEDIDO</span><p>Subtotal <b>{money(total)}</b></p><p>Frete <b>CALCULAR</b></p><div className="coupon"><input placeholder="Cupom de desconto"/><button>APLICAR</button></div><hr/><p className="total">TOTAL <b>{money(total)}</b></p><small>ou em até 3x sem juros</small><button className="primary" onClick={() => {setToast("Checkout demonstrativo iniciado"); setTimeout(()=>setToast(""),1800)}}>FINALIZAR COMPRA →</button><button className="continue" onClick={() => navigate("produtos")}>CONTINUAR COMPRANDO</button></aside></div>}</section>}

    <footer><Logo/><p>Performance, ciência e acompanhamento para a sua melhor versão.</p><div><a>Produtos</a><a>Minha conta</a><a>Atendimento</a><a>Política de privacidade</a></div><small>© 2026 B7 SUPLEMENTOS. TODOS OS DIREITOS RESERVADOS.</small></footer>
    <button className="whatsapp" aria-label="Atendimento pelo WhatsApp">◉<span>FALE COM A B7</span></button>
    {toast && <div className="toast">✓ {toast}</div>}
  </main>;
}

function ProductGrid({ products: list, add, images }: { products: typeof products; add: (id: number) => void; images:Record<number,string> }) {
  return <div className="product-grid">{list.map(p => <article className="product-card" key={p.id}><div className="product-image"><span className="product-tag">{p.tag}</span><button className="heart" aria-label="Favoritar">SALVAR</button>{images[p.id]?<img className="store-product-image" src={images[p.id]} alt={p.name}/>:<ProductArt type={p.type} tone={p.tone}/>}</div><div className="product-info"><small>{p.brand}</small><h3>{p.name}</h3><p>{p.size}</p><div className="stars"><span>AVALIAÇÃO {p.score} / 5</span></div><del>{money(p.old)}</del><strong>{money(p.price)} <small>NO PIX</small></strong><p>ou 3x de {money(p.price / 3)}</p><button className="add" onClick={() => add(p.id)}>ADICIONAR AO CARRINHO <span>+</span></button></div></article>)}</div>;
}

function RecentOrders(){return <article className="recent-module"><div className="admin-card-head"><div><span>PEDIDOS RECENTES</span><b>Atualizado agora</b></div></div>{[['#B71042','Raul Santos','R$ 269,80','APROVADO'],['#B71041','Mariana Costa','R$ 179,90','SEPARAÇÃO'],['#B71040','João Mendes','R$ 89,90','ENVIADO']].map(o=><div className="mini-row" key={o[0]}><b>{o[0]}</b><span>{o[1]}</span><strong>{o[2]}</strong><em>{o[3]}</em></div>)}</article>}
function RecentClients({onAssessment}:{onAssessment:()=>void}){return <article className="recent-module"><div className="admin-card-head"><div><span>AVALIAÇÕES PENDENTES</span><b>Clientes aguardando</b></div><button onClick={onAssessment}>ABRIR MÓDULO</button></div>{[['JM','João Mendes','Hoje, 14:30'],['MC','Mariana Costa','Amanhã, 09:00'],['PL','Pedro Lima','Amanhã, 16:20']].map(c=><div className="mini-client" key={c[1]}><i>{c[0]}</i><b>{c[1]}<small>{c[2]}</small></b><button onClick={onAssessment}>AVALIAR →</button></div>)}</article>}
