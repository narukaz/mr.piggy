pragma solidity ^0.8.20;

import {Test, console, stdError} from "forge-std/Test.sol";
import {MRPIGGY} from "../src/piggy_bank.sol";
import {IERC721Errors} from "openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol";

contract TestMRPIGGY is Test {
    MRPIGGY public mrpiggy;

    function setUp() public {
        mrpiggy = new MRPIGGY("skeleton", "skl");
    }

    function test_checkTokenIdIncrement() public {
        vm.prank(address(1));
        assertEq(0, mrpiggy.nextTokenId());
        mrpiggy.mintBasicPiggy();
        assertEq(1, mrpiggy.nextTokenId());
    }

    function test_checkOwner() public {
        vm.prank(address(1));
        mrpiggy.mintBasicPiggy();
        assertEq(mrpiggy.ownerOf(0), address(1));
    }

    function test_symbol() public {
        console.log("symbol is ", mrpiggy.symbol());
        assertEq(mrpiggy.symbol(), "skl");
    }

    function test_checkUri() public {
        vm.prank(address(1));
        mrpiggy.mintBasicPiggy();
        assertEq(mrpiggy.tokenURI(0), "1.png");
    }

    function test_mintBronzePiggy() public {
        address user = address(1);
        hoax(user);
        mrpiggy.mint_BronzePiggy{value: 0.0001 ether}();
        assertEq(mrpiggy.tokenURI(0), "2.png");
    }

    function test_RevertIf_mintBronzePiggyNoValue() public {
        address user = address(1);
        hoax(user);
        vm.expectRevert("not enough funds");
        mrpiggy.mint_BronzePiggy{value: 0 ether}();

        // assertEq(mrpiggy.tokenURI(0), "2.png");
    }

    function test_RevertIf_mintBronzePiggyMoreValue() public {
        address user = address(1);
        hoax(user);
        vm.expectRevert("not enough funds");
        mrpiggy.mint_BronzePiggy{value: 1 ether}();
        // assertEq(mrpiggy.tokenURI(0), "2.png");
    }

    function test_piggyActivation() public {
        vm.prank(address(1));
        mrpiggy.mintBasicPiggy();
        assertEq(mrpiggy.nextTokenId(), 1);
        hoax(address(1));
        mrpiggy.activatePiggy(0, 0.005 ether, 0.03 ether, 3 days);
        assertEq(mrpiggy.activePiggy(0), true);
        console.log("piggy activation status:", mrpiggy.activePiggy(0));
    }

    function test_ReverIf_piggyIsAlreadyActive() public {
        vm.prank(address(1));
        mrpiggy.mintBasicPiggy();
        assertEq(mrpiggy.nextTokenId(), 1);
        hoax(address(1));
        mrpiggy.activatePiggy(0, 0.005 ether, 0.03 ether, 3 days);
        assertEq(mrpiggy.activePiggy(0), true);
        console.log("piggy activation status:", mrpiggy.activePiggy(0));
        vm.expectRevert("Piggy is already active");
        mrpiggy.activatePiggy(0, 0.005 ether, 0.03 ether, 3 days);
    }

    function test_ReverIf_WrongDeposite() public {
        vm.prank(address(1));
        deal(address(1), 2 ether);
        mrpiggy.mintBasicPiggy();

        vm.prank(address(1));
        mrpiggy.activatePiggy(0, 0.005 ether, 0.03 ether, 3 days);

        vm.expectRevert("depositToPiggy: must send exact pledge amount");
        vm.prank(address(1));
        mrpiggy.depositToPiggy{value: 0.002 ether}(0);
    }

    function test_DepositingBasicPiggy() public {
        address user = address(1);

        vm.prank(user);
        mrpiggy.mintBasicPiggy();

        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.005 ether, 0.03 ether, 3 days);

        hoax(user, 2 ether);
        mrpiggy.depositToPiggy{value: 0.005 ether}(0);
    }

    function test_checkStreak() public {
        address user = address(1);
        vm.prank(user);
        mrpiggy.mintBasicPiggy();

        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.001 ether, 0.01 ether, 7 days);

        hoax(user, 2 ether);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.prank(user);
        (uint256 best, uint256 current, bool init) = mrpiggy.UserStreak(user);
        assertEq(best, 1, "best");
        assertEq(current, 1, "curret");
        assertEq(true, init, "init");
    }

    function test_streakGrowth() public {
        address user = address(1);
        vm.prank(user);
        mrpiggy.mintBasicPiggy();
        //
        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.001 ether, 0.01 ether, 7 days);
        //
        hoax(user, 2 ether);
        uint256 oneWeek = 7 days;
        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);
        //
        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);
        //
        vm.prank(user);
        (uint256 best, uint256 current, bool init) = mrpiggy.UserStreak(user);
        assertEq(best, 2, "best");
        assertEq(current, 2, "current");
        assertEq(true, init, "init");
    }

    function test_RevertIf_streakGrowthWrong() public {
        address user = address(1);
        vm.prank(user);
        mrpiggy.mintBasicPiggy();

        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.001 ether, 0.01 ether, 7 days);

        hoax(user, 2 ether);
        uint256 oneWeek = 7 days;

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.prank(user);
        (uint256 best, uint256 current, bool init) = mrpiggy.UserStreak(user);

        // vm.expectRevert();
        assertNotEq(current, 4, "current");
    }

    function test_PiggyFull() public {
        address user = address(1);
        vm.prank(user);
        mrpiggy.mintBasicPiggy();

        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.001 ether, 0.005 ether, 7 days);

        hoax(user, 2 ether);
        uint256 oneWeek = 7 days;

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.prank(user);
        mrpiggy.isGoalReached(0);
        console.log("status of goal", mrpiggy.isGoalReached(0));
    }

    function test_RevertIf_PiggyNotFull() public {
        address user = address(1);
        vm.prank(user);
        mrpiggy.mintBasicPiggy();

        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.001 ether, 0.005 ether, 7 days);

        hoax(user, 2 ether);
        uint256 oneWeek = 7 days;

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.prank(user);
        mrpiggy.isGoalReached(0);

        assertNotEq(mrpiggy.isGoalReached(0), true);
        console.log("status of goal", mrpiggy.isGoalReached(0));
    }

    function test_piggyHealthNone() public {
        address user = address(1);
        vm.prank(user);
        mrpiggy.mintBasicPiggy();

        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.001 ether, 0.005 ether, 7 days);

        hoax(user, 2 ether);
        uint256 oneWeek = 8 days;

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.prank(user);
        vm.expectRevert(
            "DepositeToPiggy: piggy with 0 health, only can be burned"
        );
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);
    }

    function test_piggy_burn_exactFlow() public {
        deal(address(mrpiggy), 0.1 ether);

        address user = address(1);
        vm.deal(user, 0.006 ether);

        vm.prank(user);
        mrpiggy.mintBasicPiggy();

        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.001 ether, 0.005 ether, 7 days);

        startHoax(user, 0.006 ether);

        uint256 oneWeek = 7 days;

        console.log("user start:", user.balance / 1e15, "finney");

        for (uint i = 0; i < 5; ++i) {
            vm.warp(block.timestamp + oneWeek);

            console.log("before deposit", i, "user balance:", user.balance);
            mrpiggy.depositToPiggy{value: 0.001 ether}(0);

            console.log(" after deposit", i, "user balance:", user.balance);
        }

        vm.stopPrank();

        uint256 userAfterDeposits = user.balance;
        assertEq(
            userAfterDeposits,
            0.001 ether,
            "user should have 0.001 after deposits"
        );

        uint256 saved = 5 * 0.001 ether;
        uint256 bonusBps = 300;
        uint256 expectedBonus = (saved * bonusBps) / 10000;
        uint256 expectedPayout = saved + expectedBonus;

        uint256 userBeforeBreak = user.balance;
        uint256 contractBeforeBreak = address(mrpiggy).balance;

        vm.prank(user);
        mrpiggy.Break_Your_Piggy(0);

        uint256 userAfterBreak = user.balance;
        uint256 contractAfterBreak = address(mrpiggy).balance;

        console.log("userBeforeBreak:", userBeforeBreak);
        console.log("userAfterBreak :", userAfterBreak);
        console.log("contractBefore:", contractBeforeBreak);
        console.log("contractAfter :", contractAfterBreak);

        assertEq(
            userAfterBreak,
            userBeforeBreak + expectedPayout,
            "user final mismatch"
        );
        assertEq(
            contractAfterBreak,
            contractBeforeBreak - expectedPayout,
            "contract final mismatch"
        );
    }

    function test_RevertIf_piggyDoNotExistAnymore() public {
        address user = address(1);
        vm.prank(user);
        mrpiggy.mintBasicPiggy();

        vm.prank(user);
        mrpiggy.activatePiggy(0, 0.001 ether, 0.005 ether, 7 days);

        hoax(user, 2 ether);
        uint256 oneWeek = 8 days;

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.warp(block.timestamp + oneWeek);
        mrpiggy.depositToPiggy{value: 0.001 ether}(0);

        vm.prank(user);
        mrpiggy.Break_Your_Piggy(0);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                0
            )
        );
        mrpiggy.ownerOf(0);
    }

    function test_piggyHealth() public {
        address user = address(1);
        deal(user, 0.001 ether);
        vm.prank(user);
        mrpiggy.mint_DiamondPiggy{value: 0.0007 ether}();
        assertEq(mrpiggy.piggyHealthType(0), 9);
    }

    function test_zeroRace() public view {
        assertEq(mrpiggy.total_races(), 0, "no race");
    }
    function test_create_race() public {
        address user = address(0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
        deal(user, 10 ether);
        vm.prank(user);
        mrpiggy.create_race{value: 5 ether}();
        assertEq(mrpiggy.total_races(), 1);
    }

    function test_doubleRace() public {
        address user = address(0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
        vm.prank(user);
        mrpiggy.create_race{value: 5 ether}();
        vm.prank(user);
        vm.expectRevert("createRace: Already racing");
        mrpiggy.create_race{value: 5 ether}();
    }

    function test_participate_in_race() public {
        address owner = address(0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
        vm.prank(owner);
        mrpiggy.create_race{value: 5 ether}();

        address userA = address(1);
        deal(userA, 2 ether);
        vm.prank(userA);
        mrpiggy.JoinRace{value: 0.5 ether}();

        vm.prank(userA);
        mrpiggy.JoinRace{value: 0.5 ether}();
        //
        console.log("index of NFT 0", mrpiggy.indexOfracingNft(0));
        console.log("index of NFT 1", mrpiggy.indexOfracingNft(1));
        console.log("owner of NFT 0", mrpiggy.ownerOf(0));
        console.log("owner of NFT 1", mrpiggy.ownerOf(1));
        console.log("is piggy active", mrpiggy.activePiggy(0));
        (
            uint256 totalSaved,
            uint256 depositCount,
            uint256 startTime,
            uint256 lastDeposit,
            uint256 pledgeAmount,
            uint256 cycle,
            uint256 nextExpectedPaymentTimeRange,
            uint256 goalAmount,
            uint256 piggyHealth
        ) = mrpiggy.piggies(1);
        console.log("totalSaved:", totalSaved);
        console.log("depositCount:", depositCount);
        console.log("startTime:", startTime);
        console.log("lastDeposit:", lastDeposit);
        console.log("pledgeAmount:", pledgeAmount);
        console.log("cycle:", cycle);
        console.log(
            "nextExpectedPaymentTimeRange:",
            nextExpectedPaymentTimeRange
        );
        console.log("goalAmount:", goalAmount);
        console.log("piggyHealth:", piggyHealth);
    }

    function test_RevertIf_raceAlreadyStarted() public {
        address owner = address(0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
        vm.prank(owner);
        mrpiggy.create_race{value: 5 ether}();
        vm.warp(12 days);
        address userA = address(1);
        deal(userA, 2 ether);
        vm.prank(userA);
        vm.expectRevert();
        mrpiggy.JoinRace{value: 0.5 ether}();
    }

    function test_full_race() public {
        address owner = address(0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
        vm.prank(owner);
        mrpiggy.create_race{value: 5 ether}();

        address userA = address(1);
        deal(userA, 2 ether);
        //
        address userB = address(2);
        deal(userB, 2 ether);
        //
        address userC = address(3);
        deal(userC, 2 ether);
        //
        address userD = address(4);
        deal(userD, 2 ether);
        //
        address userE = address(5);
        deal(userE, 2 ether);
        //

        vm.prank(userA); //nft 0
        mrpiggy.JoinRace{value: 0.5 ether}();
        //-
        vm.prank(userB); //nft 1
        mrpiggy.JoinRace{value: 0.5 ether}();
        //-
        vm.prank(userC); //nft 2
        mrpiggy.JoinRace{value: 0.5 ether}();
        //-
        vm.prank(userD); //nft 3
        mrpiggy.JoinRace{value: 0.5 ether}();
        //-
        vm.prank(userD); //nft 4
        mrpiggy.JoinRace{value: 0.5 ether}();
    }
}
