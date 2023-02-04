import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/user.entity';
import { jwtConstants } from '../constants';
import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // async validate(payload: any) {
  //   return { userId: payload.sub, username: payload.username };
  // }
  async validate(payload: JwtPayload): Promise<any> {
    const { username } = payload;
    const user: User = await this.usersService.findOne(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, username: user.username, role: user.role }; //Mang payload này vào request, id của payload bằng id của user

    // return user; // ko nên return user vì sẽ mang theo cả password trong request!!!
  }
}
