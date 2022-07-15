const { ethers } = require("ethers");

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
//require("@nomiclabs/hardhat-ethers");
require('solidity-coverage');
require("dotenv").config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 module.exports = { 
  networks: { 
    ropsten: { 
      url: `https://ropsten.infura.io/v3/${process.env.ROPSTEN_API_KEY}`, 
      accounts: [`${process.env.PRIVATE_KEY_OWNER}`, `${process.env.PRIVATE_KEY_ADDR1}`] 
    } 
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
  solidity: { 
    version: "0.8.7", 
    settings: { 
      optimizer: { 
        enabled: true, 
        runs: 200, 
      }, 
    }, 
  },

 };