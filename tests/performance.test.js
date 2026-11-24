import test from 'node:test';
import assert from 'node:assert/strict';
import {calculatePerformance} from '../src/aircraft/performance/calculatePerformance.js';
const keys=['Wingspan','Sweep','Dihedral','Root Chord','Taper Ratio','Washout'];
test('all 64 extreme wing combinations remain finite and flyable in the prototype',()=>{for(let n=0;n<64;n++){const p=calculatePerformance(Object.fromEntries(keys.map((k,i)=>[k,(n>>i)&1])));assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.minSpeed<p.maxSpeed);assert.ok(p.startingFuel>0);}});
test('greater span increases estimated capacity and reduces roll responsiveness',()=>{const a=calculatePerformance({Wingspan:0}),b=calculatePerformance({Wingspan:1});assert.ok(b.fuelCapacity>a.fuelCapacity);assert.ok(b.rollResponse<a.rollResponse);});
test('greater root chord increases area and capacity',()=>{const a=calculatePerformance({'Root Chord':0}),b=calculatePerformance({'Root Chord':1});assert.ok(b.area>a.area);assert.ok(b.fuelCapacity>a.fuelCapacity);});
