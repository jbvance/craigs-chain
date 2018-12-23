const getWeb3 = async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      console.log('ETHEREUM PRESENT');
      const web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        return web3;
      } catch (error) {
        throw (error);
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // Use Mist/MetaMask's provider.
      const web3 = window.web3;
      console.log("Injected web3 detected.");
      return web3;
    }
    // Fallback to localhost; use dev console port by default...
    else {
      const provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:7545"
      );
      const web3 = new Web3(provider);
      console.log("No web3 instance injected, using Local web3.");
      return web3;
    }
};

App = {

     web3Provider: null,
     contracts: {},
     account: 0x0,

     init: function() {
         

          return App.initWeb3();
     },

     initWeb3: async function() {
          // initialize web3
          web3 = await getWeb3();
          App.web3Provider = web3;

          App.displayAccountInfo();

          return App.initContract();
     },

     displayAccountInfo:  function() {
          //console.log("WEB3", web3);
          web3.eth.getCoinbase(  (err, account) => {
               //console.log('ACCOUNT', account);  
               $('#account').text(account);             
               web3.eth.getBalance(account, function(err, balance) {
                    if (err === null) {
                         $('#accountBalance').text(`${web3.fromWei(balance.toString(), 'ether')} ETH`);
                    } else {
                         console.log("ERROR", err);
                    }
               })
          });                  
     },

     initContract: function() {
          $.getJSON('ChainList.json', function(chainListArtifact) {
               // get contract artificat and use it to instantiate a truffle contract abstraction
               App.contracts.ChainList = TruffleContract(chainListArtifact);
               // set the contract providers
               App.contracts.ChainList.setProvider(App.web3Provider);
               //retrieve the article from the contract;
               return App.reloadArticles();
          });
     },

     reloadArticles: function() {

     }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
