import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';

import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { Logger } from '@nestjs/common';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { TaskDto } from './dto/task.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  private logger = new Logger('TasksController');

  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all task with filter' })
  getTasks(
    @Query() filterDto: GetTasksFilterDto,
    @Request() { user },
  ): Promise<Task[]> {
    // console.log(user);
    this.logger.verbose(
      `User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(
        filterDto,
      )}`,
    );
    return this.tasksService.getTasks(filterDto, user);
  }

  @Serialize(TaskDto) //get ra cả user info pass trong task list nên cần serialize
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all tasks of all users' })
  @Get('all')
  getAllTasks(@Request() { user }): Promise<Task[]> {
    console.log(user);
    this.logger.verbose(
      `User "${user.username}" retrieving all tasks of all Users`,
    );
    return this.tasksService.getAllTasks(user);
  }

  //Ko có @Serialize nên chỉ cần add relations vào trong find là hiện ra user info pass
  @Get('/:id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: TaskDto,
  })
  getTaskById(@Param('id') taskId: string, @Request() { user }): Promise<Task> {
    return this.tasksService.getTaskById(taskId, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create Task' })
  @ApiResponse({
    status: 200,
    description: 'The created record',
    type: TaskDto,
  })
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() { user },
  ): Promise<Task> {
    // console.log(user);

    this.logger.verbose(
      `User "${user.username}" creating a new task. Data: ${JSON.stringify(
        createTaskDto,
      )}`,
    );
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string, @Request() { user }): Promise<void> {
    // console.log(user);

    return this.tasksService.deleteTask(id, user);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @Request() { user },
  ): Promise<Task> {
    // console.log(user);

    const { status } = updateTaskStatusDto;
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}
