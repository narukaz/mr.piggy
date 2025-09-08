// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract MRPIGGY is ERC721, ERC721URIStorage, ERC721Burnable, ERC721Enumerable {
    address public owner;

    event PiggyActivated(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 pledgeAmount,
        uint256 goalAmount,
        uint256 cycle,
        uint256 nextExpected
    );

    event DepositMade(
        uint256 indexed tokenId,
        address indexed from,
        uint256 amount,
        uint256 totalSaved,
        uint256 nextExpected
    );
    mapping(address => bool) public bronze_badge;
    mapping(address => bool) public silver_badge;
    mapping(address => bool) public gold_badge;

    event BestStreakUpdated(address indexed who, uint256 newBest);

    uint256 public nextTokenId;

    mapping(uint256 => bool) public activePiggy;
    mapping(uint256 => uint256) public piggyLastCountedCycle;

    mapping(uint256 => uint256) public piggyHealthType;

    struct StreakData {
        uint256 bestStreak;
        uint256 currentStreak;
        bool initialized;
    }
    mapping(address => StreakData) public UserStreak;

    event PiggyBroken(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 savedAmount,
        uint256 bonusRate, // in basis points (e.g., 300 = 3%)
        uint256 payout
    );

    struct PiggyData {
        uint256 totalSaved;
        uint256 depositCount;
        uint256 startTime;
        uint256 lastDeposit;
        uint256 pledgeAmount;
        uint256 cycle;
        uint256 nextExpectedPaymentTimeRange;
        uint256 goalAmount;
        uint256 piggyHealth;

        // bool active;
    }

    mapping(uint256 => uint256) public vault;
    mapping(uint256 => PiggyData) public piggies;

    uint256 public constant NORMAL_HEALTH = 3;
    uint256 public constant BRONZE_HEALTH = 5;
    uint256 public constant SILVER_HEALTH = 6;
    uint256 public constant GOLD_HEALTH = 7;
    uint256 public constant DIAMOND_HEALTH = 9;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        nextTokenId = 0;
        owner = msg.sender;
    }
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return
            "https://cyan-realistic-swift-995.mypinata.cloud/ipfs/bafybeib5pbzc3x25f5qnk7rlfwlcmcnbt3wdpnmt52mvlnbc7qvzbwpwxy/";
    }

    struct Idle {
        uint256 tokenId;
        uint256 tokenType;
    }

    function mint_bronze_badge() public {
        require(!bronze_badge[msg.sender], "user already have a badge");
        uint256 streak = UserStreak[msg.sender].bestStreak;
        require(streak > 10, "streak should be greater than 10");
        bronze_badge[msg.sender] = true;
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "6.json");
    }
    function mint_silver_badge() public {
        require(!silver_badge[msg.sender], "user already have a badge");

        uint256 streak = UserStreak[msg.sender].bestStreak;
        require(streak > 30, "streak should be greater than 10");
        silver_badge[msg.sender] = true;
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "7.json");
    }

    function mint_gold_badge() public {
        require(!silver_badge[msg.sender], "user already have a badge");

        uint256 streak = UserStreak[msg.sender].bestStreak;
        require(streak > 30, "streak should be greater than 10");
        gold_badge[msg.sender] = true;
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "8.json");
    }

    function mintBasicPiggy() public {
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "1.json");
        nextTokenId++;
    }

    function mint_BronzePiggy() public payable {
        require(msg.value == 0.0001 ether, "not enough funds");
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "2.json");
        piggyHealthType[nextTokenId] = BRONZE_HEALTH;
        nextTokenId++;
    }
    function mint_SilverPiggy() public payable {
        require(msg.value == 0.0003 ether, "not enough funds");
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "3.json");
        piggyHealthType[nextTokenId] = SILVER_HEALTH;
        nextTokenId++;
    }

    function mint_GoldPiggy() public payable {
        require(msg.value == 0.0005 ether, "not enough funds");
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "4.json");
        piggyHealthType[nextTokenId] = GOLD_HEALTH;
        nextTokenId++;
    }

    function mint_DiamondPiggy() public payable {
        require(msg.value == 0.0007 ether, "not enough funds");
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "5.json");
        piggyHealthType[nextTokenId] = DIAMOND_HEALTH;
        nextTokenId++;
    }

    function activatePiggy(
        uint256 _tokenId,
        uint256 _pledgeAmount,
        uint256 _goalAmount,
        uint256 _cycle
    ) external {
        require(
            _pledgeAmount < _goalAmount,
            "pledge amount should be less then goal"
        );
        require(!(activePiggy[_tokenId]), "Piggy is already active");
        require(ownerOf(_tokenId) == msg.sender, "ActivatePiggy: not owner");
        require(_pledgeAmount > 0, "ActivatePiggy: pledge must be > 0");
        require(_goalAmount > 0, "ActivatePiggy: goal must be > 0");
        require(_cycle > 0, "ActivatePiggy: cycle must be > 0");

        PiggyData storage p = piggies[_tokenId];

        p.totalSaved = 0;
        p.depositCount = 0;
        p.startTime = block.timestamp;
        p.lastDeposit = 0; // no deposits yet
        p.pledgeAmount = _pledgeAmount;
        p.cycle = _cycle;
        p.nextExpectedPaymentTimeRange = block.timestamp + _cycle;
        p.goalAmount = _goalAmount;
        p.piggyHealth = piggyHealthType[_tokenId];
        activePiggy[_tokenId] = true;
        piggyLastCountedCycle[_tokenId] = type(uint256).max;

        emit PiggyActivated(
            _tokenId,
            msg.sender,
            _pledgeAmount,
            _goalAmount,
            _cycle,
            p.nextExpectedPaymentTimeRange
        );
    }

    function _activatePiggy(
        uint256 _tokenId,
        uint256 _pledgeAmount,
        uint256 _goalAmount,
        uint256 _cycle
    ) internal {
        PiggyData storage p = piggies[_tokenId];

        p.totalSaved = 0;
        p.depositCount = 0;
        p.startTime = block.timestamp;
        p.lastDeposit = 0; // no deposits yet
        p.pledgeAmount = _pledgeAmount;
        p.cycle = _cycle;
        p.nextExpectedPaymentTimeRange = block.timestamp + _cycle;
        p.goalAmount = _goalAmount;
        p.piggyHealth = piggyHealthType[_tokenId];
        activePiggy[_tokenId] = true;
        piggyLastCountedCycle[_tokenId] = type(uint256).max;

        emit PiggyActivated(
            _tokenId,
            msg.sender,
            _pledgeAmount,
            _goalAmount,
            _cycle,
            p.nextExpectedPaymentTimeRange
        );
    }

    function depositToPiggy(uint256 _tokenId) external payable {
        if (piggyInRace[_tokenId]) {
            require(races.length > 0, "DepositToPiggy: no race available");
            Race storage activeRace = races[races.length - 1];
            require(!activeRace.finished, "DepositToPiggy: race is over");
            require(
                block.timestamp >= activeRace.startTime,
                "DepositToPiggy: race has not started"
            );
        }

        PiggyData storage p = piggies[_tokenId];
        require(
            p.piggyHealth > 0,
            "DepositToPiggy: piggy with 0 health, only can be burned"
        );
        require(activePiggy[_tokenId], "DepositToPiggy: piggy not active");
        require(
            msg.value == p.pledgeAmount,
            "DepositToPiggy: must send exact pledge amount"
        );

        vault[_tokenId] += msg.value; // Store the deposit in a separate vault

        if (block.timestamp > p.nextExpectedPaymentTimeRange) {
            p.piggyHealth -= 1;
        }

        bool onTime = block.timestamp <= p.nextExpectedPaymentTimeRange;
        uint256 cycleIndex = (block.timestamp - p.startTime) / p.cycle;
        p.totalSaved += msg.value;
        p.depositCount += 1;
        p.lastDeposit = block.timestamp;
        p.nextExpectedPaymentTimeRange = block.timestamp + p.cycle;

        address _owner = ownerOf(_tokenId);
        StreakData storage s = UserStreak[_owner];
        if (piggyLastCountedCycle[_tokenId] != cycleIndex) {
            if (!s.initialized) {
                s.initialized = true;
                s.currentStreak = onTime ? 1 : 1;
                s.bestStreak = s.currentStreak;
                if (s.bestStreak > 0) {
                    emit BestStreakUpdated(_owner, s.bestStreak);
                }
            } else {
                if (onTime) {
                    s.currentStreak += 1;
                } else {
                    s.currentStreak = 1;
                }
                if (s.currentStreak > s.bestStreak) {
                    s.bestStreak = s.currentStreak;
                    emit BestStreakUpdated(_owner, s.bestStreak);
                }
            }
            piggyLastCountedCycle[_tokenId] = cycleIndex;
        }

        emit DepositMade(
            _tokenId,
            msg.sender,
            msg.value,
            p.totalSaved,
            p.nextExpectedPaymentTimeRange
        );
    }

    function isGoalReached(uint256 _tokenId) public view returns (bool) {
        return piggies[_tokenId].totalSaved >= piggies[_tokenId].goalAmount;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function Break_Your_Piggy(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "BreakYourPiggy: not the owner"
        );
        require(activePiggy[tokenId], "BreakYourPiggy: piggy not active");

        PiggyData storage p = piggies[tokenId];
        uint256 saved = p.totalSaved;

        uint256 payout = saved;

        if (saved >= p.goalAmount) {
            uint256 bonusRate = p.piggyHealth * 100; // health → basis points (e.g., 3 → 300 = 3%)
            uint256 bonus = (saved * bonusRate) / 10000;
            payout += bonus;
        }

        delete activePiggy[tokenId];
        delete piggies[tokenId];
        delete piggyLastCountedCycle[tokenId];
        delete vault[tokenId];
        delete piggyHealthType[tokenId];
        _burn(tokenId);
        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "BreakYourPiggy: payout failed");
        emit PiggyBroken(tokenId, msg.sender, saved, p.goalAmount, payout);
    }
    /////// racing part

    struct Race {
        uint256 startTime;
        uint256 endTime;
        uint256 goalAmount;
        uint256 cycleAmount;
        uint256 cycle;
        bool finished;
        uint256[] participants;
        uint256 reward;
    }

    event Race_started(uint256 _raceStarted, uint256 _endTime);
    event RaceExited(
        address indexed user,
        uint256 indexed tokenId,
        uint256 refund
    );

    mapping(uint256 => uint256) public indexOfracingNft;

    event RaceJoined(address indexed _user, uint256 _tokenId);
    Race[] public races;
    event RaceFinished(uint256 time, address indexed _owner);

    mapping(uint256 => bool) public piggyInRace;

    function create_race() public payable {
        require(msg.sender == owner, "CreateRace: not the owner");
        require(
            msg.value >= 5 ether,
            "CreateRace: not enough funds to start the race"
        );

        if (races.length > 0) {
            require(
                races[races.length - 1].finished,
                "createRace: Already racing"
            );
        }

        Race storage r = races.push();
        r.startTime = block.timestamp + 7 days;
        r.endTime = block.timestamp + 365 days;
        r.goalAmount = 120 ether;
        r.cycleAmount = 10 ether;
        r.cycle = 30 days;
        r.finished = false;
        r.reward = msg.value;
        emit Race_started(block.timestamp + 7 days, block.timestamp + 365 days);
    }
    function total_races() public view returns (uint256) {
        return races.length;
    }
    // function EndRace() public {
    //     require(msg.sender == owner, "EndRace: not the owner");
    //     require(races.length > 0, "EndRace: no ongoing race ");
    //     Race storage activeRace = races[races.length - 1];
    //     require(!activeRace.finished, "EndRace: race already finished");
    //     require(
    //         block.timestamp > activeRace.endTime,
    //         "EndRace: Time remaining to finish the race"
    //     );

    //     uint256[] memory participants = activeRace.participants;
    //     uint256 highTierCount = 0;
    //     uint256 midTierCount = 0;
    //     uint256 lowTierCount = 0;

    //     for (uint256 i = 0; i < participants.length; i++) {
    //         uint256 tokenId = participants[i];
    //         PiggyData storage p = piggies[tokenId];

    //         if (p.piggyHealth >= 7 && p.piggyHealth <= 10) {
    //             highTierCount++;
    //         } else if (p.piggyHealth >= 5 && p.piggyHealth < 7) {
    //             midTierCount++;
    //         } else if (p.piggyHealth > 0 && p.piggyHealth < 5) {
    //             lowTierCount++;
    //         }
    //     }

    //     uint256 totalRewardPool = activeRace.reward;
    //     uint256 highTierReward = 0;
    //     uint256 midTierReward = 0;
    //     uint256 lowTierReward = 0;

    //     if (highTierCount > 0) {
    //         highTierReward = (totalRewardPool * 60) / 100;
    //     }
    //     if (midTierCount > 0) {
    //         midTierReward = (totalRewardPool * 30) / 100;
    //     }
    //     if (lowTierCount > 0) {
    //         lowTierReward = (totalRewardPool * 10) / 100;
    //     }

    //     for (uint256 i = 0; i < participants.length; i++) {
    //         uint256 tokenId = participants[i];
    //         PiggyData storage p = piggies[tokenId];
    //         address user = ownerOf(tokenId);
    //         uint256 rewardAmount = 0;

    //         if (
    //             p.piggyHealth >= 7 && p.piggyHealth <= 10 && highTierCount > 0
    //         ) {
    //             rewardAmount = (highTierReward / highTierCount);
    //         } else if (
    //             p.piggyHealth >= 5 && p.piggyHealth < 7 && midTierCount > 0
    //         ) {
    //             rewardAmount = (midTierReward / midTierCount);
    //         } else if (
    //             p.piggyHealth > 0 && p.piggyHealth < 5 && lowTierCount > 0
    //         ) {
    //             rewardAmount = (lowTierReward / lowTierCount);
    //         } else if (p.piggyHealth == 0) {
    //             rewardAmount = p.totalSaved;
    //         }

    //         uint256 finalAmount = rewardAmount + p.totalSaved;

    //         if (finalAmount > 0) {
    //             (bool success, ) = user.call{value: finalAmount}("");
    //             require(success, "EndRace: transfer failed");
    //         }

    //         delete activePiggy[tokenId];
    //         delete piggyLastCountedCycle[tokenId];
    //         delete vault[tokenId];
    //         delete piggyHealthType[tokenId];
    //         delete piggyInRace[tokenId];
    //         delete piggies[tokenId];

    //         _burn(tokenId);
    //     }

    //     activeRace.finished = true;

    //     emit RaceFinished(block.timestamp, msg.sender);
    // }

    function EndRace() public {
        require(msg.sender == owner, "EndRace: not the owner");
        require(races.length > 0, "EndRace: no ongoing race ");
        Race storage activeRace = races[races.length - 1];
        require(!activeRace.finished, "EndRace: race already finished");
        require(
            block.timestamp > activeRace.endTime,
            "EndRace: Time remaining to finish the race"
        );

        uint256[] memory participants = activeRace.participants;
        uint256 highTierCount = 0;
        uint256 midTierCount = 0;
        uint256 lowTierCount = 0;

        for (uint256 i = 0; i < participants.length; i++) {
            uint256 tokenId = participants[i];
            PiggyData storage p = piggies[tokenId];
            if (p.piggyHealth >= 7 && p.piggyHealth <= 10) {
                highTierCount++;
            } else if (p.piggyHealth >= 5 && p.piggyHealth < 7) {
                midTierCount++;
            } else if (p.piggyHealth > 0 && p.piggyHealth < 5) {
                lowTierCount++;
            }
        }

        uint256 totalRewardPool = activeRace.reward;
        uint256 highTierReward = 0;
        uint256 midTierReward = 0;
        uint256 lowTierReward = 0;

        if (highTierCount > 0) {
            highTierReward = (totalRewardPool * 60) / 100;
        }
        if (midTierCount > 0) {
            midTierReward = (totalRewardPool * 30) / 100;
        }
        if (lowTierCount > 0) {
            lowTierReward = (totalRewardPool * 10) / 100;
        }

        for (uint256 i = 0; i < participants.length; i++) {
            uint256 tokenId = participants[i];
            PiggyData storage p = piggies[tokenId];
            address user = ownerOf(tokenId);
            uint256 rewardAmount = 0;

            if (
                p.piggyHealth >= 7 && p.piggyHealth <= 10 && highTierCount > 0
            ) {
                rewardAmount = (highTierReward / highTierCount);
            } else if (
                p.piggyHealth >= 5 && p.piggyHealth < 7 && midTierCount > 0
            ) {
                rewardAmount = (midTierReward / midTierCount);
            } else if (
                p.piggyHealth > 0 && p.piggyHealth < 5 && lowTierCount > 0
            ) {
                rewardAmount = (lowTierReward / lowTierCount);
            } else if (p.piggyHealth == 0) {
                rewardAmount = 0;
            }

            uint256 saved = p.totalSaved;
            if (saved > 0) {
                (bool success, ) = user.call{value: saved}("");
                require(success, "EndRace: savings transfer failed");
                vault[tokenId] = 0; // Reset vault after transfer
            }

            // Then, transfer the reward from the race's reward pool
            if (rewardAmount > 0) {
                (bool success, ) = user.call{value: rewardAmount}("");
                require(success, "EndRace: reward transfer failed");
            }

            delete activePiggy[tokenId];
            delete piggyLastCountedCycle[tokenId];
            delete vault[tokenId];
            delete piggyHealthType[tokenId];
            delete piggyInRace[tokenId];
            delete piggies[tokenId];

            _burn(tokenId);
        }
        activeRace.finished = true;
        emit RaceFinished(block.timestamp, msg.sender);
    }

    function JoinRace() public payable {
        require(msg.value >= 0.5 ether, "JoinRace: not enough fund to join");
        require(races.length > 0, "JoinRace: no race to join");
        Race storage activeRace = races[races.length - 1];
        require(
            activeRace.startTime >= block.timestamp,
            "JoinRace: Joining time is over"
        );

        require(!activeRace.finished, "JoinRace: race already finished");

        uint256 currentTokenId = nextTokenId;

        // Mint a Normal Piggy for the race
        _mint(msg.sender, currentTokenId);
        _setTokenURI(currentTokenId, "1.png");
        piggyHealthType[currentTokenId] = 10;
        nextTokenId++;
        indexOfracingNft[currentTokenId] = races[races.length - 1]
            .participants
            .length;
        races[races.length - 1].participants.push(currentTokenId);

        piggyInRace[currentTokenId] = true;

        _activatePiggy(
            currentTokenId,
            activeRace.cycleAmount,
            activeRace.goalAmount,
            activeRace.cycle
        );

        approve(address(this), currentTokenId);

        emit RaceJoined(msg.sender, currentTokenId);
    }

    function currentRaceReward() public pure returns (uint256) {}

    // function quit_race(uint256 _tokenId) public {
    //     address owner_of_token = ownerOf(_tokenId);
    //     require(msg.sender == owner_of_token, "exitRace: not token owner");
    //     require(piggyInRace[_tokenId], "exitRace: not in the race");

    //     PiggyData storage p = piggies[_tokenId];
    //     uint256 saved = p.totalSaved;
    //     uint256 refund = 0;

    //     Race storage activeRace = races[races.length - 1];

    //     if (saved > 0) {
    //         uint256 penalty = (saved * 2) / 100;
    //         refund = saved - penalty;
    //         activeRace.reward += penalty;
    //     }

    //     uint256 participants_len = activeRace.participants.length;
    //     uint256 indexToRemove = indexOfracingNft[_tokenId];
    //     uint256 lastParticipantTokenId = activeRace.participants[
    //         participants_len - 1
    //     ];
    //     activeRace.participants[indexToRemove] = lastParticipantTokenId;
    //     indexOfracingNft[lastParticipantTokenId] = indexToRemove;
    //     activeRace.participants.pop();
    //     delete indexOfracingNft[_tokenId];
    //     delete activePiggy[_tokenId];
    //     delete piggyLastCountedCycle[_tokenId];
    //     delete vault[_tokenId];
    //     delete piggyHealthType[_tokenId];
    //     delete piggyInRace[_tokenId];
    //     delete piggies[_tokenId];

    //     _burn(_tokenId);

    //     if (refund > 0) {
    //         (bool success, ) = owner_of_token.call{value: refund}("");
    //         require(success, "exitRace: refund failed");
    //     }

    //     emit RaceExited(owner_of_token, _tokenId, refund);
    // }
    function quit_race(uint256 _tokenId) public {
        address owner_of_token = ownerOf(_tokenId);
        require(msg.sender == owner_of_token, "exitRace: not token owner");
        require(piggyInRace[_tokenId], "exitRace: not in the race");
        PiggyData storage p = piggies[_tokenId];
        uint256 saved = p.totalSaved;
        uint256 refund = 0;
        Race storage activeRace = races[races.length - 1];
        if (saved > 0) {
            uint256 penalty = (saved * 2) / 100;
            refund = saved - penalty;
            activeRace.reward += penalty;
        }

        uint256 participants_len = activeRace.participants.length;
        uint256 indexToRemove = indexOfracingNft[_tokenId];
        uint256 lastParticipantTokenId = activeRace.participants[
            participants_len - 1
        ];
        activeRace.participants[indexToRemove] = lastParticipantTokenId;
        indexOfracingNft[lastParticipantTokenId] = indexToRemove;
        activeRace.participants.pop();
        delete indexOfracingNft[_tokenId];
        delete activePiggy[_tokenId];
        delete piggyLastCountedCycle[_tokenId];
        delete vault[_tokenId];
        delete piggyHealthType[_tokenId];
        delete piggyInRace[_tokenId];
        delete piggies[_tokenId];
        _burn(_tokenId);

        if (refund > 0) {
            (bool success, ) = owner_of_token.call{value: refund}("");
            require(success, "exitRace: refund failed");
        }

        emit RaceExited(owner_of_token, _tokenId, refund);
    }
}
