import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';
import api from '../lib/axios';
import { ERC20_ABI, DEPOSIT_ABI, CONTRACT_ADDRESSES } from '../lib/contracts';

const STEPS = {
  IDLE: 'idle',
  APPROVING: 'approving',
  DEPOSITING: 'depositing',
  CONFIRMING: 'confirming',
  DONE: 'done',
};

export function useDeposit() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [step, setStep] = useState(STEPS.IDLE);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const reset = useCallback(() => {
    setStep(STEPS.IDLE);
    setError(null);
    setResult(null);
  }, []);

  const deposit = useCallback(
    async (amount) => {
      if (!walletClient || !address) {
        setError('Wallet not connected');
        return { success: false };
      }
      if (!amount || amount <= 0) {
        setError('Invalid amount');
        return { success: false };
      }

      setError(null);
      setResult(null);

      try {
        // 1. Convert to wei (USDT uses 18 decimals on testnet)
        const amountWei = parseUnits(amount.toString(), 18);

        // 2. Check existing allowance
        const allowance = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.usdt,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, CONTRACT_ADDRESSES.deposit],
        });

        // 3. Approve if allowance is insufficient
        if (allowance < amountWei) {
          setStep(STEPS.APPROVING);
          const approveHash = await walletClient.writeContract({
            address: CONTRACT_ADDRESSES.usdt,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [CONTRACT_ADDRESSES.deposit, maxUint256],
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }

        // 4. Send deposit transaction
        setStep(STEPS.DEPOSITING);
        const depositHash = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.deposit,
          abi: DEPOSIT_ABI,
          functionName: 'deposit',
          args: [amountWei, ''],
        });

        // 5. Wait for transaction receipt
        await publicClient.waitForTransactionReceipt({ hash: depositHash });

        // 6. Confirm with backend
        setStep(STEPS.CONFIRMING);
        const { data } = await api.post('/api/deposit/confirm', { txHash: depositHash });

        setResult({ ...data, txHash: depositHash });
        setStep(STEPS.DONE);
        return { success: true, ...data, txHash: depositHash };
      } catch (err) {
        const message =
          err?.response?.data?.error ||
          err?.shortMessage ||
          err?.message ||
          'Deposit failed';
        setError(message);
        setStep(STEPS.IDLE);
        return { success: false, error: message };
      }
    },
    [walletClient, address, publicClient]
  );

  return { deposit, step, error, result, reset, STEPS };
}
