import { Worker, NearAccount, NEAR } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';
import path from "path";
import { approveUser, lockNft, nftMint, unlockNft } from './utils';

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;

  const alice = await root.createSubAccount("alice", {
    initialBalance: NEAR.parse("100 N").toJSON(),
  });

  const bob = await root.createSubAccount("bob", {
    initialBalance: NEAR.parse("100 N").toJSON(),
  });

  // Get wasm file path from package.json test script in folder above
  const bridgeContract = path.join(__dirname, "../../out/bridge_contract.wasm");

  await root.deploy(
    bridgeContract,
  );
  await root.call(root, "new_default_meta", { owner_id: root })

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, alice, bob };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('mints NFT', async (t) => {
  const { root, alice } = t.context.accounts;


  await nftMint(root, alice);
  // console.log(result.receiptFailureMessages);
  const aliceNFTs = await root.view("nft_tokens_for_owner", {
    account_id: alice.accountId
  })

  t.assert((aliceNFTs as any).length === 1)

});

test('should lock nft', async (t) => {
  const { root, alice } = t.context.accounts;

  await nftMint(root, alice);

  let aliceNFTs = await root.view("nft_tokens_for_owner", {
    account_id: alice.accountId
  })
  t.assert((aliceNFTs as any).length === 1)

  await approveUser(root, alice, root, "1");

  //lock
  await lockNft(root, root, "1")
  // console.log(result.receiptFailureMessages);

  aliceNFTs = await root.view("nft_tokens_for_owner", {
    account_id: alice.accountId
  })
  t.assert((aliceNFTs as any).length === 0)

  const isLocked = await root.view("is_token_locked", {
    token_id: "1"
  })

  t.assert(isLocked === true)
})

test('should unlock nft', async (t) => {
  const { root, alice } = t.context.accounts;

  await nftMint(root, alice);

  await approveUser(root, alice, root, "1");

  //lock
  await lockNft(root, root, "1")

  await unlockNft(root, alice, "1")

  const aliceNFTs = await root.view("nft_tokens_for_owner", {
    account_id: alice.accountId
  })

  t.assert((aliceNFTs as any).length === 1)
})

test('should unlock nft without locking', async (t) => {
  const { root, alice } = t.context.accounts;


  const res = await unlockNft(root, alice, "1")
  console.log(res.receiptFailureMessages);

  const aliceNFTs = await root.view("nft_tokens_for_owner", {
    account_id: alice.accountId
  })

  t.assert((aliceNFTs as any).length === 1)
})