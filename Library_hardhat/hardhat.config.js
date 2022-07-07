require("@nomiclabs/hardhat-waffle");

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
 const INFURA_API_KEY = "01bebb09ee3b4a07b02534e76ada95f6";
 const PRIVATE_KEY = "98011c792d961d8a243163090abfcd1b9dbe775ac329e5222eebc4e7a40789b6"

 module.exports = { 
  networks: { 
    ropsten: { 
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`, 
      accounts: [`${PRIVATE_KEY}`] 
    } 
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

