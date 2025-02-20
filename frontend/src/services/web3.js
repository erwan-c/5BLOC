import { BrowserProvider } from "ethers"; 

export const requestAccount = async () => {

    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            return accounts[0];
        } catch (error) {
            console.error("Erreur lors de la connexion à MetaMask:", error);
            alert(`Erreur MetaMask: ${error.message}`);
        }
    } else {
        alert(" MetaMask n'est pas installé !");
    }
};


export const getAccount = async () => {
    if (window.ethereum) {
        try {
            const provider = new BrowserProvider(window.ethereum); 
            const signer = await provider.getSigner();
            return await signer.getAddress(); 
        } catch (error) {
            console.error("Erreur lors de la récupération du compte:", error);
        }
    } else {
        alert("Veuillez installer MetaMask");
    }
    return null;
};
