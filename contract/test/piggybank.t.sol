pragma solidity ^0.8.20;

import {Test, console, stdError} from "forge-std/Test.sol";
import {MRPIGGY} from "../src/piggy_bank.sol";
contract TestMRPIGGY is Test {
    MRPIGGY public mrpiggy;

    function setUp() public {
        mrpiggy = new MRPIGGY("skeleton", "skl");
    }

    function test_checkTokenIdIncrement() public {
        vm.prank(address(1));
        assertEq(0, mrpiggy.nextTokenId());
        mrpiggy.safeMint(address(1));
        assertEq(1, mrpiggy.nextTokenId());
    }
}
