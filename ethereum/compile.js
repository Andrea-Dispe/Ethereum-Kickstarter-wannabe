const path = require('path');
const fs = require('fs-extra');
const solc =  require('solc');



// tale the build folder and delete if exists
const buildPath = path.resolve(__dirname, 'build')
if(buildPath) {
  fs.removeSync(buildPath)
}

// take the Campaign contract and compile it with solidity compiler
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol')
const source = fs.readFileSync(campaignPath, 'utf8')
const output = solc.compile(source, 1).contracts

console.log('output: ', output);

fs.ensureDirSync(buildPath)


const keys = Object.keys(output)
// for each contract save the abicode and bytecode into a relative file
keys.forEach(key =>  {
  try {
    fs.writeFileSync(path.resolve(buildPath, (key.replace(':', '')) + '.json'),   JSON.stringify({
      bytecode: output[key].bytecode,
      interface: output[key].interface
    }))
  } catch (error) {
    console.log('error: ', error);
  }
})


// // write each compiled contract
// for (let contract in output) {
//   console.log('contract: ', contract);
//   fs.outputJsonSync(path.resolve(buildPath, contract.replace(':', '') + '.json'),  output[contract])
// }