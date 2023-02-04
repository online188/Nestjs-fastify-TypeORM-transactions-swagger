import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

// export type User = any;

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findOne(username: string): Promise<User | undefined> {
    if (!username) {
      return null;
    }
    return this.repo.findOneBy({ username });
  }

  // findOne(id: number): Promise<User> {
  //   return this.usersRepository.findOneBy({ id: id });
  // }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.repo.create({ username, password: hashedPassword });

    try {
      await this.repo.save(user);
      console.log('Registered new user!');
    } catch (error) {
      if (error.code === '23505') {
        // duplicate username
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
