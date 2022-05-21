const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaignAddres;
let campaign;

beforeEach(async() => {
  accounts = await web3.eth.getAccounts();

  // create an instance of the contract
  // Contract expects the abicode (interface) in javascript format
  // when the contract needs to be deployed COntract only takes the abicode requried to deploy the contract
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
  // deploy the contract. It takes the bytecode
  .deploy({data: compiledFactory.bytecode})
  // send the transaction required to deploy the contract on the blockchain
  .send({from: accounts[0], gas: 1_000_000})

  console.log('factory.options: ', factory.options);

  // instanciate a single contract from the factory
  // cretae campagin deploys a contract so we need to send a transaction
  await factory.methods.createCampaign('100').send({from: accounts[0], gas: 1_000_000});
  // since getDeployedCampaigns is a view function you just need to use call and not send
 [campaignAddres] = await factory.methods.getDeployedCampaigns().call()
  // instanciate a contract already deployed by the factory with COntract where here not only takes
  // the abicode but also the contract address
  campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddres)

  console.log('campaignAddres: ', campaignAddres);
  console.log('factory.options.address: ', factory.options.address);
  console.log('campaign.options.address: ', campaign.options.address);
})


describe('Campaigns', () => {
  it('Deploys a factory and a campagin', () => {
    // factory.options.address returns the deployed contract address
    assert.ok(factory.options.address)
    assert.ok(campaign.options.address)

  })
})
// console.log('compiledFactory: ', compiledFactory);