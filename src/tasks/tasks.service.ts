import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService');

  constructor(
    @InjectRepository(Task) private repo: Repository<Task>,
    @InjectDataSource() private dataSource: DataSource, //muốn dùng DataSource# thì phải add vào đây!!!
    private readonly usersService: UsersService,
  ) {}

  async getAllTasks(user: any): Promise<Task[]> {
    return await this.repo.find({
      relations: ['user'],
    });
  }
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    // return this.repo.getTasks(filterDto, user);
    // console.log(user);

    const { status, search } = filterDto;

    const query = this.repo.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` }, // &?search=<Clean>||<Clea>||<Cle>...
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.repo.findOne({
      where: { id, user },
      relations: ['user'], // add relations vào để hiện ra all infomations of user
    });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // return this.repo.createTask(createTaskDto, user);
    // console.log(this.dataSource);
    //====Create new Task Used Transaction=====//
    return this.dataSource.transaction(async transactionEntityManager => {
      const { title, description } = createTaskDto;

      const newTask = transactionEntityManager.create(Task, {
        title,
        description,
        status: TaskStatus.OPEN,
        user,
      });

      await transactionEntityManager.save(newTask);
      return newTask;
    });

    //====Create new Task do not use Transaction=====//
    // const { title, description } = createTaskDto;
    // // const userdb = await this.usersService.findOne(user.username);
    // const task = this.repo.create({
    //   title,
    //   description,
    //   status: TaskStatus.OPEN,
    //   user,
    // });

    // await this.repo.save(task);
    // return task;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.repo.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.repo.save(task);

    return task;
  }
}
