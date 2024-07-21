import BigNumber from 'bignumber.js';

import type { Block } from 'types/api/block';

export default function getBlockReward(block: Block) {
  const txFees = BigNumber(block.tx_fees || 0);
  const burntFees = BigNumber(block.burnt_fees || 0);
  // Coinstake UTXO reward may be much more complex than any Ethereum-chain may ever had.
  // And while Blockscout UI version 1.0 was able to process complex block rewards for validators correctly,
  // a new version for some reason isn't supporting it and instead processing just first reward transaction,
  // while coinstake could have many rewards.
  // Well, that's too bad. Let's return them partially at least temporary till it be fixed by the Blockscout team.
  const minerReward = block.rewards?.filter(({ type }) => type === 'Miner Reward' || type === 'Validator Reward')?.reduce((result, item) => {
    result.reward = result.reward.plus(BigNumber(item.reward || 0));
    return result;
  }, { reward: BigNumber(0) } as any).reward;
  const totalReward = BigNumber(minerReward || 0);
  const staticReward = totalReward.minus(txFees).plus(burntFees);

  return {
    totalReward,
    staticReward,
    txFees,
    burntFees,
  };
}
