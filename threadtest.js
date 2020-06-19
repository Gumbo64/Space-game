const {
    Worker, isMainThread, parentPort, workerData
  } = require('worker_threads');
  const shipslogic = require('./static/scripts/shipslogic');
  number = 2

      
  if (isMainThread) {
    function workering(script) {
      return new Promise((resolve, reject) => {  
        const worker = new Worker(__filename);
        worker.once('message', function(a){resolve(a)});
        worker.once('error',reject)
        worker.once('exit',reject)
        worker.postMessage(script);
      })
    };
    value = [1,2,3,4,5,6,7,4,7]
    setTimeout(async function a() {
      // value = await workering(value);
      lasttime = Date.now()
      value = await Promise.all(value.map(workering))
      // value = await Promise.all([1,2,3,4,5,6,7,4,7].map(x => x*2))
      // console.log(Date.now()-lasttime);
      console.log(value)
      setTimeout(a, 0);
    }, 100);
    
    
  } else {
    parentPort.on('message',function(a){
      parentPort.postMessage(a*2);
    })
    
  }