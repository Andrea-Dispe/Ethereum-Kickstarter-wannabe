const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");
const { send } = require("process");

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
    // options.address returns the deployed contract address
    // if an address exists then the contract is deployed
    assert.ok(factory.options.address)
    assert.ok(campaign.options.address)

  })

  it('Marks caller as the campaign manager', async () => {
    // get the manager
    const manager = await campaign.methods.manager().call();
    // we deployed the contract factory and called createCampaign from it passing
    // the msg.sender as second parameter that is set as manager in the constructor of Campaign
    assert.equal(accounts[0], manager)
  })

  it('Allows people to contribute and mark the person as approver', async () => {
    await campaign.methods.contribute().send({value: 200, from: accounts[1]})
    // the approvers in Campaign is a mapping that returns a boolean
    const isApproved = await campaign.methods.approvers(accounts[1]).call()
    assert(isApproved)
  })

  it('Require a minimum contribution', async () => {
    try {
      await campaign.methods.contribute().send({value: 5, from: accounts[1]})
      // if the code above continues to here then there is no error and needs to assert false
      assert(false);
    } catch (error) {
      // if enters here it means there is an error as it should and assert there actually is by checking if error is not empty
      // and returns true
      assert(error)
    }
  })

  it('Allows the manager to make a payment request', async () => {
    await campaign.methods.createRequest(
      'Buy batteries',
      '100',
      accounts[1]
    ).send({from: accounts[0], gas: 1_000_000})

    const request = await campaign.methods.requests(0).call()
    // after creating a request and save it into the index 0 of requests
    // take that request and check if the description is the same as the one when created
    assert.equal('Buy batteries', request.description)
  })

  it('Process requests', async () => {

    let balanceBefore = await web3.eth.getBalance(accounts[1])

    await campaign.methods.contribute().send({from: accounts[0], value: web3.utils.toWei('10', 'ether')})

    await campaign.methods.createRequest(
      'A',
      web3.utils.toWei('5', 'ether'),
      accounts[1]
    ).send({from: accounts[0], gas: 1_000_000})

    await campaign.methods.approveRequest(0).send({from: accounts[0], gas: 1_000_000})

    await campaign.methods.finalizeRequest(0).send({from: accounts[0], gas: 1_000_000})

    let balanceAfter = await web3.eth.getBalance(accounts[1])
    balanceAfter = web3.utils.fromWei(balanceAfter, 'ether')
    balanceAfter = parseFloat(balanceAfter)

    console.log('balanceBefore: ', balanceBefore);
    console.log('balanceAfter: ', balanceAfter);

    assert(balanceAfter => balanceBefore + 5)



  })



})
// console.log('compiledFactory: ', compiledFactory);