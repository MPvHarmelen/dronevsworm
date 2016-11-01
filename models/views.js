//////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// VIEWS /////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

var express = require('express.io');
var path = require('path');
var app = express().http().io()

// view engine setup
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Send client html
var sent_last;
app.get('/', function(req, res) {
  res.render('overview', sent_last);
})

var UpdateDisplay = function(newData) {

  var control = {
    Algoritm_All: [],
    Param: [],
  };

  Object.keys(newData.control.Algoritm).forEach(function(alg) {
    control.Algoritm_All.push({ key: alg, active: (alg == newData.control.Algoritm_Active) })
  })
  var activeAlgoritm = newData.control.Algoritm[newData.control.Algoritm_Active];
  Object.keys(activeAlgoritm.Param).forEach(function(paramKey) {
    var param = activeAlgoritm.Param[paramKey];
    param.key = paramKey;
    control.Param.push(param)
  })

  drone = newData.lstFlock[0]
  var info = {
    id: drone.id,

    show: [
      { name: 'power', icon: 'bolt', title: 'Battery', value:
        drone.navdata.t0.demo ? drone.navdata.t0.demo.batteryPercentage : '- %'
      },
      { name: 'xyzTarget', icon: 'car', title: 'X,Y,Z Speed', value: [
          Math.round(drone.go.autopilot.vx * 100) / 100,
          Math.round(drone.go.autopilot.vy * 100) / 100,
          Math.round(drone.go.autopilot.vz * 100) / 100,
          Math.round(drone.go.autopilot.vYaw * 100) / 100,
        ]
      },
      { name: 'xyzControl', icon: 'gamepad', title: 'X,Y,Z Speed', value: [
          Math.round(drone.go.control.vx * 100) / 100,
          Math.round(drone.go.control.vy * 100) / 100,
          Math.round(drone.go.control.vz * 100) / 100,
          Math.round(drone.go.control.vYaw * 100) / 100,
        ]
      },
      { name: 'connect', icon: 'refresh', title: 'Last connect', value: Math.min(new Date().getTime() - drone.navdata.t0.timestamp, 9999) + ' ms' },
    ],

    state_0: [
      { name: 'autopilot', icon: 'car', title: 'Auto pilot', value: '' },
      { name: 'takeoff', icon: 'level-up', title: 'Drone fly', value: '' },
      { name: 'safeToggle', icon: 'shield', title: 'Drone in a safe state', value: '' }
    ],
    state_1: [
      { name: 'control', icon: 'gamepad', title: 'Manual control', value: '' },
      { name: 'land', icon: 'level-down', title: 'Drone land', value: '' },
      { name: 'stopped', icon: 'stop', title: 'Drone is stopped by safety', value: '' },
    ],
  }

  if(drone.state) {

    info.state_0[0].value = (1 === drone.state.autopilot ? 'success' : 'danger');
    info.state_0[1].value = (1 === drone.state.inAir ? 'success' : 'danger');
    info.state_0[2].value = (1 === drone.state.safe ? 'success' : 'danger');

    info.state_1[0].value = (1 === drone.state.control ? 'success' : 'danger');
    info.state_1[1].value = (1 !== drone.state.inAir ? 'success' : 'danger');
    info.state_1[2].value = (1 === drone.state.stopped ? 'success' : 'danger');
  }

  sent_last = {
    drone: info,
    control: control,
  };
  app.io.broadcast('Update_Display', sent_last);
}


module.exports = {
  app: app,
  UpdateDisplay: UpdateDisplay
}
