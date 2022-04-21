import * as queryAPI from "./queryAPI.js" ;
import * as query from "./queries.js";
//import * as chartist from "https://cdn.jsdelivr.net/chartist.js/latest/chartist.min.js";

class Task {
    constructor(name, date, xp) {
        this.name = name,
        this.date = date,
        this.xp = xp
    }
}

class DataPoint{
  constructor(x, y) {
    this.x = x,
    this.y = y
  }
}

//get data for graphs
async function getData() {
    let res = []
    let tasks = []
    let totalXp = 0;
    let data = await queryAPI.queryAPI(query.getTasks, {login: "kris"})
    data = data.progress
    //console.log(data)
    let promises = []
    for (let i = 0; i < data.length; i++) {
            let promise = queryAPI.queryAPI(query.getTaskXp, {login: "kris", task: data[i].object.name})
            promises.push(promise)

        }
    let xpData = await Promise.all(promises)
    for(let i = 0; i < xpData.length; i++) {
        let task = new Task(data[i].object.name, data[i].updatedAt, xpData[i].transaction[0].amount)
        tasks.push(task)
        totalXp += xpData[i].transaction[0].amount
    }
    res.push(tasks, totalXp)
    return res
}
let tasks = await getData()
let currentXP = tasks[1]-levelNeededXP(calculateLevel(tasks[1]))
let neededXP = levelNeededXP(calculateLevel(tasks[1])+1)-levelNeededXP(calculateLevel(tasks[1]))
document.getElementById('level').innerHTML = "level: " + calculateLevel(tasks[1])
document.getElementById('tasklist').innerHTML = "<tr id=\"toprow\"><td>TASK</td><td>COMPLETED</td><td>XP</td></tr>"
for(let i = 0; i < tasks[0].length; i++) {
    document.getElementById('tasklist').innerHTML +=  "<tr> <td>" + tasks[0][i].name + "</td><td>" + new Date(tasks[0][i].date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"}) + "</td><td>" + tasks[0][i].xp + "</td></tr>"
}

console.log(tasks[1]-levelNeededXP(calculateLevel(tasks[1])),"/", levelNeededXP(calculateLevel(tasks[1])+1)-levelNeededXP(calculateLevel(tasks[1])))
document.getElementById('totalxp').innerHTML += tasks[1]
let datapoints = []
let names = []
let xpValues = []

for (let i=0; i<tasks[0].length; i++) {
  names.push(tasks[0][i].name)
  xpValues.push(tasks[0][i].xp)
}
console.log(xpValues)
let dataxp = 0
for(let i=0; i<tasks[0].length; i++) {
  dataxp += tasks[0][i].xp
  datapoints.push(new DataPoint(new Date(tasks[0][i].date), dataxp))
}
console.log(datapoints)

//charts

new Chartist.Line('#chart1', {
  series: [
    {
      name: 'series-1',
      data: datapoints
    },
  ]
}, {
    width: 900,
    height: 300,
    fullWidth: false,
    fullHeight: false,
    chartPadding: 60,
  axisX: {
    type: Chartist.FixedScaleAxis,
    divisor: 8,
    labelInterpolationFnc: function(value) {
      return moment(value).format('MMM D');
    }
  }
});

new Chartist.Line('#chart2', {
  labels: names,
  // Naming the series with the series object array notation
  series: [{
    name: 'series-1',
    data: xpValues
  }]
}, {
  fullWidth: false,
  fullHeight: false,
  width: 900,
  height: 300,
  chartPadding: 60,
  // Within the series options you can use the series names
  // to specify configuration that will only be used for the
  // specific series.
  series: {
    'series-1': {
      lineSmooth: Chartist.Interpolation.simple(),
      showArea: true
    }
  }
}, [
  // You can even use responsive configuration overrides to
  // customize your series configuration even further!

  ['screen and (max-width: 320px)', {
    series: {
      'series-1': {
        lineSmooth: Chartist.Interpolation.none(),
        showArea: false
      }
    }
  }]
]);

chart3 = new Chartist.Pie('#chart3', {
  labels:[currentXP+'/'+ neededXP + ' XP'], 
  series: [{ name: 'done', className: 'ct-done', value: currentXP/ neededXP }, 
  {name: 'left', className: 'ct-left', value: 1-currentXP/ neededXP}]
}, {
  donut: true,
  donutWidth: 60,
  donutSolid: false,
  startAngle: 0,
  total: 1,
  showLabel: true,
  width: 220,
  height: 220
});

chart3.on('draw', function(ctx) {
  if(ctx.type === 'label') {
    
    if(ctx.index === 0) {
      ctx.element.attr({
        dx: ctx.element.root().width() / 2,
        dy: ctx.element.root().height() / 2
      });
    } else {
      ctx.element.remove();
    }
  }
});

//xp functions

function calculateLevel(xp) {
  let level = 0

  while (levelNeededXP(++level) < xp) {}

  return level-1
}

// Returns the amount of XP needed for any given level
function levelNeededXP(level) {
  return Math.round(level * (176 + 3 * level * (47 + 11 * level)))
}