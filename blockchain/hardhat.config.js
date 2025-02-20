require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", 
      accounts: [`0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61`] 

    },
  }
};
