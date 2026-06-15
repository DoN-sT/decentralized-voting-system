// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters;

    uint256 public candidatesCount;
    
    event VotedEvent(uint256 indexed candidateId, address indexed voter);

    constructor(string[] memory candidateNames) {
        for (uint256 i = 0; i < candidateNames.length; i++) {
            addCandidate(candidateNames[i]);
        }
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint256 _candidateId) public {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate.");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VotedEvent(_candidateId, msg.sender);
    }
    
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory _candidates = new Candidate[](candidatesCount);
        for (uint256 i = 1; i <= candidatesCount; i++) {
            _candidates[i - 1] = candidates[i];
        }
        return _candidates;
    }
}
