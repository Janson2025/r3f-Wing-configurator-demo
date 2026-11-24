# TwinStar Flight Lab

React Three Fiber aircraft configurator and guided racing prototype.

## Install and run (PowerShell)

```powershell
yarn install
yarn dev
```

The pilot uses `@pixiv/three-vrm` (3.x). Run `yarn build` and `node --test tests/*.test.js` to verify the build and numerical behavior. Clouds use a local texture.

## Controls

Click the circular control above the standing pilot to switch between idle and seated poses. Open **Development · Cockpit alignment** under **Wing geometry** to adjust both pilot positions, pilot scale, and the control stick and panel positions. Settings update live and are saved in this browser. Collapse the section to hide the controls. During flight, the Flight path button toggles the guide line.

W/S throttle, up/down pitch down/up, left/right roll, A/D rudder, Space brakes, C camera, P pause, Esc exit. Set automatic path following and shadow visibility before or during flight. Switching guidance mid-flight invalidates the record. A fixed-speed reference ghost is replaced on the next flight only by a faster completed flight in the same guidance category; records use localStorage.

## Pilot setup

The actual assets are `public/models/Sariah.vrm` (VRM 1.0), `public/animations/Idle.fbx` and `public/animations/Piloting.fbx` (Mixamo skeleton names). The pilot uses a humanoid retargeting adapter. Edit `src/model/pilot/pilotConfig.js` to tune the default pilot placement, hand assignments, and stick grip. The stick follows the left hand while keeping its base pivot. When the pilot sits, the adjusting slider attaches to the right hand and returns to its panel mount when the pilot stands. The panel stays mounted to the aircraft. The animations drive the hands; input-driven hand IK is future work. Pilot asset failures are isolated and logged without intentionally disabling the aircraft.

## Flight and performance

`src/aircraft/performance/calculatePerformance.js` uses bounded estimated dimensions relative to the GLB's exported morph defaults. The full Wingspan shape key is extremely large (right-wing tip X changes from -11.91 to -61.88), so visual geometry and physical estimates intentionally differ. The model uses approximate planform, induced drag, mass, roll response and fuel capacity; speed is in scene units. The race allocation is 0.4% of estimated tank capacity, not a real aircraft fuel load. Fuel flow is throttle dependent. Manual flight integrates heading and velocity, uses approximate checkpoint validation. Assisted flight clamps offsets. Leaving the 55-unit corridor triggers a red flash and a four-second recovery countdown. Each of the three gold rings awards 100 points on a forward pass through its opening. The fixed-step simulation interpolates aircraft and replay presentation between ticks. This is not a certified flight model or a full aerodynamic simulator. Takeoff/landing, terrain collisions, and stall behavior need further refinement. Reference ghost speed is 38 scene units/s. Pause freezes simulation time.
