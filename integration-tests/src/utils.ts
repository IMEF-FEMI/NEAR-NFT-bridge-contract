import { NEAR, NearAccount } from "near-workspaces";

export async function nftMint(
    root: NearAccount,
    user: NearAccount,
) {
    const lastMintedId = await root.view("get_last_minted_id")
    const tokenId = (parseInt(lastMintedId as string) + 1).toString()

    return await user.callRaw(
        root,
        "nft_mint",
        {
            token_id: tokenId,
            token_metadata: {
                title: 'Paw Paw NFT',
                description: "Paw Paw NFT",
                media:
                    "https://pbs.twimg.com/media/Fj4w5HiX0AIqk40?format=jpg&name=small",
            },
            receiver_id: user.accountId
        },
        { attachedDeposit: NEAR.parse('1') }
    )
}


export async function approveUser(
    root: NearAccount,
    user: NearAccount,
    userToApprove: NearAccount,
    token_id: string,
) {
    return await user.callRaw(
        root,
        "nft_approve",
        {
            token_id,
            account_id: userToApprove.accountId
        },
        { attachedDeposit: NEAR.parse('1') }
    )
}

export async function lockNft(
    root: NearAccount,
    user: NearAccount,
    token_id: string,
) {
    return await user.callRaw(
        root,
        "nft_lock",
        {
            token_id,
        },
        { attachedDeposit: NEAR.parse('1 yn') }
    )
}

export async function unlockNft(
    root: NearAccount,
    user: NearAccount,
    token_id: string,
) {
    const token = await root.view("nft_token", {
        token_id
    })

    return await root.callRaw(
        root,
        "nft_unlock",
        {
            token_id,
            receiver_id: user.accountId,
            token_metadata: {
                title: 'Paw Paw NFT',
                description: "Paw Paw NFT",
                media:
                    "https://pbs.twimg.com/media/Fj4w5HiX0AIqk40?format=jpg&name=small",
            },
        },
        { attachedDeposit: !token ? NEAR.parse('0.01') : NEAR.parse('1 yn') }
    )
}