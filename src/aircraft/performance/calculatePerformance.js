// Bounded conceptual aerodynamic model. Morph geometry is deliberately extreme;
// physical calibration ranges are design limits, not measured full morph dimensions.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function calculatePerformance(morphs={}) {
  const defaults={Wingspan:.25,Sweep:0,Dihedral:.3,'Root Chord':.45,'Taper Ratio':.25,Washout:0};
  const v=k=>clamp(Number(morphs[k]??defaults[k])||0,0,1)-defaults[k];
  const span=13.5*(1+.45*v('Wingspan'));
  const root=1.6*(1+.4*v('Root Chord'));
  const taper=.5*(1-.45*v('Taper Ratio'));
  const sweep=3+30*v('Sweep'), dihedral=5+15*v('Dihedral'), washout=2+4*v('Washout');
  const tip=root*taper, area=span*(root+tip)/2, ar=span*span/area;
  const volume=span*(root*root+root*tip+tip*tip)/3;
  const baseVolume=13.5*(1.6**2+1.6*.8+.8**2)/3;
  const fuelCapacity=289*clamp(volume/baseVolume,.5,1.8);
  const startingFuel=fuelCapacity*.004;
  const mass=1550+100*(area/16.2-1)+startingFuel*.8;
  const clMax=1.65*Math.cos(sweep*Math.PI/180)*(1-.02*Math.max(0,washout-2));
  const stallSpeed=Math.sqrt(2*mass*9.81/(1.225*area*clMax));
  const e=clamp(.83-.22*(taper-.5)**2-.003*(sweep-3)-.008*(washout-2),.55,.9);
  const cd0=.025+.003*(area/16.2-1)+.00015*(sweep-3);
  const dragAt=speed=>{const q=.5*1.225*speed*speed; const cl=mass*9.81/(q*area);return q*area*(cd0+cl*cl/(Math.PI*e*ar));};
  const baselineDrag= .5*1.225*65**2*16.2*(.025+(1550*9.81/(.5*1.225*65**2*16.2))**2/(Math.PI*.83*11.25));
  const dragRatio=dragAt(65)/baselineDrag;
  const rollResponse=clamp(1/((span/13.5)**1.8*(1+.025*(dihedral-5))),.35,1.3);
  const liftRatio=clMax*area/(1.65*16.2)*1550/mass;
  return {span,root,taper,sweep,dihedral,washout,area,aspectRatio:ar,fuelCapacity,startingFuel,mass,stallSpeed,dragRatio,rollResponse,
    maxSpeed:clamp(65/Math.sqrt(dragRatio),35,80), minSpeed:12*stallSpeed/30, acceleration:8*1550/mass/Math.sqrt(dragRatio), deceleration:10*dragRatio*1550/mass, brakeDeceleration:22*1550/mass, lateralSpeed:18*rollResponse, verticalSpeed:12*clamp(liftRatio,.5,1.5), controlResponse:3.5*rollResponse};
}
export function fuelFlow(throttle){return 5+57*throttle;}

export function coordinatedTurnRate(bank, speed) {
  return 9.81 * Math.tan(bank) / Math.max(10, speed);
}
