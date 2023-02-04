import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegisterInput } from './dto/RegisterInput.dto';
import { UserDto } from './dto/user.dto';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
// @Serialize(UserDto) // phải disable cái này đi vì signIn return access token
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() registerInput: RegisterInput): Promise<void> {
    return this.authService.signUp(registerInput);
  }

  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    //ở phiên bản này passport tự gán payload vào @Request()
    console.log(req.user);

    return req.user;
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUser(@GetUser() user: User) {
    console.log(user);
    return user;
  }
}
