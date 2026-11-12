import { IsString, Matches } from 'class-validator';

export class RefreshTokenDto {
    @IsString()
    @Matches(/^[0-9a-f]{128}$/)
    refreshToken: string;
}
