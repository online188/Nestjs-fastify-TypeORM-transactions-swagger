import { Exclude } from 'class-transformer';
import { User } from '../../users/user.entity';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '../task-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;

  @ManyToOne(() => User, user => user.tasks)
  // @Exclude({ toPlainOnly: true })
  user: User;
}