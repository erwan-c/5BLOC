const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🚀 Deploying contracts with account:", deployer.address);

    const Token = await hre.ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.waitForDeployment(); // ⚠️ Ajouté pour s'assurer du déploiement complet

    const contractAddress = await token.getAddress();
    console.log("✅ Token contract deployed at:", contractAddress);

    // 📌 Sauvegarder l'adresse du contrat dans un fichier pour le frontend
    saveContractAddress(contractAddress);
}

function saveContractAddress(address) {
    const frontendPath = "../frontend/src/config/contractAddress.json"; // Assure-toi que le chemin est correct
    const data = { contractAddress: address };

    fs.writeFileSync(frontendPath, JSON.stringify(data, null, 2));
    console.log("📂 Contract address saved to:", frontendPath);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error deploying contract:", error);
        process.exit(1);
    });
