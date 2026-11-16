import {playerName} from './engine.mjs';
const key='nd-projects-memory-player';
const input=document.getElementById('nickname'),play=document.getElementById('play'),message=document.getElementById('nickname_help');
try { input.value=sessionStorage.getItem(key)||''; } catch { /* Storage may be unavailable; visiting still works. */ }
function valid(){return input.value.trim().length>=2&&input.value.trim().length<=32;}
function start(name){try{sessionStorage.setItem(key,playerName(name));}catch{}location.assign('pages/game.html');}
input.addEventListener('input',()=>{play.disabled=!valid();message.textContent='De 2 a 32 caracteres. O apelido fica somente nesta sessão do navegador.';});
document.getElementById('login_form').addEventListener('submit',event=>{event.preventDefault();if(!valid()){message.textContent='Use um apelido de 2 a 32 caracteres, ou escolha Visitante.';input.focus();return;}start(input.value);});
document.getElementById('visitor').addEventListener('click',()=>start('Visitante'));
play.disabled=!valid();
