import { ethers } from "ethers";
import TokenABI from "../artifacts/Token.json";
import contractConfig from "../config/contractAddress.json";

const contractAddress = contractConfig.contractAddress;

const getProviderAndSigner = async () => {
    if (!window.ethereum) {
        alert("Veuillez installer MetaMask");
        throw new Error("MetaMask n'est pas installé");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
};

const getContract = async () => {
    const { signer } = await getProviderAndSigner();
    return new ethers.Contract(contractAddress, TokenABI.abi, signer);
};

export const createToken = async (name, typeOfResource, value, hash) => {
    try {
        const contract = await getContract();
        const tx = await contract.createToken(name, typeOfResource, value, hash);
        await tx.wait(); 
        console.log("Token créé avec succès !");
    } catch (error) {
        console.error("Erreur lors de la création du token :", error);
        alert("Erreur lors de la création du token. Veuillez réessayer.");
    }
};

export const getAllTokens = async () => {
    try {
        const contract = await getContract();
        const [tokens, owners, previousOwnersList] = await contract.getAllTokens(); 
        return tokens.map((token, index) => ({
            tokenId: index, 
            name: token.name,
            typeOfResource: token.typeOfResource,
            value: Number(token.value),
            isForSale: token.isForSale ?? false,  
            hash: token.hash,
            owner: owners[index], 
            previousOwnersList:previousOwnersList[index],
            createdAt: new Date(Number(token.createdAt) * 1000).toLocaleString(),
            lastTransferAt: new Date(Number(token.lastTransferAt) * 1000).toLocaleString(),
        }));
    } catch (error) {
        console.error("Erreur lors de la récupération des tokens :", error);
        return [];
    }
};




export const getTokenMetadata = async (tokenId) => {
    try {
        const contract = await getContract();
        const metadata = await contract.getTokenMetadata(tokenId);
        return metadata;
    } catch (error) {
        console.error(`Erreur lors de la récupération des métadonnées du token ${tokenId} :`, error);
        return null;
    }
};



export const putTokenForSale = async (tokenId) => {
    try {
        const contract = await getContract();

        const metadata = await contract.getTokenMetadata(tokenId);
        const tokenValue = metadata.value;

        const tx = await contract.putTokenForSale(tokenId);
        await tx.wait();
        alert(`Token ${tokenId} mis en vente avec succès au prix de ${tokenValue} ETH.`);
    } catch (error) {
        console.error(`Erreur lors de la mise en vente du token ${tokenId} :`, error);
        alert("Erreur lors de la mise en vente du token. Veuillez réessayer.");
    }
};

export const cancelTokenSale = async (tokenId) => {
    try {
        const contract = await getContract();
        const tx = await contract.cancelTokenSale(tokenId);
        await tx.wait();
        console.log(`Vente du token ${tokenId} annulée avec succès.`);
    } catch (error) {
        console.error(`Erreur lors de l'annulation de la vente du token ${tokenId} :`, error);
        alert("Erreur lors de l'annulation de la vente. Veuillez réessayer.");
    }
};

export const buyToken = async (tokenId, valueInEth) => {
    try {
        const contract = await getContract();
        
        const valueInWei = ethers.parseEther(valueInEth.toString()); 
        const tx = await contract.buyToken(tokenId, { value: valueInWei });
        await tx.wait();
        console.log(`Token ${tokenId} acheté avec succès.`);
    } catch (error) {
        console.error(`Erreur lors de l'achat du token ${tokenId} :`, error);
        alert("Erreur lors de l'achat du token. Veuillez réessayer.");
    }
};


export const exchangeMultipleTokens = async (tokenIdsFrom, tokenIdsTo) => {
    try {
        const contract = await getContract();

        if (tokenIdsFrom.length === 0 || tokenIdsTo.length === 0) {
            alert("Les listes de tokens à échanger ne peuvent pas être vides.");
            return;
        }

        let totalValueFrom = 0;
        let totalValueTo = 0;

        for (let i = 0; i < tokenIdsFrom.length; i++) {
            const metadata = await contract.getTokenMetadata(tokenIdsFrom[i]);
            totalValueFrom += Number(metadata.value);
        }

        for (let i = 0; i < tokenIdsTo.length; i++) {
            const metadata = await contract.getTokenMetadata(tokenIdsTo[i]);
            totalValueTo += Number(metadata.value);
        }

        if (totalValueFrom !== totalValueTo) {
            alert("Les valeurs totales des tokens à échanger doivent être égales.");
            return;
        }
        const tx = await contract.exchangeMultipleTokens(tokenIdsFrom, tokenIdsTo);
        await tx.wait(); 
        console.log("Échange des tokens réussi !");
    } catch (error) {
        console.error("Erreur lors de l'échange des tokens :", error);
        alert("Erreur lors de l'échange des tokens. Veuillez réessayer.");
    }
};
