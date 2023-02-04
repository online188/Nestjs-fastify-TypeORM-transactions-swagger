import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  use(req: any, res: any, next: () => void) {
    // const accessToken = req.rawHeaders[3].split(' ')[1]; // Lấy ra token

    let accessToken;
    try {
      if (req.headers.authorization.startsWith('Bearer ')) {
        // Lấy ra token
        accessToken = req.headers.authorization.substring(
          7,
          req.headers.authorization.length,
        );
      }
      const { id, username, role } = this.jwtService.verify(accessToken);

      req.user = { id, username, role };
    } catch (err) {}
    // console.log({ id, username, role });
    // console.log(accessToken);

    // try {
    //   const payload = jwt.verify(accessToken, jwtConstants.secret);
    //   console.log(payload);
    //   req.user = payload;
    // } catch (err) {}

    next();
  }
}
