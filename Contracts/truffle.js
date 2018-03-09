require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545, // ganache-cli address
      network_id: "*", // match any network id
      gasPrice: 50000000000, //(50 Shannon)
      gas: 6721975,
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