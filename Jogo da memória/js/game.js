import {MemoryGame,playerName} from './engine.mjs';
const symbols={sun:'sol',moon:'lua',star:'estrela',leaf:'folha',flame:'chama',wave:'ondas',mountain:'montanha',gem:'cristal',flower:'flor',bolt:'raio'};
const engine=new MemoryGame({symbols:Object.keys(symbols)});
const grid=document.getElementById('grid'),pause=document.getElementById('pause'),status=document.getElementById('game_status');
let mismatch=null,ticker=null,previous='ready';
try{document.getElementById('player').textContent=playerName(sessionStorage.getItem('nd-projects-memory-player'));}catch{}
const buttons=Object.keys(symbols).flatMap(()=>[null,null]).map((_value,index)=>{
 const button=document.createElement('button');button.type='button';button.className='card';button.dataset.index=String(index);button.setAttribute('aria-describedby','keyboard_help');
 button.addEventListener('click',()=>{if(engine.flip(index)){render();if(engine.snapshot().locked)scheduleMismatch();}});
 grid.appendChild(button);return button;
});
function duration(milliseconds){const total=Math.floor(milliseconds/1000);return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');}
function updateTime(){document.getElementById('time').textContent=duration(engine.snapshot().elapsedMs);}
function cancelMismatch(){if(mismatch!==null)clearTimeout(mismatch);mismatch=null;}
function scheduleMismatch(){cancelMismatch();mismatch=setTimeout(()=>{mismatch=null;engine.settle();render();},500);}
function render(){
 const state=engine.snapshot();
 document.getElementById('pairs').textContent=state.pairs+'/'+state.totalPairs;
 document.getElementById('moves').textContent=String(state.turns).padStart(2,'0');updateTime();
 pause.textContent=state.status==='paused'?'Retomar':'Pausar';pause.disabled=state.status==='ready'||state.status==='won';
 for(const card of state.cards){
  const button=buttons[card.id],matched=card.matched&&state.status!=='paused';
  button.classList.toggle('matched',matched);button.classList.toggle('revealed',card.revealed&&!card.matched);
  button.disabled=state.status==='paused'||state.status==='won';
  button.setAttribute('aria-disabled',String(card.matched||state.locked||button.disabled));
  button.setAttribute('aria-label','Carta '+(card.id+1)+(card.revealed?', '+symbols[card.symbol]+(matched?', par encontrado':''):', oculta'));
  button.replaceChildren();
  if(card.revealed){const image=document.createElement('img');image.src='../assets/symbols/'+card.symbol+'.svg';image.alt='';image.width=image.height=32;button.appendChild(image);
   if(matched){const label=document.createElement('span');label.className='matched-label';label.textContent='Par';button.appendChild(label);}
  }else{const question=document.createElement('span');question.className='question';question.textContent='?';question.setAttribute('aria-hidden','true');button.appendChild(question);}
 }
 status.textContent=state.status==='paused'?'Partida pausada. Retome quando quiser.':state.status==='won'?'Você encontrou os 10 pares em '+state.turns+' jogadas. Use Reiniciar para jogar novamente.':state.status==='ready'?'Selecione uma carta para começar.':state.locked?'Observe as duas cartas…':'Selecione uma carta para continuar.';
 if(state.status==='won'&&previous!=='won')document.getElementById('restart').focus();
 previous=state.status;
}
function pauseGame(){if(engine.pause()){cancelMismatch();render();}}
pause.addEventListener('click',()=>{if(engine.resume()){render();if(engine.snapshot().locked)scheduleMismatch();}else pauseGame();});
document.getElementById('restart').addEventListener('click',()=>{cancelMismatch();engine.reset();render();buttons[0].focus();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();});
window.addEventListener('blur',pauseGame);
window.addEventListener('pagehide',()=>{pauseGame();cancelMismatch();clearInterval(ticker);ticker=null;});
window.addEventListener('pageshow',()=>{if(ticker===null)ticker=setInterval(updateTime,250);});
render();ticker=setInterval(updateTime,250);
