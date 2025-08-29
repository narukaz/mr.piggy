// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract MRPIGGY is ERC721 {
    uint256 public nextTokenId;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        nextTokenId = 0;
    }

    function safeMint(address to) public {
        _mint(to, nextTokenId);
        nextTokenId++;
    }

    function _update(
        address _to,
        uint256 _tokenId,
        address _auth
    ) internal virtual override returns (address) {
        return super._update(_to, _tokenId, _auth);
    }
}
