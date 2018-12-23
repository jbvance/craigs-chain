'use strict';

const ChainList = artifacts.require('./ChainList.sol');

contract('ChainList', accounts =>  {
    let chainListInstance;
    let seller = accounts[1];
    let articleName = 'article 1';
    let articleDescription = 'Description for article 1';
    let articlePrice = 10;

    it('should be initialized with empty values', async () => {
        const instance = await ChainList.deployed();
        const data = await instance.getArticle();        
        assert.equal(data[0], 0x0, 'seller must be empty');
        assert.equal(data[1], "", 'article name must be empty');
        assert.equal(data[2], "", 'article description must be empty');
        assert.equal(data[3].toNumber(), 0, 'article price must be zero');        
    });

    it('should sell an article', async () => {
        chainListInstance = await ChainList.deployed();
        await chainListInstance.sellArticle(
            articleName, 
            articleDescription, 
            web3.utils.toWei(articlePrice.toString(), "ether"), {from: seller})
        const data = await chainListInstance.getArticle();
        assert.equal(data[0], seller, `Seller must be ${seller}`);
        assert.equal(data[1], articleName, `article name must be ${articleName}`);
        assert.equal(data[2], articleDescription, `article description must be ${articleDescription}`);
        assert.equal(data[3], web3.utils.toWei(articlePrice.toString(), 'ether'), `article price must be ${web3.utils.toWei(articlePrice.toString(), 'ether')}`);         
    })
   
});