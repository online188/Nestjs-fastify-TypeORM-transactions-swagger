import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task title', description: 'The title of the Task' })
  @IsString()
  readonly title: string;

  @ApiProperty({
    example: 'Task description',
    description: 'The description of the Task',
  })
  @IsString()
  readonly description: string;
}
