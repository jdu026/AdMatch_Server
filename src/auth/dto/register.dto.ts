import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^\S+$/, { message: '아이디에 공백을 넣을 수 없습니다.' })
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(128)
  password: string;

  @IsIn(['ADVERTISER', 'MODEL'])
  role: 'ADVERTISER' | 'MODEL';
}
