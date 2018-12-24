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
          web3.eth.getCoinbase((err, account) => {
               //console.log('ACCOUNT', account);  
               App.account = account;
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
               // get contract artifact and use it to instantiate a truffle contract abstraction
               App.contracts.ChainList = TruffleContract(chainListArtifact);
               // set the contract providers
               App.contracts.ChainList.setProvider(App.web3Provider.currentProvider);
               //retrieve the article from the contract;
               return App.reloadArticles();
          });
     },

     reloadArticles: async function() {
          try {
               //refresh account information in case the balance has changed
               App.displayAccountInfo();

               // retreive article placeholder and clear it
               $('#articlesRow').empty();
                    
               contractInstance = await App.contracts.ChainList.deployed();                        
               const article = await contractInstance.getArticle();               
               if (article[0] ==  0x0 ) { 
                    // still in initial state, so no article                    
                    return;
               }

               // retrieve the article template and fill with data
               const articleTemplate = $('#articleTemplate');
               articleTemplate.find('.panel-title').text(article[1]);
               articleTemplate.find('.article-description').text(article[2]);
               articleTemplate.find('.article-price').text(web3.fromWei(article[3], "ether"));

               let seller = article[0];               
               if (seller == App.account) {
                    seller = "You"
               }
               articleTemplate.find('.article-seller').text(seller);

               //add this article to articles row
               $('#articlesRow').append(articleTemplate.html());

          } catch(err) {
               //console.error(err.message);
               console.log('ERROR', err.message);
          }
     },

     sellArticle: function() {
          // retrieve the detail of the article
          var _article_name = $('#article_name').val();
          var _description = $('#article_description').val();
          var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");
      
          if((_article_name.trim() == '') || (_price == 0)) {
            // nothing to sell
            return false;
          }
      
          App.contracts.ChainList.deployed().then(function(instance) {
            return instance.sellArticle(_article_name, _description, _price, {
              from: App.account,
              gas: 500000
            });
          }).then(function(result) {
            App.reloadArticles();
          }).catch(function(err) {
            console.error(err);
          });
        },      
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
