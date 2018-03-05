module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545, // ganache-cli adres
      network_id: "*", // match any network id
      gasPrice: 40000000000,
    },
    coverage: {
      host: "localhost",
      network_id: "*", 
      port: 8555,         
      gas: 0xfffffffffff, 
      gasPrice: 0x01      
    }
  }
};