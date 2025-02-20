
#  Projet  5BLOC 
##  Cas d'usage
Un concert de Taylor Swift se prépare à Tours. Le nombre de places étant limité, il est essentiel de suivre chaque interaction liée à leur distribution afin d’éviter les faux billets et de garantir que chaque ticket soit tracé. C’est pourquoi l’utilisation d’une blockchain avec des tickets sous forme de tokens est nécessaire.

##  Fonctionnalités principales

✔️ Création de tokens avec des métadonnées tel que :
 - Liste des anciens propriétaires:
 - La valeur 
 - Le hash de l'image(stockée sur un réseau IPFS)
 -  Le nom
 - Le type 
 - En vente ou non

✔️ Achat et vente de tokens entre utilisateurs 
✔️ Échange de tokens sous certaines conditions 
✔️ Stockage décentralisé des fichiers sur IPFS
 ✔️ Interface utilisateur en React.js 
✔️ Tests des smart contracts avec Hardhat

----------

## Technologies utilisées

-   **Solidity** (Smart Contracts)
-   **Hardhat** (Tests et déploiement)
-   **Ethers.js** (Interaction avec la blockchain)
-   **React.js** (Frontend de l'application)
-   **Infura/IPFS** (Stockage décentralisé)

----------

##  Déploiement du Smart Contract
### 1️⃣ Installation des dépendances

Assurez-vous d'avoir **Node.js** et **npm** installés, puis exécutez :

```bash
cd blockchain
npm install
```
### 2️⃣ Mise en place de la Blockchain Locale

```bash
npx hardhat node
```
Vous allez ensuite pouvoir récupérer les **private key** des comptes, gardez-les pour la suite.


### 3️⃣ Compilation du Smart Contract
Ouvrez un nouveau Terminal et saisissez cette commande :
```bash
npx hardhat compile
```

### 4️⃣ Déploiement sur un réseau local

```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Tests des Smart Contracts

### 1️⃣ Lancer les tests avec Hardhat

```bash
npx hardhat test
```
----------
##  Interaction avec METAMASK
Il vous faudra installer l'extension MetaMask sur votre navigateur.


Il vous faudra connecter MetaMask au réseau local, pour cela :

> Ouvrez MetaMask puis ouvrez le panel des réseaux en haut à gauche . Puis sur ***Ajouter un réseau personnalisé*** et enfin saisissez les informations : 

    Nom : NOM_DE_VOTRE_CHOIX
    RPC : http://127.0.0.1:8545
    Chain ID : 31337
    Symbole : ETH
    

> Puis sauvegardez et sélectionnez ce réseau.

Importez ensuite un compte et saisissez la **private key** enregistrée au préalable.



##  Interaction avec IPFS

Les fichiers sont stockés sur **IPFS via Infura**.

Téléchargez la derniere version de kubo au travers de cette URL : https://github.com/ipfs/kubo/releases

Une fois que c'est terminé éxécutez cette commande :
```
ipfs daemon
```

 Pour configurer l'upload, ajoutez ces variables à votre `.env` dans le frontend:

> Le fichier .env étant fourni dans l'archive, il est seulement nécessaire de vérifier si l'IP et le port indiqués en sortie de votre commande sont identiques à ceux du fichier.

```env
REACT_APP_IPFS_ADD=VOTRE_ID_INFURA
REACT_APP_IPFS_BASE_URL=VOTRE_SECRET_INFURA
```


----------
##  Lancement du Frontend

### 1️⃣ Installation des dépendances

Assurez-vous d'avoir **Node.js** et **npm** installés, puis exécutez :

```bash
cd frontend
npm install
```

### 2️⃣ Démarrer le serveur de développement

```bash
npm start
```

L'application sera disponible sur [**http://localhost:3000**](http://localhost:3000/)

----------

##  Contributeurs
 -  Mattéo Broquet,
 - Joris Meunier
 - Erwan Chaintron



 

