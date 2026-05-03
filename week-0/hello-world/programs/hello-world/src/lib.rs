use anchor_lang::prelude::*;

declare_id!("5gYKnnCDUxu8XKBkJxYgNhAikL3R14f1oncmqe4jdJ1F");

#[program]
pub mod hello_world {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
