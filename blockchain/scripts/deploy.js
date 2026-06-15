const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const candidateNames = ["Alice Johnson", "Bob Smith", "Charlie Lee"];

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(candidateNames);
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log(`Voting contract deployed to: ${address}`);

  // Save the contract address and ABI to the frontend
  const frontendDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // Get the ABI from the compiled artifact
  const artifact = await hre.artifacts.readArtifact("Voting");

  const contractData = {
    address: address,
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(frontendDir, "Voting.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract data saved to frontend/src/contracts/Voting.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
