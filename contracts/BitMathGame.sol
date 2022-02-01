// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >=0.8.0 <0.9.0;

contract BitMathGame {
    /** The originator of this contract */
    address payable public minter;

    uint8 public problem;
    uint8 constant PROBLEM_MAX = 0x7;

    /** A counter for the attempts made thus far */
    uint public attempts;

    // “Money is just a number”
    // BitMathGame tokens here
    mapping (address => uint) public balance;

    /** Signals a win in the game */
    event Win(address winner, uint guess, uint reward);
    /** Signals a new minting */
    event Mint(address minter, uint reward, uint minterBalance);
    /** Signals a loss in the game */
    event NextTime(address player, uint8 guess);

    constructor(uint8 seed) {
        require(seed > 0, "Please provide a seed that is greater than 0!");
        minter = payable(msg.sender);
        mint(seed, 0);
    }

    function mint(uint8 seed, uint16 reward) internal {
        balance[minter] += seed + reward + PROBLEM_MAX;
        // Number to be guessed right
        problem = computeProblem(seed);
        // Initially, no attempts
        attempts = 0;
        emit Mint(minter, reward, balance[minter]);
    }

    function computeProblem(uint8 seed) private view returns (uint8) {
        // & is bitwise AND
        return uint8(uint(sha256(abi.encodePacked(seed + block.timestamp))) & PROBLEM_MAX);
    }

    function computeReward(uint8 guess) private view returns (uint16) {
        return uint16( (attempts**2 + guess) & 0xFFFF); // Up to 2^(16)
    }

    function play(uint8 guess) public virtual {
        attempts++;
        if (isGuessRight(guess)) {
            uint16 reward = computeReward(guess);
            address payable winner = payable(msg.sender);
            // If the minter has insufficient funds…
            if (balance[minter] < reward) {
                // … the winner takes over
                // (a new minter has been nominated!)…
                minter = winner;
                // … and gains the output of minting
                mint(guess, reward);
            } else {
                // … otherwise, the minter pays the reward
                if (msg.sender != minter) {
                    balance[minter] -= reward;
                }
                balance[winner] += reward;
                emit Win(winner, guess, reward);
            }
        } else {
                // The player pays the price of the wrong guess
                if (balance[msg.sender] > guess) {
                    if (msg.sender != minter) {
                        balance[minter] += guess;
                    }
                    balance[msg.sender] -= guess;
                } else {
                    if (balance[msg.sender] > 0) {
                        if (msg.sender != minter) {
                            balance[minter] += balance[msg.sender];
                        }
                        balance[msg.sender] = 0;
                    }
                }
            emit NextTime(msg.sender, guess);
        }
    }

    function isGuessRight(uint8 guess) private view returns (bool) {
        if (guess == problem)
            return false;
        // ~ is bitwise NOT and | is bitwise OR
        // https://docs.soliditylang.org/en/latest/types.html#integers
        return (~(~problem | guess) == 0x0);
    }

}
