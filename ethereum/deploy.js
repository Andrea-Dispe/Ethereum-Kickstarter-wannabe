const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');


const compiledFactory = require('./build/CampaignFactory.json');


const mne = 'vendor naive buddy soda stage guilt flip myth aunt snack nerve butter'
const infUrl = 'https://rinkeby.infura.io/v3/e5a53f2597f34ed89fa4d60784f44119'

const provider = new HDWalletProvider(
  mne,
  infUrl,
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
  fs.writeFileSync( path.resolve(__dirname + '/' + 'ADDRESS'), result.options.address)
  provider.engine.stop();
};
deploy();

