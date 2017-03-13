var timestep;
var lastUpdate = 0;

var world;
var minfo;
var fps = 0;
var f = [0,0,0];
var bodies = [];

var pin, pindata = new Float32Array(7);
self.onmessage = function(e) {
    if (e.data.oimoUrl && !world) {
        timestep = e.data.dt;
        // Load oimo.js
        importScripts( e.data.oimoUrl );
        // Init physics
        world = new OIMO.World({
            timestep: timestep,
            iterations: 8,
            broadphase: 3, // 1: brute force, 2: sweep & prune, 3: volume tree
            worldscale: 1,
            random: true,
            info: false, // display statistique
        });

        // Ground plane
        world.add({size:[50, 50, 50], pos:[0,-25 * 0.99,0],  move:false }, 'box');

        var N = e.data.N;
        var size = [1,0.1,1];
        minfo = new Float32Array( (N + 1) * 8 );
        for(var i=0; i!==N; i++){
            var position = [ -5 + 10 * Math.random(), (i+1)*0.1, -5 + 10 * Math.random()];
            bodies[i] = world.add({size:size, pos:position,  friction:1, restitution:0.1, move:true, sleep:0  }, 'box');
        }

        bodies[N] = world.add({size:[15, 1, 5], pos:[0, 0, -10],  friction:1, restitution:0.1, move:true, sleep:0  }, 'box');
        setTimeout(function () {
            bodies[N].linearVelocity.z = 10;
        }, 2000);

        // pin = world.add({size:[0.1,0.1,1], pos:[position[0], 3, position[2]],  friction:0, restitution:0, move:false, sleep:0  }, 'box');
        // pin.resetRotation(0,0,45);

        // bodies[i-1].orientation.multiply(new OIMO.Quat().setFromAxis(new OIMO.Vec3(1,0,0),Math.PI/2));
        // bodies[i-1].awake();

        // bodies[i-1].resetRotation(90,0,0);

        run();

    }
};


var run = function() {
    lastUpdate = Date.now();

    // Step the world
    world.step();
    var n;
    bodies.forEach( function ( b, id ) {
        n = 8 * id;
        if( b.sleeping ){
            minfo[ n + 7 ] = 1;
        } else {
            minfo[ n + 7 ] = 0;
            b.getPosition().toArray( minfo, n );
            b.getQuaternion().toArray( minfo, n+3 );
        }
    });
    var now = Date.now();
    f[1] = now;
    if (f[1]-1000>f[0]){ f[0]=f[1]; fps=f[2]; f[2]=0; } f[2]++;
    // pin.getPosition().toArray(pindata);
    // pin.getQuaternion().toArray(pindata, 3);
    self.postMessage({ perf:fps, minfo:minfo /*, pindata: pindata*/ });

    // Schedule next step
    var delay = timestep * 1000 - now + lastUpdate;
    setTimeout(run, delay < 0 ? 0 : delay );
};
