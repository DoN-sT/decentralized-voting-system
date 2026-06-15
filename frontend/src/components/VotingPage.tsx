"use client";

import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "wagmi/connectors";
import contractData from "@/contracts/Voting.json";
import { useState, useEffect, useCallback } from "react";

type Candidate = {
  id: bigint;
  name: string;
  voteCount: bigint;
};

const CONTRACT_ADDRESS = contractData.address as `0x${string}`;
const CONTRACT_ABI = contractData.abi;

const AVATAR_CLASSES = ["c1", "c2", "c3"];

export default function VotingPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract();

  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [votedFor, setVotedFor] = useState<bigint | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Read candidates
  const { data: candidatesData, refetch: refetchCandidates } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllCandidates",
    scopeKey: `candidates-${refreshKey}`,
  });

  // Check if current user has voted
  const { data: hasVoted, refetch: refetchVoter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "voters",
    args: address ? [address] : undefined,
    scopeKey: `voter-${refreshKey}`,
  });

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const candidates = (candidatesData as Candidate[]) || [];
  const totalVotes = candidates.reduce((sum, c) => sum + Number(c.voteCount), 0);

  // Refresh data on confirmation
  useEffect(() => {
    if (isConfirmed) {
      setRefreshKey((k) => k + 1);
      refetchCandidates();
      refetchVoter();
      showToast("success", "🎉 Vote recorded on the blockchain!");
    }
  }, [isConfirmed, refetchCandidates, refetchVoter]);

  useEffect(() => {
    if (writeError) {
      const msg = writeError.message.includes("already voted")
        ? "You have already voted!"
        : "Transaction failed. Please try again.";
      showToast("error", msg);
    }
  }, [writeError]);

  const showToast = useCallback((type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleVote = (candidateId: bigint) => {
    setVotedFor(candidateId);
    showToast("pending", "⏳ Confirm the transaction in MetaMask...");
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "vote",
      args: [candidateId],
    });
  };

  const getPercentage = (count: bigint) => {
    if (totalVotes === 0) return 0;
    return Math.round((Number(count) / totalVotes) * 100);
  };

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      <div className="bg-mesh" />

      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🗳️</div>
          DeVote
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="status-badge live">
            <div className="pulse" />
            Live on Chain
          </div>
          {isConnected ? (
            <button
              className="btn-primary"
              onClick={() => disconnect()}
              style={{ padding: "10px 20px", fontSize: "14px" }}
            >
              <span>{shortenAddress(address!)}</span>
            </button>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      {!isConnected ? (
        <div className="connect-prompt">
          <div className="icon">🔐</div>
          <h2>Connect Your Wallet</h2>
          <p>
            Connect your Ethereum wallet to participate in decentralized
            governance. Your vote is immutable and transparent.
          </p>
          <button
            className="btn-primary"
            onClick={() => connect({ connector: injected() })}
          >
            <span>🦊 Connect with MetaMask</span>
          </button>
        </div>
      ) : (
        <>
          {/* Hero */}
          <section className="hero">
            <h1>Cast Your Vote</h1>
            <p>
              Your vote is secured by blockchain technology. Every ballot is
              immutable, transparent, and verifiable. Choose your candidate
              below.
            </p>
          </section>

          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">{candidates.length}</div>
              <div className="stat-label">Candidates</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{totalVotes}</div>
              <div className="stat-label">Total Votes</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {hasVoted ? "✅ Voted" : "⏳ Pending"}
              </div>
              <div className="stat-label">Your Status</div>
            </div>
          </div>

          {/* Candidates */}
          <div className="candidates-grid">
            {candidates.map((candidate, index) => (
              <div
                key={Number(candidate.id)}
                className="glass-card candidate-card"
              >
                <div className="candidate-header">
                  <div
                    className={`candidate-avatar ${AVATAR_CLASSES[index % AVATAR_CLASSES.length]}`}
                  >
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="candidate-info">
                    <h3>{candidate.name}</h3>
                    <p>Candidate #{Number(candidate.id)}</p>
                  </div>
                </div>

                <div className="vote-progress">
                  <div
                    className={`vote-progress-bar ${AVATAR_CLASSES[index % AVATAR_CLASSES.length]}`}
                    style={{
                      width: `${getPercentage(candidate.voteCount)}%`,
                    }}
                  />
                </div>

                <div className="vote-count-row">
                  <span className="vote-count">
                    {Number(candidate.voteCount)} vote
                    {Number(candidate.voteCount) !== 1 ? "s" : ""}
                  </span>
                  <span className="vote-percentage">
                    {getPercentage(candidate.voteCount)}%
                  </span>
                </div>

                {hasVoted ? (
                  <button className="btn-primary btn-voted" disabled>
                    <span>
                      {votedFor === candidate.id ? "✅ Your Vote" : "Voting Closed"}
                    </span>
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => handleVote(candidate.id)}
                    disabled={isWritePending || isConfirming}
                  >
                    {(isWritePending || isConfirming) &&
                    votedFor === candidate.id ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="spinner" />
                        {isConfirming ? "Confirming..." : "Signing..."}
                      </span>
                    ) : (
                      <span>Vote for {candidate.name}</span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="footer">
        Powered by Ethereum • Built with Hardhat & Next.js • All votes are
        on-chain and immutable
      </footer>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
