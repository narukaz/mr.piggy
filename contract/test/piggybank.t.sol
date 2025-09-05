pragma solidity ^0.8.20;

import {Test, console, stdError} from "forge-std/Test.sol";
import {MRPIGGY} from "../src/piggy_bank.sol";
import {IERC721Errors} from "openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

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

        vm.expectRevert("DepositToPiggy: must send exact pledge amount");
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
            "DepositToPiggy: piggy with 0 health, only can be burned"
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

    // function test_full_race() public {
    //     address owner = address(0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
    //     vm.prank(owner);
    //     mrpiggy.create_race{value: 5 ether}();

    //     uint256 totalUsers = 10;
    //     address[] memory users = new address[](totalUsers);
    //     for (uint256 i = 0; i < totalUsers; i++) {
    //         users[i] = address(uint160(i + 1));
    //         deal(users[i], 130 ether);
    //     }

    //     uint256 depositAmount = 10 ether;
    //     uint256 joinFee = 0.5 ether;
    //     uint256 totalCycles = 12;
    //     uint256 cycleDuration = 30 days;
    //     (uint256 raceStartTime, , , , , , ) = mrpiggy.races(0);

    //     // Join race for all users
    //     for (uint256 i = 0; i < totalUsers; i++) {
    //         vm.prank(users[i]);
    //         mrpiggy.JoinRace{value: joinFee}();
    //     }

    //     // Warp to race start time
    //     vm.warp(raceStartTime + 1);

    //     // Simulate deposits for 12 cycles
    //     for (uint256 cycle = 0; cycle < totalCycles; cycle++) {
    //         for (uint256 i = 0; i < totalUsers; i++) {
    //             (, , , , , , , , uint256 piggyHealth) = mrpiggy.piggies(i);
    //             (, uint256 depositNumber, , , , , , , ) = mrpiggy.piggies(i);
    //             depositNumber += 1;

    //             if (piggyHealth > 0) {
    //                 // Users 0-2: Perfect health (10)
    //                 if (i <= 2) {
    //                     vm.prank(users[i]);
    //                     mrpiggy.depositToPiggy{value: depositAmount}(i);
    //                 }
    //                 // Users 3-5: Health 7 (miss 3 payments)
    //                 else if (i > 2 && i <= 5 && depositNumber <= 9) {
    //                     vm.prank(users[i]);
    //                     mrpiggy.depositToPiggy{value: depositAmount}(i);
    //                 }
    //                 // Users 6-7: Health < 5 (miss 6 payments)
    //                 else if (i > 5 && i <= 7 && depositNumber <= 6) {
    //                     vm.prank(users[i]);
    //                     mrpiggy.depositToPiggy{value: depositAmount}(i);
    //                 }
    //                 // Users 8-9: Health < 5 (miss almost all payments)
    //                 else if (i > 7 && i <= 9 && depositNumber <= 3) {
    //                     vm.prank(users[i]);
    //                     mrpiggy.depositToPiggy{value: depositAmount}(i);
    //                 }
    //             }
    //         }
    //         vm.warp(block.timestamp + cycleDuration);
    //     }

    //     // Warp to race end time
    //     (, uint256 endTime, , , , , ) = mrpiggy.races(0);
    //     vm.warp(endTime + 1);

    //     // End the race
    //     vm.prank(owner);
    //     mrpiggy.EndRace();

    //     // Verify a user who quit the race earlier
    //     uint256 tokenIdToQuit = 0; // Assuming the first user quits
    //     address userWhoQuits = users[tokenIdToQuit];
    //     uint256 initialUserBalance = userWhoQuits.balance;

    //     vm.prank(userWhoQuits);
    //     mrpiggy.quit_race(tokenIdToQuit);

    //     (uint256 piggySaved, , , , , , , , ) = mrpiggy.piggies(tokenIdToQuit);
    //     uint256 penalty = (piggySaved * 2) / 100;
    //     uint256 expectedRefund = piggySaved - penalty;

    //     assertEq(
    //         userWhoQuits.balance,
    //         initialUserBalance + expectedRefund,
    //         "Refund was incorrect"
    //     );
    // }

    function test_quit_race() public {
        address owner = address(0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
        vm.prank(owner);
        mrpiggy.create_race{value: 5 ether}();

        address userA = makeAddr("userA");
        deal(userA, 130 ether);

        uint256 joinFee = 0.5 ether;
        uint256 depositAmount = 10 ether;
        uint256 tokenIdToQuit = 0;

        vm.prank(userA);
        mrpiggy.JoinRace{value: joinFee}();

        (uint256 raceStartTime, , , , , , ) = mrpiggy.races(0);
        vm.warp(raceStartTime + 30 days + 1);

        vm.prank(userA);
        mrpiggy.depositToPiggy{value: depositAmount}(0);

        // Get the piggySaved amount BEFORE calling quit_race
        (uint256 piggySaved, , , , , , , , ) = mrpiggy.piggies(tokenIdToQuit);

        // Now get the balance before the refund
        uint256 balanceBeforeQuit = userA.balance;

        // Call the quit_race function
        vm.prank(userA);
        mrpiggy.quit_race(tokenIdToQuit);

        // Calculate the expected refund using the saved amount
        uint256 penalty = (piggySaved * 2) / 100;
        uint256 expectedRefund = piggySaved - penalty;

        // Assert that the user's final balance is their balance before quitting + the expected refund
        assertEq(
            userA.balance,
            balanceBeforeQuit + expectedRefund,
            "Refund was incorrect"
        );

        // Also assert that the token was burned
        assertEq(mrpiggy.balanceOf(userA), 0, "Token was not burned");
    }

    function test_full_race() public {
        address owner = address(0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496);
        vm.prank(owner);
        mrpiggy.create_race{value: 5 ether}();

        uint256 totalUsers = 10;
        address[] memory users = new address[](totalUsers);
        for (uint256 i = 0; i < totalUsers; i++) {
            users[i] = makeAddr(string.concat("user", Strings.toString(i)));
            deal(users[i], 130 ether);
        }

        uint256 depositAmount = 10 ether;
        uint256 joinFee = 0.5 ether;
        uint256 totalCycles = 12;
        uint256 cycleDuration = 30 days;
        (uint256 raceStartTime, , , , , , ) = mrpiggy.races(0);

        // Join race for all users
        for (uint256 i = 0; i < totalUsers; i++) {
            vm.prank(users[i]);
            mrpiggy.JoinRace{value: joinFee}();
        }

        // Warp to race start time
        vm.warp(raceStartTime + 1);

        // Simulate deposits for 12 cycles
        for (uint256 cycle = 0; cycle < totalCycles; cycle++) {
            for (uint256 i = 0; i < totalUsers; i++) {
                (
                    ,
                    uint256 depositNumber,
                    ,
                    ,
                    ,
                    ,
                    ,
                    ,
                    uint256 piggyHealth
                ) = mrpiggy.piggies(i);

                if (piggyHealth > 0) {
                    if (i <= 2) {
                        vm.prank(users[i]);
                        mrpiggy.depositToPiggy{value: depositAmount}(i);
                    } else if (i > 2 && i <= 5 && depositNumber <= 9) {
                        vm.prank(users[i]);
                        mrpiggy.depositToPiggy{value: depositAmount}(i);
                    } else if (i > 5 && i <= 7 && depositNumber <= 6) {
                        vm.prank(users[i]);
                        mrpiggy.depositToPiggy{value: depositAmount}(i);
                    } else if (i > 7 && i <= 9 && depositNumber <= 3) {
                        vm.prank(users[i]);
                        mrpiggy.depositToPiggy{value: depositAmount}(i);
                    }
                }
            }
            vm.warp(block.timestamp + cycleDuration);
        }

        // Warp to race end time
        (, uint256 endTime, , , , , ) = mrpiggy.races(0);
        vm.warp(endTime + 1);

        // End the race
        vm.prank(owner);
        mrpiggy.EndRace();
    }
}
