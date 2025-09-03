// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract MRPIGGY is ERC721, ERC721URIStorage, ERC721Burnable {
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

    event BestStreakUpdated(address indexed who, uint256 newBest);

    uint256 public nextTokenId;

    mapping(uint256 => bool) public activePiggy;
    mapping(uint256 => uint256) public piggyLastCountedCycle;

    mapping(uint256 => uint256) public piggyHealthType;

    struct StreakData {
        uint256 bestStreak;
        uint256 currentStreak;
        bool intialized;
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

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function mintBasicPiggy() public {
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "1.png");
        piggyHealthType[nextTokenId] = NORMAL_HEALTH;
        nextTokenId++;
    }

    function mint_BronzePiggy() public payable {
        require(msg.value == 0.0001 ether, "not enough funds");
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "2.png");
        piggyHealthType[nextTokenId] = BRONZE_HEALTH;
        nextTokenId++;
    }
    function mint_SilverPiggy() public payable {
        require(msg.value == 0.0003 ether, "not enough funds");
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "3.png");
        piggyHealthType[nextTokenId] = SILVER_HEALTH;
        nextTokenId++;
    }

    function mint_GoldPiggy() public payable {
        require(msg.value == 0.0005 ether, "not enough funds");
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "4.png");
        piggyHealthType[nextTokenId] = GOLD_HEALTH;
        nextTokenId++;
    }

    function mint_DiamondPiggy() public payable {
        require(msg.value == 0.0007 ether, "not enough funds");
        _mint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, "5.png");
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
            require(races.length > 0, "depositToPiggy: no race available");
            uint256 startTime = races[races.length - 1].startTime;
        }

        PiggyData storage p = piggies[_tokenId];
        require(
            piggies[_tokenId].piggyHealth > 0,
            "DepositeToPiggy: piggy with 0 health, only can be burned"
        );
        require(activePiggy[_tokenId], "depositToPiggy: piggy not active");
        require(
            msg.value == p.pledgeAmount,
            "depositToPiggy: must send exact pledge amount"
        );

        // Check for a missed payment before processing the new deposit
        if (block.timestamp > p.nextExpectedPaymentTimeRange) {
            // A payment was missed, so decrease piggy health
            p.piggyHealth -= 1;
        }

        bool onTime = block.timestamp <= p.nextExpectedPaymentTimeRange;

        uint256 cycleIndex = (block.timestamp - p.startTime) / p.cycle;

        p.totalSaved += msg.value;
        p.depositCount += 1;
        p.lastDeposit = block.timestamp;

        p.nextExpectedPaymentTimeRange = block.timestamp + p.cycle;

        // STREAK LOGIC (per-owner across multiple piggies)
        address owner = ownerOf(_tokenId);
        StreakData storage s = UserStreak[owner];

        // Only count this piggy once per its cycle — check last counted cycle
        if (piggyLastCountedCycle[_tokenId] != cycleIndex) {
            // Not yet counted for this cycle -> update streak according to onTime/late
            if (!s.intialized) {
                // init streak for this user
                s.intialized = true;
                s.currentStreak = onTime ? 1 : 1; // treat first counted deposit as start of streak (change to 0 if you prefer)
                s.bestStreak = s.currentStreak;
                if (s.bestStreak > 0) {
                    emit BestStreakUpdated(owner, s.bestStreak);
                }
            } else {
                // already initialized
                if (onTime) {
                    s.currentStreak += 1;
                } else {
                    // late -> restart streak, count this deposit as first in new streak
                    s.currentStreak = 1;
                }

                // update best if needed
                if (s.currentStreak > s.bestStreak) {
                    s.bestStreak = s.currentStreak;
                    emit BestStreakUpdated(owner, s.bestStreak);
                }
            }

            // mark this piggy as counted for this cycle
            piggyLastCountedCycle[_tokenId] = cycleIndex;
        } else {
            // already counted this cycle -> do not change streaks
            // (still accept the deposit and update piggy fields above)
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
        address _to,
        uint256 _tokenId,
        address _auth
    ) internal virtual override returns (address) {
        return super._update(_to, _tokenId, _auth);
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
        r.goalAmount = 3650 ether;
        r.cycleAmount = 10 ether;
        r.cycle = 30 days;
        r.finished = false;
        r.reward = msg.value;
        emit Race_started(block.timestamp + 7 days, block.timestamp + 365 days);
    }
    function total_races() public view returns (uint256) {
        return races.length;
    }
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
                rewardAmount = p.totalSaved;
            }

            uint256 finalAmount = rewardAmount + p.totalSaved;

            if (finalAmount > 0) {
                (bool success, ) = user.call{value: finalAmount}("");
                require(success, "EndRace: transfer failed");
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
