use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod draw_with_frens {
    use super::*;

    const MIN_POS: u8 = 0;
    const MAX_POS: u8 = 99;
    const MIN_COL: u8 = 0;
    const MAX_COL: u8 = 255;

    pub fn create_pixel(
        ctx: Context<CreatePixel>,
        pos_x: u8,
        pos_y: u8,
        init_col_r: u8,
        init_col_g: u8,
        init_col_b: u8,
    ) -> Result<()> {
        // Validation
        if pos_x < MIN_POS || pos_x > MAX_POS {
            return Err(ErrorCode::InvalidXCoordinate.into());
        }

        if pos_y < MIN_POS || pos_y > MAX_POS {
            return Err(ErrorCode::InvalidYCoordinate.into());
        }

        if init_col_r < MIN_COL || init_col_r > MAX_COL {
            return Err(ErrorCode::InvalidRColor.into());
        }

        if init_col_b < MIN_COL || init_col_b > MAX_COL {
            return Err(ErrorCode::InvalidBColor.into());
        }

        if init_col_g < MIN_COL || init_col_g > MAX_COL {
            return Err(ErrorCode::InvalidGColor.into());
        }

        // Set values
        let pixel = &mut ctx.accounts.pixel;
        pixel.pos_x = pos_x;
        pixel.pos_y = pos_y;
        pixel.col_r = init_col_r;
        pixel.col_g = init_col_g;
        pixel.col_b = init_col_b;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreatePixel<'info> {
    #[account(init, payer=user, space=Pixel::LEN)]
    pub pixel: Account<'info, Pixel>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Define structure of pixel account
#[account]
pub struct Pixel {
    pub pos_x: u8,
    pub pos_y: u8,
    pub col_r: u8,
    pub col_g: u8,
    pub col_b: u8,
}

// Define size of pixel account
const DISCRIMINATOR_LENGTH: usize = 8;
const POS_LENGTH: usize = 1;
const COL_LENGTH: usize = 1;

impl Pixel {
    const LEN: usize = DISCRIMINATOR_LENGTH + (2 * POS_LENGTH) + (3 * COL_LENGTH);
}

#[error_code]
pub enum ErrorCode {
    #[msg("The given X co-ordinate is not between 0-99")]
    InvalidXCoordinate,
    #[msg("The given Y co-ordinate is not between 0-99")]
    InvalidYCoordinate,
    #[msg("The given R color is not between 0-255")]
    InvalidRColor,
    #[msg("The given G color is not between 0-255")]
    InvalidGColor,
    #[msg("The given B color is not between 0-255")]
    InvalidBColor,
}
