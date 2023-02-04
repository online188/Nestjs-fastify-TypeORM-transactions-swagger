import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class TaskDto {
  @Expose()
  id: string;

  @ApiProperty({ example: 'Task title', description: 'The title of the Task' })
  @Expose()
  title: string;

  @ApiProperty({
    example: 'Task description',
    description: 'The description of the Task',
  })
  @Expose()
  description: string;

  @ApiProperty({
    example: 'OPEN',
    description: 'The status of the Task',
  })
  @Expose()
  status: string;

  @ApiProperty({
    example: 'id',
    description: 'The id of the Task',
  })
  @Transform(({ obj }) => obj.user.id)
  @Expose()
  userId: string;

  @ApiProperty({
    example: 'admin',
    description: 'The user of the Task',
  })
  @Transform(({ obj }) => obj.user.username)
  @Expose()
  username: string;
}
