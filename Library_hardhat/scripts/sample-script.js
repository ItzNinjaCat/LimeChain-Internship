// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const LibToken = await hre.ethers.getContractFactory("LIB"); 
  const libToken = await LibToken.deploy(); 
  await libToken.deployed(); 
  console.log("LibraryToken deployed to:", libToken.address);
  const Library = await hre.ethers.getContractFactory("Library"); 
  const library = await Library.deploy(ethers.utils.parseEther("0.1"), 10000, libToken.address); 
  await library.deployed(); 
  console.log("Library deployed to:", library.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
