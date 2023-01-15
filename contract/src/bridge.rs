use crate::*;
use near_sdk::require;

pub trait NFTNonFungibleTokenBridge {
    // lock
    fn nft_lock(&mut self, token_id: TokenId);
    //unlock
    fn nft_unlock(
        &mut self,
        token_id: TokenId,
        receiver_id: AccountId,
        token_metadata: Option<TokenMetadata>,
    );
    //is_token_lockedsc
    fn is_token_locked(&self, token_id: TokenId) -> bool;
}

#[near_bindgen]
impl NFTNonFungibleTokenBridge for NFTContract {
    #[payable]
    fn nft_lock(&mut self, token_id: TokenId) {
        //ensure only contract can call this fn
        self.only_contract_owner();

        //add token_id to locked_tokens and set as true
        self.locked_tokens.insert(&token_id, &true);

        //transfer nft from user to smart contract
        self.nft_transfer(self.tokens.owner_id.clone(), token_id, None, None);
    }

    #[payable]
    fn nft_unlock(
        &mut self,
        token_id: TokenId,
        receiver_id: AccountId,
        token_metadata: Option<TokenMetadata>,
    ) {
        self.only_contract_owner();
        //check if the token is minted
        let token = self.nft_token(token_id.clone());
        if let Some(token) = token {
            //checked that it is locked
            require!(
                self.is_token_locked(token.token_id.clone()),
                "NFT is held by someone else"
            );
            //then unlock to receiver_id
            self.locked_tokens.insert(&token.token_id, &false);

            //transfer nft from smart contract to user
            self.nft_transfer(receiver_id, token.token_id, None, None);
        } else {
            //mint to receiver_id

            self.tokens
                .internal_mint(token_id, receiver_id, token_metadata);
        }
    }
    //if it is not minted, mint to receiver_id
    //ensure only contract can call this fn

    fn is_token_locked(&self, token_id: TokenId) -> bool {
        self.locked_tokens.get(&token_id).unwrap_or(false)
    }
}

impl NFTContract {
    /// modifiers

    pub(crate) fn only_contract_owner(&mut self) {
        assert_eq!(
            env::signer_account_id(),
            self.tokens.owner_id,
            "Only contract owner can call this method."
        );
    }
}
