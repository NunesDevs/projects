import test from 'node:test';
import assert from 'node:assert/strict';
import {MemoryGame,shuffle,playerName} from '../Jogo da memória/js/engine.mjs';
function fixture() { let time=0; const game=new MemoryGame({symbols:['sun','moon'],random:()=>0.999,now:()=>time});return {game,at:value=>time=value}; }
test('Fisher-Yates preserves input and deck counts and validates RNG',()=>{
 const original=['a','b','c'];assert.deepEqual(shuffle(original,()=>0),['b','c','a']);assert.deepEqual(original,['a','b','c']);
 for(const bad of[-1,1,NaN,Infinity])assert.throws(()=>shuffle(original,()=>bad),RangeError);
 assert.throws(()=>new MemoryGame({symbols:['a','a']}),TypeError);
});
test('same card and third card cannot be used to bypass mismatch lock',()=>{
 const{game}=fixture();assert.equal(game.flip(0),true);assert.equal(game.flip(0),false);game.flip(1);
 assert.equal(game.snapshot().turns,1);assert.equal(game.snapshot().locked,true);assert.equal(game.flip(2),false);
 assert.equal(game.settle(),true);assert.equal(game.snapshot().cards.filter(c=>c.revealed).length,0);
});
test('matching pairs remain matched, cannot be replayed, and win freezes time',()=>{
 const{game,at}=fixture();game.flip(0);at(1000);game.flip(2);assert.equal(game.snapshot().pairs,1);assert.equal(game.flip(0),false);
 game.flip(1);at(2500);game.flip(3);const won=game.snapshot();assert.equal(won.status,'won');assert.equal(won.turns,2);assert.equal(won.elapsedMs,2500);at(9000);assert.equal(game.snapshot().elapsedMs,2500);assert.equal(game.flip(1),false);
});
test('pausing hides all cards and excludes wall time without clearing a mismatch',()=>{
 const{game,at}=fixture();game.flip(0);game.flip(1);at(1000);game.pause();at(9000);
 assert.equal(game.snapshot().elapsedMs,1000);assert.ok(game.snapshot().cards.every(c=>c.symbol===null));assert.equal(game.settle(),false);assert.equal(game.flip(2),false);
 game.resume();at(9500);assert.equal(game.snapshot().elapsedMs,1500);assert.equal(game.snapshot().locked,true);game.settle();assert.equal(game.snapshot().locked,false);
});
test('reset clears elapsed, turns, selections, matched cards and pause state',()=>{
 const{game,at}=fixture();game.flip(0);at(1500);game.flip(2);game.pause();game.reset();const state=game.snapshot();assert.equal(state.status,'ready');assert.equal(state.turns,0);assert.equal(state.pairs,0);assert.equal(state.elapsedMs,0);assert.ok(state.cards.every(c=>!c.revealed));assert.equal(game.settle(),false);
});
test('snapshots cannot mutate the engine and invalid card indexes are ignored',()=>{
 const{game}=fixture();const state=game.snapshot();assert.throws(()=>state.cards[0].matched=true,TypeError);
 for(const index of[-1,4,0.5,NaN,'0'])assert.equal(game.flip(index),false);assert.equal(game.snapshot().status,'ready');
});
test('player names have bounded plain-text normalization',()=>{
 assert.equal(playerName(null),'Visitante');assert.equal(playerName('  Ana   Silva '),'Ana Silva');assert.equal(playerName('a'.repeat(80)).length,32);
 assert.equal(playerName('A\u0000B'),'AB');assert.equal(playerName('<img src=x>'),'<img src=x>');
});
