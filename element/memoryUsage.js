const util = require('util');

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(util.inspect(memoryUsage));
}, 1000);
