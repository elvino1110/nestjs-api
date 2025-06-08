import { HttpException, Inject, Injectable } from '@nestjs/common';
import {
  LoginRequest,
  RegisterUserRequest, UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '../../generated/prisma';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {

    this.logger.info(`Register new user ${JSON.stringify(request)}`)

    //validasi request
    const registerRequest: RegisterUserRequest = this.validationService.validate(UserValidation.REGISTER, request)

    //cek data
    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: {
        username: registerRequest.username
      }
    })

    if (totalUserWithSameUsername != 0) {
      throw new HttpException('Username already exists', 400)
    }

    //registrasikan
    registerRequest.password = await bcrypt.hash(registerRequest.password, 10)

    const user = await this.prismaService.user.create({
      data: registerRequest
    })

    return {
      username: user.username,
      name: user.name
    }
  }

  async login(request: LoginRequest): Promise<UserResponse> {
    this.logger.debug(`UserService.login(${JSON.stringify(request)})`) //info nanti password keliatan jadi ganti debug agar butuh aja
    //validasi request
    const loginRequest: LoginRequest = this.validationService.validate(UserValidation.LOGIN, request)

    let user = await this.prismaService.user.findUnique({
      where: {
        username: loginRequest.username
      }
    })

    if (!user) {
      throw new HttpException('Username or password is invalid', 401)
    }

    const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password)

    if (!isPasswordValid) {
      throw new HttpException('Username or password is invalid', 401)
    }

    //update token sesi
    user = await this.prismaService.user.update({
      where: {
        username: loginRequest.username
      },
      data: {
        token: uuid()
      }
    })

    return {
      username: user.username,
      name: user.name,
      token: user.token!
    };
    
  }

  async get(user: User): Promise<UserResponse> {
    return {
      username: user.username,
      name: user.name
    }
  }

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    this.logger.debug(`UserService.update(${JSON.stringify(user)}, ${JSON.stringify(request)})`)

    //validasi request
    const updateRequest: UpdateUserRequest = this.validationService.validate(UserValidation.UPDATE, request)

    if (updateRequest.name) {
      user.name = updateRequest.name
    }

    if (updateRequest.password) {
      user.password = await bcrypt.hash(updateRequest.password, 10)
    }

    //update database
    const result = await this.prismaService.user.update({
      where: {
        username: user.username
      },
      data: user
    })

    return {
      name: result.name,
      username: result.username,
    }
  }

  async logout(user: User) : Promise<UserResponse> {
    const result = await this.prismaService.user.update({
      where: {
        username: user.username
      },
      data: {
        token: null
      }
    })

    return {
      username: result.username,
      name: result.name
    }
  }

}