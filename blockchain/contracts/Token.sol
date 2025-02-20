// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Token is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    address public owner;
    uint public maxResourcesPerUser = 4;
    mapping(address => uint) public userResourcesCount;

    struct TokenMetadata {
        string name;
        string typeOfResource;
        uint value;
        string hash;
        address[] previousOwners;
        bool isForSale;
        uint createdAt;
        uint lastTransferAt;
    }

    mapping(uint256 => TokenMetadata) public tokenMetadata;

    mapping(uint256 => uint256) public tokenForSale;

    mapping(address => uint) public lastTransactionAt;

    mapping(address => uint) public lockUntil;

    constructor() ERC721("ResourceToken", "RTK") {
        owner = msg.sender;
    }

    function createToken(
        string memory name,
        string memory typeOfResource,
        uint value,
        string memory hash
    ) public {
        require(
            userResourcesCount[msg.sender] < maxResourcesPerUser,
            "Maximum resources reached"
        );

        require(
            block.timestamp >= lastTransactionAt[msg.sender] + 5 minutes,
            "Vous ne pouvez creer qu'un ticket toutes les 5 minutes"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(msg.sender, tokenId);

        address[] memory previousOwners = new address[](1);
        previousOwners[0] = msg.sender;

        tokenMetadata[tokenId] = TokenMetadata({
            name: name,
            typeOfResource: typeOfResource,
            value: value,
            hash: hash,
            previousOwners: previousOwners,
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            isForSale: false
        });

        userResourcesCount[msg.sender] += 1;
        lastTransactionAt[msg.sender] = block.timestamp;
    }

    function getAllTokens()
        public
        view
        returns (TokenMetadata[] memory, address[] memory, address[][] memory)
    {
        uint256 totalTokens = _tokenIdCounter.current();
        TokenMetadata[] memory tokens = new TokenMetadata[](totalTokens);
        address[] memory owners = new address[](totalTokens);
        address[][] memory previousOwnersList = new address[][](totalTokens);

        for (uint256 i = 0; i < totalTokens; i++) {
            if (_exists(i)) {
                tokens[i] = tokenMetadata[i];
                owners[i] = ownerOf(i);
                previousOwnersList[i] = tokenMetadata[i].previousOwners;
            }
        }
        return (tokens, owners, previousOwnersList);
    }
    function getTokenMetadata(
        uint256 tokenId
    ) public view returns (TokenMetadata memory) {
        require(_exists(tokenId), "Le ticket n'existe pas");
        return tokenMetadata[tokenId];
    }

    function putTokenForSale(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Vous n'etes pas le proprietaire de ce ticket"
        );
        uint256 tokenValue = tokenMetadata[tokenId].value;
        tokenForSale[tokenId] = tokenValue;
        tokenMetadata[tokenId].isForSale = true;
    }

    function cancelTokenSale(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "Vous n'etes pas le proprietaire de ce ticket"
        );
        tokenForSale[tokenId] = 0;
        tokenMetadata[tokenId].isForSale = false;
    }

    function buyToken(uint256 tokenId) public payable {
        uint256 salePrice = tokenForSale[tokenId];
        require(salePrice > 0, "Le ticket n'est pas a vendre");
        require(msg.value >= salePrice, "Pas assez de fonds");

        require(
            block.timestamp >= lockUntil[msg.sender],
            "Vous etes temporairement bloques"
        );

        address seller = ownerOf(tokenId);
        address buyer = msg.sender;

        payable(seller).transfer(msg.value);

        tokenMetadata[tokenId].previousOwners.push(seller);

        _transfer(seller, buyer, tokenId);

        tokenForSale[tokenId] = 0;

        lockUntil[msg.sender] = block.timestamp + 10 minutes;

        lastTransactionAt[msg.sender] = block.timestamp;
    }

    function exchangeMultipleTokens(
        uint256[] memory tokenIdsFrom,
        uint256[] memory tokenIdsTo
    ) public {
        require(
            tokenIdsFrom.length > 0 && tokenIdsTo.length > 0,
            "Les listes de tokens ne peuvent pas etre vides."
        );

        uint256 totalValueFrom = 0;
        uint256 totalValueTo = 0;

        address ownerFrom = ownerOf(tokenIdsFrom[0]);
        address ownerTo = ownerOf(tokenIdsTo[0]);

        require(
            ownerFrom != ownerTo,
            "Vous ne pouvez pas echanger vos propres tokens entre eux."
        );
        require(
            ownerFrom == msg.sender || ownerTo == msg.sender,
            "Vous devez posseder au moins un des tokens pour echanger."
        );

        for (uint256 i = 0; i < tokenIdsFrom.length; i++) {
            require(
                ownerOf(tokenIdsFrom[i]) == ownerFrom,
                "Tous les tokens de la premiere liste doivent appartenir au meme proprietaire."
            );
            totalValueFrom += tokenMetadata[tokenIdsFrom[i]].value;

            tokenMetadata[tokenIdsFrom[i]].previousOwners.push(ownerFrom);
        }

        for (uint256 i = 0; i < tokenIdsTo.length; i++) {
            require(
                ownerOf(tokenIdsTo[i]) == ownerTo,
                "Tous les tokens de la seconde liste doivent appartenir au meme proprietaire."
            );
            totalValueTo += tokenMetadata[tokenIdsTo[i]].value;

            tokenMetadata[tokenIdsTo[i]].previousOwners.push(ownerTo);
        }

        require(
            totalValueFrom == totalValueTo,
            "Les valeurs totales des tokens echanges doivent etre egales."
        );

        for (uint256 i = 0; i < tokenIdsFrom.length; i++) {
            _transfer(ownerFrom, ownerTo, tokenIdsFrom[i]);
        }

        for (uint256 i = 0; i < tokenIdsTo.length; i++) {
            _transfer(ownerTo, ownerFrom, tokenIdsTo[i]);
        }
    }
}
