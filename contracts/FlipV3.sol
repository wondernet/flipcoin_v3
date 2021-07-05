import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

pragma solidity ^0.8.5;

contract FlipContractV3 is Ownable {
    using SafeMath for uint256;

    event bet(
        address indexed user,
        uint256 indexed bet,
        uint8 indexed win,
        uint8 side
    );

    event funded(address sender, uint256 funding);
    event withdraw(address owner, uint256 value);

    function flip(uint8 side) public payable returns (uint8) {
        require(address(this).balance >= msg.value.mul(10), "not enough funds");
        require(side == 0 || side == 1, "side not 1 or 0");
        uint8 win;
        if (block.timestamp % 2 == side) {
            payable(msg.sender).transfer(msg.value * 2);
            win = 1;
        } else {
            win = 0;
        }
        emit bet(msg.sender, msg.value, win, side);
        return win;
    }

    function withdrawAll() public onlyOwner returns (uint256) {
        emit withdraw(msg.sender, address(this).balance);
        payable(msg.sender).transfer(address(this).balance);
        assert(address(this).balance == 0);
        return address(this).balance;
    }

    function fundContract() public payable {
        emit funded(msg.sender, msg.value);
    }
}
