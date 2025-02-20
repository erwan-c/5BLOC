import React, { useState, useEffect } from "react";
import { requestAccount, getAccount } from "../services/web3";
import {
  createToken,
  getAllTokens,
  buyToken,
  putTokenForSale,
  getTokenMetadata,
  cancelTokenSale,
  exchangeMultipleTokens,
} from "../services/token";
import "./styles.css";
import { FaInfoCircle } from "react-icons/fa";

const Home = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("Fosse Or");
  const [value, setValue] = useState("");
  const [hash, setHash] = useState("");
  const [tokens, setTokens] = useState([]);
  const [account, setAccount] = useState(null);
  const [myTokens, setMyTokens] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokensForExchangeFrom, setTokensForExchangeFrom] = useState([]);
  const [tokensForExchangeTo, setTokensForExchangeTo] = useState([]);
  const IPFS_ADD = process.env.REACT_APP_IPFS_ADD;
  const IPFS_BASE_URL = process.env.REACT_APP_IPFS_BASE_URL;

  useEffect(() => {
    const checkConnection = async () => {
      const connectedAccount = await getAccount();
      if (connectedAccount) {
        setAccount(connectedAccount);
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    if (account) {
      fetchTokens();
    }
  }, [account]);

  const fetchTokens = async () => {
    const allTokens = await getAllTokens();
    console.log(allTokens);
    setTokens(allTokens || []);
    const userTokens = allTokens.filter((token) => token.owner === account);
    setMyTokens(userTokens);
  };

  const handleConnect = async () => {
    const connectedAccount = await requestAccount();
    if (connectedAccount) {
      setAccount(connectedAccount);
      fetchTokens();
    }
  };

  const handleCancelSale = async (tokenId) => {
    try {
      await cancelTokenSale(tokenId);
      fetchTokens();
    } catch (error) {
      console.error("Erreur lors de l'annulation de la vente :", error);
    }
  };

  const uploadFileToIPFS = async () => {
    if (!file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(IPFS_ADD, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setHash(data.Hash);
      alert("Fichier téléchargé sur IPFS avec le hash : " + data.Hash);
    } catch (error) {
      console.error("Erreur lors du téléchargement sur IPFS :", error);
      alert("Erreur lors du téléchargement sur IPFS.");
    }
  };

  const handleCreateToken = async () => {
    if (!hash) {
      alert("Le fichier doit être téléchargé avant de créer un token.");
      return;
    }
    await createToken(name, type, value, hash);
    setName("");
    setType("");
    setValue("");
    setHash("");
    setFile(null);
    fetchTokens();
  };

  const handleBuyToken = async (tokenId, value) => {
    try {
      await buyToken(tokenId, value);
      fetchTokens();
    } catch (error) {
      console.error("Erreur lors de l'achat du token :", error);
      alert("Erreur lors de l'achat du token. Veuillez réessayer.");
    }
  };

  const handleSetTokenForSale = async (tokenId) => {
    try {
      const metadata = await getTokenMetadata(tokenId);
      const salePrice = metadata.value;

      if (salePrice > 0) {
        await putTokenForSale(tokenId);
        fetchTokens();
      } else {
        alert("Le token n'a pas de prix défini.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise en vente du token :", error);
      alert("Erreur lors de la mise en vente du token. Veuillez réessayer.");
    }
  };

  const handleTokenClick = (token) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedToken(null);
  };
  const handleClickOutside = (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal();
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleExchangeTokens = async () => {
    try {
      const totalValueFrom = await calculateTotalValue(tokensForExchangeFrom);
      const totalValueTo = await calculateTotalValue(tokensForExchangeTo);

      if (totalValueFrom !== totalValueTo) {
        alert("Les valeurs totales des tokens doivent être égales !");
        return;
      }

      await exchangeMultipleTokens(tokensForExchangeFrom, tokensForExchangeTo);
      fetchTokens();
    } catch (error) {
      console.error("Erreur lors de l'échange des tokens :", error);
      alert("Erreur lors de l'échange des tokens.");
    }
  };

  const calculateTotalValue = async (tokenIds) => {
    let totalValue = 0;
    for (const tokenId of tokenIds) {
      const metadata = await getTokenMetadata(tokenId);
      totalValue += Number(metadata.value);
    }
    return totalValue;
  };

  const handleTokenForExchangeSelection = (tokenId, type) => {
    if (type === "from") {
      setTokensForExchangeFrom((prev) => {
        if (!prev.includes(tokenId)) {
          return [...prev, tokenId];
        }
        return prev;
      });
    } else if (type === "to") {
      setTokensForExchangeTo((prev) => {
        if (!prev.includes(tokenId)) {
          return [...prev, tokenId];
        }
        return prev;
      });
    }
  };

  return (
    <div>
      {!account ? (
        <button onClick={handleConnect}>Se connecter à MetaMask</button>
      ) : (
        <>
          <p>
            <b>Connecté en tant que : </b>
            {account}
          </p>
          <input
            type="text"
            placeholder="Nom"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Valeur"
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="file-input-container">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={uploadFileToIPFS}>Télécharger sur IPFS</button>
          </div>
          <select onChange={(e) => setType(e.target.value)}>
            <option>Fosse Or</option>
            <option>Carré Or</option>
            <option>Fosse</option>
            <option>Tribunes</option>
          </select>
          <div className="center">
            <button onClick={handleCreateToken}>Créer un Ticket</button>
          </div>
          <div className="tokens-container">
            <div className="tokens-list">
              <h2>Mes Tickets</h2>
              <ul>
                {tokens
                  .filter((token) => token.owner === account)
                  .map((token, index) => (
                    <li key={index} className="token-item">
                      {token.name} - {token.typeOfResource} - {token.value} ETH
                      <button
                        onClick={() => handleTokenClick(token)}
                        className="icon-button"
                      >
                        <FaInfoCircle className="icon" />
                      </button>
                      {token.isForSale ? (
                        <span
                          style={{
                            color: "#4a90e2",
                            fontWeight: "bold",
                            marginLeft: "10px",
                          }}
                        >
                          (En vente)
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "grey",
                            fontWeight: "bold",
                            marginLeft: "10px",
                          }}
                        >
                          (Non en vente)
                        </span>
                      )}
                      {token.isForSale ? (
                        <button onClick={() => handleCancelSale(token.tokenId)}>
                          Annuler la vente
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetTokenForSale(token.tokenId)}
                        >
                          Mettre en vente
                        </button>
                      )}
                      {token.isForSale && (
                        <label className="exchange-checkbox">
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleTokenForExchangeSelection(
                                token.tokenId,
                                "from",
                                e.target.checked
                              )
                            }
                          />
                        </label>
                      )}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="tokens-list">
              <h2>Tickets en vente</h2>
              <ul>
                {tokens
                  .filter((token) => token.isForSale && token.owner !== account)
                  .map((token, index) => (
                    <li key={index}>
                      {token.name} - {token.typeOfResource} - {token.value} ETH
                      <button
                        onClick={() => handleTokenClick(token)}
                        className="icon-button"
                      >
                        <FaInfoCircle className="icon" />
                      </button>
                      <button
                        onClick={() =>
                          handleBuyToken(token.tokenId, token.value)
                        }
                      >
                        Acheter le Ticket
                      </button>
                      <label>
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            handleTokenForExchangeSelection(
                              token.tokenId,
                              "to",
                              e.target.checked
                            )
                          }
                        />
                      </label>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="center">
            <button onClick={handleExchangeTokens}>Échanger les Tickets</button>
          </div>

          <h2>Autres Tickets (Non en vente)</h2>
          <ul>
            {tokens
              .filter((token) => !token.isForSale && token.owner !== account)
              .map((token, index) => (
                <li key={index}>
                  {token.name} - {token.typeOfResource} - {token.value} ETH
                  <button onClick={() => handleTokenClick(token)}>
                    <FaInfoCircle />
                  </button>
                </li>
              ))}
          </ul>

          {isModalOpen && selectedToken && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={closeModal}>
                  &times;
                </span>
                <h3>Détails du Tickets</h3>
                <p>
                  <b>Nom :</b> {selectedToken.name}
                </p>
                <p>
                  <b>Type :</b> {selectedToken.typeOfResource}
                </p>
                <p>
                  <b>Valeur :</b> {selectedToken.value} ETH
                </p>
                <p>
                  <img
                    src={`${IPFS_BASE_URL}${selectedToken.hash}`}
                    alt={selectedToken.name}
                    style={{ maxWidth: "300px", borderRadius: "8px" }}
                  />
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
