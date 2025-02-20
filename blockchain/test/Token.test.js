const { expect } = require("chai");
const { ethers } = require("hardhat"); 

describe("Token Smart Contract", function () {
  let Token, token;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(); 

  });

  it("Doit déployer le contrat avec le bon propriétaire", async function () {
    expect(await token.owner()).to.equal(owner.address);
  });

  it("Doit permettre à un utilisateur de créer un token", async function () {
    await token.connect(addr1).createToken("Gold", "Metal", 10, "hash123");

    const [tokens, owners] = await token.getAllTokens();
    expect(tokens.length).to.equal(1);
    expect(owners[0]).to.equal(addr1.address);
  });

  it("Doit empêcher un utilisateur de dépasser la limite de 4 tokens", async function () {
    for (let i = 0; i < 4; i++) {
        await token.connect(addr1).createToken(`Token ${i}`, "Type", 10, "hash");
        await network.provider.send("evm_increaseTime", [300]); 
    }

    await expect(
        token.connect(addr1).createToken("Token 5", "Type", 10, "hash")
    ).to.be.revertedWith("Maximum resources reached");
});

  it("Doit permettre de mettre un token en vente", async function () {
    await token.connect(addr1).createToken("Diamond", "Gem", 20, "hashXYZ");
    
    await token.connect(addr1).putTokenForSale(0);
    const metadata = await token.getTokenMetadata(0);
    
    expect(metadata.isForSale).to.equal(true);
  });

  it("Doit permettre d'annuler la vente d'un token", async function () {
    await token.connect(addr1).createToken("Silver", "Metal", 15, "hashSilver");
    
    await token.connect(addr1).putTokenForSale(0);
    await token.connect(addr1).cancelTokenSale(0);
    const metadata = await token.getTokenMetadata(0);
    
    expect(metadata.isForSale).to.equal(false);
  });

  it("Doit permettre l'achat d'un token", async function () {
    await token.connect(addr1).createToken("Token 1", "Type", 10, "hash");
    await token.connect(addr1).putTokenForSale(0);

    await expect(
        token.connect(addr2).buyToken(0, { value: ethers.parseEther("1") })
    ).to.changeEtherBalances([addr1, addr2], [ethers.parseEther("1"), ethers.parseEther("-1")]);
});

  it("Doit permettre l'échange de tokens entre deux utilisateurs", async function () {
    await token.connect(addr1).createToken("TokenA", "Resource", 50, "hashA");
    await token.connect(addr2).createToken("TokenB", "Resource", 50, "hashB");

    await token.connect(addr1).exchangeMultipleTokens([0], [1]);

    expect(await token.ownerOf(0)).to.equal(addr2.address);
    expect(await token.ownerOf(1)).to.equal(addr1.address);
  });

  it("Doit empêcher un échange si les valeurs des tokens ne sont pas égales", async function () {
    await token.connect(addr1).createToken("TokenX", "Resource", 40, "hashX");
    await token.connect(addr2).createToken("TokenY", "Resource", 30, "hashY");

    await expect(
      token.connect(addr1).exchangeMultipleTokens([0], [1])
    ).to.be.revertedWith("Les valeurs totales des tokens echanges doivent etre egales.");
  });

});
