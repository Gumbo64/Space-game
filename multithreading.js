const { Worker, isMainThread, parentPort,workerData } = require('worker_threads');
workerid = require('worker_threads').threadId;
console.log(workerid)
  if (isMainThread) {
    console.log('main thread messed up')
  } else {
    const shipslogic = require('./static/scripts/shipslogic');
    parentPort.on('message',(states)=>{
      clonedata = [ states ]
      clonedata=clonedata[0]
      // console.log(clonedata)
      ships =  clonedata[0];
      // console.log(clonedata)
      bullets = clonedata[1];
      const colours = clonedata.slice(2)
      // console.log(colours)
      returns = [];
      lengtho = colours.length;
      for (i=0;i<lengtho;i++){
        console.log(colours, 'all')
        console.log(colours[i], 'one')
        shipslogic.updateone(colours[i]);
        returns.push([ships[colours[i]],bullets[colours[i]],colours[i]]);
        // console.log('bassel')
      }
      // console.log(ships)
      parentPort.postMessage(returns);
      // console.log('closed', returns, "end")
    })
  }
  